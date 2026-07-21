import React, { useState, useEffect } from 'react';
import UsuarioRoleList from './UsuarioRoleList';
import UsuarioRoleAdd from './UsuarioRoleAdd';
import UsuarioRoleEdit from './UsuarioRoleEdit';
import { fetchUsuariosRoles, createUsuarioRol, updateUsuarioRol, deleteUsuarioRol } from '../../api/usuariosRoles.api';
import { fetchUsuarios } from '../../api/usuarios.api';
import { fetchRoles } from '../../api/roles.api';

export default function UsuariosRolesPage() {
  const [view, setView] = useState('list');
  const [asignaciones, setAsignaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [asgData, usrData, rlData] = await Promise.all([
        fetchUsuariosRoles(),
        fetchUsuarios(),
        fetchRoles()
      ]);
      setAsignaciones(asgData);
      setUsuarios(usrData);
      setRoles(rlData);
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
    await createUsuarioRol(formData, usuarios, roles);
    await loadData();
    setView('list');
  };

  const handleUpdate = async (id, formData) => {
    await updateUsuarioRol(id, formData, usuarios, roles);
    await loadData();
    setSelectedItem(null);
    setView('list');
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la asignación #${id}?`)) {
      await deleteUsuarioRol(id);
      await loadData();
    }
  };

  const startEdit = (item) => {
    setSelectedItem(item);
    setView('edit');
  };

  return (
    <div>
      {view === 'list' && (
        <UsuarioRoleList
          asignaciones={asignaciones}
          isLoading={isLoading}
          onAddClick={() => setView('add')}
          onEditClick={startEdit}
          onDeleteClick={handleDelete}
        />
      )}

      {view === 'add' && (
        <UsuarioRoleAdd
          usuarios={usuarios}
          roles={roles}
          onSave={handleCreate}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && selectedItem && (
        <UsuarioRoleEdit
          item={selectedItem}
          usuarios={usuarios}
          roles={roles}
          onSave={handleUpdate}
          onCancel={() => { setSelectedItem(null); setView('list'); }}
        />
      )}
    </div>
  );
}
