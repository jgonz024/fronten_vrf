import React, { useState, useEffect } from 'react';
import { fetchTiposCliente, createTipoCliente, updateTipoCliente, deleteTipoCliente } from '../../api/tipoCliente.api';
import TipoClienteList from './TipoClienteList';
import TipoClienteAdd from './TipoClienteAdd';
import TipoClienteEdit from './TipoClienteEdit';

export default function TipoClientesPage() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedTipo, setSelectedTipo] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTiposCliente();
      setTipos(data);
    } catch (err) {
      setError(err.message || 'Error al obtener tipos de cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAdd = async (formData) => {
    await createTipoCliente(formData);
    await loadData();
    setView('list');
  };

  const handleSaveEdit = async (id, formData) => {
    await updateTipoCliente(id, formData);
    await loadData();
    setView('list');
    setSelectedTipo(null);
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

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando tipos de cliente desde PostgreSQL...
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
        <TipoClienteList
          tipos={tipos}
          onAddNew={() => setView('add')}
          onEdit={(tipo) => { setSelectedTipo(tipo); setView('edit'); }}
          onDelete={handleDelete}
        />
      )}

      {view === 'add' && (
        <TipoClienteAdd
          onSave={handleSaveAdd}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && (
        <TipoClienteEdit
          tipo={selectedTipo}
          onSave={handleSaveEdit}
          onCancel={() => { setView('list'); setSelectedTipo(null); }}
        />
      )}
    </div>
  );
}
