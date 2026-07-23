export function exportToExcel(filename, headers, rows) {
  if (!rows || rows.length === 0) {
    alert('No hay datos disponibles con los filtros aplicados para exportar.');
    return;
  }

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(h => escapeCell(h.label)).join(';');
  const dataLines = rows.map(row => {
    return headers.map(h => {
      try {
        const val = typeof h.accessor === 'function' ? h.accessor(row) : row[h.accessor];
        return escapeCell(val);
      } catch {
        return '""';
      }
    }).join(';');
  });

  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
