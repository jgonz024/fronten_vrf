import React from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Header({ title, subtitle, userSession, onOpenProfile, onLogout }) {
  const usuario = userSession?.usuario || {};
  const userName = usuario?.nombre || 'Administrador VRF';
  const roles = usuario?.roles || [{ nombre: 'ADMINISTRADOR' }];
  const fotoUrl = usuario?.foto_url;
  const fullFotoUrl = fotoUrl && fotoUrl.startsWith('/') ? `${BACKEND_URL}${fotoUrl}` : fotoUrl;

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
        <button
          onClick={onOpenProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}
          className="btn-user-profile"
          title="Haz clic para editar tu perfil de usuario"
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>✏️</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
              {roles.map(r => (
                <span key={r.id || r.nombre} className="badge badge-role" style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {r.nombre}
                </span>
              ))}
            </div>
          </div>
        </button>

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
