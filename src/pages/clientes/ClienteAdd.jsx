import React, { useState, useEffect } from 'react';
import { fetchClientes } from '../../api/clientes.api';
import { fetchTiposCliente } from '../../api/tipoCliente.api';
import { fetchCategoriasCliente } from '../../api/categoriaCliente.api';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSelectors() {
      try {
        const [cData, tData, catData] = await Promise.all([
          fetchClientes(),
          fetchTiposCliente(),
          fetchCategoriasCliente()
        ]);
        // Solo mostrar como posibles clientes padres a aquellos que NO dependen de otro padre
        setClientesBase(cData.filter(c => !c.id_cliente_padre));
        setTipos(tData);
        setCategorias(catData);
      } catch (err) {
        console.error('Error al cargar selectores:', err);
      }
    }
    loadSelectors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente.trim()) {
      setError('El nombre de la empresa / cliente es obligatorio');
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
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0 }}>🏢 Crear Nuevo Cliente</h3>
        <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
          ✕
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        {/* Cliente Padre / Vendedor Original */}
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

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Tipo de Cliente</label>
          <select
            className="form-input"
            value={formData.id_tipo_cliente}
            onChange={e => setFormData({ ...formData, id_tipo_cliente: e.target.value })}
          >
            <option value="" style={{ background: '#0b1329' }}>Seleccionar Tipo</option>
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
            <option value="" style={{ background: '#0b1329' }}>Seleccionar Categoría</option>
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
            placeholder="Ej. 76.517.759-K"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Persona de Contacto</label>
          <input
            type="text"
            className="form-input"
            value={formData.contacto}
            onChange={e => setFormData({ ...formData, contacto: e.target.value })}
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

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Email de Contacto</label>
          <input
            type="email"
            className="form-input"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ fontSize: '12px' }}>
            {isSubmitting ? 'Creando...' : '💾 Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
