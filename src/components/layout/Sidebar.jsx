import React, { useState } from 'react';
import logoImg from '../../assets/images/logo.png';

export default function Sidebar({ activeTab, setActiveTab, userSession }) {
  const activeRoleName = (
    userSession?.activeRole?.nombre || 
    userSession?.usuario?.roles?.[0]?.nombre || 
    ''
  ).toUpperCase().trim();

  const isAdmin = !activeRoleName || activeRoleName === 'ADMINISTRADOR' || activeRoleName === 'ADMIN';
  const isSupervisor = activeRoleName === 'SUPERVISOR';
  const isTecnico = activeRoleName === 'TECNICO' || activeRoleName === 'TÉCNICO';
  const isGerente = activeRoleName.includes('GERENTE');
  const isCliente = activeRoleName === 'CLIENTE';

  // Inicialmente expandimos la sección que contenga la pestaña activa
  const [collapsedSections, setCollapsedSections] = useState(() => {
    const clientesTabs = ['clientes', 'tipo_cliente', 'categoria_cliente', 'categoria_activo', 'tipo_activo', 'marca_activo', 'activos'];
    const otTabs = ['admin_ot', 'ordenes_trabajo'];
    
    return {
      'Administración': !['usuarios', 'roles'].includes(activeTab),
      'Clientes y Activos': !clientesTabs.includes(activeTab),
      'Órdenes de Trabajo': !otTabs.includes(activeTab)
    };
  });

  // Botón Dashboard (fuera de secciones colapsables)
  const dashboardItem = { id: 'dashboard', label: 'Panel de Control', icon: '🏠', subtitle: 'Resumen y estadísticas' };

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const rawSections = [
    {
      title: 'Administración',
      items: [
        { id: 'empresa', label: 'Datos Empresa', icon: '🏢', subtitle: 'Información oficial y logo' },
        { id: 'usuarios', label: 'Usuarios', icon: '👤', subtitle: 'Cuentas, perfiles y roles' },
        { id: 'roles', label: 'Roles', icon: '🔑', subtitle: 'Definición de permisos' },
      ]
    },
    {
      title: 'Clientes y Activos',
      items: [
        { id: 'clientes', label: 'Clientes', icon: '🏢', subtitle: 'Directorio general de clientes' },
        { id: 'tipo_cliente', label: 'Tipos de Cliente', icon: '🏷️', subtitle: 'Industrial, Particular' },
        { id: 'categoria_cliente', label: 'Categorías de Cliente', icon: '⭐', subtitle: 'Hisense, LG, Samsung...' },
        { id: 'categoria_activo', label: 'Categorías de Activo', icon: '⚙️', subtitle: 'Climatización, Ventilación...' },
        { id: 'tipo_activo', label: 'Tipos de Activo', icon: '🔧', subtitle: 'Mini Split, VRF, VEX...' },
        { id: 'marca_activo', label: 'Marcas de Activo', icon: '⭐', subtitle: 'Anwo, Hisense, Carrier...' },
        { id: 'activos', label: 'Activos / Equipos', icon: '❄️', subtitle: 'Equipos y componentes instalados' },
      ]
    },
    {
      title: 'Órdenes de Trabajo',
      items: [
        { id: 'ordenes_trabajo', label: 'Órdenes de Trabajo', icon: '📝', subtitle: 'Gestión de órdenes de trabajo' },
        { id: 'admin_ot', label: 'Administración de OT', icon: '⚙️', subtitle: 'Configurar Tipos, Estados y parámetros' }
      ]
    }
  ];

  // Filtrado estricto por rol según especificaciones
  const sections = rawSections.map(sec => {
    let allowedIds = [];
    if (sec.title === 'Administración') {
      if (isAdmin) allowedIds = ['empresa', 'usuarios', 'roles'];
    } else if (sec.title === 'Clientes y Activos') {
      if (isAdmin) {
        allowedIds = ['clientes', 'tipo_cliente', 'categoria_cliente', 'categoria_activo', 'tipo_activo', 'marca_activo', 'activos'];
      } else if (isSupervisor || isTecnico || isGerente) {
        allowedIds = ['clientes', 'activos'];
      } else if (isCliente) {
        allowedIds = ['activos'];
      } else {
        allowedIds = ['clientes', 'activos'];
      }
    } else if (sec.title === 'Órdenes de Trabajo') {
      if (isAdmin) {
        allowedIds = ['ordenes_trabajo', 'admin_ot'];
      } else {
        allowedIds = ['ordenes_trabajo'];
      }
    }
    return {
      ...sec,
      items: sec.items.filter(item => allowedIds.includes(item.id))
    };
  }).filter(sec => sec.items.length > 0);

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
        {/* Contenedor transparente para Logo VRF SYSTEMS® */}
        <div style={{
          padding: '6px 8px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
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

      {/* Dashboard siempre visible */}
      <button
        onClick={() => setActiveTab('dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: activeTab === 'dashboard'
            ? 'linear-gradient(90deg, rgba(0,198,255,0.2), rgba(0,114,255,0.08))'
            : 'rgba(0,198,255,0.06)',
          border: activeTab === 'dashboard'
            ? '1px solid rgba(0,198,255,0.5)'
            : '1px solid rgba(0,198,255,0.2)',
          color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: '18px' }}>{dashboardItem.icon}</span>
        <div>
          <div style={{ fontWeight: activeTab === 'dashboard' ? 700 : 500, fontSize: '13px' }}>{dashboardItem.label}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{dashboardItem.subtitle}</div>
        </div>
      </button>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sections.map((sec, secIdx) => {
          const isCollapsed = collapsedSections[sec.title];
          return (
            <div key={secIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div 
                onClick={() => toggleSection(sec.title)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  color: 'var(--accent-cyan)',
                  fontWeight: 700,
                  padding: '6px 8px',
                  borderBottom: '1px solid rgba(0, 198, 255, 0.15)',
                  marginBottom: '4px',
                  letterSpacing: '0.05em',
                  userSelect: 'none',
                  transition: 'background 0.2s',
                  borderRadius: 'var(--radius-sm)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 198, 255, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span>{sec.title}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  {isCollapsed ? '▶' : '▼'}
                </span>
              </div>
              {!isCollapsed && sec.items.map(item => {
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
            </div>
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
