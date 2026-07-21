import React, { useState } from 'react';

export default function UsuarioRoleAdd({ usuarios, roles, onSave, onCancel }) {
  const [usuarioId, setUsuarioId] = useState(usuarios[0]?.id || '');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleToggle = (rolId) => {
    const numericId = Number(rolId);
    if (selectedRoles.includes(numericId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== numericId));
    } else {
      setSelectedRoles([...selectedRoles, numericId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioId) {
      setError('Debes seleccionar un usuario');
      return;
    }
    if (selectedRoles.length === 0) {
      setError('Debes seleccionar al menos un rol para el usuario');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave({ usuario_id: Number(usuarioId), role_ids: selectedRoles });
    } catch (err) {
      setError(err.message || 'Error al asignar roles');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>🛡️ Asignar Múltiples Roles a Usuario</h3>
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
            value={usuarioId}
            onChange={e => setUsuarioId(e.target.value)}
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

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Seleccionar Roles a Asignar * (Puedes marcar varios)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(10, 18, 41, 0.6)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {roles.map(r => {
              const isChecked = selectedRoles.includes(r.id);
              return (
                <label
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isChecked ? 'rgba(0, 198, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isChecked ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleRoleToggle(r.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: isChecked ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                      🔑 {r.nombre}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {r.descripcion || 'Sin descripción'}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Guardando...' : `💾 Guardar ${selectedRoles.length} Rol(es)`}
          </button>
        </div>
      </form>
    </div>
  );
}
