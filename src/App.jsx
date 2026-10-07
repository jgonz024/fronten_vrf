import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import CambiarPasswordModal from './pages/auth/CambiarPasswordModal';
import PerfilModal from './pages/auth/PerfilModal';
import SeleccionarRolModal from './pages/auth/SeleccionarRolModal';
import DashboardPage from './pages/dashboard/DashboardPage';

import UsuariosPage from './pages/usuarios/UsuariosPage';
import RolesPage from './pages/roles/RolesPage';
import ClientesPage from './pages/clientes/ClientesPage';
import TipoClientesPage from './pages/tipo_cliente/TipoClientesPage';
import CategoriaClientesPage from './pages/categoria_cliente/CategoriaClientesPage';
import CategoriaActivosPage from './pages/categoria_activo/CategoriaActivosPage';
import TipoActivosPage from './pages/tipo_activo/TipoActivosPage';
import MarcaActivosPage from './pages/marca_activo/MarcaActivosPage';
import ActivosPage from './pages/activo/ActivosPage';
import TipoOtsPage from './pages/tipo_ot/TipoOtsPage';
import EstadosOtsPage from './pages/estados_ot/EstadosOtsPage';
import OrdenesTrabajosPage from './pages/orden_trabajo/OrdenesTrabajosPage';
import AdminOtPage from './pages/admin_ot/AdminOtPage';
import EmpresaPage from './pages/empresa/EmpresaPage';
import InformesTecnicosPage from './pages/informes_tecnicos/InformesTecnicosPage';

const SESSION_KEY = import.meta.env.VITE_SESSION_STORAGE_KEY;

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);

  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (!parsed.activeRole && parsed.usuario?.roles?.length > 0) {
      parsed.activeRole = parsed.usuario.roles[0];
    }
    return parsed;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const handleLoginSuccess = (loginData) => {
    // Retener sesión en estado pendiente para exigir seleccionar el rol de entrada ANTES de salir de la pantalla de login
    setPendingAuth(loginData);
  };

  const handleConfirmEntryRole = (chosenRole) => {
    if (pendingAuth) {
      const fullSession = {
        ...pendingAuth,
        activeRole: chosenRole
      };
      
      const roleName = (chosenRole?.nombre || '').toUpperCase().trim();
      const isAdmin = roleName === 'ADMINISTRADOR' || roleName === 'ADMIN';
      const isCliente = roleName === 'CLIENTE';

      if (isAdmin) {
        setActiveTab('dashboard');
      } else if (isCliente) {
        setActiveTab('activos');
      } else {
        setActiveTab('dashboard');
      }

      setSession(fullSession);
      setPendingAuth(null);
    }
  };

  const handleChangeActiveRole = (newRole) => {
    if (session) {
      const updatedSession = {
        ...session,
        activeRole: newRole
      };
      setSession(updatedSession);

      const roleName = (newRole?.nombre || '').toUpperCase().trim();
      const isAdmin = roleName === 'ADMINISTRADOR' || roleName === 'ADMIN';
      const isCliente = roleName === 'CLIENTE';

      if (!isAdmin) {
        if (['usuarios', 'roles', 'admin_ot', 'tipo_cliente', 'categoria_cliente', 'categoria_activo', 'tipo_activo', 'marca_activo'].includes(activeTab)) {
          setActiveTab('ordenes_trabajo');
        } else if (isCliente && activeTab === 'clientes') {
          setActiveTab('activos');
        }
      }
    }
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
    setPendingAuth(null);
    setShowPerfilModal(false);
  };

  // 1. Si no hay sesión activa y hay un login recién autorizado, mostrar el Modal de Selección de Rol ANTES de entrar al Dashboard
  if (!session && pendingAuth) {
    return (
      <SeleccionarRolModal
        usuario={pendingAuth.usuario}
        onConfirmRole={handleConfirmEntryRole}
      />
    );
  }

  // 2. Si no hay sesión ni login pendiente, mostrar pantalla de login
  if (!session) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Usuario con sesión activa: Cargar aplicación principal
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
        onChangeActiveRole={handleChangeActiveRole}
        onOpenProfile={() => setShowPerfilModal(true)}
        onLogout={handleLogout}
      >
        {activeTab === 'dashboard' && <DashboardPage userSession={session} onNavigate={setActiveTab} />}
        {activeTab === 'empresa' && <EmpresaPage userSession={session} onClose={() => setActiveTab('dashboard')} />}
        {activeTab === 'usuarios' && <UsuariosPage userSession={session} />}
        {activeTab === 'roles' && <RolesPage userSession={session} />}
        {activeTab === 'clientes' && <ClientesPage userSession={session} />}
        {activeTab === 'tipo_cliente' && <TipoClientesPage userSession={session} />}
        {activeTab === 'categoria_cliente' && <CategoriaClientesPage userSession={session} />}
        {activeTab === 'categoria_activo' && <CategoriaActivosPage userSession={session} />}
        {activeTab === 'tipo_activo' && <TipoActivosPage userSession={session} />}
        {activeTab === 'marca_activo' && <MarcaActivosPage userSession={session} />}
        {activeTab === 'activos' && <ActivosPage userSession={session} />}
        {activeTab === 'tipo_ot' && <TipoOtsPage userSession={session} />}
        {activeTab === 'estados_ot' && <EstadosOtsPage userSession={session} />}
        {activeTab === 'admin_ot' && <AdminOtPage userSession={session} />}
        {activeTab === 'ordenes_trabajo' && <OrdenesTrabajosPage userSession={session} />}
        {activeTab === 'informes_tecnicos' && <InformesTecnicosPage userSession={session} />}
      </MainLayout>
    </>
  );
}
