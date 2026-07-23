import React, { useState, useMemo } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ── Colores por rol ────────────────────────────────────────────────────────────
const ROL_COLORS = {
  administrador: { bg: 'rgba(0,198,255,0.15)', border: 'rgba(0,198,255,0.5)', text: '#00c6ff' },
  admin: { bg: 'rgba(0,198,255,0.15)', border: 'rgba(0,198,255,0.5)', text: '#00c6ff' },
  tecnico: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.5)', text: '#22c55e' },
  técnico: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.5)', text: '#22c55e' },
  supervisor: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.5)', text: '#fbbf24' },
  gerente: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.5)', text: '#c084fc' },
  cliente: { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.5)', text: '#f472b6' },
  default: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', text: '#a5b4fc' },
};

function getRolColor(nombre = '') {
  const key = nombre.toLowerCase().trim();
  for (const [k, v] of Object.entries(ROL_COLORS)) {
    if (key.includes(k)) return v;
  }
  return ROL_COLORS.default;
}

// ── Avatar del usuario ─────────────────────────────────────────────────────────
function UserAvatar({ user, size = 44 }) {
  const initials = (user.nombre || user.username || '?')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (user.foto_url) {
    const src = user.foto_url.startsWith('http')
      ? user.foto_url
      : `${BACKEND_URL}${user.foto_url}`;
    return (
      <img
        src={src}
        alt={user.nombre}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(0,198,255,0.4)',
          boxShadow: '0 0 12px rgba(0,198,255,0.2)',
          flexShrink: 0
        }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(0,114,255,0.4), rgba(0,198,255,0.3))',
      border: '2px solid rgba(0,198,255,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#00c6ff',
      boxShadow: '0 0 12px rgba(0,198,255,0.15)'
    }}>
      {initials}
    </div>
  );
}

