import React from 'react';

export default function TipoClienteList({ tipos, isAdmin, onAddNew, onEdit, onDelete, onRestore }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Listado de Tipos de Cliente</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total registrados: {tipos.length}</p>
        </div>
        <button onClick={onAddNew} className="btn btn-primary">
          + Nuevo Tipo de Cliente
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOMBRE DEL TIPO</th>
            <th>DESCRIPCIÓN</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {tipos.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No hay tipos de cliente registrados.
              </td>
            </tr>
          ) : (
            tipos.map(item => {
              const isDeleted = item.eliminado;
              return (
                <tr
                  key={item.id}
                  style={isDeleted ? { opacity: 0.5, background: 'rgba(239, 68, 68, 0.08)' } : {}}
                >
                  <td><span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>#{item.id}</span></td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🏷️ {item.nombre}</span>
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isDeleted ? (
                        isAdmin && (
                          <button onClick={() => onRestore(item.id)} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                            🔄 Restaurar
                          </button>
                        )
                      ) : (
                        <>
                          <button onClick={() => onEdit(item)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                            ✏️ Editar
                          </button>
                          <button onClick={() => onDelete(item.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}>
                            🗑️ Eliminar
                          </button>
                        </>
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
