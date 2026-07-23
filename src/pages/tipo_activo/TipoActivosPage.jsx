import React, { useState, useEffect } from 'react';
import { fetchTiposActivo, createTipoActivo, updateTipoActivo, deleteTipoActivo, restoreTipoActivo } from '../../api/tipoActivo.api';
import TipoActivoList from './TipoActivoList';
import TipoActivoAdd from './TipoActivoAdd';
import TipoActivoEdit from './TipoActivoEdit';

export default function TipoActivosPage({ userSession }) {
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
      const data = await fetchTiposActivo(isAdmin);
      setTipos(data);

      if (selectedTipo) {
        const updated = data.find(t => t.id === selectedTipo.id);
        if (updated) setSelectedTipo(updated);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener tipos de activo');
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
    const nuevo = await createTipoActivo(formData);
    await loadData();
    if (nuevo && nuevo.id) {
      setSelectedTipo(nuevo);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateTipoActivo(id, formData);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar el tipo de activo #${id}?`)) {
      try {
        await deleteTipoActivo(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreTipoActivo(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading && tipos.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando tipos de activos desde PostgreSQL...
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
          <TipoActivoList
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
              <TipoActivoAdd
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedTipo && (
              <TipoActivoEdit
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
