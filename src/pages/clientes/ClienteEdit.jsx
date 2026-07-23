import React, { useState, useEffect } from 'react';
import { fetchClientes } from '../../api/clientes.api';
import { fetchTiposCliente } from '../../api/tipoCliente.api';
import { fetchCategoriasCliente } from '../../api/categoriaCliente.api';
import ClienteDireccionesSection from '../direcciones/ClienteDireccionesSection';

// ─── Utilidades RUT Chileno ───────────────────────────────────────────────────

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
  const expectedChar =
    expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : String(expectedDv);
  return dv === expectedChar;
}

function validateEmail(email) {
  if (!email || email.trim() === '') return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email.trim());
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ClienteEdit({ cliente, isAdmin, onSave, onDelete, onRestore, onCancel }) {
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
  const [successInfo, setSuccessInfo] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ rut: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSelectors() {
      try {
        const [cData, tData, catData] = await Promise.all([
          fetchClientes(isAdmin),
          fetchTiposCliente(isAdmin),
          fetchCategoriasCliente(isAdmin)
        ]);
        setClientesBase(cData.filter(c => !c.id_cliente_padre && c.id !== cliente?.id));
        setTipos(tData);
        setCategorias(catData);
      } catch (err) {
        console.error('Error al cargar selectores:', err);
      }
    }
    loadSelectors();

    if (cliente) {
      setFormData({
        idcliente: cliente.idcliente || '',
        n_cliente: cliente.n_cliente || '',
        cliente: cliente.cliente || '',
        id_tipo_cliente: cliente.id_tipo_cliente || '',
        contacto: cliente.contacto || '',
        rut: cliente.rut || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        id_categoria_cliente: cliente.id_categoria_cliente || '',
        id_cliente_padre: cliente.id_cliente_padre || ''
      });
      setError('');
      setSuccessInfo('');
      setFieldErrors({ rut: '', email: '' });
    }
  }, [cliente, isAdmin]);

  // ── Handlers con validación en tiempo real ──
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
    setSuccessInfo('');
    setIsSubmitting(true);
    try {
      await onSave(cliente.id, formData);
      setSuccessInfo('✓ Cambios guardados correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeleted = cliente?.eliminado;
  const isClienteFinal = Boolean(cliente?.id_cliente_padre);

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
      {/* Cabecera */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '14px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        gap: '12px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
              DETALLES Y EDICIÓN DE CLIENTE
            </span>
            {isClienteFinal && (
              <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', fontSize: '10px', fontWeight: 700 }}>
                🔗 Cliente Final (Padre: {cliente.cliente_padre_nombre})
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🏢 {cliente?.cliente || 'Cliente'}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDeleted ? (
            isAdmin && (
              <button
                type="button"
                onClick={() => onRestore(cliente.id)}
                className="btn btn-primary"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                title="Restaurar este cliente"
              >
                🔄 Restaurar
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => onDelete(cliente.id)}
              className="btn btn-danger"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Eliminar lógicamente este cliente"
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

        {/* Fila: N° Cliente + Código Interno */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>N° del Cliente</label>
            <input
              type="text"
              className="form-input"
              value={formData.n_cliente}
              onChange={e => setFormData({ ...formData, n_cliente: e.target.value })}
              placeholder="Ej. CL-6"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Código Interno (ID Cliente)</label>
            <input
              type="text"
              className="form-input"
              value={formData.idcliente}
              onChange={e => setFormData({ ...formData, idcliente: e.target.value })}
              placeholder="Ej. 3E63D07B"
            />
          </div>
        </div>

        {/* Nombre */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Nombre (o Razón Social) del Cliente *</label>
          <input
            type="text"
            className="form-input"
            value={formData.cliente}
            onChange={e => setFormData({ ...formData, cliente: e.target.value })}
            required
          />
        </div>

        {/* ── RUT + Email al inicio ── */}
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
              <div style={{ fontSize: '10px', color: '#f87171', marginTop: '4px' }}>
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
              <div style={{ fontSize: '10px', color: '#f87171', marginTop: '4px' }}>
                ❌ {fieldErrors.email}
              </div>
            )}
          </div>
        </div>

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
            Si un cliente depende de otro (ej: reventa de equipos o edificio), se marca automáticamente como Cliente Final.
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
              {tipos.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0b1329' }}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Categoría / Marca del Cliente</label>
            <select
              className="form-input"
              value={formData.id_categoria_cliente}
              onChange={e => setFormData({ ...formData, id_categoria_cliente: e.target.value })}
            >
              {categorias.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0b1329' }}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contacto + Teléfono */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Nombre Persona de Contacto</label>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !!fieldErrors.rut || !!fieldErrors.email}
            className="btn btn-primary"
            style={{ fontSize: '12px', opacity: (isSubmitting || !!fieldErrors.rut || !!fieldErrors.email) ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Guardando...' : '✏️ Guardar Datos del Cliente'}
          </button>
        </div>
      </form>

      {/* SECCIÓN MULTI-DIRECCIONES */}
      {cliente?.id && (
        <ClienteDireccionesSection
          clienteId={cliente.id}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
