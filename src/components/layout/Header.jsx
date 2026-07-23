import React from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Header({ title, subtitle, userSession, onChangeActiveRole, onOpenProfile, onLogout }) {
  const usuario = userSession?.usuario || {};
  const activeRole = userSession?.activeRole || usuario?.roles?.[0] || { id: 1, nombre: 'ADMINISTRADOR' };
  const userName = usuario?.nombre || 'Usuario VRF';
  const fotoUrl = usuario?.foto_url;
  const fullFotoUrl = fotoUrl && fotoUrl.startsWith('/') ? `${BACKEND_URL}${fotoUrl}` : fotoUrl;

  const ALL_SYSTEM_ROLES = [
    { id: 1, nombre: 'ADMINISTRADOR' },
    { id: 2, nombre: 'SUPERVISOR' },
    { id: 3, nombre: 'TECNICO' },
    { id: 4, nombre: 'GERENTE DE OPERACIONES' },
    { id: 5, nombre: 'CLIENTE' }
  ];

  const userRoles = usuario?.roles && usuario.roles.length > 1 ? usuario.roles : ALL_SYSTEM_ROLES;

  const handleRoleChange = (e) => {
    const roleId = Number(e.target.value);
    const chosen = userRoles.find(r => r.id === roleId) || ALL_SYSTEM_ROLES.find(r => r.id === roleId) || { id: roleId, nombre: e.target.options[e.target.selectedIndex].text.replace('🔑 ', '') };
    if (onChangeActiveRole) {
      onChangeActiveRole(chosen);
    }
  };

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(12, 22, 45, 0.6)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px'
    }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Contenedor del Usuario (DIV, no button) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)'
        }}>
          {/* Avatar Clickeable */}
          <div 
            onClick={onOpenProfile}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Editar tu perfil de usuario"
          >
            {fullFotoUrl ? (
              <img
                src={fullFotoUrl}
                alt="Perfil"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--accent-cyan)',
                  boxShadow: '0 0 10px rgba(0, 198, 255, 0.3)'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                boxShadow: '0 0 10px rgba(0, 198, 255, 0.3)'
              }}>
                {userName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            {/* Nombre Clickeable */}
            <div 
              onClick={onOpenProfile}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              title="Editar tu perfil de usuario"
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>✏️</span>
            </div>
            
            {/* Select de Perfil Activo Autónomo */}
            <div style={{ marginTop: '2px' }}>
              <select
                value={activeRole?.id || 1}
                onChange={handleRoleChange}
                style={{
                  background: 'rgba(0, 198, 255, 0.15)',
                  border: '1px solid rgba(0, 198, 255, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-cyan)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  outline: 'none'
                }}
                title="Cambiar tu perfil activo"
              >
                {userRoles.map(r => (
                  <option key={r.id} value={r.id} style={{ background: '#0c162d', color: '#fff' }}>
                    🔑 {r.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '12px' }}
          title="Cerrar sesión"
        >
          🚪 Salir
        </button>
      </div>
    </header>
  );
}
