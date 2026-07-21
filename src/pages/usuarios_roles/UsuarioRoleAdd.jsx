import React, { useState } from 'react';

export default function UsuarioRoleAdd({ usuarios, roles, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    usuario_id: usuarios[0]?.id || '',
    rol_id: roles[0]?.id || ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usuario_id || !formData.rol_id) {
      setError('Debes seleccionar un usuario y un rol');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Error al crear asignación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>🛡️ Asignar Rol a Usuario</h3>
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
          <label className="form-label">Seleccionar Usuario *</label>
          <select
            className="form-select"
            value={formData.usuario_id}
            onChange={e => setFormData({ ...formData, usuario_id: e.target.value })}
            required
          >
            <option value="">-- Elija un Usuario --</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombre} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Seleccionar Rol *</label>
          <select
            className="form-select"
            value={formData.rol_id}
            onChange={e => setFormData({ ...formData, rol_id: e.target.value })}
            required
          >
            <option value="">-- Elija un Rol --</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.nombre} - {r.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Guardando...' : '💾 Confirmar Asignación'}
          </button>
        </div>
      </form>
    </div>
  );
}
