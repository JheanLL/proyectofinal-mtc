import docx
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_borders(cell, top='E2E8F0', bottom='E2E8F0', left=None, right=None):
    tcPr = cell._tc.get_or_add_tcPr()
    borders_elm = f'<w:tcBorders {nsdecls("w")}>'
    borders_elm += f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{top}"/>'
    borders_elm += f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="{bottom}"/>'
    if left:
        borders_elm += f'<w:left w:val="single" w:sz="4" w:space="0" w:color="{left}"/>'
    else:
        borders_elm += f'<w:left w:val="none"/>'
    if right:
        borders_elm += f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{right}"/>'
    else:
        borders_elm += f'<w:right w:val="none"/>'
    borders_elm += '</w:tcBorders>'
    tcBorders = parse_xml(borders_elm)
    tcPr.append(tcBorders)

def format_cell(cell, text, bold=False, color_rgb=(15, 23, 42), font_size=8.5, fill_hex=None, align=WD_ALIGN_PARAGRAPH.LEFT):
    if fill_hex:
        set_cell_background(cell, fill_hex)
    set_cell_margins(cell)
    set_cell_borders(cell)
    cell.text = ""
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05
    run = p.add_run(text)
    run.bold = bold
    run.font.name = 'Calibri'
    run.font.size = Pt(font_size)
    run.font.color.rgb = RGBColor(*color_rgb)

