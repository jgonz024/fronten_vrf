import React from 'react';

export default function TipoActivoList({ tipos, isAdmin, selectedTipoId, onAddNew, onSelectTipo, onDelete, onRestore }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Listado de Tipos de Activo</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Haz clic en un tipo de activo para editarlo en el panel lateral ({tipos.length})</p>
        </div>
        <button onClick={onAddNew} className="btn btn-primary">
          + Añadir
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>TIPO DE ACTIVO</th>
            <th>DESCRIPCIÓN</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {tipos.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No hay tipos de activos registrados.
              </td>
            </tr>
          ) : (
            tipos.map(item => {
              const isDeleted = item.eliminado;
              const isSelected = selectedTipoId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectTipo(item)}
                  style={{
                    cursor: 'pointer',
                    opacity: isDeleted ? 0.55 : 1,
                    background: isSelected
                      ? 'rgba(0, 198, 255, 0.15)'
                      : isDeleted ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                  }}
                >
                  <td><span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>#{item.id}</span></td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🔧 {item.nombre}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {item.descripcion || 'Sin descripción'}
                  </td>
                  <td>
                    {isDeleted ? (
                      <span className="badge badge-danger">🗑️ Eliminado (Lógico)</span>
                    ) : (
                      <span className="badge badge-active">Activo</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={(e) => { e.stopPropagation(); onSelectTipo(item); }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        ✏️ Editar
                      </button>
                      {isDeleted ? (
                        isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); onRestore(item.id); }} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                            🔄
                          </button>
                        )
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
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
