import React from 'react';

export default function UsuarioRoleList({ asignaciones, onAddClick, onEditClick, onDeleteClick, isLoading }) {
  // Agrupar asignaciones por usuario_id para mostrar un usuario con todos sus roles agrupados en una sola fila/columna
  const groupedByUser = React.useMemo(() => {
    const map = new Map();
    asignaciones.forEach(item => {
      const uId = Number(item.usuario_id);
      if (!map.has(uId)) {
        map.set(uId, {
          usuario_id: uId,
          usuario_nombre: item.usuario_nombre || `Usuario #${uId}`,
          roles: [],
          role_ids: [],
          asignado_en: item.asignado_en
        });
      }
      const entry = map.get(uId);
      if (item.rol_id && !entry.role_ids.includes(Number(item.rol_id))) {
        entry.role_ids.push(Number(item.rol_id));
        entry.roles.push({
          id: Number(item.rol_id),
          nombre: item.rol_nombre || `Rol #${item.rol_id}`
        });
      }
    });
    return Array.from(map.values());
  }, [asignaciones]);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Matriz de Asignación de Roles</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Usuarios con roles asignados: {groupedByUser.length}
          </p>
        </div>
        <button onClick={onAddClick} className="btn btn-primary">
          <span>➕</span> Asignar Roles
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando asignaciones desde la API...
        </div>
      ) : groupedByUser.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No existen usuarios con roles asignados actualmente.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID Usuario</th>
                <th>Usuario y Roles Asignados</th>
                <th>Fecha de Asignación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {groupedByUser.map(group => (
                <tr key={group.usuario_id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>#{group.usuario_id}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                        👤 {group.usuario_nombre}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {group.roles.map(r => (
                          <span key={r.id} className="badge badge-role" style={{ fontSize: '11px' }}>
                            🔑 {r.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {group.asignado_en ? new Date(group.asignado_en).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onEditClick(group)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        ✏️ Editar Roles
                      </button>
                      <button
                        onClick={() => onDeleteClick(group.usuario_id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        🗑️ Eliminar Todos
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
