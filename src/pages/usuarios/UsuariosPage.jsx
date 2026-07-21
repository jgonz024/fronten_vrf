import React, { useState, useEffect } from 'react';
import { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario, restoreUsuario } from '../../api/usuarios.api';
import UsuarioList from './UsuarioList';
import UsuarioAdd from './UsuarioAdd';
import UsuarioEdit from './UsuarioEdit';

export default function UsuariosPage({ userSession }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsuarios(isAdmin);
      setUsuarios(data);
    } catch (err) {
      setError(err.message || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSaveAdd = async (formData) => {
    await createUsuario(formData);
    await loadData();
    setView('list');
  };

  const handleSaveEdit = async (id, formData) => {
    await updateUsuario(id, formData);
    await loadData();
    setView('list');
    setSelectedUsuario(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de desactivar/eliminar lógicamente el usuario #${id}?`)) {
      try {
        await deleteUsuario(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreUsuario(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando usuarios desde PostgreSQL...
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {view === 'list' && (
        <UsuarioList
          usuarios={usuarios}
          isAdmin={isAdmin}
          onAddNew={() => setView('add')}
          onEdit={(u) => { setSelectedUsuario(u); setView('edit'); }}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      )}

      {view === 'add' && (
        <UsuarioAdd
          onSave={handleSaveAdd}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && (
        <UsuarioEdit
          usuario={selectedUsuario}
          onSave={handleSaveEdit}
          onCancel={() => { setView('list'); setSelectedUsuario(null); }}
        />
      )}
    </div>
  );
}
