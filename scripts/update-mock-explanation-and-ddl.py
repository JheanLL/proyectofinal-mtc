import docx
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def format_cell(cell, text, font_size=8, fill_hex=None):
    if fill_hex:
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(text)
    run.font.name = 'Consolas'
    run.font.size = Pt(font_size)
    run.font.color.rgb = RGBColor(15, 23, 42)

def update_documents():
    # Leer seeds generados
    with open('scripts/generated_seeds.sql', 'r', encoding='utf-8') as f:
        seeds_sql = f.read()

    # 1. Actualizar database_schema_aiven.sql
    with open('database_schema_aiven.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # Header explicativo para el DDL
    ddl_header_note = (
        "-- ==============================================================================\n"
        "-- NOTA DE ARQUITECTURA: SIMULACIÓN DE APIS (MOCK DATA PROVIDER EN AIVEN MYSQL)\n"
        "-- ==============================================================================\n"
        "-- En cumplimiento de los requerimientos del MTC y dado que PeruRail y Travel Group\n"
        "-- son entidades privadas que no poseen APIs públicas abiertas en internet, este script\n"
        "-- DDL incluye el 'Banco de Datos Simulado' en Aiven MySQL para las tablas de estaciones,\n"
        "-- horarios ferroviarios y circuitos turísticos peatonales.\n"
        "-- Dichos datos emulan la infraestructura real del corredor Cusco - Machu Picchu\n"
        "-- y son servidos por los endpoints REST (/api/estaciones, /api/horarios, /api/zonas)\n"
        "-- simulando ser APIs externas de dichas empresas (Mock Provider).\n"
        "-- En una fase posterior de producción nacional, estos conectores se sustituirán\n"
        "-- directamente por las APIs propietarias reales de PeruRail y Travel Group.\n"
        "-- En contraste, la integración meteorológica del SENAMHI (/api/senamhi) opera con una\n"
        "-- API satelital real en tiempo real: Open-Meteo (https://api.open-meteo.com/v1/forecast).\n"
        "-- ==============================================================================\n\n"
    )

    if "NOTA DE ARQUITECTURA: SIMULACIÓN DE APIS" not in sql_content:
        sql_content = ddl_header_note + sql_content

    if "SEED SIMULADO TRAVEL GROUP PERÚ" not in sql_content:
        # Añadir antes de tbl_filtro_exclusion o al final
        insert_marker = "-- 10. TABLA: tbl_filtro_exclusion"
        if insert_marker in sql_content:
            idx = sql_content.find(insert_marker)
            sql_content = sql_content[:idx] + seeds_sql + "\n\n" + sql_content[idx:]
        else:
            sql_content += "\n\n" + seeds_sql

    with open('database_schema_aiven.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    print("Updated database_schema_aiven.sql with mock data explanation and all seeds.")

    # 2. Actualizar PROYECTO_FINAL_ISO.docx
    doc_path = '/home/jhean/Desktop/PROYECTO_FINAL_ISO.docx'
    doc = docx.Document(doc_path)

    # Actualizar Table 7 (DDL Maestro)
    for t in doc.tables:
        f0 = t.rows[0].cells[0].text.strip()
        if 'Script DDL Maestro' in f0:
            ddl_full = "💻 Script DDL Maestro para Aiven MySQL y Diagrama Gráfico (MySQL Workbench / E-R)\n" + sql_content
            format_cell(t.rows[0].cells[0], ddl_full, fill_hex='F8FAFC', font_size=7.5)
            print("Updated Table 7 DDL in PROYECTO_FINAL_ISO.docx with complete seeds.")
            break

    # Párrafo explicativo condensado bajo Módulo 1
    explanation_text = (
        "• Nota Arquitectónica: Simulación de APIs (Mock Data Provider en Aiven MySQL) vs. API Real de Clima (Open-Meteo):\n"
        "  1. API Real en Vivo (SENAMHI): Es la única API externa real en producción que se consulta en tiempo real. "
        "Dado que el portal estatal senamhi.gob.pe no cuenta con una REST API pública en JSON, el backend se conecta en vivo a la API satelital meteorológica global de Open-Meteo "
        "(https://api.open-meteo.com/v1/forecast), parametrizada con las coordenadas GPS exactas de cada estación ferroviaria (-13.52° en Cusco, -13.15° en Aguas Calientes, etc.). "
        "Esta API extrae en tiempo real temperatura actual, humedad, probabilidad de lluvia, radiación UV andina y viento, procesadas bajo la política de caché Edge de 5 minutos y botón de refresco en vivo (?refresh=true).\n"
        "  2. APIs Simuladas mediante Mock Data Provider (PeruRail y Travel Group Perú): Al tratarse de corporaciones privadas que no ofrecen APIs públicas abiertas para entornos universitarios ni de desarrollo, "
        "el sistema emula su existencia mediante una arquitectura Mock Provider implementada en endpoints Serverless de Next.js (/api/estaciones, /api/horarios, /api/zonas). "
        "La data no es ficticia: emula de manera fidedigna las 6 estaciones andinas, las 27 frecuencias de trenes (Expedition, Vistadome, Tren Local con tarifas reales en PEN y USD) "
        "y los 12 circuitos peatonales con sus fotos WebP y coordenadas, persistidos en el clúster gestionado de Aiven for MySQL.\n"
        "  3. Contrato de Interfaz para Sustitución Futura en Producción: Estos endpoints fueron desacoplados con contratos estándar JSON/REST. "
        "En un entorno institucional definitivo, cuando el MTC formalice convenios de interoperabilidad con PeruRail y Travel Group, la capa de interfaz web (el asesor y las pantallas para turistas) "
        "no requerirá ninguna modificación: bastará con redirigir los conectores del servidor hacia las APIs propietarias reales de dichas organizaciones, reemplazando el mock provider de forma 100% transparente."
    )

    for p in doc.paragraphs:
        if p.text.strip().startswith('• 1. Módulo de Integración de Datos'):
            p.text = (
                "• 1. Módulo de Integración de Datos (APIs del Sistema):\n"
                "  - SENAMHI (API Satelital Real en Vivo): https://proyectofinal-mtc.vercel.app/api/senamhi (conecta a Open-Meteo por coordenadas GPS)\n"
                "  - PeruRail Estaciones (Mock API Provider): https://proyectofinal-mtc.vercel.app/api/estaciones (catálogo de 6 estaciones con GPS y altitud)\n"
                "  - PeruRail Horarios (Mock API Provider): https://proyectofinal-mtc.vercel.app/api/horarios (27 frecuencias ferroviarias y tarifas PEN/USD)\n"
                "  - Travel Group Zonas (Mock API Provider): https://proyectofinal-mtc.vercel.app/api/zonas (12 circuitos a pie con fotos WebP y coordenadas)\n"
                "  - Sincronizador MTC (Orquestador Institucional): https://proyectofinal-mtc.vercel.app/api/sync (monitoreo de latencia y refresco de flujos)"
            )
            # Insertar el párrafo explicativo a continuación
            p_note = doc.add_paragraph()
            p._p.addnext(p_note._p)
            p_note.paragraph_format.space_before = Pt(8)
            p_note.paragraph_format.space_after = Pt(8)
            p_note.paragraph_format.line_spacing = 1.15
            run_note = p_note.add_run(explanation_text)
            run_note.font.name = 'Calibri'
            run_note.font.size = Pt(8.5)
            run_note.font.color.rgb = RGBColor(51, 65, 85)
            print("Inserted mock explanation paragraph in PROYECTO_FINAL_ISO.docx.")
            break

    doc.save(doc_path)
    print("Saved:", doc_path)

    # 3. Actualizar también INFORME_PRACTICA_ZONAS_TURISTICAS.docx
    doc_path2 = '/home/jhean/Desktop/INFORME_PRACTICA_ZONAS_TURISTICAS.docx'
    doc2 = docx.Document(doc_path2)
    for p in doc2.paragraphs:
        if p.text.strip().startswith('1. Módulo de Integración:'):
            p.text = (
                "1. Módulo de Integración de Datos (APIs del Sistema):\n"
                "  - SENAMHI (API Satelital Real en Vivo): https://proyectofinal-mtc.vercel.app/api/senamhi (conecta a Open-Meteo por coordenadas GPS)\n"
                "  - PeruRail Estaciones (Mock API Provider): https://proyectofinal-mtc.vercel.app/api/estaciones (catálogo de 6 estaciones con GPS y altitud)\n"
                "  - PeruRail Horarios (Mock API Provider): https://proyectofinal-mtc.vercel.app/api/horarios (27 frecuencias ferroviarias y tarifas PEN/USD)\n"
                "  - Travel Group Zonas (Mock API Provider): https://proyectofinal-mtc.vercel.app/api/zonas (12 circuitos a pie con fotos WebP y coordenadas)\n"
                "  - Sincronizador MTC (Orquestador Institucional): https://proyectofinal-mtc.vercel.app/api/sync (monitoreo de latencia y refresco de flujos)"
            )
            p_note = doc2.add_paragraph()
            p._p.addnext(p_note._p)
            p_note.paragraph_format.space_before = Pt(8)
            p_note.paragraph_format.space_after = Pt(8)
            p_note.paragraph_format.line_spacing = 1.15
            run_note = p_note.add_run(explanation_text)
            run_note.font.name = 'Calibri'
            run_note.font.size = Pt(8.5)
            run_note.font.color.rgb = RGBColor(51, 65, 85)
            print("Inserted mock explanation paragraph in INFORME_PRACTICA_ZONAS_TURISTICAS.docx.")
            break

    doc2.save(doc_path2)
    print("Saved:", doc_path2)

if __name__ == '__main__':
    update_documents()
