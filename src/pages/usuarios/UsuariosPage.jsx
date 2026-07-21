import React, { useState, useEffect } from 'react';
import UsuarioList from './UsuarioList';
import UsuarioAdd from './UsuarioAdd';
import UsuarioEdit from './UsuarioEdit';
import { fetchUsuarios, createUsuario, updateUsuario, resetPasswordAdminApi, deleteUsuario } from '../../api/usuarios.api';

export default function UsuariosPage() {
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (formData) => {
    await createUsuario(formData);
    await loadData();
    setView('list');
  };

  const handleUpdate = async (id, formData) => {
    await updateUsuario(id, formData);
    await loadData();
    setSelectedUsuario(null);
    setView('list');
  };

  const handleResetPassword = async (usuario) => {
    if (window.confirm(`¿Estás seguro de que deseas restablecer la clave del usuario "${usuario.nombre}" a la contraseña por defecto (Vrf12345)? El usuario deberá cambiarla obligatoriamente en su siguiente ingreso.`)) {
      try {
        await resetPasswordAdminApi(usuario.id);
        alert(`La contraseña de ${usuario.nombre} fue restablecida exitosamente a Vrf12345`);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al restablecer contraseña');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el usuario #${id}?`)) {
      await deleteUsuario(id);
      await loadData();
    }
  };

  const startEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setView('edit');
  };

  return (
    <div>
      {view === 'list' && (
        <UsuarioList
          usuarios={usuarios}
          isLoading={isLoading}
          onAddClick={() => setView('add')}
          onEditClick={startEdit}
          onResetPasswordClick={handleResetPassword}
          onDeleteClick={handleDelete}
        />
      )}

      {view === 'add' && (
        <UsuarioAdd
          onSave={handleCreate}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && selectedUsuario && (
        <UsuarioEdit
          usuario={selectedUsuario}
          onSave={handleUpdate}
          onCancel={() => { setSelectedUsuario(null); setView('list'); }}
        />
      )}
    </div>
  );
}
