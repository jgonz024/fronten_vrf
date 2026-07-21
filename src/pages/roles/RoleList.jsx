import React from 'react';

export default function RoleList({ roles, onAddClick, onEditClick, onDeleteClick, isLoading }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Listado de Roles</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Total perfiles de acceso: {roles.length}
          </p>
        </div>
        <button onClick={onAddClick} className="btn btn-primary">
          <span>➕</span> Nuevo Rol
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando roles desde la API...
        </div>
      ) : roles.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No hay roles definidos actualmente.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Rol</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>#{r.id}</td>
                  <td>
                    <span className="badge badge-role">{r.nombre}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.descripcion || 'Sin descripción'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onEditClick(r)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => onDeleteClick(r.id)}
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
