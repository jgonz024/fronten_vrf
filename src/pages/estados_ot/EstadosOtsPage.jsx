import React, { useState, useEffect } from 'react';
import { fetchEstadosOt, createEstadoOt, updateEstadoOt, deleteEstadoOt, restoreEstadoOt } from '../../api/estadosOt.api';
import EstadoOtList from './EstadoOtList';
import EstadoOtAdd from './EstadoOtAdd';
import EstadoOtEdit from './EstadoOtEdit';

export default function EstadosOtsPage({ userSession }) {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [panelMode, setPanelMode] = useState('closed'); // 'closed' | 'add' | 'edit'
  const [selectedEstado, setSelectedEstado] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchEstadosOt(isAdmin);
      setEstados(data);

      if (selectedEstado) {
        const updated = data.find(e => e.id === selectedEstado.id);
        if (updated) setSelectedEstado(updated);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener estados de OT');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectForEdit = (estado) => {
    setSelectedEstado(estado);
    setPanelMode('edit');
  };

  const handleStartAdd = () => {
    setSelectedEstado(null);
    setPanelMode('add');
  };

  const handleClosePanel = () => {
    setPanelMode('closed');
    setSelectedEstado(null);
  };

  const handleSaveAdd = async (formData) => {
    const nuevo = await createEstadoOt(formData);
    await loadData();
    if (nuevo && nuevo.id) {
      setSelectedEstado(nuevo);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateEstadoOt(id, formData);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar el estado de OT #${id}?`)) {
      try {
        await deleteEstadoOt(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreEstadoOt(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading && estados.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando estados de OT desde la base de datos MySQL...
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
          <EstadoOtList
            estados={estados}
            isAdmin={isAdmin}
            selectedEstadoId={selectedEstado?.id}
            onAddNew={handleStartAdd}
            onSelectEstado={handleSelectForEdit}
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
              <EstadoOtAdd
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedEstado && (
              <EstadoOtEdit
                estado={selectedEstado}
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
