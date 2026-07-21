import React, { useState, useEffect } from 'react';
import { fetchClientes, createCliente, updateCliente, deleteCliente, restoreCliente } from '../../api/clientes.api';
import { fetchTiposCliente } from '../../api/tipoCliente.api';
import { fetchCategoriasCliente } from '../../api/categoriaCliente.api';
import ClienteList from './ClienteList';
import ClienteAdd from './ClienteAdd';
import ClienteEdit from './ClienteEdit';

export default function ClientesPage({ userSession }) {
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Panel lateral derecho ('closed' | 'add' | 'edit')
  const [panelMode, setPanelMode] = useState('closed');
  const [selectedCliente, setSelectedCliente] = useState(null);

  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cData, tData, catData] = await Promise.all([
        fetchClientes(isAdmin),
        fetchTiposCliente(isAdmin),
        fetchCategoriasCliente(isAdmin)
      ]);
      setClientes(cData);
      setTipos(tData);
      setCategorias(catData);

      // Si hay un cliente seleccionado en edición, actualizar sus datos con la información fresca
      if (selectedCliente) {
        const updated = cData.find(c => c.id === selectedCliente.id);
        if (updated) {
          setSelectedCliente(updated);
        }
      }
    } catch (err) {
      setError(err.message || 'Error al obtener datos de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectForEdit = (cliente) => {
    setSelectedCliente(cliente);
    setPanelMode('edit');
  };

  const handleStartAdd = () => {
    setSelectedCliente(null);
    setPanelMode('add');
  };

  const handleClosePanel = () => {
    setPanelMode('closed');
    setSelectedCliente(null);
  };

  const handleSaveAdd = async (formData) => {
    const nuevo = await createCliente(formData);
    await loadData();
    if (nuevo && nuevo.id) {
      setSelectedCliente(nuevo);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateCliente(id, formData);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de desactivar/eliminar lógicamente el cliente #${id}?`)) {
      try {
        await deleteCliente(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreCliente(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading && clientes.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando directorio de clientes desde PostgreSQL...
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

      {/* Split Layout: Lista/Tarjetas a la Izquierda + Panel Lateral de Creación/Edición a la Derecha */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* LADO IZQUIERDO: Directorio y Controles */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <ClienteList
            clientes={clientes}
            tipos={tipos}
            categorias={categorias}
            isAdmin={isAdmin}
            selectedClienteId={selectedCliente?.id}
            onAddNew={handleStartAdd}
            onSelectCliente={handleSelectForEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        </div>

        {/* LADO DERECHO: Panel Lateral (Side Drawer) para Agregar/Editar */}
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
              <ClienteAdd
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedCliente && (
              <ClienteEdit
                cliente={selectedCliente}
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
