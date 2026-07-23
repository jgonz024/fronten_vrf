import React, { useState, useEffect } from 'react';
import { fetchClientes } from '../../api/clientes.api';
import { fetchTiposCliente } from '../../api/tipoCliente.api';
import { fetchCategoriasCliente } from '../../api/categoriaCliente.api';

// ─── Utilidades RUT Chileno ───────────────────────────────────────────────────

/**
 * Formatea un RUT mientras se escribe: "12345678" → "12.345.678-9"
 * Acepta entradas con o sin puntos/guión.
 */
function formatRut(value) {
  // Eliminar todo excepto dígitos y K/k
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length === 0) return '';

  const dv = clean.slice(-1);
  const num = clean.slice(0, -1);

  if (num.length === 0) return dv;

  // Insertar puntos cada 3 dígitos desde la derecha
  const formatted = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

/**
 * Valida RUT chileno (módulo 11).
 * Acepta formatos: "12.345.678-9", "12345678-9", "12345678K"
 */
function validateRut(rut) {
  if (!rut || rut.trim() === '') return true; // Campo opcional → válido si vacío

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
  const expectedChar =
    expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);

  return dv === expectedChar;
}

/**
 * Valida formato de email.
 */
function validateEmail(email) {
  if (!email || email.trim() === '') return true; // Campo opcional → válido si vacío
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ClienteAdd({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    idcliente: '',
    n_cliente: '',
    cliente: '',
    id_tipo_cliente: '',
    contacto: '',
    rut: '',
    telefono: '',
    email: '',
    id_categoria_cliente: '',
    id_cliente_padre: ''
  });

  const [clientesBase, setClientesBase] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ rut: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSelectors() {
      try {
        const [cData, tData, catData] = await Promise.all([
          fetchClientes(),
          fetchTiposCliente(),
          fetchCategoriasCliente()
        ]);
        setClientesBase(cData.filter(c => !c.id_cliente_padre));
        setTipos(tData);
        setCategorias(catData);
      } catch (err) {
        console.error('Error al cargar selectores:', err);
      }
    }
    loadSelectors();
  }, []);

  // ── Handlers con validación en tiempo real ──
  const handleRutChange = (e) => {
    const raw = e.target.value;
    const formatted = formatRut(raw);
    setFormData(prev => ({ ...prev, rut: formatted }));

    if (formatted.length > 1) {
      const isValid = validateRut(formatted);
      setFieldErrors(prev => ({
        ...prev,
        rut: isValid ? '' : 'RUT inválido — verifica el dígito verificador'
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, rut: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, email: val }));
    if (val.trim().length > 0) {
      const isValid = validateEmail(val);
      setFieldErrors(prev => ({
        ...prev,
        email: isValid ? '' : 'Formato de email inválido (ej. nombre@dominio.cl)'
      }));
    } else {
      setFieldErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones pre-envío
    if (!formData.cliente.trim()) {
      setError('El nombre de la empresa / cliente es obligatorio');
      return;
    }

    if (formData.rut && !validateRut(formData.rut)) {
      setError('El RUT ingresado no es válido. Verifica el dígito verificador.');
      setFieldErrors(prev => ({ ...prev, rut: 'RUT inválido — verifica el dígito verificador' }));
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      setError('El email ingresado no tiene un formato válido.');
      setFieldErrors(prev => ({ ...prev, email: 'Formato de email inválido (ej. nombre@dominio.cl)' }));
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Error al guardar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Estilos inline reutilizables ──
  const inputErrorStyle = {
    borderColor: 'rgba(239, 68, 68, 0.7)',
    boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.15)'
  };
  const inputOkStyle = {
    borderColor: 'rgba(34, 197, 94, 0.6)',
    boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.1)'
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
      {/* Header */}
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
            CREAR NUEVO CLIENTE
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🏢 Agregar Cliente
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

      {/* Error global */}
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Fila: N° Cliente + Código Interno */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>N° del Cliente</label>
            <input
              type="text"
              className="form-input"
              value={formData.n_cliente}
              onChange={e => setFormData({ ...formData, n_cliente: e.target.value })}
              placeholder="Ej. CL-1432"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Código Interno (ID)</label>
            <input
              type="text"
              className="form-input"
              value={formData.idcliente}
              onChange={e => setFormData({ ...formData, idcliente: e.target.value })}
              placeholder="Ej. 3E63D07B"
            />
          </div>
        </div>

        {/* Nombre del cliente */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Nombre (o Razón Social) del Cliente *</label>
          <input
            type="text"
            className="form-input"
            value={formData.cliente}
            onChange={e => setFormData({ ...formData, cliente: e.target.value })}
            placeholder="Nombre completo de la empresa o persona"
            required
          />
        </div>

        {/* ── RUT + Email al inicio (campos prioritarios) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* RUT Chileno */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>
              🪪 RUT del Cliente
              {formData.rut && !fieldErrors.rut && (
                <span style={{ color: '#22c55e', marginLeft: '6px', fontWeight: 700 }}>✓ Válido</span>
              )}
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.rut}
              onChange={handleRutChange}
              placeholder="Ej. 76.517.759-K"
              maxLength={12}
              style={fieldErrors.rut ? inputErrorStyle : (formData.rut && !fieldErrors.rut ? inputOkStyle : {})}
            />
            {fieldErrors.rut && (
              <div style={{ fontSize: '10px', color: '#f87171', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ❌ {fieldErrors.rut}
              </div>
            )}
            {!fieldErrors.rut && !formData.rut && (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Formato: 12.345.678-9 (se formatea automáticamente)
              </div>
            )}
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>
              ✉️ Email de Contacto
              {formData.email && !fieldErrors.email && (
                <span style={{ color: '#22c55e', marginLeft: '6px', fontWeight: 700 }}>✓ Válido</span>
              )}
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.email}
              onChange={handleEmailChange}
              placeholder="contacto@empresa.cl"
              style={fieldErrors.email ? inputErrorStyle : (formData.email && !fieldErrors.email ? inputOkStyle : {})}
            />
            {fieldErrors.email && (
              <div style={{ fontSize: '10px', color: '#f87171', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ❌ {fieldErrors.email}
              </div>
            )}
          </div>
        </div>

        {/* Separador visual */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', marginTop: '2px' }} />

        {/* Cliente Padre */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>🔗 Cliente Padre (Vendedor / Matriz Opcional)</label>
          <select
            className="form-input"
            value={formData.id_cliente_padre}
            onChange={e => setFormData({ ...formData, id_cliente_padre: e.target.value })}
          >
            <option value="" style={{ background: '#0b1329' }}>Ninguno (Cliente Independiente)</option>
            {clientesBase.map(c => (
              <option key={c.id} value={c.id} style={{ background: '#0b1329' }}>
                🏢 {c.cliente} (#{c.id})
              </option>
            ))}
          </select>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Si selecciona un padre, este registro será un Cliente Final derivado.
          </div>
        </div>

        {/* Tipo + Categoría */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Tipo de Cliente</label>
            <select
              className="form-input"
              value={formData.id_tipo_cliente}
              onChange={e => setFormData({ ...formData, id_tipo_cliente: e.target.value })}
            >
              <option value="" style={{ background: '#0b1329' }}>Seleccionar Tipo</option>
              {tipos.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0b1329' }}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Categoría / Marca</label>
            <select
              className="form-input"
              value={formData.id_categoria_cliente}
              onChange={e => setFormData({ ...formData, id_categoria_cliente: e.target.value })}
            >
              <option value="" style={{ background: '#0b1329' }}>Seleccionar Categoría</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0b1329' }}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contacto + Teléfono */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Persona de Contacto</label>
            <input
              type="text"
              className="form-input"
              value={formData.contacto}
              onChange={e => setFormData({ ...formData, contacto: e.target.value })}
              placeholder="Nombre del contacto"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Teléfono de Contacto</label>
            <input
              type="text"
              className="form-input"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+56 9 XXXX XXXX"
            />
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !!fieldErrors.rut || !!fieldErrors.email}
            className="btn btn-primary"
            style={{ fontSize: '12px', opacity: (isSubmitting || !!fieldErrors.rut || !!fieldErrors.email) ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Creando...' : '💾 Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
