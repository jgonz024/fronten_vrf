import React, { useState, useEffect } from 'react';
import { fetchRoles } from '../../api/roles.api';

export default function UsuarioEdit({ usuario, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    activo: true
  });
  const [rolesList, setRolesList] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const data = await fetchRoles();
        setRolesList(data);
      } catch (err) {
        console.error('Error al cargar roles:', err);
      }
    }
    loadRoles();

    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        activo: usuario.activo ?? true
      });
      const initialRoles = usuario.roles ? usuario.roles.map(r => Number(r.id)) : [];
      setSelectedRoleIds(initialRoles);
    }
  }, [usuario]);

  const handleRoleToggle = (rolId) => {
    const numericId = Number(rolId);
    if (selectedRoleIds.includes(numericId)) {
      setSelectedRoleIds(selectedRoleIds.filter(id => id !== numericId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, numericId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.email.trim()) {
      setError('El nombre y el correo electrónico son campos obligatorios');
      return;
    }
    if (selectedRoleIds.length === 0) {
      setError('Debes seleccionar al menos un rol para el usuario');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave(usuario.id, { ...formData, role_ids: selectedRoleIds });
    } catch (err) {
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>✏️ Editar Usuario #{usuario?.id}</h3>
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
          <label className="form-label">Nombre Completo *</label>
          <input
            type="text"
            className="form-input"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Correo Electrónico *</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono de Contacto</label>
          <input
            type="text"
            className="form-input"
            value={formData.telefono}
            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>

        {/* Sección de Asignación Directa de Roles */}
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Roles Asignados al Usuario * (Marca o desmarca roles)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(10, 18, 41, 0.6)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {rolesList.map(r => {
              const isChecked = selectedRoleIds.includes(Number(r.id));
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

        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <input
            type="checkbox"
            id="activo-edit"
            checked={formData.activo}
            onChange={e => setFormData({ ...formData, activo: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="activo-edit" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
            Usuario Activo en el Sistema
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Actualizando...' : '💾 Guardar Cambios de Usuario y Roles'}
          </button>
        </div>
      </form>
    </div>
  );
}
