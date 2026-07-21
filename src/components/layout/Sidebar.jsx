import React from 'react';
import logoImg from '../../assets/images/logo.png';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'usuarios', label: 'Usuarios', icon: '👤', subtitle: 'Cuentas, perfiles y roles' },
    { id: 'roles', label: 'Roles', icon: '🔑', subtitle: 'Definición de permisos' },
    { id: 'clientes', label: 'Clientes', icon: '🏢', subtitle: 'Directorio general de clientes' },
    { id: 'tipo_cliente', label: 'Tipos de Cliente', icon: '🏷️', subtitle: 'Industrial, Particular' },
    { id: 'categoria_cliente', label: 'Categorías de Cliente', icon: '⭐', subtitle: 'Hisense, LG, Samsung...' },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(12, 22, 45, 0.95)',
      borderRight: '1px solid var(--border-color)',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      overflowY: 'auto'
    }}>
      {/* Brand Header Integrado */}
      <div style={{
        background: 'rgba(15, 25, 50, 0.7)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid rgba(0, 198, 255, 0.2)',
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Badge Blanco para Logo VRF SYSTEMS® */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff, #f0f6ff)',
          borderRadius: '10px',
          padding: '10px 14px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
        }}>
          <img
            src={logoImg}
            alt="VRF SYSTEMS®"
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '46px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Subtítulo Estilizado en Cyan Neón */}
        <div style={{
          fontSize: '11px',
          color: 'var(--accent-cyan)',
          letterSpacing: '0.14em',
          fontWeight: 700,
          textTransform: 'uppercase',
          textAlign: 'center',
          textShadow: '0 0 8px rgba(0, 198, 255, 0.4)'
        }}>
          SUPPORT MANAGEMENT
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                gap: '10px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'linear-gradient(90deg, rgba(0, 198, 255, 0.15), rgba(0, 114, 255, 0.05))' : 'transparent',
                border: isActive ? '1px solid rgba(0, 198, 255, 0.3)' : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: isActive ? 600 : 500, fontSize: '13px' }}>{item.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.subtitle}</div>
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
