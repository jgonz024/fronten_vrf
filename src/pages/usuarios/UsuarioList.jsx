import React from 'react';

export default function UsuarioList({ usuarios, onAddClick, onEditClick, onResetPasswordClick, onDeleteClick, isLoading }) {
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
                <th>Roles Asignados</th>
                <th>Estado</th>
                <th>Clave</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usr => (
                <tr key={usr.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>#{usr.id}</td>
                  <td style={{ fontWeight: 500 }}>{usr.nombre}</td>
                  <td>{usr.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {usr.roles && usr.roles.length > 0 ? (
                        usr.roles.map(r => (
                          <span key={r.id} className="badge badge-role" style={{ fontSize: '11px' }}>
                            {r.nombre}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sin rol</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {usr.activo ? (
                      <span className="badge badge-active">Activo</span>
                    ) : (
                      <span className="badge badge-inactive">Inactivo</span>
                    )}
                  </td>
                  <td>
                    {usr.debe_cambiar_password ? (
                      <span className="badge badge-inactive" style={{ fontSize: '10px' }}>⚠️ Reset / Inicial</span>
                    ) : (
                      <span className="badge badge-active" style={{ fontSize: '10px' }}>✓ Personalizada</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => onEditClick(usr)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => onResetPasswordClick(usr)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '12px', borderColor: 'rgba(234, 179, 8, 0.4)', color: '#fde047' }}
                        title="Restablecer contraseña por defecto a Vrf12345"
                      >
                        🔑 Reset Clave
                      </button>
                      <button
                        onClick={() => onDeleteClick(usr.id)}
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
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
