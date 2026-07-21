import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import CambiarPasswordModal from './pages/auth/CambiarPasswordModal';
import PerfilModal from './pages/auth/PerfilModal';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import RolesPage from './pages/roles/RolesPage';
import UsuariosRolesPage from './pages/usuarios_roles/UsuariosRolesPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('vrf_session');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem('vrf_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('vrf_session');
    }
  }, [session]);

  const handleLoginSuccess = (loginData) => {
    setSession(loginData);
  };

  const handlePasswordChanged = () => {
    if (session) {
      const updatedSession = {
        ...session,
        debe_cambiar_password: false,
        usuario: { ...session.usuario, debe_cambiar_password: false }
      };
      setSession(updatedSession);
    }
  };

  const handleProfileUpdated = (updatedUsuarioData) => {
    if (session) {
      const updatedSession = {
        ...session,
        usuario: { ...session.usuario, ...updatedUsuarioData }
      };
      setSession(updatedSession);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setShowPerfilModal(false);
  };

  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {session.debe_cambiar_password && (
        <CambiarPasswordModal
          usuarioId={session.usuario.id}
          onPasswordChanged={handlePasswordChanged}
        />
      )}

      {showPerfilModal && (
        <PerfilModal
          userSession={session}
          onClose={() => setShowPerfilModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      <MainLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSession={session}
        onOpenProfile={() => setShowPerfilModal(true)}
        onLogout={handleLogout}
      >
        {activeTab === 'usuarios' && <UsuariosPage />}
        {activeTab === 'roles' && <RolesPage />}
        {activeTab === 'usuarios_roles' && <UsuariosRolesPage />}
      </MainLayout>
    </>
  );
}
