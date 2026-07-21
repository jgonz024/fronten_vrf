import React, { useState, useEffect } from 'react';
import { fetchTiposCliente } from '../../api/tipoCliente.api';
import { fetchCategoriasCliente } from '../../api/categoriaCliente.api';

export default function ClienteEdit({ cliente, onSave, onDelete, onCancel }) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSelectors() {
      try {
        const [tData, cData] = await Promise.all([
          fetchTiposCliente(),
          fetchCategoriasCliente()
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
    }
  }, [cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente.trim()) {
      setError('El nombre de la empresa / cliente es obligatorio');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave(cliente.id, formData);
    } catch (err) {
      setError(err.message || 'Error al actualizar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>✏️ Editar Cliente #{cliente?.id}</h3>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Código Interno (ID Cliente)</label>
            <input
              type="text"
              className="form-input"
              value={formData.idcliente}
              onChange={e => setFormData({ ...formData, idcliente: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">N° de Cliente</label>
            <input
              type="text"
              className="form-input"
              value={formData.n_cliente}
              onChange={e => setFormData({ ...formData, n_cliente: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nombre / Razón Social *</label>
          <input
            type="text"
            className="form-input"
            value={formData.cliente}
            onChange={e => setFormData({ ...formData, cliente: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Tipo de Cliente (FK)</label>
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

          <div className="form-group">
            <label className="form-label">Categoría / Marca (FK)</label>
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Contacto Responsable</label>
            <input
              type="text"
              className="form-input"
              value={formData.contacto}
              onChange={e => setFormData({ ...formData, contacto: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">RUT</label>
            <input
              type="text"
              className="form-input"
              value={formData.rut}
              onChange={e => setFormData({ ...formData, rut: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Teléfono de Contacto</label>
            <input
              type="text"
              className="form-input"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          {onDelete && cliente?.id && (
            <button
              type="button"
              onClick={() => onDelete(cliente.id)}
              className="btn btn-danger"
              style={{ fontSize: '13px' }}
            >
              🗑️ Eliminar Cliente
            </button>
          )}

          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Actualizando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
