import React, { useState, useEffect } from 'react';
import RoleList from './RoleList';
import RoleAdd from './RoleAdd';
import RoleEdit from './RoleEdit';
import { fetchRoles, createRol, updateRol, deleteRol } from '../../api/roles.api';

export default function RolesPage() {
  const [view, setView] = useState('list');
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoles();
      setRoles(data);
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
    await createRol(formData);
    await loadData();
    setView('list');
  };

  const handleUpdate = async (id, formData) => {
    await updateRol(id, formData);
    await loadData();
    setSelectedRol(null);
    setView('list');
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el rol #${id}?`)) {
      await deleteRol(id);
      await loadData();
    }
  };

  const startEdit = (rol) => {
    setSelectedRol(rol);
    setView('edit');
  };

  return (
    <div>
      {view === 'list' && (
        <RoleList
          roles={roles}
          isLoading={isLoading}
          onAddClick={() => setView('add')}
          onEditClick={startEdit}
          onDeleteClick={handleDelete}
        />
      )}

      {view === 'add' && (
        <RoleAdd
          onSave={handleCreate}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && selectedRol && (
        <RoleEdit
          rol={selectedRol}
          onSave={handleUpdate}
          onCancel={() => { setSelectedRol(null); setView('list'); }}
        />
      )}
    </div>
  );
}
