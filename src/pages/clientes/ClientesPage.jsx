import React, { useState, useEffect } from 'react';
import { fetchClientes, createCliente, updateCliente, deleteCliente } from '../../api/clientes.api';
import ClienteList from './ClienteList';
import ClienteAdd from './ClienteAdd';
import ClienteEdit from './ClienteEdit';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedCliente, setSelectedCliente] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchClientes();
      setClientes(data);
    } catch (err) {
      setError(err.message || 'Error al obtener clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAdd = async (formData) => {
    await createCliente(formData);
    await loadData();
    setView('list');
  };

  const handleSaveEdit = async (id, formData) => {
    await updateCliente(id, formData);
    await loadData();
    setView('list');
    setSelectedCliente(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar el cliente #${id}?`)) {
      try {
        await deleteCliente(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando 1,431 clientes desde PostgreSQL...
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
        <ClienteList
          clientes={clientes}
          onAddNew={() => setView('add')}
          onEdit={(cli) => { setSelectedCliente(cli); setView('edit'); }}
          onDelete={handleDelete}
        />
      )}

      {view === 'add' && (
        <ClienteAdd
          onSave={handleSaveAdd}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && (
        <ClienteEdit
          cliente={selectedCliente}
          onSave={handleSaveEdit}
          onCancel={() => { setView('list'); setSelectedCliente(null); }}
        />
      )}
    </div>
  );
}
