import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import UsuariosPage from './pages/usuarios/UsuariosPage';
import RolesPage from './pages/roles/RolesPage';
import UsuariosRolesPage from './pages/usuarios_roles/UsuariosRolesPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('usuarios');

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'usuarios' && <UsuariosPage />}
      {activeTab === 'roles' && <RolesPage />}
      {activeTab === 'usuarios_roles' && <UsuariosRolesPage />}
    </MainLayout>
  );
}
