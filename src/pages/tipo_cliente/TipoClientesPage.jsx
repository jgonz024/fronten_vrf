import React, { useState, useEffect } from 'react';
import { fetchTiposCliente, createTipoCliente, updateTipoCliente, deleteTipoCliente, restoreTipoCliente } from '../../api/tipoCliente.api';
import TipoClienteList from './TipoClienteList';
import TipoClienteAdd from './TipoClienteAdd';
import TipoClienteEdit from './TipoClienteEdit';

export default function TipoClientesPage({ userSession }) {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [panelMode, setPanelMode] = useState('closed'); // 'closed' | 'add' | 'edit'
  const [selectedTipo, setSelectedTipo] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTiposCliente(isAdmin);
      setTipos(data);

      if (selectedTipo) {
        const updated = data.find(t => t.id === selectedTipo.id);
        if (updated) setSelectedTipo(updated);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener tipos de cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectForEdit = (tipo) => {
    setSelectedTipo(tipo);
    setPanelMode('edit');
  };

  const handleStartAdd = () => {
    setSelectedTipo(null);
    setPanelMode('add');
  };

  const handleClosePanel = () => {
    setPanelMode('closed');
    setSelectedTipo(null);
  };

  const handleSaveAdd = async (formData) => {
    const nuevo = await createTipoCliente(formData);
    await loadData();
    if (nuevo && nuevo.id) {
      setSelectedTipo(nuevo);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateTipoCliente(id, formData);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar el tipo de cliente #${id}?`)) {
      try {
        await deleteTipoCliente(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreTipoCliente(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading && tipos.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando tipos de cliente desde la base de datos MySQL...
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
          <TipoClienteList
            tipos={tipos}
            isAdmin={isAdmin}
            selectedTipoId={selectedTipo?.id}
            onAddNew={handleStartAdd}
            onSelectTipo={handleSelectForEdit}
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
              <TipoClienteAdd
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedTipo && (
              <TipoClienteEdit
                tipo={selectedTipo}
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
