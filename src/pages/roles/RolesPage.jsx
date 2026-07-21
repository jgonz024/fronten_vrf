import React, { useState, useEffect } from 'react';
import { fetchRoles, createRol, updateRol, deleteRol, restoreRol } from '../../api/roles.api';
import RoleList from './RoleList';
import RoleAdd from './RoleAdd';
import RoleEdit from './RoleEdit';

export default function RolesPage({ userSession }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedRole, setSelectedRole] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRoles(isAdmin);
      setRoles(data);
    } catch (err) {
      setError(err.message || 'Error al obtener roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSaveAdd = async (formData) => {
    await createRol(formData);
    await loadData();
    setView('list');
  };

  const handleSaveEdit = async (id, formData) => {
    await updateRol(id, formData);
    await loadData();
    setView('list');
    setSelectedRole(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar el rol #${id}?`)) {
      try {
        await deleteRol(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreRol(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando roles desde PostgreSQL...
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
        <RoleList
          roles={roles}
          isAdmin={isAdmin}
          onAddNew={() => setView('add')}
          onEdit={(role) => { setSelectedRole(role); setView('edit'); }}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      )}

      {view === 'add' && (
        <RoleAdd
          onSave={handleSaveAdd}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && (
        <RoleEdit
          role={selectedRole}
          onSave={handleSaveEdit}
          onCancel={() => { setView('list'); setSelectedRole(null); }}
        />
      )}
    </div>
  );
}
