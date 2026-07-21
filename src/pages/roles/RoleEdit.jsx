import React, { useState, useEffect } from 'react';

export default function RoleEdit({ role, isAdmin, onSave, onDelete, onRestore, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role) {
      setFormData({
        nombre: role.nombre || '',
        descripcion: role.descripcion || ''
      });
      setError('');
      setSuccessInfo('');
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }

    setError('');
    setSuccessInfo('');
    setIsSubmitting(true);
    try {
      await onSave(role.id, formData);
      setSuccessInfo('✓ Cambios guardados correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar el rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeleted = role?.eliminado;

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      border: '1px solid rgba(0, 198, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        gap: '12px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
            DETALLES Y EDICIÓN DE ROL
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🔑 {role?.nombre || 'Rol'}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDeleted ? (
            isAdmin && (
              <button
                type="button"
                onClick={() => onRestore(role.id)}
                className="btn btn-primary"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                title="Restaurar este rol"
              >
                🔄 Restaurar
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => onDelete(role.id)}
              className="btn btn-danger"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Eliminar lógicamente este rol"
            >
              🗑️
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
            title="Cerrar panel"
          >
            ✕
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      {successInfo && (
        <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '12px' }}>
          {successInfo}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Nombre del Rol *</label>
          <input
            type="text"
            className="form-input"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Descripción del Rol</label>
          <textarea
            className="form-input"
            rows="4"
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ fontSize: '12px' }}>
            {isSubmitting ? 'Guardando...' : '✏️ Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
