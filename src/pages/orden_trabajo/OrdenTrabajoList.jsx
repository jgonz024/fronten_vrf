import React from 'react';

export default function OrdenTrabajoList({ ordenes, isAdmin, selectedOrdenId, onAddNew, onSelectOrden, onDelete, onRestore }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        // AppSheet / Excel Serial Date (e.g. 46031)
        if (!isNaN(dateStr)) {
          const serial = Number(dateStr);
          const utcDays = Math.floor(serial - 25569);
          const date = new Date(utcDays * 86400 * 1000);
          return date.toLocaleDateString();
        }
        return dateStr;
      }
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Listado de Órdenes de Trabajo</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Haz clic en una fila para editarla en el panel lateral ({ordenes.length})</p>
        </div>
        <button onClick={onAddNew} className="btn btn-primary">
          + Nueva OT
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>FOLIO</th>
            <th>TÍTULO / TRABAJO</th>
            <th>CLIENTE</th>
            <th>TÉCNICO</th>
            <th>PROGRAMACIÓN</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No hay órdenes de trabajo registradas.
              </td>
            </tr>
          ) : (
            ordenes.map(item => {
              const isDeleted = item.eliminado;
              const isSelected = selectedOrdenId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectOrden(item)}
                  style={{
                    cursor: 'pointer',
                    opacity: isDeleted ? 0.55 : 1,
                    background: isSelected
                      ? 'rgba(0, 198, 255, 0.15)'
                      : isDeleted ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                  }}
                >
                  <td><span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>#{item.id}</span></td>
                  <td><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.folio || 'N/A'}</span></td>
                  <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.titulo_ot}</span>
                  </td>
                  <td><span style={{ fontSize: '13px' }}>🏢 {item.cliente_nombre || 'N/A'}</span></td>
                  <td><span style={{ fontSize: '13px' }}>👤 {item.usuario_nombre || 'No asignado'}</span></td>
                  <td><span style={{ fontSize: '13px' }}>📅 {formatDate(item.fecha_programacion)}</span></td>
                  <td>
                    {isDeleted ? (
                      <span className="badge badge-danger">🗑️ Eliminada</span>
                    ) : (
                      <span className="badge badge-active">{item.estado_ot_nombre || 'Activa'}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => onSelectOrden(item)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        ✏️ Editar
                      </button>
                      {isDeleted ? (
                        isAdmin && (
                          <button onClick={() => onRestore(item.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                            🔄
                          </button>
                        )
                      ) : (
                        <button onClick={() => onDelete(item.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