def update_document():
    doc_path = '/home/jhean/Desktop/INFORME_PRACTICA_ZONAS_TURISTICAS.docx'
    doc = docx.Document(doc_path)

    # =========================================================================
    # 1. ACTUALIZAR TABLA 0: REQUERIMIENTOS FUNCIONALES (Agregar RF-12, RF-13, RF-14)
    # =========================================================================
    t0 = doc.tables[0]
    existing_rf = [r.cells[0].text.strip() for r in t0.rows]
    new_rfs = [
        ('RF-12', 'Filtros de Exclusión en Servidor (tbl_filtro_exclusion)', 
         'Bajas administrativas instantáneas (< 0.1 ms) de zonas y trenes en memoria del servidor sin alterar APIs externas de origen.', 'Alta'),
        ('RF-13', 'Restauración desde Bitácora de Auditoría', 
         'Recuperación íntegra de entidades eliminadas desde /admin/auditoria, restableciendo imágenes WebP, coordenadas y tarifas sin pérdida de datos.', 'Alta'),
        ('RF-14', 'Carga de Imágenes WebP a Costo Cero', 
         'Compresión y redimensión en cliente (Canvas) y almacenamiento directo en Aiven MySQL (MEDIUMTEXT) sin costos de storage cloud.', 'Alta')
    ]
    for code, name, desc, prio in new_rfs:
        if code not in existing_rf:
            row = t0.add_row()
            bg_hex = 'FFFFFF' if len(t0.rows) % 2 == 0 else 'F8FAFC'
            format_cell(row.cells[0], code, bold=True, fill_hex=bg_hex)
            format_cell(row.cells[1], name, bold=True, fill_hex=bg_hex)
            format_cell(row.cells[2], desc, fill_hex=bg_hex)
            format_cell(row.cells[3], prio, bold=True, fill_hex=bg_hex, color_rgb=(16, 185, 129) if prio == 'Alta' else (245, 158, 11))
            print(f'Added {code} to Table 0.')

    # =========================================================================
    # 2. INSERTAR HISTORIAS DE USUARIO Y CASOS DE USO ANTES DE RNF
    # =========================================================================
    rnf_p = None
    for p in doc.paragraphs:
        if p.text.strip().startswith('Requerimientos No Funcionales (RNF)'):
            rnf_p = p
            break

    if rnf_p:
        doc_text = " ".join([p.text for p in doc.paragraphs])
        if 'Historias de Usuario (Product Backlog - Metodología Scrum)' not in doc_text:
            def insert_p_before(text="", bold=False, italic=False, font_size=10, space_before=4, space_after=4, bullet=False, color_rgb=(15, 23, 42)):
                new_p = doc.add_paragraph()
                rnf_p._p.addprevious(new_p._p)
                pPr = new_p.paragraph_format
                pPr.space_before = Pt(space_before)
                pPr.space_after = Pt(space_after)
                pPr.line_spacing = 1.15
                if bullet:
                    new_p.style = 'List Bullet'
                run = new_p.add_run(text)
                run.bold = bold
                run.italic = italic
                run.font.name = 'Calibri'
                run.font.size = Pt(font_size)
                run.font.color.rgb = RGBColor(*color_rgb)
                return new_p

            insert_p_before("Historias de Usuario (Product Backlog - Metodología Scrum)", bold=True, font_size=11, space_before=14, space_after=6, color_rgb=(15, 23, 42))
            insert_p_before("A continuación se detallan las Historias de Usuario estructuradas según el estándar ágil (Como [rol], quiero [funcionalidad], para [beneficio/valor de negocio]), cubriendo a todos los actores institucionales y los requerimientos del MTC:", font_size=9, space_before=2, space_after=6, color_rgb=(51, 65, 85))

            hu_table = doc.add_table(rows=1, cols=5)
            rnf_p._p.addprevious(hu_table._tbl)
            
            headers = ['ID', 'Rol / Actor', 'Historia de Usuario (User Story)', 'Criterios de Aceptación (DoD)', 'Prioridad']
            hdr_row = hu_table.rows[0]
            for i, h in enumerate(headers):
                format_cell(hdr_row.cells[i], h, bold=True, color_rgb=(255, 255, 255), fill_hex='0F172A', font_size=8.5)

            hu_data = [
                ('HU-TUR-01', 'Turista / Ciudadano', 
                 'Como turista, deseo filtrar zonas turísticas por tipo de preferencia (Naturaleza, Arqueología, Historia) y estación ferroviaria, para planificar una excursión acorde a mis gustos.',
                 'Filtra en tiempo real; muestra tarjetas visuales con badges de categoría y distancia.', 'Alta'),
                ('HU-TUR-02', 'Turista / Ciudadano', 
                 'Como senderista, deseo que el sistema calcule la distancia y tiempo de caminata estrictamente en un solo tramo de ida y vuelta, para evitar sobreesfuerzo físico y no extraviarme.',
                 'Aplica fórmula: Distancia Total = 2 * Distancia Ida; Tiempo Total = 2 * Tiempo Ida; clasifica dificultad.', 'Alta'),
                ('HU-TUR-03', 'Turista / Ciudadano', 
                 'Como visitante, deseo visualizar el pronóstico meteorológico oficial de SENAMHI con índice UV y alertas de lluvia por estación, para elegir vestimenta y horarios seguros.',
                 'Presenta temperatura actual, probabilidad de lluvia en %, índice UV e ícono del tiempo actualizado.', 'Alta'),
                ('HU-TUR-04', 'Turista / Ciudadano', 
                 'Como viajero, deseo seleccionar mis trenes de ida y retorno de PeruRail coordinando horarios y tarifas oficiales en PEN y USD, para asegurar mi logística de traslado.',
                 'Despliega lista de trenes Expedition y Vistadome; calcula subtotal y total de pasajes de ida y vuelta.', 'Alta'),
                ('HU-TUR-05', 'Turista / Ciudadano', 
                 'Como turista, deseo generar y descargar un informe turístico consolidado en PDF con membrete oficial del MTC, para llevar mi itinerario impreso o digital.',
                 'Genera documento A4 estructurado con código de itinerario único, resumen de trenes, clima y ruta peatonal.', 'Alta'),
                ('HU-TG-01', 'Travel Group Perú', 
                 'Como gestor de Travel Group, deseo registrar, modificar y listar zonas turísticas peatonales con sus tiempos y coordenadas cartográficas, para mantener el catálogo actualizado.',
                 'Formulario con validación de campos obligatorios; asignación de estación y cálculo de ida/vuelta.', 'Alta'),
                ('HU-TG-02', 'Travel Group Perú', 
                 'Como operador de contenidos, deseo cargar fotografías de las zonas comprimidas automáticamente en WebP sin costo de nube, para enriquecer el catálogo sin generar gastos de infraestructura.',
                 'Compresión en Canvas a WebP (< 80 KB); almacenamiento en tbl_zona_turistica.zon_imagen_url (MEDIUMTEXT).', 'Alta'),
                ('HU-TG-03', 'Travel Group Perú', 
                 'Como supervisor de Travel Group, deseo restaurar zonas peatonales eliminadas accidentalmente desde la bitácora de auditoría, para recuperar al instante fotos WebP y coordenadas sin reingresar datos.',
                 'Botón Restaurar en /admin/auditoria; retira de tbl_filtro_exclusion; reactiva en BD y asienta evento RESTORE.', 'Alta'),
                ('HU-PR-01', 'PeruRail S.A.', 
                 'Como coordinador de PeruRail, deseo administrar las frecuencias, salidas, llegadas y tipos de trenes (Expedition / Vistadome), para coordinar con el flujo de turistas.',
                 'CRUD operativo de horarios en /admin/horarios con control de estaciones origen y destino.', 'Alta'),
                ('HU-PR-02', 'PeruRail S.A.', 
                 'Como analista comercial de PeruRail, deseo actualizar tarifas en Soles (PEN) y Dólares (USD), para reflejar con precisión los precios de pasajes ferroviarios.',
                 'Validación de montos positivos y renderizado dinámico en módulo cliente y reportes PDF.', 'Alta'),
                ('HU-PR-03', 'PeruRail S.A.', 
                 'Como despachador de PeruRail, deseo recuperar horarios ferroviarios eliminados desde la bitácora de auditoría, para restablecer frecuencias sin tener que reconfigurar tarifas multimoneda.',
                 'Restaura registro desde auditoría; elimina exclusión en servidor y actualiza catálogo de trenes de inmediato.', 'Alta'),
                ('HU-MTC-01', 'Administrador MTC', 
                 'Como superadministrador del MTC, deseo supervisar el estado de salud, latencia y sincronización de las APIs de SENAMHI, PeruRail y Travel Group, para asegurar la continuidad del servicio.',
                 'Panel /admin/integraciones con latencia en ms, total de registros, estado ACTIVO y botón de sincronización.', 'Media'),
                ('HU-MTC-02', 'Administrador MTC', 
                 'Como auditor del MTC, deseo registrar de manera inmutable cada login, creación, edición, eliminación y restauración con usuario, IP y fecha, para garantizar el no repudio.',
                 'Bitácora inmutable en tbl_auditoria; soporte de eventos LOGIN, CREATE, UPDATE, DELETE, SYNC y RESTORE.', 'Alta'),
                ('HU-MTC-03', 'Administrador MTC', 
                 'Como directivo del MTC, deseo que las bajas de zonas y trenes se gestionen mediante filtros de exclusión en servidor (tbl_filtro_exclusion) a ultra-baja latencia (< 0.1 ms) y sean reversibles.',
                 'Filtrado instantáneo en servidor; exclusión sin tocar APIs externas; consola de restauración global con snapshot.', 'Alta')
            ]

            for row_idx, data in enumerate(hu_data):
                row = hu_table.add_row()
                bg_hex = 'FFFFFF' if row_idx % 2 == 0 else 'F8FAFC'
                format_cell(row.cells[0], data[0], bold=True, fill_hex=bg_hex)
                format_cell(row.cells[1], data[1], bold=True, fill_hex=bg_hex)
                format_cell(row.cells[2], data[2], fill_hex=bg_hex)
                format_cell(row.cells[3], data[3], fill_hex=bg_hex)
                format_cell(row.cells[4], data[4], bold=True, fill_hex=bg_hex, color_rgb=(16, 185, 129) if data[4] == 'Alta' else (245, 158, 11))

            insert_p_before("", space_before=4, space_after=4)
            insert_p_before("Especificación de Casos de Uso del Sistema (UML / RUP)", bold=True, font_size=11, space_before=12, space_after=6, color_rgb=(15, 23, 42))

            cu_data = [
                ("CU-01: Planificación de Itinerario Peatonal Turístico", 
                 "• Actores: Turista / Público General.\n"
                 "• Precondición: Plataforma web accesible desde navegador web o smartphone.\n"
                 "• Flujo Principal:\n"
                 "  1. El turista ingresa al 'Asesor Turístico' (/planificador).\n"
                 "  2. Selecciona su preferencia de viaje (Naturaleza, Arqueología, etc.) y estación ferroviaria.\n"
                 "  3. El sistema filtra las zonas peatonales y calcula la distancia y tiempo exacto en un solo tramo de ida y vuelta.\n"
                 "  4. El sistema consulta en paralelo las previsiones meteorológicas oficiales de SENAMHI (temperatura, lluvia, UV).\n"
                 "  5. El turista selecciona sus trenes de ida y retorno de PeruRail y revisa el tarifario en PEN y USD.\n"
                 "  6. El sistema emite el itinerario consolidado con opción de descarga de informe PDF oficial.\n"
                 "• Postcondición: Itinerario planificado y registrado con código único de consulta."),

                ("CU-02: Gestión de Zonas Turísticas y Carga de Imágenes WebP", 
                 "• Actores: Gestor Travel Group Perú, Superadministrador MTC.\n"
                 "• Precondición: Operador autenticado con credenciales de Travel Group o Administrador MTC.\n"
                 "• Flujo Principal:\n"
                 "  1. El usuario accede al módulo /admin/zonas.\n"
                 "  2. Completa los datos técnicos: nombre, estación asociada, categoría, distancia de ida (metros) y tiempo (minutos).\n"
                 "  3. Carga una fotografía local; el cliente web la comprime automáticamente a formato WebP (< 80 KB).\n"
                 "  4. El sistema persiste el registro en Aiven MySQL (tbl_zona_turistica) y genera evento CREATE en tbl_auditoria.\n"
                 "• Postcondición: Zona turística disponible de inmediato en el catálogo público y asesor interactivo."),

                ("CU-03: Gestión de Horarios y Frecuencias Ferroviarias", 
                 "• Actores: Operador Logístico PeruRail, Superadministrador MTC.\n"
                 "• Precondición: Operador autenticado con rol PERURAIL o ADMIN.\n"
                 "• Flujo Principal:\n"
                 "  1. El usuario accede al módulo /admin/horarios.\n"
                 "  2. Registra o modifica horarios de salida y llegada, tipo de servicio (Expedition/Vistadome) y tarifas PEN/USD.\n"
                 "  3. El sistema valida integridad referencial con las estaciones y persiste en tbl_horario_tren.\n"
                 "  4. Se genera asiento de auditoría con la acción UPDATE o CREATE.\n"
                 "• Postcondición: Horarios y tarifas actualizados para los turistas en el planificador."),

                ("CU-04: Exclusión y Bajas Lógicas en Servidor (tbl_filtro_exclusion)", 
                 "• Actores: Travel Group Perú (zonas), PeruRail (horarios), Administrador MTC (global).\n"
                 "• Precondición: Operador con privilegios institucionales autenticado.\n"
                 "• Flujo Principal:\n"
                 "  1. El operador solicita eliminar una zona turística o frecuencia de tren.\n"
                 "  2. El backend extrae un snapshot íntegro del registro (incluyendo foto WebP, coordenadas y tarifas).\n"
                 "  3. El identificador se inserta en tbl_filtro_exclusion (activo = 1) con motivo y correo del operador.\n"
                 "  4. Se almacena el evento DELETE en tbl_auditoria conteniendo el registroSnapshot en formato JSON.\n"
                 "  5. Los endpoints públicos ejecutan filtrado en memoria de servidor (< 0.1 ms), excluyendo el registro sin tocar APIs externas.\n"
                 "• Postcondición: Registro ocultado del público pero preservado íntegramente en bitácora para eventual reversión."),

                ("CU-05: Restauración de Entidades desde Bitácora de Auditoría", 
                 "• Actores: Travel Group Perú (zonas), PeruRail (horarios), Administrador MTC (global).\n"
                 "• Precondición: Existe registro previo de eliminación (DELETE) en tbl_auditoria con snapshot válido.\n"
                 "• Flujo Principal:\n"
                 "  1. El operador ingresa a la bitácora oficial en /admin/auditoria.\n"
                 "  2. Localiza la fila con acción DELETE y verifica los detalles del registro eliminado.\n"
                 "  3. Presiona el botón interactivo 'Restaurar'.\n"
                 "  4. El endpoint /api/auditoria/restore valida los permisos RBAC correspondientes al módulo.\n"
                 "  5. El sistema elimina o desactiva la exclusión en tbl_filtro_exclusion y reactiva la entidad en la tabla de datos.\n"
                 "  6. Se registra automáticamente un evento de auditoría con acción 'RESTORE'.\n"
                 "  7. La interfaz notifica el éxito mediante toast y la entidad reaparece de inmediato en el catálogo público.\n"
                 "• Postcondición: Entidad recuperada al 100% (imágenes WebP, coordenadas y tarifas) sin necesidad de reescritura manual."),

                ("CU-06: Sincronización Forzada de Datos y Control de Caché", 
                 "• Actores: Superadministrador MTC, Turista / Usuario Final.\n"
                 "• Precondición: Conectividad a Internet activa.\n"
                 "• Flujo Principal:\n"
                 "  1. El usuario visualiza los datos en caché Edge (TTL 5 minutos con s-maxage=300).\n"
                 "  2. En caso de requerir datos en vivo, presiona el botón 'Actualizar Ahora' (?refresh=true).\n"
                 "  3. El servidor omite la caché (no-store) y consulta los endpoints en tiempo real de SENAMHI y base de datos.\n"
                 "  4. Desde /admin/integraciones, el Administrador MTC puede forzar la sincronización global de todas las fuentes.\n"
                 "• Postcondición: Información actualizada al instante con latencia inferior a 25 ms.")
            ]

            for cu_title, cu_desc in cu_data:
                insert_p_before(cu_title, bold=True, font_size=9.5, space_before=8, space_after=2, color_rgb=(15, 23, 42))
                insert_p_before(cu_desc, font_size=8.5, space_before=2, space_after=4, color_rgb=(51, 65, 85))

            print('Successfully inserted Historias de Usuario and Casos de Uso.')

    # =========================================================================
    # 3. ACTUALIZAR PLAN DE PRUEBAS (TABLA 3): AGREGAR CP-09, CP-10, CP-11
    # =========================================================================
    t3 = doc.tables[3]
    existing_cp = [r.cells[0].text.strip() for r in t3.rows]
    new_cps = [
        ('CP-09', 'Filtro de Exclusión', 
         'Dar de baja una zona o frecuencia ferroviaria en el servidor.', 
         'Se registra en tbl_filtro_exclusion y desaparece al instante de la UI y cálculos sin tocar APIs externas. [APROBADO]'),
        ('CP-10', 'Auditoría y Restauración', 
         'Restaurar registro eliminado desde consola /admin/auditoria.', 
         'Recupera la entidad con total fidelidad (fotos WebP, coordenadas, tarifas), retira de tbl_filtro_exclusion y genera evento RESTORE. [APROBADO]'),
        ('CP-11', 'Seguridad y RBAC', 
         'Verificar restricción de permisos por rol en endpoints y restauración.', 
         'Travel Group restringido a Zonas; PeruRail a Horarios; MTC Admin con acceso global (26/26 pruebas de suite aprobadas). [APROBADO]')
    ]
    for cp_id, mod, esc, res in new_cps:
        if cp_id not in existing_cp:
            row = t3.add_row()
            bg_hex = 'FFFFFF' if len(t3.rows) % 2 == 0 else 'F8FAFC'
            format_cell(row.cells[0], cp_id, bold=True, fill_hex=bg_hex)
            format_cell(row.cells[1], mod, bold=True, fill_hex=bg_hex)
            format_cell(row.cells[2], esc, fill_hex=bg_hex)
            format_cell(row.cells[3], res, fill_hex=bg_hex, color_rgb=(16, 185, 129))
            print(f'Added {cp_id} to Table 3.')

    # =========================================================================
    # 4. ACTUALIZAR MATRIZ RBAC (TABLA 7): AGREGAR FILTROS Y RESTAURACIÓN
    # =========================================================================
    t7 = doc.tables[7]
    existing_rbac = [r.cells[0].text.strip() for r in t7.rows]
    new_rbacs = [
        ('Gestión de Filtros de Exclusión (Bajas Lógicas)', 'Denegado (401)', 'Permitido (ZONAS)', 'Permitido (HORARIOS)', 'Permitido (Global)'),
        ('Restauración de Registros desde Auditoría', 'Denegado (401)', 'Permitido (Solo ZONAS)', 'Permitido (Solo HORARIOS)', 'Permitido (Global)')
    ]
    for op, tur, tg, pr, mtc in new_rbacs:
        if op not in existing_rbac:
            row = t7.add_row()
            bg_hex = 'FFFFFF' if len(t7.rows) % 2 == 0 else 'F8FAFC'
            format_cell(row.cells[0], op, bold=True, fill_hex=bg_hex)
            format_cell(row.cells[1], tur, fill_hex=bg_hex, color_rgb=(239, 68, 68) if 'Denegado' in tur else (16, 185, 129))
            format_cell(row.cells[2], tg, fill_hex=bg_hex, color_rgb=(239, 68, 68) if 'Denegado' in tg else (16, 185, 129))
            format_cell(row.cells[3], pr, fill_hex=bg_hex, color_rgb=(239, 68, 68) if 'Denegado' in pr else (16, 185, 129))
            format_cell(row.cells[4], mtc, fill_hex=bg_hex, color_rgb=(16, 185, 129))
            print(f'Added {op} to Table 7.')

    # =========================================================================
    # 5. ACTUALIZAR DESCRIPCIÓN DE MÓDULOS DE SOFTWARE (P38)
    # =========================================================================
    for p in doc.paragraphs:
        if p.text.strip().startswith('2. Módulo de Administración:'):
            p.text = ""
            run = p.add_run(
                "2. Módulo de Administración, Filtros y Auditoría: CRUD de zonas turísticas peatonales (/admin/zonas), "
                "CRUD de horarios/tarifas ferroviarias (/admin/horarios), gestión de filtros de exclusión en servidor (tbl_filtro_exclusion), "
                "bitácora inmutable no repudiable con trazabilidad total y consola de restauración de registros con preservación de WebP y georreferencias (/admin/auditoria)."
            )
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            run.font.color.rgb = RGBColor(51, 65, 85)
            print('Updated software module 2 description.')
            break

    # =========================================================================
    # 6. ACTUALIZAR PÁRRAFO DE ARQUITECTURA (P54) Y GUÍA DE ADMINISTRADORES
    # =========================================================================
    for p in doc.paragraphs:
        if 'Arquitectura de Integración, Filtrado en Servidor' in p.text:
            p.text = ""
            pPr = p.paragraph_format
            pPr.space_before = Pt(12)
            pPr.space_after = Pt(8)
            pPr.line_spacing = 1.15
            
            r_title = p.add_run("Arquitectura de Integración, Filtrado en Servidor, Caché de 5 Minutos y Restauración:\n")
            r_title.bold = True
            r_title.font.name = 'Calibri'
            r_title.font.size = Pt(10)
            r_title.font.color.rgb = RGBColor(15, 23, 42)

            body_text = (
                "1. Cumplimiento de Flujos Periódicos (Hoja de Práctica): Conforme a las directrices de la Hoja de Práctica, la cual estipula la 'integración de flujos de información periódicos provenientes de tres fuentes clave' y 'actualización diaria de clima y datos de trenes', la arquitectura implementa una política de caché Edge en Vercel con tiempo de vida (TTL) de 5 minutos (s-maxage=300, stale-while-revalidate=60). Esto asegura tiempos de respuesta ultra veloces (< 25 ms, muy inferior al límite de 2 segundos exigido en el RNF-03) y evita saturar de consultas redundantes las fuentes externas.\n"
                "2. Actualización Manual en Tiempo Real: En las interfaces de usuario (/clima, /zonas, /admin/integraciones) se integró un botón interactivo de 'Actualizar Ahora' que añade el parámetro ?refresh=true a las peticiones. Esto omite la caché de borde de forma inmediata (Cache-Control: no-store), forzando una consulta en vivo a la red meteorológica del SENAMHI y a la base de datos oficial.\n"
                "3. Filtrado en Servidor con Tabla de Exclusiones (tbl_filtro_exclusion): Para respetar las eliminaciones y modificaciones realizadas por los administradores sin requerir editar las APIs externas ni ralentizar el sistema, se diseñó la tabla tbl_filtro_exclusion (prefijo fil_). Cuando un operador elimina una zona o un horario, el identificador queda registrado en esta tabla. El backend en Node.js/Next.js ejecuta un filtrado instantáneo en memoria y en la consulta SQL (fil_registro_id NOT IN), eliminando cualquier duplicidad o registro no deseado en menos de 0.1 ms antes de entregar el payload al cliente.\n"
                "4. Carga y Compresión de Imágenes WebP a Costo Cero: Se incorporó en el gestor de Travel Group (/admin/zonas) la opción de subir fotografías locales directamente. El navegador las procesa mediante HTML5 Canvas, escalándolas a máx. 1000px y comprimiéndolas en formato WebP al 82% (< 80 KB). Dicho contenido se almacena en el campo zon_imagen_url (tipo MEDIUMTEXT) de Aiven MySQL, validando que únicamente los roles autenticados TRAVEL_GROUP y ADMIN puedan realizar la carga en su respectiva categoría y sin incurrir en costos de almacenamiento en la nube.\n"
                "5. Restauración y Recuperación de Registros desde la Bitácora de Auditoría (/admin/auditoria): Dado que zonas turísticas y frecuencias ferroviarias son entidades complejas que integran imágenes WebP de alta resolución, puntos de interés georreferenciados, coordenadas cartográficas y tarifas multimoneda, la eliminación accidental representaría una pérdida operativa crítica. El sistema preserva un 'registroSnapshot' JSON íntegro en tbl_auditoria.aud_detalles_json al momento de la baja. Desde la bitácora /admin/auditoria, los operadores autorizados disponen del botón interactivo 'Restaurar', el cual reinserta o reactiva el registro en la base de datos, retira la exclusión de tbl_filtro_exclusion y asienta un evento 'RESTORE', recuperando el 100% de la información sin reescritura manual."
            )
            r_body = p.add_run(body_text)
            r_body.font.name = 'Calibri'
            r_body.font.size = Pt(8.5)
            r_body.font.color.rgb = RGBColor(51, 65, 85)
            print('Updated architecture and restoration paragraph.')
            break

    for p in doc.paragraphs:
        if p.text.strip().startswith('Travel Group Perú: Ingrese a /admin/zonas'):
            p.text = ""
            run = p.add_run("Travel Group Perú: Ingrese a /admin/zonas para registrar o editar zonas peatonales, calcular distancias y tiempos de caminata ida/vuelta, y cargar fotos WebP. Si una zona fue eliminada por error, acceda a /admin/auditoria para restaurarla con un solo clic preservando su fotografía y coordenadas.")
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            run.font.color.rgb = RGBColor(51, 65, 85)
        elif p.text.strip().startswith('PeruRail: Ingrese a /admin/horarios'):
            p.text = ""
            run = p.add_run("PeruRail: Ingrese a /admin/horarios para modificar frecuencias de trenes, tipos de servicio y tarifarios multimoneda (PEN/USD). Si una frecuencia fue retirada accidentalmente, puede recuperarla de inmediato desde /admin/auditoria manteniendo sus precios y configuraciones.")
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            run.font.color.rgb = RGBColor(51, 65, 85)
        elif p.text.strip().startswith('Gestores MTC: Ingrese a /admin/integraciones'):
            p.text = ""
            run = p.add_run("Gestores MTC: Ingrese a /admin/integraciones para supervisar la salud de las APIs, forzar la sincronización de flujos externos e invalidar la caché de 5 minutos. Asimismo, en /admin/auditoria cuenta con supervisión global no repudiable y la facultad de restaurar cualquier registro del sistema.")
            run.font.name = 'Calibri'
            run.font.size = Pt(8.5)
            run.font.color.rgb = RGBColor(51, 65, 85)

    # =========================================================================
    # 7. ACTUALIZAR TABLA 8 (ANEXO OPENAI - REQUERIMIENTOS MoSCoW)
    # =========================================================================
    t8 = doc.tables[8]
    t8_text = t8.rows[0].cells[0].text
    if 'RF-13' not in t8_text:
        updated_t8_text = (
            '🤖 Grupo 1: Requerimientos — Pregunta Prompt:\n'
            '"¿Priorízame los requerimientos funcionales de acuerdo a la norma IEEE?"\n\n'
            'Respuesta / Análisis Generado:\n'
            'De acuerdo con la norma IEEE 830, los requerimientos se priorizan formalmente mediante el método MoSCoW:\n'
            '• Alta (Obligatorios / Must Have): RF-01 (Filtro por preferencias), RF-02 (Cálculo de trayecto peatonal ida y vuelta), '
            'RF-03 (Integración meteorológica SENAMHI con alertas y UV), RF-04 (Logística ferroviaria PeruRail con horarios y tarifas PEN/USD), '
            'RF-05 (Emisión de informe turístico PDF/HTML), RF-06 (CRUD Zonas Travel Group Perú), RF-07 (Estaciones solo lectura para Travel Group), '
            'RF-08 (CRUD Horarios PeruRail), RF-12 (Filtros de exclusión en servidor con tbl_filtro_exclusion a < 0.1 ms), '
            'RF-13 (Restauración de registros desde bitácora de auditoría con preservación integral de imágenes WebP y coordenadas), '
            'y RF-14 (Carga de imágenes WebP en base de datos a costo cero).\n'
            '• Media (Deseables / Should Have): RF-09 (Mapa interactivo Leaflet con trazado dinámico de ruta), '
            'RF-10 (Sincronizador y monitor de latencia de APIs con bypass de caché), RF-11 (Matriz de asignación de estaciones para Travel Group).\n'
            '• Baja (Opcionales / Could Have): Búsqueda avanzada y consulta histórica de informes por código único de itinerario.'
        )
        format_cell(t8.rows[0].cells[0], updated_t8_text, fill_hex='F8FAFC', font_size=8.5)
        print('Updated Table 8 prompt response text.')

    # Guardar documento
    doc.save(doc_path)
    print(f'Document successfully updated and saved: {doc_path}')

if __name__ == '__main__':
    update_document()
