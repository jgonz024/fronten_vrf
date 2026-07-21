import React, { useState, useEffect } from 'react';
import { fetchRoles, createRol, updateRol, deleteRol, restoreRol } from '../../api/roles.api';
import RoleList from './RoleList';
import RoleAdd from './RoleAdd';
import RoleEdit from './RoleEdit';

export default function RolesPage({ userSession }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [panelMode, setPanelMode] = useState('closed'); // 'closed' | 'add' | 'edit'
  const [selectedRole, setSelectedRole] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRoles(isAdmin);
      setRoles(data);

      if (selectedRole) {
        const updated = data.find(r => r.id === selectedRole.id);
        if (updated) setSelectedRole(updated);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectForEdit = (role) => {
    setSelectedRole(role);
    setPanelMode('edit');
  };

  const handleStartAdd = () => {
    setSelectedRole(null);
    setPanelMode('add');
  };

  const handleClosePanel = () => {
    setPanelMode('closed');
    setSelectedRole(null);
  };

  const handleSaveAdd = async (formData) => {
    const nuevo = await createRol(formData);
    await loadData();
    if (nuevo && nuevo.id) {
      setSelectedRole(nuevo);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateRol(id, formData);
    await loadData();
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

  if (loading && roles.length === 0) {
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

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <RoleList
            roles={roles}
            isAdmin={isAdmin}
            selectedRoleId={selectedRole?.id}
            onAddNew={handleStartAdd}
            onSelectRole={handleSelectForEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        </div>

        {panelMode !== 'closed' && (
          <div style={{
            width: '440px',
            flexShrink: 0,
            position: 'sticky',
            top: '20px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}>
            {panelMode === 'add' && (
              <RoleAdd
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedRole && (
              <RoleEdit
                role={selectedRole}
                isAdmin={isAdmin}
                onSave={handleSaveEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onCancel={handleClosePanel}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
