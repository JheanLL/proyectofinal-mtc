import docx
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
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

def remove_row(table, row):
    table._tbl.remove(row._tr)

def main():
    doc_path = '/home/jhean/Desktop/INFORME_PRACTICA_ZONAS_TURISTICAS.docx'
    doc = docx.Document(doc_path)

    # Identificar tablas dinámicamente por encabezado
    t_rf = None
    t_hu = None
    t_tech = None
    t_bd = None
    t_pruebas = None
    t_cred = None
    t_rbac = None
    t_p1 = None

    for idx, t in enumerate(doc.tables):
        first_cell = t.rows[0].cells[0].text.strip()
        second_cell = t.rows[0].cells[1].text.strip() if len(t.rows[0].cells) > 1 else ""

        if 'Requerimiento Funcional' in second_cell:
            t_rf = t
        elif 'Rol / Actor' in second_cell:
            t_hu = t
        elif 'Tecnología' in first_cell:
            t_tech = t
        elif 'Tabla (tbl_)' in first_cell:
            t_bd = t
        elif first_cell == 'ID' and 'Módulo' in second_cell:
            t_pruebas = t
        elif 'Entidad / Institución' in first_cell:
            t_cred = t
        elif 'Operación / Funcionalidad' in first_cell or ('Turista / Público' in second_cell and len(t.columns) == 5):
            t_rbac = t
        elif 'Grupo 1: Requerimientos' in first_cell and len(t.columns) == 1:
            t_p1 = t

    print("Found tables:")
    print("  RF:", t_rf is not None)
    print("  HU:", t_hu is not None)
    print("  Tech:", t_tech is not None)
    print("  BD:", t_bd is not None)
    print("  Pruebas:", t_pruebas is not None)
    print("  Credenciales:", t_cred is not None)
    print("  RBAC:", t_rbac is not None)
    print("  Prompt 1:", t_p1 is not None)

    # 1. Limpiar t_bd: remover filas que empiecen con 'CP-'
    if t_bd:
        rows_to_remove = [r for r in t_bd.rows if r.cells[0].text.strip().startswith('CP-')]
        for r in rows_to_remove:
            remove_row(t_bd, r)
        print(f"Cleaned {len(rows_to_remove)} CP rows from BD table. Remaining rows: {len(t_bd.rows)}")

    # 2. Agregar CP-09, CP-10, CP-11 a t_pruebas
    if t_pruebas:
        existing_cp = [r.cells[0].text.strip() for r in t_pruebas.rows]
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
                row = t_pruebas.add_row()
                bg_hex = 'FFFFFF' if len(t_pruebas.rows) % 2 == 0 else 'F8FAFC'
                format_cell(row.cells[0], cp_id, bold=True, fill_hex=bg_hex)
                format_cell(row.cells[1], mod, bold=True, fill_hex=bg_hex)
                format_cell(row.cells[2], esc, fill_hex=bg_hex)
                format_cell(row.cells[3], res, fill_hex=bg_hex, color_rgb=(16, 185, 129))
                print(f"Added {cp_id} to Test Plan table.")

    # 3. Limpiar t_cred: remover filas que no sean credenciales (las filas de RBAC)
    if t_cred:
        rows_to_remove = [r for r in t_cred.rows if r.cells[0].text.strip().startswith(('Gestión de Filtros', 'Restauración de Registros'))]
        for r in rows_to_remove:
            remove_row(t_cred, r)
        print(f"Cleaned {len(rows_to_remove)} RBAC rows from Credenciales table. Remaining rows: {len(t_cred.rows)}")

    # 4. Arreglar t_rbac: restaurar encabezado [0][0] y agregar las dos operaciones si faltan
    if t_rbac:
        format_cell(t_rbac.rows[0].cells[0], 'Operación / Funcionalidad', bold=True, color_rgb=(255, 255, 255), fill_hex='0F172A', font_size=8.5)
        existing_ops = [r.cells[0].text.strip() for r in t_rbac.rows]
        new_ops = [
            ('Gestión de Filtros de Exclusión (Bajas Lógicas)', 'Denegado (401)', 'Permitido (ZONAS)', 'Permitido (HORARIOS)', 'Permitido (Global)'),
            ('Restauración de Registros desde Auditoría', 'Denegado (401)', 'Permitido (Solo ZONAS)', 'Permitido (Solo HORARIOS)', 'Permitido (Global)')
        ]
        for op, tur, tg, pr, mtc in new_ops:
            if op not in existing_ops:
                row = t_rbac.add_row()
                bg_hex = 'FFFFFF' if len(t_rbac.rows) % 2 == 0 else 'F8FAFC'
                format_cell(row.cells[0], op, bold=True, fill_hex=bg_hex)
                format_cell(row.cells[1], tur, fill_hex=bg_hex, color_rgb=(239, 68, 68) if 'Denegado' in tur else (16, 185, 129))
                format_cell(row.cells[2], tg, fill_hex=bg_hex, color_rgb=(239, 68, 68) if 'Denegado' in tg else (16, 185, 129))
                format_cell(row.cells[3], pr, fill_hex=bg_hex, color_rgb=(239, 68, 68) if 'Denegado' in pr else (16, 185, 129))
                format_cell(row.cells[4], mtc, fill_hex=bg_hex, color_rgb=(16, 185, 129))
                print(f"Added {op} to RBAC matrix.")

    # 5. Actualizar t_p1 (Anexo Prompt 1) con MoSCoW que incluya RF-12, RF-13, RF-14
    if t_p1:
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
        format_cell(t_p1.rows[0].cells[0], updated_t8_text, fill_hex='F8FAFC', font_size=8.5)
        print("Updated Prompt 1 table with comprehensive MoSCoW prioritization.")

    # Guardar
    doc.save(doc_path)
    print("Fix script completed and saved to:", doc_path)

if __name__ == '__main__':
    main()
