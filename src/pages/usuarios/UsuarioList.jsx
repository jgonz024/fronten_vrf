import React from 'react';

export default function UsuarioList({ usuarios, isAdmin, selectedUsuarioId, onAddNew, onSelectUsuario, onDelete, onRestore }) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Listado de Usuarios del Sistema</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Haz clic en un usuario para editarlo en el panel lateral ({usuarios.length})</p>
        </div>
        <button onClick={onAddNew} className="btn btn-primary">
          + Añadir
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOMBRE</th>
            <th>EMAIL</th>
            <th>ROLES ASIGNADOS</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            usuarios.map(user => {
              const isDeleted = user.eliminado;
              const isSelected = selectedUsuarioId === user.id;
              return (
                <tr
                  key={user.id}
                  onClick={() => onSelectUsuario(user)}
                  style={{
                    cursor: 'pointer',
                    opacity: isDeleted ? 0.55 : 1,
                    background: isSelected
                      ? 'rgba(0, 198, 255, 0.15)'
                      : isDeleted ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                  }}
                >
                  <td><span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>#{user.id}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {user.foto_url ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${user.foto_url}`}
                          alt={user.nombre}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-cyan)' }}
                        />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 198, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                          👤
                        </div>
                      )}
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.nombre}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map(r => (
                          <span key={r.id} className="badge badge-role">{r.nombre}</span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sin roles</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {isDeleted ? (
                      <span className="badge badge-danger">🗑️ Eliminado (Lógico)</span>
                    ) : user.activo ? (
                      <span className="badge badge-active">Activo</span>
                    ) : (
                      <span className="badge badge-inactive">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={(e) => { e.stopPropagation(); onSelectUsuario(user); }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        ✏️ Editar
                      </button>
                      {isDeleted ? (
                        isAdmin && (
                          <button onClick={(e) => { e.stopPropagation(); onRestore(user.id); }} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                            🔄
                          </button>
                        )
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(user.id); }} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
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
