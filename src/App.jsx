import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import CambiarPasswordModal from './pages/auth/CambiarPasswordModal';
import PerfilModal from './pages/auth/PerfilModal';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import RolesPage from './pages/roles/RolesPage';
import ClientesPage from './pages/clientes/ClientesPage';
import TipoClientesPage from './pages/tipo_cliente/TipoClientesPage';
import CategoriaClientesPage from './pages/categoria_cliente/CategoriaClientesPage';

const SESSION_KEY = import.meta.env.VITE_SESSION_STORAGE_KEY;

export default function App() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
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
        {activeTab === 'usuarios' && <UsuariosPage userSession={session} />}
        {activeTab === 'roles' && <RolesPage userSession={session} />}
        {activeTab === 'clientes' && <ClientesPage userSession={session} />}
        {activeTab === 'tipo_cliente' && <TipoClientesPage userSession={session} />}
        {activeTab === 'categoria_cliente' && <CategoriaClientesPage userSession={session} />}
      </MainLayout>
    </>
  );
}
