import React, { useState, useEffect } from 'react';
import { fetchCategoriasActivo, createCategoriaActivo, updateCategoriaActivo, deleteCategoriaActivo, restoreCategoriaActivo } from '../../api/categoriaActivo.api';
import CategoriaActivoList from './CategoriaActivoList';
import CategoriaActivoAdd from './CategoriaActivoAdd';
import CategoriaActivoEdit from './CategoriaActivoEdit';

export default function CategoriaActivosPage({ userSession }) {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [panelMode, setPanelMode] = useState('closed'); // 'closed' | 'add' | 'edit'
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCategoriasActivo(isAdmin);
      setCategorias(data);

      if (selectedCategoria) {
        const updated = data.find(c => c.id === selectedCategoria.id);
        if (updated) setSelectedCategoria(updated);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener categorías de activo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectForEdit = (categoria) => {
    setSelectedCategoria(categoria);
    setPanelMode('edit');
  };

  const handleStartAdd = () => {
    setSelectedCategoria(null);
    setPanelMode('add');
  };

  const handleClosePanel = () => {
    setPanelMode('closed');
    setSelectedCategoria(null);
  };

  const handleSaveAdd = async (formData) => {
    const nueva = await createCategoriaActivo(formData);
    await loadData();
    if (nueva && nueva.id) {
      setSelectedCategoria(nueva);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateCategoriaActivo(id, formData);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría de activo #${id}?`)) {
      try {
        await deleteCategoriaActivo(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreCategoriaActivo(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading && categorias.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando categorías de activo desde la base de datos MySQL...
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
          <CategoriaActivoList
            categorias={categorias}
            isAdmin={isAdmin}
            selectedCategoriaId={selectedCategoria?.id}
            onAddNew={handleStartAdd}
            onSelectCategoria={handleSelectForEdit}
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
              <CategoriaActivoAdd
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedCategoria && (
              <CategoriaActivoEdit
                categoria={selectedCategoria}
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
