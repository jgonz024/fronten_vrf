import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ activeTab, setActiveTab, userSession, onOpenProfile, onLogout, children }) {
  const titles = {
    usuarios: { title: 'Gestión de Usuarios', subtitle: 'Administración de cuentas, técnicos y credenciales' },
    roles: { title: 'Gestión de Roles', subtitle: 'Definición de perfiles y niveles de autorización' },
    usuarios_roles: { title: 'Asignación de Roles a Usuarios', subtitle: 'Matriz de asociación entre usuarios y múltiples perfiles' }
  };

  const currentHeader = titles[activeTab] || { title: 'VRF Systems', subtitle: 'Sistema de Gestión' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          userSession={userSession}
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
