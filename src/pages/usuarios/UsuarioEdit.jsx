import React, { useState, useEffect } from 'react';
import { fetchRoles } from '../../api/roles.api';

export default function UsuarioEdit({ usuario, isAdmin, onSave, onDelete, onRestore, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    activo: true,
    foto_url: '',
    role_ids: []
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const rolesData = await fetchRoles();
        setAvailableRoles(rolesData);
      } catch (err) {
        console.error('Error al obtener lista de roles:', err);
      }
    }
    loadRoles();

    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        telefono: usuario.telefono || '',
        activo: usuario.activo !== undefined ? usuario.activo : true,
        foto_url: usuario.foto_url || '',
        role_ids: usuario.roles ? usuario.roles.map(r => r.id) : []
      });
      setError('');
      setSuccessInfo('');
    }
  }, [usuario]);

  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      const exists = prev.role_ids.includes(roleId);
      const updated = exists
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId];
      return { ...prev, role_ids: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.email.trim()) {
      setError('El nombre y el correo electrónico son obligatorios');
      return;
    }

    setError('');
    setSuccessInfo('');
    setIsSubmitting(true);
    try {
      await onSave(usuario.id, formData);
      setSuccessInfo('✓ Cambios guardados correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeleted = usuario?.eliminado;

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      border: '1px solid rgba(0, 198, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Cabecera del Panel Lateral */}
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
            DETALLES Y EDICIÓN DE USUARIO
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            👤 {usuario?.nombre || 'Usuario'}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDeleted ? (
            isAdmin && (
              <button
                type="button"
                onClick={() => onRestore(usuario.id)}
                className="btn btn-primary"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                title="Restaurar este usuario"
              >
                🔄 Restaurar
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => onDelete(usuario.id)}
              className="btn btn-danger"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Desactivar lógicamente este usuario"
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
          <label className="form-label" style={{ fontSize: '11px' }}>Nombre Completo *</label>
          <input
            type="text"
            className="form-input"
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
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Teléfono de Contacto</label>
          <input
            type="text"
            className="form-input"
            value={formData.telefono}
            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
          />
        </div>

        {/* Roles del Sistema */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Asignación de Roles</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(10, 18, 41, 0.5)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {availableRoles.map(rol => {
              const isChecked = formData.role_ids.includes(rol.id);
              return (
                <label key={rol.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleRoleToggle(rol.id)}
                    style={{ accentColor: 'var(--accent-cyan)' }}
                  />
                  <span>🔑 {rol.nombre}</span>
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
            {isSubmitting ? 'Guardando...' : '✏️ Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
