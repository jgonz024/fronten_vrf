import React, { useState, useEffect } from 'react';
import UsuarioList from './UsuarioList';
import UsuarioAdd from './UsuarioAdd';
import UsuarioEdit from './UsuarioEdit';
import { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../api/usuarios.api';

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
