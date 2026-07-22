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
            CREAR NUEVO USUARIO
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ➕ Agregar Usuario
          </h3>
        </div>
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

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Nombre Completo *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej. Pedro Morales"
            value={formData.nombre}
            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Correo Electrónico *</label>
          <input
            type="email"
            className="form-input"
            placeholder="ejemplo@vrfsystems.cl"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Contraseña Inicial</label>
          <input
            type="password"
            className="form-input"
            placeholder="Vrf12345 (por defecto si se deja vacío)"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Teléfono de Contacto</label>
          <input
            type="text"
            className="form-input"
            placeholder="+56 9 1234 5678"
            value={formData.telefono}
            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Roles del Usuario *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(10, 18, 41, 0.5)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {rolesList.map(r => {
              const isChecked = selectedRoleIds.includes(r.id);
              return (
                <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleRoleToggle(r.id)}
                    style={{ accentColor: 'var(--accent-cyan)' }}
                  />
                  <span>🔑 {r.nombre}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Estado de Cuenta</label>
          <select
            className="form-input"
            value={formData.activo ? 'true' : 'false'}
            onChange={e => setFormData({ ...formData, activo: e.target.value === 'true' })}
          >
            <option value="true" style={{ background: '#0b1329' }}>Activa</option>
            <option value="false" style={{ background: '#0b1329' }}>Inactiva</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ fontSize: '12px' }}>
            {isSubmitting ? 'Guardando...' : '💾 Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
