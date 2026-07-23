import React, { useState, useEffect } from 'react';
import { fetchRoles } from '../../api/roles.api';

// ─── Utilidades RUT Chileno (igual que ClienteAdd) ────────────────────────────

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
  if (!email || email.trim() === '') return false; // Obligatorio en usuario
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function UsuarioAdd({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rut: '',
    password: '',
    telefono: '',
    activo: true
  });
  const [rolesList, setRolesList] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ rut: '', email: '' });
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
      setError('El correo electrónico es obligatorio y debe tener un formato válido');
      setFieldErrors(prev => ({ ...prev, email: 'Formato de email inválido (ej. nombre@dominio.cl)' }));
      return;
    }
    if (formData.rut && !validateRut(formData.rut)) {
      setError('El RUT ingresado no es válido. Verifica el dígito verificador.');
      setFieldErrors(prev => ({ ...prev, rut: 'RUT inválido — verifica el dígito verificador' }));
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

  const hasBlockingErrors = !!fieldErrors.rut || !!fieldErrors.email;

  // Estilos inline
  const inputErrorStyle = { borderColor: 'rgba(239,68,68,0.7)', boxShadow: '0 0 0 2px rgba(239,68,68,0.15)' };
  const inputOkStyle = { borderColor: 'rgba(34,197,94,0.6)', boxShadow: '0 0 0 2px rgba(34,197,94,0.1)' };

  return (
    <div className="glass-panel" style={{
      padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
      border: '1px solid rgba(0,198,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
            CREAR NUEVO USUARIO
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ➕ Agregar Usuario
          </h3>
        </div>
        <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="Cerrar panel">
          ✕
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Nombre */}
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
            ) : (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Se formatea automáticamente
              </div>
            )}
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
              placeholder="ejemplo@vrfsystems.cl"
              value={formData.email}
              onChange={handleEmailChange}
              style={fieldErrors.email ? inputErrorStyle : (formData.email && !fieldErrors.email ? inputOkStyle : {})}
            />
            {fieldErrors.email && (
              <div style={{ fontSize: '10px', color: '#f87171', marginTop: '4px' }}>❌ {fieldErrors.email}</div>
            )}
          </div>
        </div>

        {/* Teléfono + Contraseña */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>📞 Teléfono</label>
            <input
              type="text"
              className="form-input"
              placeholder="+56 9 1234 5678"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🔒 Contraseña Inicial</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        {/* Roles */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>🔐 Roles del Usuario *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(10,18,41,0.5)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
            {isSubmitting ? 'Guardando...' : '💾 Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
