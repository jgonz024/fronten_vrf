import React, { useState } from 'react';

export default function TipoClienteAdd({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre del tipo de cliente es obligatorio');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Error al guardar tipo de cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>🏷️ Crear Tipo de Cliente</h3>
        <button onClick={onCancel} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
          ✕ Cancelar
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nombre del Tipo de Cliente *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej. Comercial / Industrial"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            className="form-input"
            rows="3"
            placeholder="Descripción opcional del perfil de cliente"
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Guardando...' : '💾 Crear Tipo de Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
