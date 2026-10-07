import React, { useState, useEffect, useMemo } from 'react';
import { fetchClientes } from '../../api/clientes.api';
import { fetchTiposCliente } from '../../api/tipoCliente.api';
import { fetchOtsDisponibles, createDosier } from '../../api/dosierInformeTecnico.api';

export default function DosierAddModal({ userSession, onClose, onCreated }) {
  // Estado para la lista de clientes y filtros
  const [clientes, setClientes] = useState([]);
  const [tiposCliente, setTiposCliente] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  // Filtros de cliente
  const [searchClienteText, setSearchClienteText] = useState('');
  const [selectedTipoClienteId, setSelectedTipoClienteId] = useState('');

  // Cliente seleccionado
  const [selectedCliente, setSelectedCliente] = useState(null);

  // OTs disponibles para el cliente seleccionado
  const [otsDisponibles, setOtsDisponibles] = useState([]);
  const [loadingOts, setLoadingOts] = useState(false);
  const [selectedOtIds, setSelectedOtIds] = useState([]);

  // Formulario del dosier
  const [formData, setFormData] = useState({
    titulo: 'Informe Técnico Consolidado de Mantenimiento',
    fecha_emision: new Date().toISOString().slice(0, 10),
    observaciones: '',
    destinatario_email: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Cargar clientes y tipos al inicio
  useEffect(() => {
    async function initData() {
      setLoadingClientes(true);
      try {
        const [cData, tcData] = await Promise.all([
          fetchClientes(false),
          fetchTiposCliente(false).catch(() => [])
        ]);
        setClientes(cData || []);
        setTiposCliente(tcData || []);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
      } finally {
        setLoadingClientes(false);
      }
    }
    initData();
  }, []);

  // Clientes filtrados con los filtros avanzados
  const filteredClientes = useMemo(() => {
    const q = searchClienteText.trim().toLowerCase();
    return clientes.filter(c => {
      const matchText = !q ||
        (c.cliente && c.cliente.toLowerCase().includes(q)) ||
        (c.rut && c.rut.toLowerCase().includes(q)) ||
        (c.contacto && c.contacto.toLowerCase().includes(q));

      const matchTipo = !selectedTipoClienteId ||
        String(c.id_tipo_cliente) === String(selectedTipoClienteId);

      return matchText && matchTipo;
    });
  }, [clientes, searchClienteText, selectedTipoClienteId]);

  // Manejar selección de cliente
  const handleSelectCliente = async (cliente) => {
    setSelectedCliente(cliente);
    setSelectedOtIds([]);
    setFormData(prev => ({
      ...prev,
      titulo: `Informe Técnico Consolidado - ${cliente.cliente}`,
      destinatario_email: cliente.email || ''
    }));

    setLoadingOts(true);
    setError('');
    try {
      const ots = await fetchOtsDisponibles(cliente.id);
      setOtsDisponibles(ots);
      // Por defecto seleccionar todas las OTs disponibles
      setSelectedOtIds(ots.map(o => o.id));
    } catch (err) {
      setError(err.message || 'Error al obtener órdenes de trabajo disponibles');
    } finally {
      setLoadingOts(false);
    }
  };

  // Toggle de selección de OT individual
  const handleToggleOt = (otId) => {
    setSelectedOtIds(prev =>
      prev.includes(otId) ? prev.filter(id => id !== otId) : [...prev, otId]
    );
  };

  // Toggle de todas las OTs
  const handleToggleAllOts = () => {
    if (selectedOtIds.length === otsDisponibles.length) {
      setSelectedOtIds([]);
    } else {
      setSelectedOtIds(otsDisponibles.map(o => o.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCliente) {
      setError('Por favor seleccione un cliente para generar el informe técnico');
      return;
    }
    if (selectedOtIds.length === 0) {
      setError('Debe seleccionar al menos una orden de trabajo para incluir en el informe');
      return;
    }
    if (!formData.titulo.trim()) {
      setError('El título del informe técnico es obligatorio');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const userId = userSession?.usuario?.id || 1;
      const payload = {
        titulo: formData.titulo.trim(),
        id_cliente: selectedCliente.id,
        fecha_emision: formData.fecha_emision,
        id_usuario: userId,
        observaciones: formData.observaciones.trim() || null,
        destinatario_email: formData.destinatario_email.trim() || null,
        ordenes_ids: selectedOtIds
      };

      const nuevoDosier = await createDosier(payload);
      if (onCreated) onCreated(nuevoDosier);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al crear informe técnico');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(5, 12, 28, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 99990,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1527',
          border: '1px solid rgba(0, 198, 255, 0.35)',
          borderRadius: '14px',
          width: '1000px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,198,255,0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 22px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#111c30',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
              NUEVO INFORME TÉCNICO CONSOLIDADO
            </div>
            <h3 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>
              📋 Generar Dosier de Órdenes de Trabajo por Cliente
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#fca5a5', marginBottom: '16px', fontSize: '12px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* SECCIÓN 1: SELECCIONAR CLIENTE CON FILTROS POTENTES */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  1. Seleccionar Cliente *
                </div>
                {selectedCliente && (
                  <button
                    type="button"
                    onClick={() => { setSelectedCliente(null); setOtsDisponibles([]); setSelectedOtIds([]); }}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    🔄 Cambiar Cliente
                  </button>
                )}
              </div>

              {!selectedCliente ? (
                <div>
                  {/* Barra de Filtros de Cliente */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="🔍 Buscar por nombre, razón social o RUT..."
                        value={searchClienteText}
                        onChange={e => setSearchClienteText(e.target.value)}
                        style={{ fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <select
                        className="form-input"
                        value={selectedTipoClienteId}
                        onChange={e => setSelectedTipoClienteId(e.target.value)}
                        style={{ fontSize: '12px' }}
                      >
                        <option value="" style={{ background: '#0b1329' }}>Todos los Tipos de Cliente</option>
                        {tiposCliente.map(t => (
                          <option key={t.id} value={t.id} style={{ background: '#0b1329' }}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Lista desplegable / selectora de clientes filtrados */}
                  {loadingClientes ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      Cargando catálogo de clientes...
                    </div>
                  ) : filteredClientes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No se encontraron clientes con los filtros aplicados.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                      {filteredClientes.slice(0, 30).map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCliente(c)}
                          style={{
                            padding: '8px 12px', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            cursor: 'pointer', transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                            e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '12px' }}>{c.cliente}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                              {c.rut ? `RUT: ${c.rut}` : ''}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {c.tipo_cliente_nombre && (
                              <span className="badge" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)' }}>
                                {c.tipo_cliente_nombre}
                              </span>
                            )}
                            <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                              Seleccionar ➔
                            </span>
                          </div>
                        </div>
                      ))}
                      {filteredClientes.length > 30 && (
                        <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', padding: '4px' }}>
                          Mostrando 30 de {filteredClientes.length} clientes. Refina la búsqueda para filtrar más.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Cliente ya seleccionado */
                <div style={{
                  padding: '12px 14px', borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--accent-cyan)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>
                      🏢 {selectedCliente.cliente}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      RUT: <strong>{selectedCliente.rut || 'N/A'}</strong> · Tipo: <strong>{selectedCliente.tipo_cliente_nombre || 'General'}</strong> · Email: {selectedCliente.email || 'Sin correo registrado'}
                    </div>
                  </div>
                  <span className="badge badge-active" style={{ fontSize: '11px' }}>
                    ✓ Cliente Seleccionado
                  </span>
                </div>
              )}
            </div>

            {/* SECCIÓN 2: TABLA DE ÓRDENES DE TRABAJO DISPONIBLES */}
            {selectedCliente && (
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                      2. Órdenes de Trabajo del Cliente para el Informe *
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Solo se muestran las órdenes que <strong>aún no han sido incluidas en ningún otro informe técnico</strong>.
                    </div>
                  </div>

                  {otsDisponibles.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-active" style={{ fontSize: '11px' }}>
                        {selectedOtIds.length} de {otsDisponibles.length} seleccionadas
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleAllOts}
                        className="btn btn-secondary"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        {selectedOtIds.length === otsDisponibles.length ? 'Desmarcar Todas' : 'Seleccionar Todas'}
                      </button>
                    </div>
                  )}
                </div>

                {loadingOts ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    ⏳ Consultando órdenes de trabajo disponibles...
                  </div>
                ) : otsDisponibles.length === 0 ? (
                  <div style={{
                    padding: '24px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)',
                    borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', fontSize: '12px'
                  }}>
                    ℹ️ Este cliente <strong>no registra órdenes de trabajo disponibles</strong> (todas las órdenes ya fueron asignadas a otros informes técnicos anteriores o no tiene órdenes registradas).
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ background: '#111c30', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-cyan)', textAlign: 'left' }}>
                          <th style={{ padding: '8px 10px', width: '40px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedOtIds.length === otsDisponibles.length && otsDisponibles.length > 0}
                              onChange={handleToggleAllOts}
                              style={{ accentColor: 'var(--accent-cyan)' }}
                            />
                          </th>
                          <th style={{ padding: '8px 10px' }}>N° OT</th>
                          <th style={{ padding: '8px 10px' }}>FOLIO</th>
                          <th style={{ padding: '8px 10px' }}>TÍTULO / TRABAJO</th>
                          <th style={{ padding: '8px 10px' }}>TIPO</th>
                          <th style={{ padding: '8px 10px' }}>FECHA</th>
                          <th style={{ padding: '8px 10px' }}>ESTADO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {otsDisponibles.map(ot => {
                          const isChecked = selectedOtIds.includes(ot.id);
                          return (
                            <tr
                              key={ot.id}
                              onClick={() => handleToggleOt(ot.id)}
                              style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: isChecked ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                                cursor: 'pointer'
                              }}
                            >
                              <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleOt(ot.id)}
                                  onClick={e => e.stopPropagation()}
                                  style={{ accentColor: 'var(--accent-cyan)' }}
                                />
                              </td>
                              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#fff' }}>
                                #{ot.id}
                              </td>
                              <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                                {ot.folio || 'S/F'}
                              </td>
                              <td style={{ padding: '8px 10px', color: '#fff', fontWeight: 600 }}>
                                {ot.titulo_ot}
                              </td>
                              <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                                {ot.tipo_ot_nombre || 'N/A'}
                              </td>
                              <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>
                                {ot.fecha_programacion ? new Date(ot.fecha_programacion).toLocaleDateString() : 'N/A'}
                              </td>
                              <td style={{ padding: '8px 10px' }}>
                                <span className="badge badge-active" style={{ fontSize: '10px' }}>
                                  {ot.estado_ot_nombre || 'Realizada'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN 3: DATOS DEL INFORME CONSOLIDADO */}
            {selectedCliente && (
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                  3. Datos del Dosier / Informe Técnico
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Título del Informe Técnico *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.titulo}
                      onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ej. Informe Técnico de Mantenimiento - Octubre 2026"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Fecha de Emisión *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.fecha_emision}
                      onChange={e => setFormData({ ...formData, fecha_emision: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Correo Electrónico Destinatario (Para envío posterior)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.destinatario_email}
                    onChange={e => setFormData({ ...formData, destinatario_email: e.target.value })}
                    placeholder="correo@cliente.cl"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Conclusiones / Observaciones Generales del Dosier</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={formData.observaciones}
                    onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Resumen ejecutivo de los trabajos realizados, recomendaciones técnicas preventivas, estado de los activos intervenidos..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
              paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 16px' }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: '12px', padding: '8px 22px' }}
                disabled={saving || !selectedCliente || selectedOtIds.length === 0}
              >
                {saving ? '💾 Generando Informe...' : '📑 Guardar y Generar Dosier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
