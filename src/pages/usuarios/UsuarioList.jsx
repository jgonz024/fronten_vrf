import React from 'react';

export default function UsuarioList({ usuarios, onAddClick, onEditClick, onDeleteClick, isLoading }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Listado de Usuarios</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Total registrados: {usuarios.length}
          </p>
        </div>
        <button onClick={onAddClick} className="btn btn-primary">
          <span>➕</span> Nuevo Usuario
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando usuarios desde la API...
        </div>
      ) : usuarios.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No hay usuarios registrados actualmente.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usr => (
                <tr key={usr.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>#{usr.id}</td>
                  <td style={{ fontWeight: 500 }}>{usr.nombre}</td>
                  <td>{usr.email}</td>
                  <td>{usr.telefono || '—'}</td>
                  <td>
                    {usr.activo ? (
                      <span className="badge badge-active">Active</span>
                    ) : (
                      <span className="badge badge-inactive">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onEditClick(usr)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => onDeleteClick(usr.id)}
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
