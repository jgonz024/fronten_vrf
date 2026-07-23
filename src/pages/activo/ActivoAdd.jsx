import React, { useState, useEffect } from 'react';
import { fetchDirecciones } from '../../api/direcciones.api';

export default function ActivoAdd({ onSave, onCancel, clients, categories, types, brands }) {
  const [formData, setFormData] = useState({
    id_cliente: '',
    id_direccion: '',
    codigo_qr: '',
    id_identificador: '',
    id_categoria_activo: '',
    id_tipo_activo: '',
    id_marca_activo: '',
    modelo_ui: '',
    modelo_ue: '',
    serie_ui: '',
    serie_ue: '',
    capacidad_activo: '',
    refrigerante_activo: '',
    fotografia_activo: '',
    fotografia_activo2: '',
    piso: '',
    ubicacion_activo: '',
    fecha_instalacion: '',
    mantencion_recurrente: 'No',
    meses_mantenimiento: '',
    estado_activo: 'Operativo',
    detalles_activo: '',
    ultimo_informe_realizado: '',
    proxima_mantencion: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch client addresses when client selection changes
  useEffect(() => {
    if (formData.id_cliente) {
      fetchDirecciones(formData.id_cliente)
        .then(res => setAddresses(res || []))
        .catch(err => {
          console.error(err);
          setAddresses([]);
        });
    } else {
      setAddresses([]);
    }
  }, [formData.id_cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_cliente) {
      setError('El cliente es obligatorio');
      return;
    }
    if (!formData.id_identificador) {
      setError('El identificador del activo es obligatorio');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        id_cliente: Number(formData.id_cliente),
        id_direccion: formData.id_direccion ? Number(formData.id_direccion) : null,
        id_categoria_activo: formData.id_categoria_activo ? Number(formData.id_categoria_activo) : null,
        id_tipo_activo: formData.id_tipo_activo ? Number(formData.id_tipo_activo) : null,
        id_marca_activo: formData.id_marca_activo ? Number(formData.id_marca_activo) : null,
      });
    } catch (err) {
      setError(err.message || 'Error al guardar el activo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '28px',
      border: '1px solid rgba(0, 198, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
            REGISTRO DE EQUIPAMIENTO
          </div>
          <h3 style={{ fontSize: '16px', color: '#ffffff', margin: 0 }}>
            ➕ Agregar Activo / Equipo
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          style={{ padding: '6px 10px', fontSize: '12px' }}
        >
          ✕
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SECTION 1: Asignación */}
        <div>
          <h4 style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            Asignación y Cliente
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Cliente *</label>
              <select
                className="form-input"
                value={formData.id_cliente}
                onChange={e => setFormData({ ...formData, id_cliente: e.target.value, id_direccion: '' })}
                required
              >
                <option value="">Seleccione Cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.cliente}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Dirección</label>
              <select
                className="form-input"
                value={formData.id_direccion}
                onChange={e => setFormData({ ...formData, id_direccion: e.target.value })}
                disabled={!formData.id_cliente}
              >
                <option value="">Seleccione Dirección...</option>
                {addresses.map(a => (
                  <option key={a.id} value={a.id}>{a.direccion}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: General Info */}
        <div>
          <h4 style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            Identificación del Activo
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Identificador del Activo *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. PISO 2 RESTAURANTE 1 UE"
                value={formData.id_identificador}
                onChange={e => setFormData({ ...formData, id_identificador: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Código QR</label>
              <input
                type="text"
                className="form-input"
                placeholder="Código QR o Barras"
                value={formData.codigo_qr}
                onChange={e => setFormData({ ...formData, codigo_qr: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Clasificación */}
        <div>
          <h4 style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            Clasificación y Marcas
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Categoría de Activo</label>
              <select
                className="form-input"
                value={formData.id_categoria_activo}
                onChange={e => setFormData({ ...formData, id_categoria_activo: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Tipo de Activo</label>
              <select
                className="form-input"
                value={formData.id_tipo_activo}
                onChange={e => setFormData({ ...formData, id_tipo_activo: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Marca</label>
              <select
                className="form-input"
                value={formData.id_marca_activo}
                onChange={e => setFormData({ ...formData, id_marca_activo: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: Modelos y Unidades */}
        <div>
          <h4 style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            Especificaciones Técnicas (UI / UE)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Modelo Unidad Interior (UI)</label>
              <input
                type="text"
                className="form-input"
                value={formData.modelo_ui}
                onChange={e => setFormData({ ...formData, modelo_ui: e.target.value })}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Modelo Unidad Exterior (UE)</label>
              <input
                type="text"
                className="form-input"
                value={formData.modelo_ue}
                onChange={e => setFormData({ ...formData, modelo_ue: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Serie Unidad Interior (UI)</label>
              <input
                type="text"
                className="form-input"
                value={formData.serie_ui}
                onChange={e => setFormData({ ...formData, serie_ui: e.target.value })}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Serie Unidad Exterior (UE)</label>
              <input
                type="text"
                className="form-input"
                value={formData.serie_ue}
                onChange={e => setFormData({ ...formData, serie_ue: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Capacidad Térmica / BTU</label>
              <input
                type="text"
                className="form-input"
                value={formData.capacidad_activo}
                onChange={e => setFormData({ ...formData, capacidad_activo: e.target.value })}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Refrigerante</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. R22, R410A..."
                value={formData.refrigerante_activo}
                onChange={e => setFormData({ ...formData, refrigerante_activo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Location and Status */}
        <div>
          <h4 style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            Ubicación y Estado de Operación
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Piso</label>
              <input
                type="text"
                className="form-input"
                value={formData.piso}
                onChange={e => setFormData({ ...formData, piso: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Ubicación Detallada</label>
              <input
                type="text"
                className="form-input"
                value={formData.ubicacion_activo}
                onChange={e => setFormData({ ...formData, ubicacion_activo: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Estado Actual *</label>
              <select
                className="form-input"
                value={formData.estado_activo}
                onChange={e => setFormData({ ...formData, estado_activo: e.target.value })}
                required
              >
                <option value="Operativo">Operativo</option>
                <option value="Medianamente Operativo">Medianamente Operativo</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 6: Maintenance and Dates */}
        <div>
          <h4 style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            Planificación y Mantenimiento
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Fecha de Instalación</label>
              <input
                type="date"
                className="form-input"
                value={formData.fecha_instalacion}
                onChange={e => setFormData({ ...formData, fecha_instalacion: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Mantención Recurrente</label>
              <select
                className="form-input"
                value={formData.mantencion_recurrente}
                onChange={e => setFormData({ ...formData, mantencion_recurrente: e.target.value })}
              >
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Meses de Mantención (ej. 4, 7, 10, 1)</label>
              <input
                type="text"
                className="form-input"
                placeholder="4 , 7 , 10 , 1"
                value={formData.meses_mantenimiento}
                onChange={e => setFormData({ ...formData, meses_mantenimiento: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Próxima Mantención</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Este Mes, Agosto 2026..."
                value={formData.proxima_mantencion}
                onChange={e => setFormData({ ...formData, proxima_mantencion: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Último Informe Realizado</label>
              <input
                type="text"
                className="form-input"
                placeholder="Fecha / ID de informe"
                value={formData.ultimo_informe_realizado}
                onChange={e => setFormData({ ...formData, ultimo_informe_realizado: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: Photos & Details */}
        <div>
          <h4 style={{ color: 'var(--accent-cyan)', fontSize: '12px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            Imágenes y Notas
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>URL Fotografía Activo 1</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={formData.fotografia_activo}
                onChange={e => setFormData({ ...formData, fotografia_activo: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>URL Fotografía Activo 2</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={formData.fotografia_activo2}
                onChange={e => setFormData({ ...formData, fotografia_activo2: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Detalles / Notas del Activo</label>
              <textarea
                className="form-input"
                rows="3"
                value={formData.detalles_activo}
                onChange={e => setFormData({ ...formData, detalles_activo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '10px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? 'Registrando...' : '💾 Registrar Activo'}
          </button>
        </div>
      </form>
    </div>
  );
}
