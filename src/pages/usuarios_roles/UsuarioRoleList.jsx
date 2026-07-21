import React from 'react';

export default function UsuarioRoleList({ asignaciones, onAddClick, onEditClick, onDeleteClick, isLoading }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Asignación de Roles a Usuarios</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Total relaciones activas: {asignaciones.length}
          </p>
        </div>
        <button onClick={onAddClick} className="btn btn-primary">
          <span>➕</span> Asignar Rol
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando asignaciones desde la API...
        </div>
      ) : asignaciones.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No existen asignaciones registradas.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol Asignado</th>
                <th>Fecha Asignación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>#{item.id}</td>
                  <td style={{ fontWeight: 500 }}>
                    👤 {item.usuario_nombre || `Usuario #${item.usuario_id}`}
                  </td>
                  <td>
                    <span className="badge badge-role">
                      🔑 {item.rol_nombre || `Rol #${item.rol_id}`}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {item.asignado_en ? new Date(item.asignado_en).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onEditClick(item)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => onDeleteClick(item.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
