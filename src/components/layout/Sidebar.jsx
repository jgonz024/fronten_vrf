import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'usuarios', label: 'Usuarios', icon: '👤', subtitle: 'Cuentas, perfiles y roles' },
    { id: 'roles', label: 'Roles', icon: '🔑', subtitle: 'Definición de permisos' },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(12, 22, 45, 0.9)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#ffffff',
          boxShadow: '0 0 16px rgba(0, 198, 255, 0.4)'
        }}>
          ❄️
        </div>
        <div>
          <h2 style={{ fontSize: '18px', color: '#ffffff', lineHeight: 1.1 }}>VRF Systems</h2>
          <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', letterSpacing: '0.05em', fontWeight: 600 }}>
            HVAC MANAGEMENT
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, padding: '0 8px 4px 8px' }}>
          Configuración y Entidades
        </div>
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'linear-gradient(90deg, rgba(0, 198, 255, 0.15), rgba(0, 114, 255, 0.05))' : 'transparent',
                border: isActive ? '1px solid rgba(0, 198, 255, 0.3)' : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: isActive ? 600 : 500, fontSize: '14px' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.subtitle}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(10, 18, 41, 0.5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--status-active-text)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-active-text)', boxShadow: '0 0 8px var(--status-active-text)' }} />
          Base de Datos PostgreSQL (vrfsystems)
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Host: localhost:5432
        </div>
      </div>
    </aside>
  );
}
