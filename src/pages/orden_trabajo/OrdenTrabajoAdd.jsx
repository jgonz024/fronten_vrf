import React, { useState } from 'react';
import ClienteSearchPicker from '../admin_ot/ClienteSearchPicker';
import TecnicoSearchPicker from '../admin_ot/TecnicoSearchPicker';
import ActivoSearchPicker from '../admin_ot/ActivoSearchPicker';

export default function OrdenTrabajoAdd({ usuarios, clientes, tiposOt, estadosOt, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    titulo_ot: '',
    ido: '',
    folio: '',
    id_usuario: '',
    id_tipo_ot: '',
    id_cliente: '',
    id_activo: '',
    fecha_crecion_ot: '',
    mesa_desarrollo_ot: '',
    fecha_programacion: '',
    tiempo_estimado: 0,
    id_estado_ot: '',
    tiempo_en_llegar: 0,
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion_ingreso: '',
    ubicacion_egreso: '',
    horas_parciales: 0,
    nombre_encargado: '',
    firma_encargado: '',
    nombre_encargado_direccion: '',
    telefono_encargado: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo_ot.trim()) {
      setError('El título de la orden de trabajo es obligatorio');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      // Clean up empty fields to null for Postgres FK compatibility
      const cleanData = {};
      Object.keys(formData).forEach(key => {
        const val = formData[key];
        if (val === '' || val === undefined) {
          cleanData[key] = null;
        } else {
          cleanData[key] = val;
        }
      });

      await onSave(cleanData);
    } catch (err) {
      setError(err.message || 'Error al guardar orden de trabajo');
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
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        gap: '12px'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
            CREAR NUEVA ORDEN DE TRABAJO
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📝 Agregar Orden de Trabajo
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>Título del Trabajo *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej. Mantención de Aire Acondicionado..."
            value={formData.titulo_ot}
            onChange={e => setFormData({ ...formData, titulo_ot: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Folio</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. OT-1002"
              value={formData.folio}
              onChange={e => setFormData({ ...formData, folio: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>ID AppSheet (ido)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej. 34EE0253"
              value={formData.ido}
              onChange={e => setFormData({ ...formData, ido: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Cliente *</label>
            <ClienteSearchPicker
              value={formData.id_cliente}
              onChange={val => setFormData({ ...formData, id_cliente: val })}
              placeholder="🔍 Buscar cliente por nombre, RUT..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Técnico Asignado</label>
            <TecnicoSearchPicker
              value={formData.id_usuario}
              onChange={val => setFormData({ ...formData, id_usuario: val })}
              placeholder="🔍 Buscar técnico por nombre..."
            />
          </div>
        </div>

        {/* Activo / Equipo Asociado (con lector QR) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '11px' }}>
            📦 Activo / Equipo Asociado (Escanear QR)
          </label>
          <ActivoSearchPicker
            value={formData.id_activo}
            onChange={val => setFormData({ ...formData, id_activo: val })}
            placeholder="🔍 Buscar o escanear QR de activo..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Tipo de OT *</label>
            <select
              className="form-input"
              value={formData.id_tipo_ot}
              onChange={e => setFormData({ ...formData, id_tipo_ot: e.target.value })}
              required
            >
              <option value="">-- Seleccionar --</option>
              {tiposOt.map(t => (
                <option key={t.id} value={t.id}>{t.tipo}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Estado de OT *</label>
            <select
              className="form-input"
              value={formData.id_estado_ot}
              onChange={e => setFormData({ ...formData, id_estado_ot: e.target.value })}
              required
            >
              <option value="">-- Seleccionar --</option>
              {estadosOt.map(e => (
                <option key={e.id} value={e.id}>{e.estado}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Fecha Creación</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.fecha_crecion_ot}
              onChange={e => setFormData({ ...formData, fecha_crecion_ot: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Fecha Programación</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.fecha_programacion}
              onChange={e => setFormData({ ...formData, fecha_programacion: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Tiempo Estimado (Hrs)</label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={formData.tiempo_estimado}
              onChange={e => setFormData({ ...formData, tiempo_estimado: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Tiempo en Llegar (Mins)</label>
            <input
              type="number"
              className="form-input"
              value={formData.tiempo_en_llegar}
              onChange={e => setFormData({ ...formData, tiempo_en_llegar: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Fecha/Hora Inicio</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.fecha_inicio}
              onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Fecha/Hora Fin</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.fecha_fin}
              onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Ubicación Ingreso</label>
            <input
              type="text"
              className="form-input"
              placeholder="Coordenadas GPS o dirección..."
              value={formData.ubicacion_ingreso}
              onChange={e => setFormData({ ...formData, ubicacion_ingreso: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Ubicación Egreso</label>
            <input
              type="text"
              className="form-input"
              placeholder="Coordenadas GPS o dirección..."
              value={formData.ubicacion_egreso}
              onChange={e => setFormData({ ...formData, ubicacion_egreso: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Horas Parciales</label>
            <input
              type="number"
              step="any"
              className="form-input"
              value={formData.horas_parciales}
              onChange={e => setFormData({ ...formData, horas_parciales: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Mesa Desarrollo OT</label>
            <input
              type="text"
              className="form-input"
              placeholder="Comentarios de mesa..."
              value={formData.mesa_desarrollo_ot}
              onChange={e => setFormData({ ...formData, mesa_desarrollo_ot: e.target.value })}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '8px' }}>
            DATOS DEL ENCARGADO / FIRMA
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Nombre Encargado</label>
              <input
                type="text"
                className="form-input"
                value={formData.nombre_encargado}
                onChange={e => setFormData({ ...formData, nombre_encargado: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Teléfono Encargado</label>
              <input
                type="text"
                className="form-input"
                placeholder="+569..."
                value={formData.telefono_encargado}
                onChange={e => setFormData({ ...formData, telefono_encargado: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Dirección Encargado</label>
              <input
                type="text"
                className="form-input"
                value={formData.nombre_encargado_direccion}
                onChange={e => setFormData({ ...formData, nombre_encargado_direccion: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Firma (URL/Base64)</label>
              <input
                type="text"
                className="form-input"
                placeholder="URL de firma..."
                value={formData.firma_encargado}
                onChange={e => setFormData({ ...formData, firma_encargado: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ fontSize: '12px' }}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ fontSize: '12px' }}>
            {isSubmitting ? 'Guardando...' : '💾 Crear OT'}
          </button>
        </div>
      </form>
    </div>
  );
}