// ── Tarjeta de usuario ─────────────────────────────────────────────────────────
function UsuarioCard({ user, isSelected, isAdmin, onSelect, onDelete, onRestore }) {
  const isDeleted = user.eliminado;
  const firstRol = user.roles?.[0];
  const rolColor = getRolColor(firstRol?.nombre || '');

  return (
    <div
      onClick={() => onSelect(user)}
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(0,198,255,0.15), rgba(0,114,255,0.08))'
          : isDeleted
            ? 'rgba(239,68,68,0.05)'
            : 'linear-gradient(135deg, rgba(15,25,50,0.85), rgba(10,18,41,0.7))',
        border: isSelected
          ? '2px solid rgba(0,198,255,0.6)'
          : isDeleted ? '1px dashed rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        opacity: isDeleted ? 0.6 : 1,
        boxShadow: isSelected ? '0 0 20px rgba(0,198,255,0.2)' : '0 4px 16px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isSelected ? '0 0 20px rgba(0,198,255,0.2)' : '0 4px 16px rgba(0,0,0,0.25)';
      }}
    >
      {/* Glow decorativo superior derecho */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: '-15px', right: '-15px',
          width: '70px', height: '70px', borderRadius: '50%',
          background: 'rgba(0,198,255,0.15)', filter: 'blur(18px)', pointerEvents: 'none'
        }} />
      )}

      {/* Header: Avatar + Nombre + Estado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <UserAvatar user={user} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.nombre || user.username}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            @{user.username}
          </div>
        </div>
        <div>
          {isDeleted ? (
            <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', padding: '3px 8px', fontWeight: 700 }}>
              🗑️ Baja
            </span>
          ) : user.activo ? (
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} title="Activo" />
          ) : (
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#6b7280', display: 'inline-block' }} title="Inactivo" />
          )}
        </div>
      </div>

      {/* Datos de contacto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        {user.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '13px' }}>✉️</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
          </div>
        )}
        {user.telefono && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '13px' }}>📞</span>
            <span>{user.telefono}</span>
          </div>
        )}
        {!user.email && !user.telefono && (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px' }}>
            Sin datos de contacto
          </div>
        )}
      </div>

      {/* Roles */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {user.roles && user.roles.length > 0 ? (
          user.roles.map(r => {
            const rc = getRolColor(r.nombre);
            return (
              <span key={r.id} style={{
                fontSize: '10px', fontWeight: 700,
                background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`,
                borderRadius: '10px', padding: '3px 8px'
              }}>
                {r.nombre}
              </span>
            );
          })
        ) : (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin roles asignados</span>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '11px', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
          {isSelected ? '▶ Seleccionado' : 'Clic para editar'}
        </span>
        <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onSelect(user)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            ✏️ Editar
          </button>
          {isDeleted ? (
            isAdmin && (
              <button
                onClick={() => onRestore(user.id)}
                className="btn btn-primary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                🔄
              </button>
            )
          ) : (
            <button
              onClick={() => onDelete(user.id)}
              className="btn btn-danger"
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function UsuarioList({ usuarios, isAdmin, selectedUsuarioId, onAddNew, onSelectUsuario, onDelete, onRestore }) {
  const [displayMode, setDisplayMode] = useState('cards'); // 'cards' | 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRolId, setSelectedRolId] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  // Extraer todos los roles disponibles de los usuarios
  const allRoles = useMemo(() => {
    const map = {};
    usuarios.forEach(u => {
      (u.roles || []).forEach(r => {
        if (!map[r.id]) map[r.id] = r;
      });
    });
    return Object.values(map).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [usuarios]);

  // Filtrado
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(u => {
      // Búsqueda texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const match =
          (u.nombre || '').toLowerCase().includes(term) ||
          (u.username || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term) ||
          (u.telefono || '').toLowerCase().includes(term);
        if (!match) return false;
      }

      // Filtro por rol
      if (selectedRolId !== '') {
        const hasRol = (u.roles || []).some(r => String(r.id) === String(selectedRolId));
        if (!hasRol) return false;
      }

      // Filtro por estado
      if (selectedEstado === 'ACTIVO' && (u.eliminado || !u.activo)) return false;
      if (selectedEstado === 'INACTIVO' && (u.eliminado || u.activo)) return false;
      if (selectedEstado === 'ELIMINADO' && !u.eliminado) return false;

      return true;
    });
  }, [usuarios, searchTerm, selectedRolId, selectedEstado]);

  const hasFilters = searchTerm !== '' || selectedRolId !== '' || selectedEstado !== '';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRolId('');
    setSelectedEstado('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Panel de controles */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>Directorio de Usuarios</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Mostrando {filteredUsuarios.length} de {usuarios.length} usuario(s)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Toggle Tarjetas / Lista */}
            <div style={{ display: 'flex', background: 'rgba(10,18,41,0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '2px' }}>
              <button
                onClick={() => setDisplayMode('cards')}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: displayMode === 'cards' ? 'var(--accent-blue)' : 'transparent',
                  color: displayMode === 'cards' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                🎴 Tarjetas
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: displayMode === 'list' ? 'var(--accent-blue)' : 'transparent',
                  color: displayMode === 'list' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                📋 Lista
              </button>
            </div>

            <button onClick={onAddNew} className="btn btn-primary">
              + Añadir
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          {/* Búsqueda texto */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🔍 Buscar por texto</label>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              placeholder="Nombre, usuario, email, teléfono..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por Rol */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🔐 Rol</label>
            <select
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              value={selectedRolId}
              onChange={e => setSelectedRolId(e.target.value)}
            >
              <option value="" style={{ background: '#0b1329' }}>Todos los Roles</option>
              {allRoles.map(r => (
                <option key={r.id} value={r.id} style={{ background: '#0b1329' }}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🚦 Estado</label>
            <select
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              value={selectedEstado}
              onChange={e => setSelectedEstado(e.target.value)}
            >
              <option value="" style={{ background: '#0b1329' }}>Todos</option>
              <option value="ACTIVO" style={{ background: '#0b1329' }}>Activos</option>
              <option value="INACTIVO" style={{ background: '#0b1329' }}>Inactivos</option>
              <option value="ELIMINADO" style={{ background: '#0b1329' }}>Eliminados</option>
            </select>
          </div>

          {/* Limpiar filtros */}
          {hasFilters && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={{ height: '38px', width: '100%', fontSize: '12px' }}
              >
                🧹 Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODO TARJETAS ── */}
      {displayMode === 'cards' && (
        <>
          {filteredUsuarios.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron usuarios con los filtros aplicados.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {filteredUsuarios.map(user => (
                <UsuarioCard
                  key={user.id}
                  user={user}
                  isSelected={selectedUsuarioId === user.id}
                  isAdmin={isAdmin}
                  onSelect={onSelectUsuario}
                  onDelete={onDelete}
                  onRestore={onRestore}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MODO LISTA ── */}
      {displayMode === 'list' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>USUARIO</th>
                  <th>EMAIL</th>
                  <th>TELÉFONO</th>
                  <th>ROLES</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No se encontraron usuarios con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map(user => {
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
                            ? 'rgba(0,198,255,0.15)'
                            : isDeleted ? 'rgba(239,68,68,0.08)' : 'transparent'
                        }}
                      >
                        <td>
                          <span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>
                            #{user.id}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <UserAvatar user={user} size={34} />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                                {user.nombre || user.username}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {user.email || '—'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {user.telefono || '—'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map(r => {
                                const rc = getRolColor(r.nombre);
                                return (
                                  <span key={r.id} style={{
                                    fontSize: '10px', fontWeight: 700,
                                    background: rc.bg, color: rc.text,
                                    border: `1px solid ${rc.border}`,
                                    borderRadius: '10px', padding: '2px 7px'
                                  }}>
                                    {r.nombre}
                                  </span>
                                );
                              })
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Sin roles</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {isDeleted ? (
                            <span className="badge badge-danger" style={{ fontSize: '10px' }}>🗑️ Eliminado</span>
                          ) : user.activo ? (
                            <span className="badge badge-active" style={{ fontSize: '10px' }}>● Activo</span>
                          ) : (
                            <span className="badge badge-inactive" style={{ fontSize: '10px' }}>○ Inactivo</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => onSelectUsuario(user)}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              ✏️ Editar
                            </button>
                            {isDeleted ? (
                              isAdmin && (
                                <button
                                  onClick={() => onRestore(user.id)}
                                  className="btn btn-primary"
                                  style={{ padding: '4px 8px', fontSize: '11px' }}
                                >
                                  🔄
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => onDelete(user.id)}
                                className="btn btn-danger"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                              >
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
        </div>
      )}
    </div>
  );
}
