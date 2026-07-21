import React, { useState, useEffect } from 'react';
import { fetchTiposCliente } from '../../api/tipoCliente.api';
import { fetchCategoriasCliente } from '../../api/categoriaCliente.api';
import ClienteDireccionesSection from '../direcciones/ClienteDireccionesSection';

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
    id_categoria_cliente: ''
  });
  const [tipos, setTipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSelectors() {
      try {
        const [tData, cData] = await Promise.all([
          fetchTiposCliente(isAdmin),
          fetchCategoriasCliente(isAdmin)
        ]);
        setTipos(tData);
        setCategorias(cData);
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
        id_categoria_cliente: cliente.id_categoria_cliente || ''
      });
      setError('');
      setSuccessInfo('');
    }
  }, [cliente, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente.trim()) {
      setError('El nombre de la empresa / cliente es obligatorio');
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

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      border: '1px solid rgba(0, 198, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Cabecera Superior Estilo Panel Lateral de Detalles */}
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
            DETALLES Y EDICIÓN DE CLIENTE
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🏢 {cliente?.cliente || 'Cliente'}
          </h3>
        </div>

        {/* Botones de Acción Superiores */}
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

      {/* Formulario Editable del Cliente */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Tipo de Cliente</label>
          <select
            className="form-input"
            value={formData.id_tipo_cliente}
            onChange={e => setFormData({ ...formData, id_tipo_cliente: e.target.value })}
          >
            {tipos.map(t => (
              <option key={t.id} value={t.id} style={{ background: '#0b1329' }}>
                {t.nombre}
              </option>
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
              <option key={c.id} value={c.id} style={{ background: '#0b1329' }}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>RUT del Cliente</label>
          <input
            type="text"
            className="form-input"
            value={formData.rut}
            onChange={e => setFormData({ ...formData, rut: e.target.value })}
            placeholder="6.517.759-6"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Nombre Persona de Contacto</label>
          <input
            type="text"
            className="form-input"
            value={formData.contacto}
            onChange={e => setFormData({ ...formData, contacto: e.target.value })}
            placeholder="Ej. HISENSE GORENJE CHILE SPA"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Teléfono de Contacto</label>
          <input
            type="text"
            className="form-input"
            value={formData.telefono}
            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
            placeholder="8004473673"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Email de Contacto</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="contacto@empresa.com"
          />
        </div>

        {/* Pie del Formulario con Botón Guardar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ fontSize: '12px' }}>
            {isSubmitting ? 'Guardando...' : '✏️ Guardar Datos del Cliente'}
          </button>
        </div>
      </form>

      {/* SECCIÓN MULTI-DIRECCIONES DEL CLIENTE */}
      {cliente?.id && (
        <ClienteDireccionesSection
          clienteId={cliente.id}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
