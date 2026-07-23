import React, { useState, useEffect } from 'react';
import { fetchDirecciones } from '../../api/direcciones.api';

export default function ActivoEdit({
  activo,
  isAdmin,
  onSave,
  onDelete,
  onRestore,
  onCancel,
  clients,
  categories,
  types,
  brands
}) {
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
  const [successInfo, setSuccessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data
  useEffect(() => {
    if (activo) {
      setFormData({
        id_cliente: activo.id_cliente || '',
        id_direccion: activo.id_direccion || '',
        codigo_qr: activo.codigo_qr || '',
        id_identificador: activo.id_identificador || '',
        id_categoria_activo: activo.id_categoria_activo || '',
        id_tipo_activo: activo.id_tipo_activo || '',
        id_marca_activo: activo.id_marca_activo || '',
        modelo_ui: activo.modelo_ui || '',
        modelo_ue: activo.modelo_ue || '',
        serie_ui: activo.serie_ui || '',
        serie_ue: activo.serie_ue || '',
        capacidad_activo: activo.capacidad_activo || '',
        refrigerante_activo: activo.refrigerante_activo || '',
        fotografia_activo: activo.fotografia_activo || '',
        fotografia_activo2: activo.fotografia_activo2 || '',
        piso: activo.piso || '',
        ubicacion_activo: activo.ubicacion_activo || '',
        fecha_instalacion: activo.fecha_instalacion ? activo.fecha_instalacion.substring(0, 10) : '',
        mantencion_recurrente: activo.mantencion_recurrente || 'No',
        meses_mantenimiento: activo.meses_mantenimiento || '',
        estado_activo: activo.estado_activo || 'Operativo',
        detalles_activo: activo.detalles_activo || '',
        ultimo_informe_realizado: activo.ultimo_informe_realizado || '',
        proxima_mantencion: activo.proxima_mantencion || ''
      });
      setError('');
      setSuccessInfo('');
    }
  }, [activo]);

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
    setSuccessInfo('');
    setIsSubmitting(true);
    try {
      await onSave(activo.id, {
        ...formData,
        id_cliente: Number(formData.id_cliente),
        id_direccion: formData.id_direccion ? Number(formData.id_direccion) : null,
        id_categoria_activo: formData.id_categoria_activo ? Number(formData.id_categoria_activo) : null,
        id_tipo_activo: formData.id_tipo_activo ? Number(formData.id_tipo_activo) : null,
        id_marca_activo: formData.id_marca_activo ? Number(formData.id_marca_activo) : null,
      });
      setSuccessInfo('✓ Cambios guardados correctamente');
    } catch (err) {
      setError(err.message || 'Error al guardar cambios');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeleted = activo?.eliminado;

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
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        gap: '12px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
            GESTIÓN DE EQUIPAMIENTO
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={activo?.id_identificador}>
            ✏️ {activo?.id_identificador || 'Detalle de Activo'}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDeleted ? (
            isAdmin && (
              <button
                type="button"
                onClick={() => onRestore(activo.id)}
                className="btn btn-primary"
                style={{ padding: '6px 10px', fontSize: '12px' }}
              >
                🔄 Restaurar
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => onDelete(activo.id)}
              className="btn btn-danger"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Dar de baja activo"
            >
              🗑️
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '12px' }}
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

      {/* Photo Preview Section (if image URLs exist) */}
      {(formData.fotografia_activo || formData.fotografia_activo2) && (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {formData.fotografia_activo && (
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <img src={formData.fotografia_activo} alt="UI" style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} onError={(e) => {e.target.style.display='none';}} />
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>Foto Principal</div>
            </div>
          )}
          {formData.fotografia_activo2 && (
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <img src={formData.fotografia_activo2} alt="UE" style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} onError={(e) => {e.target.style.display='none';}} />
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>Foto Secundaria</div>
            </div>
          )}
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
                value={formData.meses_mantenimiento}
                className="form-input"
                onChange={e => setFormData({ ...formData, meses_mantenimiento: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Próxima Mantención</label>
              <input
                type="text"
                className="form-input"
                value={formData.proxima_mantencion}
                onChange={e => setFormData({ ...formData, proxima_mantencion: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Último Informe Realizado</label>
              <input
                type="text"
                className="form-input"
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
                value={formData.fotografia_activo}
                onChange={e => setFormData({ ...formData, fotografia_activo: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>URL Fotografía Activo 2</label>
              <input
                type="url"
                className="form-input"
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
            {isSubmitting ? 'Guardando...' : '✏️ Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
