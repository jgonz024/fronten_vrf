import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ activeTab, setActiveTab, userSession, onChangeActiveRole, onOpenProfile, onLogout, children }) {
  const titles = {
    dashboard: { title: 'Panel de Control', subtitle: 'Resumen ejecutivo y estadísticas en tiempo real del sistema' },
    usuarios: { title: 'Gestión de Usuarios', subtitle: 'Administración de cuentas, técnicos y credenciales' },
    roles: { title: 'Gestión de Roles', subtitle: 'Definición de perfiles y niveles de autorización' },
    usuarios_roles: { title: 'Asignación de Roles a Usuarios', subtitle: 'Matriz de asociación entre usuarios y múltiples perfiles' },
    categoria_activo: { title: 'Gestión de Categorías de Activo', subtitle: 'Definición de categorías de equipamientos e instalaciones' },
    tipo_activo: { title: 'Gestión de Tipos de Activo', subtitle: 'Definición de tipos de equipamientos e instalaciones HVAC' },
    marca_activo: { title: 'Gestión de Marcas de Activo', subtitle: 'Catálogo de fabricantes y marcas de equipos de climatización' },
    activos: { title: 'Gestión de Activos / Equipos', subtitle: 'Administración de equipos, unidades interiores/exteriores y fichas técnicas' },
    tipo_ot: { title: 'Gestión de Tipos de OT', subtitle: 'Administración de categorías y tipos de órdenes de trabajo' },
    estados_ot: { title: 'Gestión de Estados de OT', subtitle: 'Control de flujos e hitos para órdenes de trabajo' },
    admin_ot: { title: 'Administración de OT', subtitle: 'Configuración general de tipos y estados de órdenes de trabajo' },
    ordenes_trabajo: { title: 'Órdenes de Trabajo', subtitle: 'Asignación, programación y control de órdenes de trabajo en terreno' }
  };

  const currentHeader = titles[activeTab] || { title: 'VRF Systems', subtitle: 'Sistema de Gestión' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userSession={userSession} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          userSession={userSession}
          onChangeActiveRole={onChangeActiveRole}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />
        
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
