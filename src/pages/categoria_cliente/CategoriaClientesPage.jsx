import React, { useState, useEffect } from 'react';
import { fetchCategoriasCliente, createCategoriaCliente, updateCategoriaCliente, deleteCategoriaCliente } from '../../api/categoriaCliente.api';
import CategoriaClienteList from './CategoriaClienteList';
import CategoriaClienteAdd from './CategoriaClienteAdd';
import CategoriaClienteEdit from './CategoriaClienteEdit';

export default function CategoriaClientesPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCategoriasCliente();
      setCategorias(data);
    } catch (err) {
      setError(err.message || 'Error al obtener categorías de cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAdd = async (formData) => {
    await createCategoriaCliente(formData);
    await loadData();
    setView('list');
  };

  const handleSaveEdit = async (id, formData) => {
    await updateCategoriaCliente(id, formData);
    await loadData();
    setView('list');
    setSelectedCategoria(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría de cliente #${id}?`)) {
      try {
        await deleteCategoriaCliente(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando categorías de cliente desde PostgreSQL...
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
        <CategoriaClienteList
          categorias={categorias}
          onAddNew={() => setView('add')}
          onEdit={(cat) => { setSelectedCategoria(cat); setView('edit'); }}
          onDelete={handleDelete}
        />
      )}

      {view === 'add' && (
        <CategoriaClienteAdd
          onSave={handleSaveAdd}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && (
        <CategoriaClienteEdit
          categoria={selectedCategoria}
          onSave={handleSaveEdit}
          onCancel={() => { setView('list'); setSelectedCategoria(null); }}
        />
      )}
    </div>
  );
}
