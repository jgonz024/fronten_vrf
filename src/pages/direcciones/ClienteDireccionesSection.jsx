import React, { useState, useEffect } from 'react';
import { fetchDirecciones, createDireccion, updateDireccion, deleteDireccion, restoreDireccion } from '../../api/direcciones.api';

export default function ClienteDireccionesSection({ clienteId, isAdmin }) {
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para formulario de dirección (Agregar/Editar)
  const [formMode, setFormMode] = useState('closed'); // 'closed' | 'add' | 'edit'
  const [editingDir, setEditingDir] = useState(null);
  const [dirData, setDirData] = useState({
    direccion: '',
    contactoendireccion: '',
    telefonoendireccion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDirecciones = async () => {
    if (!clienteId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchDirecciones(clienteId, isAdmin);
      setDirecciones(data);
    } catch (err) {
      setError(err.message || 'Error al cargar las direcciones del cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirecciones();
  }, [clienteId, isAdmin]);

  const handleStartAdd = () => {
    setEditingDir(null);
    setDirData({ direccion: '', contactoendireccion: '', telefonoendireccion: '' });
    setFormMode('add');
    setError('');
  };

  const handleStartEdit = (dir) => {
    setEditingDir(dir);
    setDirData({
      direccion: dir.direccion || '',
      contactoendireccion: dir.contactoendireccion || '',
      telefonoendireccion: dir.telefonoendireccion || ''
    });
    setFormMode('edit');
    setError('');
  };

  const handleCancelForm = () => {
    setFormMode('closed');
    setEditingDir(null);
    setError('');
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!dirData.direccion.trim()) {
      setError('La dirección es obligatoria');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      if (formMode === 'add') {
        await createDireccion({
          ...dirData,
          id_cliente: clienteId
        });
      } else if (formMode === 'edit' && editingDir) {
        await updateDireccion(editingDir.id, {
          ...dirData,
          id_cliente: clienteId
        });
      }
      await loadDirecciones();
      handleCancelForm();
    } catch (err) {
      setError(err.message || 'Error al guardar dirección');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDir = async (dirId) => {
    if (window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      try {
        await deleteDireccion(dirId);
        await loadDirecciones();
        if (editingDir && editingDir.id === dirId) {
          handleCancelForm();
        }
      } catch (err) {
        alert(err.message || 'Error al eliminar dirección');
      }
    }
  };

  const handleRestoreDir = async (dirId) => {
    try {
      await restoreDireccion(dirId);
      await loadDirecciones();
    } catch (err) {
      alert(err.message || 'Error al restaurar dirección');
    }
  };

  if (!clienteId) return null;

  return (
    <div style={{
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Cabecera Sección Direcciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>📍</span>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Direcciones del Cliente
          </h4>
          <span className="badge" style={{ background: 'rgba(0, 198, 255, 0.15)', color: 'var(--accent-cyan)', fontSize: '11px', fontWeight: 700 }}>
            {direcciones.length}
          </span>
        </div>

        {formMode === 'closed' && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            + Añadir Dirección
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '11px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Formulario Inline para Crear o Editar Dirección */}
      {formMode !== 'closed' && (
        <form onSubmit={handleSaveForm} style={{
          background: 'rgba(10, 18, 41, 0.6)',
          padding: '14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(0, 198, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {formMode === 'add' ? '📍 Nueva Dirección' : `📍 Editar Dirección #${editingDir?.id}`}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Dirección / Sucursal *</label>
            <input
              type="text"
              className="form-input"
              value={dirData.direccion}
              onChange={e => setDirData({ ...dirData, direccion: e.target.value })}
              placeholder="Ej. Av. Andrés Bello 2457, Providencia"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Contacto en Dirección</label>
              <input
                type="text"
                className="form-input"
                value={dirData.contactoendireccion}
                onChange={e => setDirData({ ...dirData, contactoendireccion: e.target.value })}
                placeholder="Ej. Juan Pérez (Administrador)"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Teléfono en Dirección</label>
              <input
                type="text"
                className="form-input"
                value={dirData.telefonoendireccion}
                onChange={e => setDirData({ ...dirData, telefonoendireccion: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={handleCancelForm} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
              {isSubmitting ? 'Guardando...' : '💾 Guardar Dirección'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Direcciones del Cliente */}
      {loading ? (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⏳ Cargando direcciones...</div>
      ) : direcciones.length === 0 ? (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Este cliente no posee direcciones registradas. Haz clic en "+ Añadir Dirección" para registrar una sucursal.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {direcciones.map(dir => {
            const isDeleted = dir.eliminado;
            return (
              <div
                key={dir.id}
                style={{
                  background: isDeleted ? 'rgba(239, 68, 68, 0.08)' : 'rgba(10, 18, 41, 0.4)',
                  border: isDeleted ? '1px dashed rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  opacity: isDeleted ? 0.6 : 1
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', wordBreak: 'break-word' }}>
                    📍 {dir.direccion}
                  </div>
                  {(dir.contactoendireccion || dir.telefonoendireccion) && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {dir.contactoendireccion && <span>👤 {dir.contactoendireccion}</span>}
                      {dir.contactoendireccion && dir.telefonoendireccion && <span> • </span>}
                      {dir.telefonoendireccion && <span>📞 {dir.telefonoendireccion}</span>}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {isDeleted ? (
                    isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleRestoreDir(dir.id)}
                        className="btn btn-primary"
                        style={{ padding: '3px 8px', fontSize: '10px' }}
                      >
                        🔄
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(dir)}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '10px' }}
                        title="Editar esta dirección"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDir(dir.id)}
                        className="btn btn-danger"
                        style={{ padding: '3px 8px', fontSize: '10px' }}
                        title="Eliminar esta dirección"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
