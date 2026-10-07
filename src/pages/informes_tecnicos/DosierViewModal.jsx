import React, { useState, useEffect } from 'react';
import { fetchDosierById } from '../../api/dosierInformeTecnico.api';
import { fetchEmpresa } from '../../api/empresa.api';
import { exportDosierPdf } from '../../utils/exportDosierPdf';
import DosierEmailModal from './DosierEmailModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const formatFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function DosierViewModal({ dosierId, onClose, onUpdated }) {
  const [dosier, setDosier] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [dData, empData] = await Promise.all([
          fetchDosierById(dosierId),
          fetchEmpresa().catch(() => null)
        ]);
        setDosier(dData);
        setEmpresa(empData);
      } catch (err) {
        setError(err.message || 'Error al cargar informe técnico');
      } finally {
        setLoading(false);
      }
    }
    if (dosierId) {
      loadData();
    }
  }, [dosierId]);

  const handlePrintPdf = () => {
    if (dosier) {
      exportDosierPdf({ dosier, empresaData: empresa });
    }
  };

  const ots = dosier?.ordenes_trabajo || [];

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
          width: '980px',
          maxWidth: '95vw',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>📑</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-active" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                  {dosier?.folio || 'INFORME'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                  {dosier?.titulo || 'Cargando...'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Cliente: <strong style={{ color: 'var(--accent-cyan)' }}>{dosier?.cliente_nombre || 'N/A'}</strong> · {ots.length} Órdenes de Trabajo consolidadas
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handlePrintPdf}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Abrir e imprimir PDF en el PC"
            >
              📄 Abrir / PDF
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--accent-cyan)' }}
              title="Enviar dosier por correo electrónico"
            >
              ✉️ Enviar Email
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#ef4444', border: 'none', color: '#fff',
                borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
              }}
              title="Cerrar vista"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
              ⏳ Cargando informe técnico consolidado...
            </div>
          ) : error ? (
            <div style={{ padding: '16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          ) : dosier && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Tarjeta de Datos del Cliente y Emisión */}
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Cliente Receptor</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '3px' }}>{dosier.cliente_nombre}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RUT: {dosier.cliente_rut || 'Sin RUT'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Contacto / Ubicación</div>
                  <div style={{ fontSize: '12px', color: '#fff', marginTop: '3px' }}>📍 {dosier.cliente_direccion || 'Sin dirección'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>✉️ {dosier.cliente_email || 'Sin correo'} · 📞 {dosier.cliente_telefono || 'Sin teléfono'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Emisión y Estado</div>
                  <div style={{ fontSize: '12px', color: '#fff', marginTop: '3px' }}>📅 Fecha: {dosier.fecha_emision}</div>
                  <div style={{ fontSize: '11px', color: dosier.email_enviado ? '#34d399' : 'var(--text-muted)', marginTop: '2px' }}>
                    {dosier.email_enviado ? `✉️ Enviado a ${dosier.destinatario_email}` : '⏳ Pendiente de envío por correo'}
                  </div>
                </div>
              </div>

              {/* Observaciones / Resumen del dosier */}
              {dosier.observaciones && (
                <div style={{
                  background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: '10px', padding: '14px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    📝 Conclusiones y Resumen del Dosier
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {dosier.observaciones}
                  </div>
                </div>
              )}

              {/* Tabla de Órdenes de Trabajo incluidas */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔧 Órdenes de Trabajo Incluidas</span>
                    <span className="badge badge-active" style={{ fontSize: '10px' }}>{ots.length} OTs</span>
                  </div>
                </div>

                {ots.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    No se encontraron órdenes de trabajo asociadas a este informe técnico.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {ots.map((ot, idx) => (
                      <div
                        key={ot.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '10px', padding: '16px', overflow: 'hidden'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                                #{idx + 1} · OT #{ot.id}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                                {ot.titulo_ot}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Folio: <strong>{ot.folio || 'N/A'}</strong> · Técnico: {ot.tecnico_encargado_nombre || 'No asignado'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span className="badge" style={{ fontSize: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                              {ot.tipo_ot_nombre || 'Servicio'}
                            </span>
                            <span className="badge badge-active" style={{ fontSize: '10px' }}>
                              {ot.estado_ot_nombre || 'Finalizada'}
                            </span>
                          </div>
                        </div>

                        {/* Activos de la OT */}
                        {ot.activos && ot.activos.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
                              Equipos / Activos ({ot.activos.length})
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                              {ot.activos.map(act => (
                                <div key={act.id_activo} style={{ background: 'rgba(10, 18, 41, 0.4)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px' }}>
                                  <div style={{ fontWeight: 700, color: '#fff' }}>🏷️ {act.id_identificador || 'Activo'}</div>
                                  <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{act.marca_activo_nombre || ''} {act.modelo_ui || ''}</div>
                                  {act.ubicacion_activo && <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>📍 {act.ubicacion_activo}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Informes y fotos de la OT */}
                        {ot.informes && ot.informes.length > 0 && (
                          <div>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
                              Detalle Técnico y Hallazgos
                            </div>
                            {ot.informes.map(inf => (
                              <div key={inf.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)', marginBottom: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                                  {inf.titulo}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                  {inf.resumen || 'Sin resumen'}
                                </div>

                                {/* Fotos */}
                                {inf.imagenes && inf.imagenes.length > 0 && (
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginTop: '8px' }}>
                                    {inf.imagenes.map(img => (
                                      <div
                                        key={img.id}
                                        onClick={() => setLightboxImg(formatFileUrl(img.url_imagen))}
                                        style={{
                                          height: '65px', borderRadius: '6px', overflow: 'hidden',
                                          border: '1px solid rgba(255,255,255,0.1)', cursor: 'zoom-in'
                                        }}
                                      >
                                        <img
                                          src={formatFileUrl(img.url_imagen)}
                                          alt="Foto"
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 22px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#111c30',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {empresa?.razon_social || 'VRF Systems'} · {empresa?.telefono_contacto || ''}
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 16px' }}
          >
            ✕ Cerrar Ventana
          </button>
        </div>
      </div>

      {/* Modal de envío de email */}
      {showEmailModal && (
        <DosierEmailModal
          dosier={dosier}
          onClose={() => setShowEmailModal(false)}
          onSent={() => {
            if (onUpdated) onUpdated();
            setDosier(prev => ({ ...prev, email_enviado: true, destinatario_email: dosier.cliente_email }));
          }}
        />
      )}

      {/* Lightbox para fotos */}
      {lightboxImg && (
        <div
          onClick={e => { e.stopPropagation(); setLightboxImg(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999999,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '30px'
          }}
        >
          <button
            onClick={e => { e.stopPropagation(); setLightboxImg(null); }}
            style={{
              position: 'fixed', top: '20px', right: '24px', zIndex: 1000000,
              background: '#ef4444', border: 'none', color: '#fff', borderRadius: '50%',
              width: '38px', height: '38px', fontSize: '16px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            ✕
          </button>
          <img
            src={lightboxImg}
            alt="Foto ampliada"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain',
              borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
            }}
          />
        </div>
      )}
    </div>
  );
}
