import React, { useState, useEffect } from 'react';
import OtSearchPicker from './OtSearchPicker';
import TecnicoSearchPicker from './TecnicoSearchPicker';
import ClienteSearchPicker from './ClienteSearchPicker';
import ActivoSearchPicker from './ActivoSearchPicker';

/**
 * Componente genérico para mantener entidades hijas de OT.
 * Recibe: fetchFn, createFn, deleteFn, restoreFn, columns, formFields, entityName
 */
export default function GenericChildOtPage({ 
  fetchFn, createFn, deleteFn, restoreFn,
  columns,      // [{ key, label, render? }]
  formFields,   // [{ key, label, type, placeholder, required?, options? }]
  entityName,
  isAdmin
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchFn(null, isAdmin);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const cleanData = {};
      Object.keys(formData).forEach(k => {
        cleanData[k] = formData[k] === '' ? null : formData[k];
      });
      await createFn(cleanData);
      setFormData({});
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al crear registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Eliminar registro #${id}?`)) return;
    try {
      await deleteFn(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreFn(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Error al restaurar');
    }
  };

  const formatDate = (val) => {
    if (!val) return '—';
    try {
      return new Date(val).toLocaleString();
    } catch {
      return val;
    }
  };

  return (
    <div>
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>Listado de {entityName}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{items.length} registros encontrados</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ fontSize: '12px' }}>
            {showForm ? '✕ Cerrar' : `+ Nuevo`}
          </button>
        </div>

        {/* Inline Creation Form */}
        {showForm && (
          <form onSubmit={handleCreate} style={{ background: 'rgba(0, 198, 255, 0.05)', border: '1px solid rgba(0, 198, 255, 0.2)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '4px' }}>
              CREAR NUEVO REGISTRO
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {formFields.map(field => (
                <div key={field.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '10px' }}>{field.label}{field.required ? ' *' : ''}</label>
                  {field.key === 'id_ot' ? (
                    <OtSearchPicker
                      value={formData[field.key] || ''}
                      onChange={val => setFormData({ ...formData, [field.key]: val })}
                      placeholder={field.placeholder}
                    />
                  ) : (field.key === 'id_tecnicos' || field.key === 'id_tecnico') ? (
                    <TecnicoSearchPicker
                      value={formData[field.key] || ''}
                      onChange={val => setFormData({ ...formData, [field.key]: val })}
                      placeholder={field.placeholder}
                    />
                  ) : field.key === 'id_cliente' ? (
                    <ClienteSearchPicker
                      value={formData[field.key] || ''}
                      onChange={val => setFormData({ ...formData, [field.key]: val })}
                      placeholder={field.placeholder}
                    />
                  ) : field.key === 'id_activo' ? (
                    <ActivoSearchPicker
                      value={formData[field.key] || ''}
                      onChange={val => setFormData({ ...formData, [field.key]: val })}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      className="form-input"
                      style={{ fontSize: '12px' }}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    >
                      <option value="">-- Seleccionar --</option>
                      {(field.options || []).map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className="form-input"
                      style={{ fontSize: '12px' }}
                      placeholder={field.placeholder || ''}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                      step={field.type === 'number' ? 'any' : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ fontSize: '11px' }}>Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ fontSize: '11px' }}>
                {isSubmitting ? 'Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </form>
        )}

        {/* Data Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>⏳ Cargando...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  {columns.map(col => <th key={col.key}>{col.label}</th>)}
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={columns.length + 3} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Sin registros</td></tr>
                ) : (
                  items.map(item => {
                    const isDeleted = item.eliminado;
                    return (
                      <tr key={item.id} style={{ opacity: isDeleted ? 0.5 : 1, background: isDeleted ? 'rgba(239, 68, 68, 0.06)' : 'transparent' }}>
                        <td><span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>#{item.id}</span></td>
                        {columns.map(col => (
                          <td key={col.key}>
                            {col.render 
                              ? col.render(item[col.key], item) 
                              : col.isDate 
                                ? formatDate(item[col.key])
                                : (item[col.key] ?? '—')}
                          </td>
                        ))}
                        <td>
                          {isDeleted 
                            ? <span className="badge badge-danger">🗑️ Eliminado</span>
                            : <span className="badge badge-active">Activo</span>
                          }
                        </td>
                        <td>
                          {isDeleted ? (
                            isAdmin && <button onClick={() => handleRestore(item.id)} className="btn btn-primary" style={{ padding: '3px 8px', fontSize: '10px' }}>🔄</button>
                          ) : (
                            <button onClick={() => handleDelete(item.id)} className="btn btn-danger" style={{ padding: '3px 8px', fontSize: '10px' }}>🗑️</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
