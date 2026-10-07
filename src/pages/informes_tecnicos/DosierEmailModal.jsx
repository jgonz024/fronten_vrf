import React, { useState } from 'react';
import { enviarDosierEmail } from '../../api/dosierInformeTecnico.api';

export default function DosierEmailModal({ dosier, onClose, onSent }) {
  const [destinatario, setDestinatario] = useState(dosier?.cliente_email || '');
  const [asunto, setAsunto] = useState(`Informe Técnico Consolidado - ${dosier?.folio} - ${dosier?.cliente_nombre || ''}`);
  const [mensaje, setMensaje] = useState(
    `Estimado cliente,\n\nLe hacemos entrega del informe técnico consolidado (${dosier?.folio}) correspondiente a las órdenes de trabajo realizadas en sus instalaciones.\n\nQuedamos atentos a cualquier consulta.\n\nAtentamente,\nEquipo VRF Systems`
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destinatario.trim()) {
      setError('Por favor ingrese un correo destinatario válido');
      return;
    }

    setEnviando(true);
    setError('');
    try {
      await enviarDosierEmail(dosier.id, {
        destinatario_email: destinatario.trim(),
        asunto: asunto.trim(),
        mensaje: mensaje.trim()
      });
      setExito(true);
      setTimeout(() => {
        if (onSent) onSent();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al enviar el correo electrónico');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(5, 12, 28, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1527',
          border: '1px solid rgba(0, 198, 255, 0.35)',
          borderRadius: '12px',
          width: '560px',
          maxWidth: '92vw',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,198,255,0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#131d31',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              ✉️ Enviar por Correo Electrónico
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
              {dosier?.folio} — {dosier?.titulo}
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px', color: '#fca5a5', fontSize: '12px' }}>
              ⚠️ {error}
            </div>
          )}

          {exito && (
            <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '6px', color: '#86efac', fontSize: '12px', fontWeight: 700 }}>
              ✅ ¡Correo enviado exitosamente al destinatario!
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Destinatario (Email del Cliente) *</label>
            <input
              type="email"
              className="form-input"
              value={destinatario}
              onChange={e => setDestinatario(e.target.value)}
              placeholder="cliente@empresa.cl"
              required
            />
            {dosier?.cliente_email && destinatario !== dosier.cliente_email && (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Email registrado del cliente: <strong>{dosier.cliente_email}</strong>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Asunto *</label>
            <input
              type="text"
              className="form-input"
              value={asunto}
              onChange={e => setAsunto(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Mensaje personalizado</label>
            <textarea
              className="form-input"
              rows={5}
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              style={{ resize: 'vertical', lineHeight: '1.4' }}
            />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '10px',
            marginTop: '8px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '12px' }}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: '12px' }}
              disabled={enviando || exito}
            >
              {enviando ? '📤 Enviando correo...' : '✉️ Enviar Informe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
