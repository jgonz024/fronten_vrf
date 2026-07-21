import React from 'react';

export default function Header({ title, subtitle, userSession, onLogout }) {
  const userName = userSession?.usuario?.nombre || 'Administrador VRF';
  const roles = userSession?.usuario?.roles || [{ nombre: 'ADMINISTRADOR' }];

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 14px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
              {roles.map(r => (
                <span key={r.id || r.nombre} className="badge badge-role" style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {r.nombre}
                </span>
              ))}
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
