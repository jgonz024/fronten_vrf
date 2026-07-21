import React, { useState, useEffect } from 'react';
import { fetchRoles } from '../../api/roles.api';

export default function UsuarioAdd({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
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
        // Por defecto seleccionar el primer rol si existe
        if (data.length > 0) {
          setSelectedRoleIds([data[0].id]);
        }
      } catch (err) {
        console.error('Error al cargar roles:', err);
      }
    }
    loadRoles();
  }, []);

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
      await onSave({ ...formData, role_ids: selectedRoleIds });
    } catch (err) {
      setError(err.message || 'Error al guardar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>➕ Crear Nuevo Usuario</h3>
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
            placeholder="Ej. Pedro Morales"
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
            placeholder="ejemplo@vrfsystems.cl"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña Inicial (Por defecto: Vrf12345)</label>
          <input
            type="password"
            className="form-input"
            placeholder="Vrf12345 (por defecto si se deja vacío)"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono de Contacto</label>
          <input
            type="text"
            className="form-input"
            placeholder="+56 9 1234 5678"
            value={formData.telefono}
            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>

        {/* Sección de Asignación Directa de Roles */}
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            Roles del Usuario * (Puedes seleccionar múltiples)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(10, 18, 41, 0.6)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {rolesList.map(r => {
              const isChecked = selectedRoleIds.includes(r.id);
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

        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
          <input
            type="checkbox"
            id="activo"
            checked={formData.activo}
            onChange={e => setFormData({ ...formData, activo: e.target.checked })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="activo" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
            Usuario Activo en el Sistema
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Guardando...' : '💾 Crear Usuario y Asignar Roles'}
          </button>
        </div>
      </form>
    </div>
  );
}
