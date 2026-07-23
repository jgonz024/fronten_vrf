import React, { useState, useEffect } from 'react';
import { fetchMarcasActivo, createMarcaActivo, updateMarcaActivo, deleteMarcaActivo, restoreMarcaActivo } from '../../api/marcaActivo.api';
import MarcaActivoList from './MarcaActivoList';
import MarcaActivoAdd from './MarcaActivoAdd';
import MarcaActivoEdit from './MarcaActivoEdit';

export default function MarcaActivosPage({ userSession }) {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [panelMode, setPanelMode] = useState('closed'); // 'closed' | 'add' | 'edit'
  const [selectedMarca, setSelectedMarca] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMarcasActivo(isAdmin);
      setMarcas(data);

      if (selectedMarca) {
        const updated = data.find(m => m.id === selectedMarca.id);
        if (updated) setSelectedMarca(updated);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener marcas de activo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectForEdit = (marca) => {
    setSelectedMarca(marca);
    setPanelMode('edit');
  };

  const handleStartAdd = () => {
    setSelectedMarca(null);
    setPanelMode('add');
  };

  const handleClosePanel = () => {
    setPanelMode('closed');
    setSelectedMarca(null);
  };

  const handleSaveAdd = async (formData) => {
    const nueva = await createMarcaActivo(formData);
    await loadData();
    if (nueva && nueva.id) {
      setSelectedMarca(nueva);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateMarcaActivo(id, formData);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar la marca de activo #${id}?`)) {
      try {
        await deleteMarcaActivo(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreMarcaActivo(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading && marcas.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando marcas de activos desde PostgreSQL...
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
          <MarcaActivoList
            marcas={marcas}
            isAdmin={isAdmin}
            selectedMarcaId={selectedMarca?.id}
            onAddNew={handleStartAdd}
            onSelectMarca={handleSelectForEdit}
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
              <MarcaActivoAdd
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedMarca && (
              <MarcaActivoEdit
                marca={selectedMarca}
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
