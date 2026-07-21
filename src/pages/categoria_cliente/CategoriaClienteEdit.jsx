import React, { useState, useEffect } from 'react';

export default function CategoriaClienteEdit({ categoria, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || ''
      });
    }
  }, [categoria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave(categoria.id, formData);
    } catch (err) {
      setError(err.message || 'Error al actualizar categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '560px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>✏️ Editar Categoría de Cliente #{categoria?.id}</h3>
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
          <label className="form-label">Nombre de la Categoría / Marca *</label>
          <input
            type="text"
            className="form-input"
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
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Actualizando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
