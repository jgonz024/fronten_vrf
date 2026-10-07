import React, { useState, useEffect } from 'react';
import { fetchUsuarios, createUsuario, updateUsuario, deleteUsuario, restoreUsuario } from '../../api/usuarios.api';
import UsuarioList from './UsuarioList';
import UsuarioAdd from './UsuarioAdd';
import UsuarioEdit from './UsuarioEdit';

export default function UsuariosPage({ userSession }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Panel lateral derecho ('closed' | 'add' | 'edit')
  const [panelMode, setPanelMode] = useState('closed');
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsuarios(isAdmin);
      setUsuarios(data);

      if (selectedUsuario) {
        const updated = data.find(u => u.id === selectedUsuario.id);
        if (updated) setSelectedUsuario(updated);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectForEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setPanelMode('edit');
  };

  const handleStartAdd = () => {
    setSelectedUsuario(null);
    setPanelMode('add');
  };

  const handleClosePanel = () => {
    setPanelMode('closed');
    setSelectedUsuario(null);
  };

  const handleSaveAdd = async (formData) => {
    const nuevo = await createUsuario(formData);
    await loadData();
    if (nuevo && nuevo.id) {
      setSelectedUsuario(nuevo);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateUsuario(id, formData);
    await loadData();
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

  if (loading && usuarios.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando usuarios desde la base de datos MySQL...
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
          <UsuarioList
            usuarios={usuarios}
            isAdmin={isAdmin}
            selectedUsuarioId={selectedUsuario?.id}
            onAddNew={handleStartAdd}
            onSelectUsuario={handleSelectForEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        </div>

        {panelMode !== 'closed' && (
          <div style={{
            width: '450px',
            flexShrink: 0,
            position: 'sticky',
            top: '20px',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto'
          }}>
            {panelMode === 'add' && (
              <UsuarioAdd
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedUsuario && (
              <UsuarioEdit
                usuario={selectedUsuario}
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
