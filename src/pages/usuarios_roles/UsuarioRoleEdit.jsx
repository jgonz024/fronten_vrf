import React, { useState, useEffect } from 'react';

export default function UsuarioRoleEdit({ item, usuarios, roles, onSave, onCancel }) {
  const [usuarioId, setUsuarioId] = useState(item?.usuario_id || '');
  const [selectedRoles, setSelectedRoles] = useState(item?.role_ids || [item?.rol_id].filter(Boolean).map(Number));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setUsuarioId(item.usuario_id || '');
      const initialRoles = item.role_ids ? item.role_ids.map(Number) : [Number(item.rol_id)].filter(Boolean);
      setSelectedRoles(initialRoles);
    }
  }, [item]);

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
      await onSave(item.usuario_id || item.id, { usuario_id: Number(usuarioId), role_ids: selectedRoles });
    } catch (err) {
      setError(err.message || 'Error al actualizar asignación de roles');
    } finally {
      setIsSubmitting(false);
    }
  };

  const usuarioActual = usuarios.find(u => u.id === Number(usuarioId)) || { nombre: item?.usuario_nombre || `Usuario #${usuarioId}` };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>✏️ Editar Roles Asignados: {usuarioActual.nombre}</h3>
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
          <label className="form-label">Usuario Seleccionado</label>
          <input
            type="text"
            className="form-input"
            value={`${usuarioActual.nombre} (${usuarioActual.email || 'ID #' + usuarioId})`}
            disabled
            style={{ opacity: 0.85, cursor: 'not-allowed', color: 'var(--accent-cyan)', fontWeight: 600 }}
          />
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Roles del Usuario (Marca o desmarca los roles correspondientes)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(10, 18, 41, 0.6)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {roles.map(r => {
              const isChecked = selectedRoles.includes(Number(r.id));
              return (
                <label
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: isChecked ? 'rgba(0, 198, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
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
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: isChecked ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                        🔑 {r.nombre}
                      </span>
                      {isChecked && (
                        <span className="badge badge-active" style={{ fontSize: '10px' }}>✓ Asignado</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
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
