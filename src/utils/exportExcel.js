import * as XLSX from 'xlsx';

export function exportToExcel(filename, headers, rows) {
  if (!rows || rows.length === 0) {
    alert('No hay datos disponibles con los filtros aplicados para exportar.');
    return;
  }

  // Transformar dataset filtrado completo (ignorando paginación)
  const data = rows.map(row => {
    const obj = {};
    headers.forEach(h => {
      try {
        const val = typeof h.accessor === 'function' ? h.accessor(row) : row[h.accessor];
        obj[h.label] = val === null || val === undefined ? '' : val;
      } catch {
        obj[h.label] = '';
      }
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

  // Ajustar anchos de columnas dinámicamente
  const colWidths = headers.map(h => {
    let maxLen = h.label.length;
    data.forEach(row => {
      const cellVal = String(row[h.label] || '');
      if (cellVal.length > maxLen) {
        maxLen = Math.min(cellVal.length, 55);
      }
    });
    return { wch: maxLen + 3 };
  });
  worksheet['!cols'] = colWidths;

  // Exportar como archivo binario nativo .xlsx
  const fileTitle = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileTitle);
}
