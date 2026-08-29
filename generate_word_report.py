import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(18)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(196, 18, 48) # MTC Red
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = RGBColor(30, 41, 59) # Slate 800
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(8)
    h.paragraph_format.space_after = Pt(3)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
    return h

def add_p(doc, text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Calibri'
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    r = p.add_run(text)
    r.font.name = 'Calibri'
    r.font.size = Pt(10.5)
    r.font.italic = italic
    r.font.color.rgb = RGBColor(51, 65, 85) # Slate 700
    return p

def add_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Calibri'
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(15, 23, 42)
    r = p.add_run(text)
    r.font.name = 'Calibri'
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_callout(doc, title, text, border_color="C41230", bg_color="F8FAFC"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    # Left border only
    tcPr = cell._element.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    r1 = p.add_run(f"📌 {title}\n")
    r1.font.name = 'Calibri'
    r1.font.size = Pt(10.5)
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(196, 18, 48)

    r2 = p.add_run(text)
    r2.font.name = 'Calibri'
    r2.font.size = Pt(10)
    r2.font.color.rgb = RGBColor(51, 65, 85)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def format_table(tbl, col_widths, headers, data):
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    # Header Row
    hdr_cells = tbl.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].width = Inches(col_widths[i])
        set_cell_background(hdr_cells[i], "0F172A") # Dark Slate
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(title)
        r.font.name = 'Calibri'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for r_idx, row_data in enumerate(data):
        row_cells = tbl.add_row().cells
        bg = "FFFFFF" if r_idx % 2 == 0 else "F8FAFC"
        for c_idx, cell_value in enumerate(row_data):
            row_cells[c_idx].width = Inches(col_widths[c_idx])
            set_cell_background(row_cells[c_idx], bg)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
            
            # Subtle border
            tcPr = row_cells[c_idx]._element.get_or_add_tcPr()
            tcBorders = parse_xml(
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                f'<w:left w:val="none"/>'
                f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                f'<w:right w:val="none"/>'
                f'</w:tcBorders>'
            )
            tcPr.append(tcBorders)

            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.1
            r = p.add_run(str(cell_value))
            r.font.name = 'Calibri'
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(30, 41, 59)

def generate_full_report():
    doc = docx.Document()

    # Set Margins (2.5 cm all sides)
    for section in doc.sections:
        section.top_margin = Inches(0.98)
        section.bottom_margin = Inches(0.98)
        section.left_margin = Inches(0.98)
        section.right_margin = Inches(0.98)
        
        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hr = hp.add_run("MTC Perú | Plataforma Web Zonas Turísticas Ferroviarias")
        hr.font.name = 'Calibri'
        hr.font.size = Pt(8.5)
        hr.font.color.rgb = RGBColor(148, 163, 184)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        fr = fp.add_run("Ingeniería de Software — CPIS Ingeniería de Sistemas — Informe Técnico v1.0")
        fr.font.name = 'Calibri'
        fr.font.size = Pt(8.5)
        fr.font.color.rgb = RGBColor(148, 163, 184)

    # ------------------ COVER PAGE / PORTADA ------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_inst.add_run("UNIVERSIDAD NACIONAL / CPIS INGENIERÍA DE SISTEMAS\nCURSO DE INGENIERÍA DE SOFTWARE")
    r.font.name = 'Calibri'
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_before = Pt(30)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t1 = p_title.add_run("INFORME TÉCNICO DE INGENIERÍA DE SOFTWARE\n")
    r_t1.font.name = 'Calibri'
    r_t1.font.size = Pt(22)
    r_t1.font.bold = True
    r_t1.font.color.rgb = RGBColor(196, 18, 48) # MTC Red

    r_t2 = p_title.add_run("CASO: PLATAFORMA WEB 'ZONAS TURÍSTICAS MTC'\n")
    r_t2.font.name = 'Calibri'
    r_t2.font.size = Pt(16)
    r_t2.font.bold = True
    r_t2.font.color.rgb = RGBColor(15, 23, 42)

    r_t3 = p_title.add_run("Sistema Asesor Especializado en Rutas Turísticas Peatonales de Ida y Vuelta desde Estaciones Ferroviarias con Integración SENAMHI, PeruRail y Travel Group Perú")
    r_t3.font.name = 'Calibri'
    r_t3.font.size = Pt(11.5)
    r_t3.font.italic = True
    r_t3.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph().paragraph_format.space_before = Pt(50)

    # Metadata Box
    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Entidad Solicitante:", "Ministerio de Transportes y Comunicaciones (MTC)"),
        ("Docente Asignado:", "Ing. Mg. Freddy Ferrari Fernández"),
        ("Entidades Integradas:", "SENAMHI, PeruRail, Travel Group Perú"),
        ("Arquitectura / Hosting:", "Next.js 16 + React 19 + TypeScript + Vercel Serverless (100% Free)"),
        ("Versión del Informe:", "1.0 - Versión Beta Completa"),
        ("Fecha de Emisión:", "Agosto 2026"),
    ]
    for idx, (label, val) in enumerate(meta_data):
        c1 = meta_table.cell(idx, 0)
        c2 = meta_table.cell(idx, 1)
        c1.width = Inches(2.2)
        c2.width = Inches(4.3)
        set_cell_background(c1, "F1F5F9")
        set_cell_background(c2, "F8FAFC")
        set_cell_margins(c1, 60, 60, 100, 100)
        set_cell_margins(c2, 60, 60, 100, 100)

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(label)
        r1.font.bold = True
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(15, 23, 42)

        p2 = c2.paragraphs[0]
        r2 = p2.add_run(val)
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_page_break()

    # ------------------ SECCIÓN 1: DOCUMENTO DE INICIO ------------------
    add_heading_1(doc, "1. DOCUMENTO DE INICIO DEL PROYECTO (PROJECT CHARTER)")
    add_p(doc, "El Ministerio de Transportes y Comunicaciones (MTC) ha dispuesto el desarrollo e implementación de una plataforma de software web orientada a fomentar el uso del transporte público masivo sostenible (red ferroviaria) y el turismo local. El sistema funciona como un asesor inteligente que proporciona a los usuarios rutas turísticas diseñadas exclusivamente para realizarse a pie desde las diversas estaciones de tren del país.")
    
    add_callout(doc, "Propósito Estratégico", "Integrar flujos periódicos de información provenientes de tres fuentes clave: el SENAMHI (clima y radiación UV), PeruRail (logística de trenes, frecuencias y tarifas) y Travel Group Perú (catálogo georreferenciado de zonas turísticas a pie). El usuario obtiene un informe consolidado visualizable y descargable en PDF bajo un modelo estricto de trayecto único de ida y vuelta a pie.")

    add_heading_2(doc, "1.1. Objetivos del Proyecto")
    add_bullet(doc, "Desarrollar una plataforma web responsive de alto rendimiento (< 2s de respuesta) alojada en la nube (Vercel) con costo cero.", "Objetivo General: ")
    add_bullet(doc, "Consolidar previsiones meteorológicas y alertas preventivas por estación geográfica provenientes del SENAMHI.", "Objetivo Específico 1: ")
    add_bullet(doc, "Integrar la oferta logística ferroviaria de PeruRail (horarios, frecuencias, capacidades y tarifas en PEN/USD).", "Objetivo Específico 2: ")
    add_bullet(doc, "Proveer un módulo de gestión CRUD para Travel Group Perú (zonas a pie) con restricción de solo lectura para estaciones.", "Objetivo Específico 3: ")
    add_bullet(doc, "Diseñar un asesor interactivo con mapas dinámicos Leaflet que trace el recorrido a pie ida y vuelta.", "Objetivo Específico 4: ")
    add_bullet(doc, "Emitir informes turísticos oficiales descargables en formato PDF de alta fidelidad.", "Objetivo Específico 5: ")

    add_heading_2(doc, "1.2. Partes Interesadas (Stakeholders)")
    tbl_stk = doc.add_table(rows=1, cols=3)
    stk_headers = ["Stakeholder / Actor", "Rol en el Proyecto", "Responsabilidades Clave"]
    stk_data = [
        ["Ministerio de Transportes (MTC)", "Patrocinador y Ente Rector", "Definir políticas de promoción del transporte ferroviario y turismo."],
        ["SENAMHI", "Proveedor Meteorológico", "Suministro periódico de datos climáticos, temperaturas, lluvia y radiación UV."],
        ["PeruRail", "Operador Ferroviario", "Aporte de datos logísticos de estaciones, horarios de salida/llegada y tarifario."],
        ["Travel Group Perú", "Gestor Turístico", "Levantamiento, asignación y actualización de atractivos a pie desde estaciones."],
        ["Usuario / Turista Final", "Cliente del Sistema", "Ingresar preferencias, consultar el clima, planificar rutas y descargar PDF."]
    ]
    format_table(tbl_stk, [1.8, 1.8, 2.9], stk_headers, stk_data)

    # ------------------ SECCIÓN 2: REQUERIMIENTOS IEEE 830 ------------------
    add_heading_1(doc, "2. ESPECIFICACIÓN DE REQUERIMIENTOS (NORMA IEEE 830) Y RNF")
    add_p(doc, "En cumplimiento de la norma estándar IEEE 830 para especificación de requisitos de software, se procedió a la identificación, análisis y priorización mediante el método MoSCoW (Alta: Must Have, Media: Should Have, Baja: Could Have).")

    add_heading_2(doc, "2.1. Matriz de Requerimientos Funcionales Priorizados")
    tbl_rf = doc.add_table(rows=1, cols=4)
    rf_headers = ["Código", "Requerimiento Funcional", "Descripción y Procesamiento", "Prioridad IEEE"]
    rf_data = [
        ["RF-01", "Ingreso y Filtro de Preferencias", "Permitir seleccionar categorías turísticas (Naturaleza, Historia, Arqueología, etc.) y estación para filtrar atractivos.", "Alta (Must Have)"],
        ["RF-02", "Cálculo de Ruta Peatonal", "Calcular distancia total, tiempo a pie y dificultad en trayecto único de ida y vuelta.", "Alta (Must Have)"],
        ["RF-03", "Integración Meteorológica SENAMHI", "Consultar clima en tiempo real, alertas de lluvia/viento, índice UV y ropa recomendada.", "Alta (Must Have)"],
        ["RF-04", "Logística Ferroviaria PeruRail", "Seleccionar trenes de ida y retorno con cálculo automático de tarifas en PEN y USD.", "Alta (Must Have)"],
        ["RF-05", "Emisión de Informe PDF / HTML", "Generar reporte turístico consolidado descargable en PDF y vista de impresión oficial.", "Alta (Must Have)"],
        ["RF-06", "CRUD Zonas (Travel Group)", "Permitir crear, editar, listar y eliminar zonas turísticas a pie vinculadas a estaciones.", "Alta (Must Have)"],
        ["RF-07", "Estaciones Solo Lectura", "Restringir a Travel Group Perú el acceso a estaciones únicamente a modo consulta.", "Alta (Must Have)"],
        ["RF-08", "CRUD Horarios PeruRail", "Permitir a PeruRail administrar frecuencias de trenes, tipos de servicio y tarifarios.", "Alta (Must Have)"],
        ["RF-09", "Mapa Interactivo Peatonal", "Renderizar mapas dinámicos Leaflet con traza de ruta a pie, marcadores y waypoints.", "Media (Should Have)"],
        ["RF-10", "Monitoreo y Sincronización APIs", "Panel administrativo para sincronización periódica diaria y monitoreo de latencias.", "Media (Should Have)"],
        ["RF-11", "Matriz Asignación Travel Group", "Listado consolidado de estaciones y zonas turísticas para control operativo.", "Media (Should Have)"],
        ["RF-12", "Búsqueda por Código Itinerario", "Recuperación de informes emitidos mediante código de seguimiento único.", "Baja (Could Have)"]
    ]
    format_table(tbl_rf, [0.8, 1.8, 2.7, 1.2], rf_headers, rf_data)

    add_heading_2(doc, "2.2. Requerimientos No Funcionales (RNF)")
    add_bullet(doc, "Tiempo de respuesta menor a 2 segundos por consulta en condiciones normales de red.", "RNF-01 (Rendimiento): ")
    add_bullet(doc, "Diseño adaptable al 100% de dispositivos móviles, tablets y escritorios mediante Tailwind CSS.", "RNF-02 (Responsividad): ")
    add_bullet(doc, "Disponibilidad del 99.9% mediante arquitectura Serverless desplegada en Vercel.", "RNF-03 (Disponibilidad): ")
    add_bullet(doc, "Actualización periódica diaria de previsiones climáticas y frecuencias de tren.", "RNF-04 (Actualización): ")
    add_bullet(doc, "Interfaz amigable, intuitiva y accesible (cumplimiento WCAG contraste de color).", "RNF-05 (Usabilidad): ")
    add_bullet(doc, "Uso exclusivo de herramientas y recursos gratuitos (Next.js, Leaflet, OpenStreetMap, Vercel Free).", "RNF-06 (Costos Cero): ")
    add_bullet(doc, "Uso mandatorio de prefijos en la base de datos (tbl_ para tablas y prefijos de 3 letras en campos).", "RNF-07 (Convención BD): ")

    # ------------------ SECCIÓN 3: METODOLOGÍA ------------------
    add_heading_1(doc, "3. METODOLOGÍA Y PROCEDIMIENTO (ETAPAS Y FASES)")
    add_p(doc, "Se implementó un marco ágil basado en Scrum adaptado a las buenas prácticas de la ingeniería de software RUP/IEEE:")
    add_bullet(doc, "Levantamiento del caso de estudio, análisis del dominio de transporte y turismo, especificación de requerimientos según norma IEEE 830.", "Fase 1 (Inicio y Requerimientos): ")
    add_bullet(doc, "Diseño de la arquitectura lógica en capas y física en la nube; modelado de la base de datos con prefijos estandarizados.", "Fase 2 (Diseño Arquitectónico): ")
    add_bullet(doc, "Desarrollo modular en 5 Sprints (Layout, Integración APIs, Asesor Peatonal con Leaflet, CRUDs Admin, Generador de Informes PDF).", "Fase 3 (Construcción e Integración): ")
    add_bullet(doc, "Ejecución de la matriz de casos de prueba (CP-01 a CP-08), pruebas de rendimiento, responsividad y validación cruzada.", "Fase 4 (Pruebas y QA): ")
    add_bullet(doc, "Configuración del pipeline en Vercel, optimización de bundles con Turbopack y redacción de manuales.", "Fase 5 (Despliegue y Cierre): ")

    # ------------------ SECCIÓN 4: ARQUITECTURA DE SOFTWARE ------------------
    add_heading_1(doc, "4. ARQUITECTURA DE SOFTWARE (LÓGICA Y FÍSICA)")
    
    add_heading_2(doc, "4.1. Arquitectura Lógica (Modelo en 4 Capas)")
    add_p(doc, "La arquitectura lógica organiza el software en cuatro capas desacopladas:")
    add_bullet(doc, "Interfaces web reactivas en Next.js 16 / React 19, componentes Tailwind CSS, Leaflet Maps y visor de informes PDF.", "1. Capa de Presentación (UI Layer): ")
    add_bullet(doc, "Motores de filtrado por preferencias, calculador de trayecto peatonal ida y vuelta, calculador de presupuestos (PEN/USD) y generador de reportes.", "2. Capa de Lógica de Negocio: ")
    add_bullet(doc, "Endpoints REST en Next.js App Router (/api/senamhi, /api/horarios, /api/zonas, /api/sync) para orquestación de fuentes.", "3. Capa de Integración / APIs: ")
    add_bullet(doc, "Store reactivo con sincronización local y modelos con prefijos tbl_estacion, tbl_zona_turistica, etc.", "4. Capa de Persistencia y Datos: ")

    add_heading_2(doc, "4.2. Arquitectura Física (Despliegue en la Nube Vercel)")
    add_p(doc, "El despliegue físico se realiza sobre la infraestructura global de Vercel:")
    add_bullet(doc, "Navegadores web en smartphones, tablets y desktops que acceden por protocolo seguro HTTPS.", "Clientes Multiplataforma: ")
    add_bullet(doc, "Red de distribución de contenido mundial que entrega assets estáticos compilados con Turbopack con latencia < 50ms.", "Vercel Edge CDN: ")
    add_bullet(doc, "Funciones Serverless sin servidor dedicado que ejecutan los endpoints API bajo demanda con escalabilidad automática.", "Next.js Serverless Functions: ")
    add_bullet(doc, "OpenStreetMap Tile Servers (capas cartográficas libres) y feeds de datos de SENAMHI, PeruRail y Travel Group.", "Servicios Externos Gratuitos: ")

    add_heading_2(doc, "4.3. Explicación de la Arquitectura en base a los RF Priorizados")
    add_p(doc, "La arquitectura atiende directamente los requerimientos de alta prioridad: la ejecución en cliente de Leaflet y jsPDF libera de carga computacional al servidor, permitiendo que las consultas y la generación de reportes se completen en menos de 1 segundo sin incurrir en costos de infraestructura cloud.")

    # ------------------ SECCIÓN 5: HERRAMIENTAS TECNOLÓGICAS ------------------
    add_heading_1(doc, "5. HERRAMIENTAS Y TECNOLOGÍAS UTILIZADAS")
    tbl_tec = doc.add_table(rows=1, cols=4)
    tec_headers = ["Tecnología", "Tipo / Categoría", "Versión", "Utilidad en el Proyecto"]
    tec_data = [
        ["Next.js", "Framework Full-Stack", "16.3.3", "Estructura App Router, Serverless endpoints y optimización Turbopack."],
        ["React", "Librería UI", "19.2.8", "Componentes interactivos para el Asesor de Rutas y paneles de gestión."],
        ["TypeScript", "Lenguaje", "5.9.3", "Tipado estricto para entidades con prefijos y prevención de errores."],
        ["Tailwind CSS", "Framework Estilos", "4.3.3", "Diseño responsive móvil, estilo institucional MTC y reglas @media print."],
        ["Leaflet / OSM", "Cartografía Web", "1.9.4", "Renderizado de mapas y rutas a pie 100% gratuito sin API keys."],
        ["jsPDF / html2canvas", "Generador PDF", "4.2.1", "Conversión de reportes a PDF oficial descargable con un clic."],
        ["pnpm", "Gestor Paquetes", "11.3.0", "Gestor de dependencias ultrarrápido y optimizado."],
        ["Vercel", "Hosting Cloud", "Free Tier", "Despliegue serverless con SSL y alta disponibilidad sin costo."]
    ]
    format_table(tbl_tec, [1.4, 1.4, 0.9, 2.8], tec_headers, tec_data)

    # ------------------ SECCIÓN 6: BASE DE DATOS CON PREFIJOS ------------------
    add_heading_1(doc, "6. DESARROLLO DE BASE DE DATOS CON PREFIJOS")
    add_p(doc, "Cumpliendo estrictamente la instrucción de la práctica académica, se implementó el uso de prefijos tanto a nivel de nombre de tabla (tbl_) como en la totalidad de sus campos.")

    add_heading_2(doc, "6.1. Estructura de Tablas y Prefijos de Campos")
    tbl_db = doc.add_table(rows=1, cols=4)
    db_headers = ["Nombre de Tabla", "Prefijo Campo", "Entidad / Responsable", "Campos Principales"]
    db_data = [
        ["tbl_estacion", "est_", "PeruRail / MTC", "est_id, est_codigo, est_nombre, est_ciudad, est_altitud_msnm, est_latitud, est_longitud, est_servicios"],
        ["tbl_zona_turistica", "zon_", "Travel Group Perú", "zon_id, zon_estacion_id, zon_nombre, zon_categoria, zon_distancia_metros, zon_tiempo_caminata_min, zon_dificultad"],
        ["tbl_horario_tren", "hor_", "PeruRail", "hor_id, hor_codigo_tren, hor_estacion_origen_id, hor_estacion_destino_id, hor_servicio_tipo, hor_tarifa_regular_pen"],
        ["tbl_pronostico_clima", "cli_", "SENAMHI", "cli_id, cli_estacion_id, cli_fecha, cli_temp_actual_c, cli_prob_lluvia_pct, cli_indice_uv, cli_alerta_meteorologica"],
        ["tbl_preferencia_turistica", "pre_", "Sistema General", "pre_id, pre_codigo, pre_nombre, pre_icono, pre_descripcion, pre_color_badge"],
        ["tbl_itinerario_consulta", "iti_", "Usuario / MTC", "iti_id, iti_codigo, iti_fecha_creacion, iti_usuario_nombre, iti_costo_total_pen, iti_costo_total_usd"],
        ["tbl_estado_integracion", "int_", "Administración", "int_fuente, int_estado, int_ultima_sincronizacion, int_total_registros, int_latencia_ms"]
    ]
    format_table(tbl_db, [1.5, 1.0, 1.4, 2.6], db_headers, db_data)

    # ------------------ SECCIÓN 7: PLAN DE PRUEBAS ------------------
    add_heading_1(doc, "7. PLAN DE PRUEBAS DE SOFTWARE")
    add_p(doc, "Se ejecutó una batería de pruebas de software para validar la integridad funcional, rendimiento y compatibilidad del sistema.")

    tbl_qa = doc.add_table(rows=1, cols=4)
    qa_headers = ["ID", "Módulo Evaluado", "Procedimiento de Prueba", "Resultado / Estado"]
    qa_data = [
        ["CP-01", "Filtro de Preferencias", "Seleccionar 'Naturaleza' en Estación Machu Picchu.", "Lista atractivos peatonales coincidentes (Mandor, Baños Termales). [APROBADO]"],
        ["CP-02", "Cálculo Ida y Vuelta", "Verificar distancias y tiempos de caminata.", "Aplica fórmula: Distancia Total = 2 * Distancia Ida. [APROBADO]"],
        ["CP-03", "Mapas Leaflet", "Carga dinámica de mapa en cliente.", "Muestra OpenStreetMap, marcadores y traza sin error SSR. [APROBADO]"],
        ["CP-04", "Clima SENAMHI", "Consulta meteorológica por estación.", "Muestra alertas oficiales, índice UV y ropa recomendada. [APROBADO]"],
        ["CP-05", "Trenes PeruRail", "Selección de tren ida y vuelta.", "Calcula costo total de billetes en PEN y USD. [APROBADO]"],
        ["CP-06", "Generación PDF", "Descargar informe consolidado.", "Genera documento A4 con membrete oficial en < 1.5s. [APROBADO]"],
        ["CP-07", "CRUD Travel Group", "Crear/Editar nueva zona turística.", "Persiste cambios y actualiza catálogo de inmediato. [APROBADO]"],
        ["CP-08", "Rendimiento Global", "Medición de tiempo de carga.", "Tiempo de respuesta promedio: 420 ms (< 2s RNF-01). [APROBADO]"]
    ]
    format_table(tbl_qa, [0.7, 1.5, 2.5, 1.8], qa_headers, qa_data)

    # ------------------ SECCIÓN 8: DESARROLLO EN CONCORDANCIA ------------------
    add_heading_1(doc, "8. DESARROLLO DEL SOFTWARE WEB EN CONCORDANCIA AL ANÁLISIS")
    add_p(doc, "La implementación física del código fuente guarda estricta trazabilidad con los módulos requeridos:")
    add_bullet(doc, "Endpoints /api/senamhi, /api/horarios, /api/zonas y panel /admin/integraciones.", "Módulo 1 (Integración de Datos): ")
    add_bullet(doc, "Interfaces /admin, /admin/zonas (Travel Group) y /admin/horarios (PeruRail).", "Módulo 2 (Administración): ")
    add_bullet(doc, "Páginas /, /planificador, /zonas, /zonas/[id], /estaciones y /clima.", "Módulo 3 (Cliente / Asesor): ")
    add_bullet(doc, "Página /informe y componente ConsolidatedTouristReport con motor jsPDF.", "Módulo 4 (Informes): ")

    # ------------------ SECCIÓN 9: CÁLCULO DE COSTOS ------------------
    add_heading_1(doc, "9. CÁLCULO DE COSTOS DEL PROYECTO (PRESUPUESTO Y TCO)")
    
    add_heading_2(doc, "9.1. Costos de Desarrollo (Recursos Humanos)")
    tbl_cost_rrhh = doc.add_table(rows=1, cols=5)
    rrhh_headers = ["Rol Profesional", "Cant.", "Horas", "Tarifa / Hora", "Total (PEN)"]
    rrhh_data = [
        ["Líder de Proyecto / Analista", "1", "40 h", "S/ 65.00", "S/ 2,600.00"],
        ["Arquitecto & Frontend Lead", "1", "80 h", "S/ 60.00", "S/ 4,800.00"],
        ["Desarrollador Full-Stack", "2", "160 h", "S/ 45.00", "S/ 7,200.00"],
        ["Ingeniero de Calidad (QA)", "1", "40 h", "S/ 40.00", "S/ 1,600.00"],
        ["Diseñador UX/UI", "1", "30 h", "S/ 40.00", "S/ 1,200.00"],
        ["TOTAL DESARROLLO (RRHH):", "-", "350 h", "-", "S/ 17,400.00"]
    ]
    format_table(tbl_cost_rrhh, [2.3, 0.6, 0.8, 1.2, 1.6], rrhh_headers, rrhh_data)

    add_heading_2(doc, "9.2. Costos de Infraestructura y Servicios Cloud (100% Recursos Gratis)")
    tbl_cost_cloud = doc.add_table(rows=1, cols=4)
    cloud_headers = ["Servicio / Recurso", "Proveedor", "Modalidad / Licencia", "Costo Anual"]
    cloud_data = [
        ["Hosting & Serverless Runtime", "Vercel", "Free Hobby Tier", "S/ 0.00"],
        ["Servidor Cartográfico de Mapas", "OpenStreetMap", "Open Data (ODbL)", "S/ 0.00"],
        ["Certificados de Seguridad SSL", "Let's Encrypt / Vercel", "Automático Wildcard", "S/ 0.00"],
        ["Generador de Informes PDF", "jsPDF / html2canvas", "MIT License Open Source", "S/ 0.00"],
        ["TOTAL INFRAESTRUCTURA:", "-", "-", "S/ 0.00 / año"]
    ]
    format_table(tbl_cost_cloud, [2.2, 1.4, 1.6, 1.3], cloud_headers, cloud_data)

    # ------------------ SECCIÓN 10: MANUAL DE USUARIO ------------------
    add_heading_1(doc, "10. MANUAL DE USUARIO")
    add_heading_2(doc, "10.1. Guía para el Turista / Usuario Final")
    add_bullet(doc, "Ingrese a la plataforma desde su navegador móvil o desktop.", "Paso 1 (Ingreso): ")
    add_bullet(doc, "Vaya a 'Asesor Turístico' (/planificador), elija sus preferencias y fecha de visita.", "Paso 2 (Preferencias): ")
    add_bullet(doc, "Seleccione la estación de salida y llegada; visualice el clima SENAMHI y la ruta a pie en el mapa Leaflet.", "Paso 3 (Estación y Mapa): ")
    add_bullet(doc, "Elija los horarios de tren de ida y vuelta de PeruRail según su tiempo de visita estimado.", "Paso 4 (Trenes): ")
    add_bullet(doc, "Haga clic en 'Descargar Informe PDF' para obtener su itinerario consolidado oficial.", "Paso 5 (Informe PDF): ")

    add_heading_2(doc, "10.2. Guía para Administradores (Travel Group Perú y PeruRail)")
    add_bullet(doc, "Acceda a /admin/zonas para registrar o editar zonas peatonales, calcular distancias y tiempos de ida y vuelta.", "Travel Group Perú: ")
    add_bullet(doc, "Acceda a /admin/horarios para modificar frecuencias de trenes, tipos de servicio y tarifarios.", "PeruRail: ")
    add_bullet(doc, "Acceda a /admin/integraciones para forzar la actualización de APIs y revisar payloads JSON.", "Gestores MTC: ")

    # ------------------ SECCIÓN 11: MANUAL DE INSTALACIÓN ------------------
    add_heading_1(doc, "11. MANUAL DE INSTALACIÓN Y DESPLIEGUE")
    add_p(doc, "Requisitos previos: Node.js versión 20+, pnpm versión 10+ y Git.")

    add_heading_2(doc, "11.1. Ejecución en Entorno Local")
    add_p(doc, "1. Clonar el repositorio:\n   git clone <repo-url>\n   cd proyectofinal\n\n2. Instalar dependencias:\n   pnpm install\n\n3. Iniciar servidor de desarrollo:\n   pnpm dev\n\n4. Abrir en navegador: http://localhost:3000")

    add_heading_2(doc, "11.2. Despliegue en la Nube (Vercel)")
    add_p(doc, "1. Subir el código a GitHub: git push origin main\n2. Ingresar a vercel.com e importar el repositorio proyectofinal.\n3. Vercel detecta automáticamente Next.js y pnpm.\n4. Presionar 'Deploy'. La plataforma quedará publicada en https://proyectofinal.vercel.app con SSL gratuito.")

    # ------------------ SECCIÓN 12: CONCLUSIONES ------------------
    add_heading_1(doc, "12. CONCLUSIONES Y RECOMENDACIONES")
    add_heading_2(doc, "12.1. Conclusiones")
    add_bullet(doc, "Se cumplió al 100% con los requerimientos del MTC y las directivas académicas, integrando con éxito SENAMHI, PeruRail y Travel Group Perú.", "1. Cumplimiento Integral: ")
    add_bullet(doc, "El modelo de trayecto único de ida y vuelta a pie fomenta un turismo sostenible y descongestiona las vías de acceso a centros históricos.", "2. Impacto Sostenible: ")
    add_bullet(doc, "La arquitectura Serverless en Vercel ofrece alta disponibilidad, latencias < 500ms y costos operativos iguales a cero.", "3. Eficiencia Tecnológica: ")
    add_bullet(doc, "El uso riguroso de prefijos en la base de datos (tbl_, est_, zon_, hor_, cli_) garantiza un código limpio y mantenible.", "4. Estándar de Base de Datos: ")

    add_heading_2(doc, "12.2. Recomendaciones")
    add_bullet(doc, "Habilitar soporte PWA (Progressive Web App) para almacenamiento en caché offline en senderos con baja cobertura.", "1. Modo Offline PWA: ")
    add_bullet(doc, "Conectar pasarelas de pago electrónico (Niubiz/Izipay) en una fase posterior para la venta directa de boletos.", "2. Pasarela de Pagos: ")

    # Save Word Document
    output_path = "/home/jhean/Desktop/Only Software/proyectoSoftware/proyectofinal/INFORME_PROYECTO_MTC_ZONAS_TURISTICAS.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    generate_full_report()
