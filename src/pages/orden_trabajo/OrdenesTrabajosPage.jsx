import React, { useState, useEffect } from 'react';
import { fetchOrdenesTrabajo, createOrdenTrabajo, updateOrdenTrabajo, deleteOrdenTrabajo, restoreOrdenTrabajo } from '../../api/ordenTrabajo.api';
import { fetchUsuarios } from '../../api/usuarios.api';
import { fetchClientes } from '../../api/clientes.api';
import { fetchTiposOt } from '../../api/tipoOt.api';
import { fetchEstadosOt } from '../../api/estadosOt.api';
import OrdenTrabajoList from './OrdenTrabajoList';
import OrdenTrabajoAdd from './OrdenTrabajoAdd';
import OrdenTrabajoEdit from './OrdenTrabajoEdit';

export default function OrdenesTrabajosPage({ userSession }) {
  const [ordenes, setOrdenes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tiposOt, setTiposOt] = useState([]);
  const [estadosOt, setEstadosOt] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [panelMode, setPanelMode] = useState('closed'); // 'closed' | 'add' | 'edit'
  const [selectedOrden, setSelectedOrden] = useState(null);

  const activeRoleName = (
    userSession?.activeRole?.nombre || 
    userSession?.usuario?.roles?.[0]?.nombre || 
    ''
  ).toUpperCase().trim();
  const isAdmin = !activeRoleName || activeRoleName === 'ADMINISTRADOR' || activeRoleName === 'ADMIN';
  const isCliente = activeRoleName === 'CLIENTE' && !isAdmin;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, usersData, clientsData, tiposData, estadosData] = await Promise.all([
        fetchOrdenesTrabajo(isAdmin),
        fetchUsuarios(false), // only active dropdown items
        fetchClientes(false),
        fetchTiposOt(false),
        fetchEstadosOt(false)
      ]);
      
      setOrdenes(data);
      setUsuarios(usersData);
      setClientes(clientsData);
      setTiposOt(tiposData);
      setEstadosOt(estadosData);

      if (selectedOrden) {
        const updated = data.find(o => o.id === selectedOrden.id);
        if (updated) setSelectedOrden(updated);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleSelectForEdit = (orden) => {
    setSelectedOrden(orden);
    setPanelMode('edit');
  };

  const handleStartAdd = () => {
    setSelectedOrden(null);
    setPanelMode('add');
  };

  const handleClosePanel = () => {
    setPanelMode('closed');
    setSelectedOrden(null);
  };

  const handleSaveAdd = async (formData) => {
    const nueva = await createOrdenTrabajo(formData);
    await loadData();
    if (nueva && nueva.id) {
      setSelectedOrden(nueva);
      setPanelMode('edit');
    } else {
      setPanelMode('closed');
    }
  };

  const handleSaveEdit = async (id, formData) => {
    await updateOrdenTrabajo(id, formData);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar la Orden de Trabajo #${id}?`)) {
      try {
        await deleteOrdenTrabajo(id);
        await loadData();
      } catch (err) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreOrdenTrabajo(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  if (loading && ordenes.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        ⏳ Cargando órdenes de trabajo desde PostgreSQL...
      </div>
    );
  }

  // Filtrar OTs si el usuario es CLIENTE
  const displayOrdenes = ordenes.filter(o => {
    if (!isCliente) return true;
    const userEmail = (userSession?.usuario?.email || '').toLowerCase();
    const userName = (userSession?.usuario?.nombre || '').toLowerCase();
    const clientObj = clientes.find(c => c.id === o.id_cliente);
    const clientName = (clientObj?.cliente || o.cliente_nombre || '').toLowerCase();
    const clientEmail = (clientObj?.email || '').toLowerCase();
    return (
      (userEmail && (clientEmail === userEmail || userEmail.includes(clientEmail))) ||
      (userName && (clientName.includes(userName) || userName.includes(clientName))) ||
      o.id_usuario === userSession?.usuario?.id
    );
  });

  return (
    <div>
      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabla de Órdenes de Trabajo en ancho completo */}
      <OrdenTrabajoList
        ordenes={displayOrdenes}
        isAdmin={isAdmin}
        selectedOrdenId={selectedOrden?.id}
        onAddNew={handleStartAdd}
        onSelectOrden={handleSelectForEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      {/* Modal Semi-Transparente al 90% centrado sobre la lista */}
      {panelMode !== 'closed' && (
        <div 
          onClick={handleClosePanel}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 12, 28, 0.78)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '1280px',
              height: '90vh',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85)',
              border: '1px solid rgba(0, 198, 255, 0.4)',
              background: 'rgba(12, 22, 48, 0.96)',
              backdropFilter: 'blur(16px)'
            }}
          >
            {panelMode === 'add' && (
              <OrdenTrabajoAdd
                usuarios={usuarios}
                clientes={clientes}
                tiposOt={tiposOt}
                estadosOt={estadosOt}
                onSave={handleSaveAdd}
                onCancel={handleClosePanel}
              />
            )}

            {panelMode === 'edit' && selectedOrden && (
              <OrdenTrabajoEdit
                orden={selectedOrden}
                usuarios={usuarios}
                clientes={clientes}
                tiposOt={tiposOt}
                estadosOt={estadosOt}
                isAdmin={isAdmin}
                onSave={handleSaveEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onCancel={handleClosePanel}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
