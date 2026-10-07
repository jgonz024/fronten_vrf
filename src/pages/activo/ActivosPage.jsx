import React, { useState, useEffect } from 'react';
import { fetchActivos, createActivo, updateActivo, deleteActivo, restoreActivo } from '../../api/activo.api';
import { fetchClientes } from '../../api/clientes.api';
import { fetchCategoriasActivo } from '../../api/categoriaActivo.api';
import { fetchTiposActivo } from '../../api/tipoActivo.api';
import { fetchMarcasActivo } from '../../api/marcaActivo.api';

import ActivoList from './ActivoList';
import ActivoAdd from './ActivoAdd';
import ActivoEdit from './ActivoEdit';
import ActivoQrModal from './ActivoQrModal';

export default function ActivosPage({ userSession }) {
  const [activos, setActivos] = useState([]);
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [selectedActivo, setSelectedActivo] = useState(null);
  const [qrModalActivo, setQrModalActivo] = useState(null);
  const [panelMode, setPanelMode] = useState('closed'); // 'closed', 'add', 'edit'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const activeRoleName = (
    userSession?.activeRole?.nombre || 
    userSession?.usuario?.roles?.[0]?.nombre || 
    ''
  ).toUpperCase().trim();
  const isAdmin = !activeRoleName || activeRoleName === 'ADMINISTRADOR' || activeRoleName === 'ADMIN';
  const isCliente = activeRoleName === 'CLIENTE' && !isAdmin;

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [activosList, clientsList, catList, typeList, brandList] = await Promise.all([
        fetchActivos(isAdmin),
        fetchClientes(false), // only active clients
        fetchCategoriasActivo(false),
        fetchTiposActivo(false),
        fetchMarcasActivo(false)
      ]);
      setActivos(activosList || []);
      setClients(clientsList || []);
      setCategories(catList || []);
      setTypes(typeList || []);
      setBrands(brandList || []);

      // Si hay un activo seleccionado en edición, actualizar sus datos con la información fresca
      if (selectedActivo) {
        const updated = activosList.find(a => a.id === selectedActivo.id);
        if (updated) {
          setSelectedActivo(updated);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos de activos. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectActivo = (activo) => {
    setSelectedActivo(activo);
    setPanelMode('edit');
  };

  const handleAddNew = () => {
    setSelectedActivo(null);
    setPanelMode('add');
  };

  const handleSaveNew = async (data) => {
    const created = await createActivo(data);
    await loadData();
    if (created && created.id) {
      setSelectedActivo(created);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleUpdate = async (id, data) => {
    await updateActivo(id, data);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de desactivar/eliminar lógicamente el activo #${id}?`)) {
      try {
        await deleteActivo(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreActivo(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (isLoading && activos.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando directorio de activos desde la base de datos MySQL...
      </div>
    );
  }

  // Filtrar activos si el usuario es CLIENTE
  const displayActivos = activos.filter(a => {
    if (!isCliente) return true;
    const userEmail = (userSession?.usuario?.email || '').toLowerCase();
    const userName = (userSession?.usuario?.nombre || '').toLowerCase();
    const clientObj = clients.find(c => c.id === a.id_cliente);
    const clientName = (clientObj?.cliente || a.cliente_nombre || '').toLowerCase();
    const clientEmail = (clientObj?.email || '').toLowerCase();
    return (
      (userEmail && (clientEmail === userEmail || userEmail.includes(clientEmail))) ||
      (userName && (clientName.includes(userName) || userName.includes(clientName)))
    );
  });

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
          <ActivoList
            activos={displayActivos}
            isAdmin={isAdmin}
            selectedActivoId={selectedActivo?.id}
            onAddNew={handleAddNew}
            onSelectActivo={handleSelectActivo}
            onOpenQrModal={(act) => setQrModalActivo(act)}
            onDelete={handleDelete}
            onRestore={handleRestore}
            clients={clients}
            categories={categories}
            types={types}
            brands={brands}
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
              <ActivoAdd
                onSave={handleSaveNew}
                onCancel={() => setPanelMode('closed')}
                clients={clients}
                categories={categories}
                types={types}
                brands={brands}
              />
            )}

            {panelMode === 'edit' && selectedActivo && (
              <ActivoEdit
                activo={selectedActivo}
                isAdmin={isAdmin}
                onSave={handleUpdate}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onCancel={() => {
                  setPanelMode('closed');
                  setSelectedActivo(null);
                }}
                clients={clients}
                categories={categories}
                types={types}
                brands={brands}
              />
            )}
          </div>
        )}
      </div>

      {qrModalActivo && (
        <ActivoQrModal
          activo={qrModalActivo}
          onClose={() => setQrModalActivo(null)}
        />
      )}
    </div>
  );
}

