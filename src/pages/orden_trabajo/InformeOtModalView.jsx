import React, { useState, useEffect } from 'react';
import { fetchInformesOt } from '../../api/informeOt.api';
import { fetchImagenesInformeOt } from '../../api/imagenesInformeOt.api';

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
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInformes = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchInformesOt(orden.id);
        setInformes(data || []);
        if (data && data.length > 0) {
          setSelectedInforme(data[0]);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar informes técnicos');
      } finally {
        setLoading(false);
      }
    };
    if (orden && orden.id) {
      loadInformes();
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

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 12, 28, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-lg, 12px)',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              📄 INFORME TÉCNICO DE OT #{orden.id} — {orden.titulo_ot}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              Cliente: {orden.cliente_nombre || 'N/A'} {informes.length > 1 ? `(${informes.length} Informes disponibles)` : ''}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '11px' }}
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              Cargando informe(s)...
            </div>
          ) : error ? (
            <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', padding: '16px' }}>
              {error}
            </div>
          ) : informes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              Esta Orden de Trabajo no registra informes técnicos.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {/* Si hay más de 1 informe, mostrar lista selector en la izquierda */}
              {informes.length > 1 && (
                <div style={{
                  width: '220px',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingRight: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Seleccionar Informe ({informes.length})
                  </div>
                  {informes.map((inf, idx) => {
                    const isSelected = selectedInforme?.id === inf.id;
                    return (
                      <button
                        key={inf.id}
                        onClick={() => setSelectedInforme(inf)}
                        style={{
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm, 6px)',
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.06)',
                          background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          fontSize: '11px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>#{idx + 1}. {inf.titulo}</div>
                        <div style={{ fontSize: '9px', opacity: 0.7 }}>
                          {inf.tecnico_nombre ? `Redactó: ${inf.tecnico_nombre}` : 'Sin redactor'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Detalle del Informe Seleccionado */}
              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedInforme && (
                  <>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                        {selectedInforme.titulo}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                        👤 Redactado por: <strong>{selectedInforme.tecnico_nombre || 'No especificado'}</strong>
                      </div>
                      {selectedInforme.fecha_hora && (
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          📅 Fecha: {new Date(selectedInforme.fecha_hora).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '6px' }}>
                        Resumen / Conclusión Técnica
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                        {selectedInforme.resumen || 'Sin resumen o conclusiones ingresadas.'}
                      </div>
                    </div>

                    {/* Galería de Fotos del Informe */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                        📷 FOTOS DEL INFORME ({reportImages.length})
                      </div>
                      {loadingImages ? (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cargando imágenes...</div>
                      ) : reportImages.length === 0 ? (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', italic: 'true' }}>No se han adjuntado fotografías a este informe.</div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                          {reportImages.map(img => (
                            <a
                              key={img.id}
                              href={formatFileUrl(img.url_imagen)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-sm, 6px)',
                                overflow: 'hidden',
                                height: '90px',
                                display: 'block',
                                transition: 'transform 0.15s ease'
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
      </div>
    </div>
  );
}
