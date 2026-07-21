import React, { useState, useEffect } from 'react';
import { fetchCategoriasCliente, createCategoriaCliente, updateCategoriaCliente, deleteCategoriaCliente, restoreCategoriaCliente } from '../../api/categoriaCliente.api';
import CategoriaClienteList from './CategoriaClienteList';
import CategoriaClienteAdd from './CategoriaClienteAdd';
import CategoriaClienteEdit from './CategoriaClienteEdit';

export default function CategoriaClientesPage({ userSession }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCategoriasCliente(isAdmin);
      setCategorias(data);
    } catch (err) {
      setError(err.message || 'Error al obtener categorías de cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

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

  const handleRestore = async (id) => {
    try {
      await restoreCategoriaCliente(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
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
          isAdmin={isAdmin}
          onAddNew={() => setView('add')}
          onEdit={(cat) => { setSelectedCategoria(cat); setView('edit'); }}
          onDelete={handleDelete}
          onRestore={handleRestore}
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
