import React, { useState, useEffect } from 'react';
import { fetchInformesOt } from '../../api/informeOt.api';
import { fetchImagenesInformeOt } from '../../api/imagenesInformeOt.api';
import { fetchEmpresa } from '../../api/empresa.api';
import { exportInformeOtPdf } from '../../utils/exportInformePdf';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const formatFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function InformeOtModalView({ orden, onClose }) {
  const [loading, setLoading] = useState(true);
  const [informes, setInformes] = useState([]);
  const [selectedInforme, setSelectedInforme] = useState(null);
  const [reportImages, setReportImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [empresa, setEmpresa] = useState(null);
  const [error, setError] = useState('');

  // Cargar empresa y informes en paralelo
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [informesData, empresaData] = await Promise.all([
          fetchInformesOt(orden.id),
          fetchEmpresa().catch(() => null)
        ]);
        setInformes(informesData || []);
        setEmpresa(empresaData);
        if (informesData && informesData.length > 0) {
          setSelectedInforme(informesData[0]);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar informes técnicos');
      } finally {
        setLoading(false);
      }
    };
    if (orden && orden.id) {
      loadAll();
    }
  }, [orden]);

  useEffect(() => {
    const loadImages = async () => {
      if (!selectedInforme || !selectedInforme.id) {
        setReportImages([]);
        return;
      }
      setLoadingImages(true);
      try {
        const imgs = await fetchImagenesInformeOt(selectedInforme.id);
        setReportImages(imgs || []);
      } catch (err) {
        console.error('Error al cargar imágenes del informe:', err);
      } finally {
        setLoadingImages(false);
      }
    };
    loadImages();
  }, [selectedInforme]);

  // ── Logo de empresa para el header del modal ──
  const logoSrc = empresa?.logo_url
    ? formatFileUrl(empresa.logo_url)
    : null;

  const razonSocial = empresa?.razon_social || '';
  const emailEmpresa = empresa?.email || '';
  const telefonoEmpresa = empresa?.telefono_contacto || '';
  const direccionEmpresa = empresa?.direccion || '';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(5,12,28,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1527',
          border: '1px solid rgba(0,198,255,0.35)',
          borderRadius: '14px',
          width: '900px',
          maxWidth: '94vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0,198,255,0.15)',
          overflow: 'hidden'
        }}
      >
        {/* ── HEADER MODAL: Logo + Empresa + Cerrar ── */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#111c30',
          flexShrink: 0,
          gap: '16px'
        }}>
          {/* Izquierda: Logo + datos empresa + título OT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {/* Logo */}
            {logoSrc && (
              <img
                src={logoSrc}
                alt={razonSocial}
                style={{
                  height: '42px',
                  maxWidth: '120px',
                  objectFit: 'contain',
                  filter: 'brightness(1.05)',
                  flexShrink: 0
                }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            {/* Datos empresa + OT */}
            <div style={{ minWidth: 0 }}>
              {razonSocial && (
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: '2px' }}>
                  {razonSocial}
                </div>
              )}
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                📄 INFORME TÉCNICO — OT #{orden.id}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {orden.titulo_ot}
                {informes.length > 1 && (
                  <span style={{ marginLeft: '6px', color: 'var(--text-muted)' }}>
                    · {informes.length} informes registrados
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cerrar */}
          <button
            onClick={onClose}
            style={{
              background: '#ef4444', border: 'none', color: '#ffffff',
              borderRadius: '6px', padding: '6px 14px', fontSize: '12px',
              fontWeight: 700, cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '4px',
              boxShadow: '0 2px 8px rgba(239,68,68,0.4)'
            }}
            title="Cerrar ventana"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* ── CONTENIDO ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              Cargando informe(s)...
            </div>
          ) : error ? (
            <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
              {error}
            </div>
          ) : informes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              Esta Orden de Trabajo no registra informes técnicos.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* Selector lateral si hay múltiples informes */}
              {informes.length > 1 && (
                <div style={{
                  width: '210px', flexShrink: 0,
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  paddingRight: '14px',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Informes ({informes.length})
                  </div>
                  {informes.map((inf, idx) => {
                    const isSelected = selectedInforme?.id === inf.id;
                    return (
                      <button
                        key={inf.id}
                        onClick={() => setSelectedInforme(inf)}
                        style={{
                          textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.06)',
                          background: isSelected ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.03)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>#{idx + 1}. {inf.titulo}</div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>
                          {inf.tecnico_nombre ? `Redactó: ${inf.tecnico_nombre}` : 'Sin redactor'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Detalle del informe seleccionado */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedInforme && (
                  <>
                    <div style={{
                      background: 'rgba(255,255,255,0.03)', padding: '14px',
                      borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px'
                    }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                          {selectedInforme.titulo}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                          👤 Redactado por: <strong>{selectedInforme.tecnico_nombre || 'No especificado'}</strong>
                        </div>
                        {selectedInforme.fecha_hora && (
                          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                            📅 Fecha: {new Date(selectedInforme.fecha_hora).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => exportInformeOtPdf({ informe: selectedInforme, orden, reportImages, empresaData: empresa })}
                        className="btn btn-primary"
                        style={{ fontSize: '11px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        📄 Generar PDF
                      </button>
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.03)', padding: '14px',
                      borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '8px' }}>
                        Resumen / Conclusión Técnica
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {selectedInforme.resumen || 'Sin resumen o conclusiones ingresadas.'}
                      </div>
                    </div>

                    {/* Galería de fotos */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '10px' }}>
                        📷 FOTOS DEL INFORME ({reportImages.length})
                      </div>
                      {loadingImages ? (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cargando imágenes...</div>
                      ) : reportImages.length === 0 ? (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No se han adjuntado fotografías a este informe.</div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                          {reportImages.map(img => (
                            <a
                              key={img.id}
                              href={formatFileUrl(img.url_imagen)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '8px', overflow: 'hidden',
                                height: '95px', display: 'block', transition: 'transform 0.15s ease'
                              }}
                            >
                              <img
                                src={formatFileUrl(img.url_imagen)}
                                alt="Foto Informe"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER MODAL: Email + Teléfono de empresa ── */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: '#0b1428',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Datos de contacto empresa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {emailEmpresa && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: 'var(--accent-cyan)' }}>✉️</span>
                <span>{emailEmpresa}</span>
              </span>
            )}
            {telefonoEmpresa && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: 'var(--accent-cyan)' }}>📞</span>
                <span>{telefonoEmpresa}</span>
              </span>
            )}
            {direccionEmpresa && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>📍</span>
                <span>{direccionEmpresa}</span>
              </span>
            )}
            {!emailEmpresa && !telefonoEmpresa && !direccionEmpresa && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Sin datos de contacto registrados
              </span>
            )}
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
    </div>
  );
}
