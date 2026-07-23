import React, { useState, useEffect } from 'react';
import { fetchRoles } from '../../api/roles.api';

// ─── Utilidades RUT Chileno (igual que ClienteEdit) ───────────────────────────

function formatRut(value) {
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  const dv = clean.slice(-1);
  const num = clean.slice(0, -1);
  if (num.length === 0) return dv;
  const formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

function validateRut(rut) {
  if (!rut || rut.trim() === '') return true;
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const dv = clean.slice(-1);
  const numStr = clean.slice(0, -1);
  if (numStr.length === 0 || isNaN(Number(numStr))) return false;
  let sum = 0;
  let multiplier = 2;
  for (let i = numStr.length - 1; i >= 0; i--) {
    sum += parseInt(numStr[i]) * multiplier;
    multiplier = multiplier < 7 ? multiplier + 1 : 2;
  }
  const expectedDv = 11 - (sum % 11);
  const expectedChar = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);
  return dv === expectedChar;
}

function validateEmail(email) {
  if (!email || email.trim() === '') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function UsuarioEdit({ usuario, isAdmin, onSave, onDelete, onRestore, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rut: '',
    telefono: '',
    activo: true,
    foto_url: '',
    role_ids: []
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ rut: '', email: '' });
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
        rut: usuario.rut || '',
        telefono: usuario.telefono || '',
        activo: usuario.activo !== undefined ? usuario.activo : true,
        foto_url: usuario.foto_url || '',
        role_ids: usuario.roles ? usuario.roles.map(r => r.id) : []
      });
      setError('');
      setSuccessInfo('');
      setFieldErrors({ rut: '', email: '' });
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

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value);
    setFormData(prev => ({ ...prev, rut: formatted }));
    if (formatted.length > 1) {
      setFieldErrors(prev => ({
        ...prev,
        rut: validateRut(formatted) ? '' : 'RUT inválido — verifica el dígito verificador'
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, rut: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, email: val }));
    if (val.trim().length > 0) {
      setFieldErrors(prev => ({
        ...prev,
        email: validateEmail(val) ? '' : 'Formato de email inválido (ej. nombre@dominio.cl)'
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setError('El nombre completo es obligatorio');
      return;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError('El correo electrónico es obligatorio y debe tener un formato válido.');
      setFieldErrors(prev => ({ ...prev, email: 'Formato de email inválido (ej. nombre@dominio.cl)' }));
      return;
    }
    if (formData.rut && !validateRut(formData.rut)) {
      setError('El RUT ingresado no es válido. Verifica el dígito verificador.');
      setFieldErrors(prev => ({ ...prev, rut: 'RUT inválido — verifica el dígito verificador' }));
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
  const hasBlockingErrors = !!fieldErrors.rut || !!fieldErrors.email;

  const inputErrorStyle = { borderColor: 'rgba(239,68,68,0.7)', boxShadow: '0 0 0 2px rgba(239,68,68,0.15)' };
  const inputOkStyle = { borderColor: 'rgba(34,197,94,0.6)', boxShadow: '0 0 0 2px rgba(34,197,94,0.1)' };

  return (
    <div className="glass-panel" style={{
      padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
      border: '1px solid rgba(0,198,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', gap: '12px' }}>
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
              <button type="button" onClick={() => onRestore(usuario.id)} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                🔄 Restaurar
              </button>
            )
          ) : (
            <button type="button" onClick={() => onDelete(usuario.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}>
              🗑️
            </button>
          )}
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
            ✕
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}
      {successInfo && (
        <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(52,211,153,0.4)', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '12px' }}>
          {successInfo}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Nombre */}
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

        {/* RUT + Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* RUT */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>
              🪪 RUT
              {formData.rut && !fieldErrors.rut && (
                <span style={{ color: '#22c55e', marginLeft: '6px', fontWeight: 700 }}>✓ Válido</span>
              )}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. 12.345.678-9"
              value={formData.rut}
              onChange={handleRutChange}
              maxLength={12}
              style={fieldErrors.rut ? inputErrorStyle : (formData.rut && !fieldErrors.rut ? inputOkStyle : {})}
            />
            {fieldErrors.rut ? (
              <div style={{ fontSize: '10px', color: '#f87171', marginTop: '4px' }}>❌ {fieldErrors.rut}</div>
            ) : !formData.rut ? (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Se formatea automáticamente
              </div>
            ) : null}
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>
              ✉️ Correo Electrónico *
              {formData.email && !fieldErrors.email && (
                <span style={{ color: '#22c55e', marginLeft: '6px', fontWeight: 700 }}>✓ Válido</span>
              )}
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.email}
              onChange={handleEmailChange}
              style={fieldErrors.email ? inputErrorStyle : (formData.email && !fieldErrors.email ? inputOkStyle : {})}
            />
            {fieldErrors.email && (
              <div style={{ fontSize: '10px', color: '#f87171', marginTop: '4px' }}>❌ {fieldErrors.email}</div>
            )}
          </div>
        </div>

        {/* Teléfono */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>📞 Teléfono de Contacto</label>
          <input
            type="text"
            className="form-input"
            value={formData.telefono}
            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="+56 9 XXXX XXXX"
          />
        </div>

        {/* Roles */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>🔐 Asignación de Roles</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(10,18,41,0.5)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
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

        {/* Estado */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>🚦 Estado de Cuenta</label>
          <select
            className="form-input"
            value={formData.activo ? 'true' : 'false'}
            onChange={e => setFormData({ ...formData, activo: e.target.value === 'true' })}
          >
            <option value="true" style={{ background: '#0b1329' }}>Activa</option>
            <option value="false" style={{ background: '#0b1329' }}>Inactiva</option>
          </select>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || hasBlockingErrors}
            className="btn btn-primary"
            style={{ fontSize: '12px', opacity: (isSubmitting || hasBlockingErrors) ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Guardando...' : '✏️ Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
