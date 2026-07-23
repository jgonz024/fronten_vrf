import React from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ActivoQrModal({ activo, onClose }) {
  if (!activo) return null;

  const rawQr = activo.codigo_qr || `/uploads/qr/qr_activo_${activo.id}.gif`;
  const qrFullUrl = rawQr.startsWith('http') ? rawQr : `${BACKEND_URL}${rawQr}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta QR Activo #${activo.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f4f6f8;
            }
            .ticket {
              width: 320px;
              padding: 24px;
              background: #ffffff;
              border: 2px solid #000;
              border-radius: 12px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .brand {
              font-size: 16px;
              font-weight: 800;
              color: #050c1c;
              letter-spacing: 1px;
            }
            .sub-brand {
              font-size: 10px;
              color: #666;
              margin-bottom: 12px;
              text-transform: uppercase;
            }
            .qr-img {
              width: 220px;
              height: 220px;
              object-fit: contain;
              margin: 12px 0;
              border: 1px solid #ddd;
              padding: 6px;
              border-radius: 8px;
            }
            .id-box {
              font-size: 18px;
              font-weight: 800;
              color: #0088cc;
              margin-bottom: 4px;
            }
            .details {
              font-size: 11px;
              color: #333;
              line-height: 1.4;
            }
            @media print {
              body { background: transparent; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="brand">VRF SYSTEMS®</div>
            <div class="sub-brand">ETIQUETA OFICIAL DE ACTIVO / EQUIPO</div>
            <div class="id-box">ID ACTIVO: #${activo.id}</div>
            <div style="font-weight: bold; font-size: 14px;">${activo.id_identificador || 'S/I'}</div>
            <img src="${qrFullUrl}" class="qr-img" alt="Código QR GIF" />
            <div class="details">
              <div><strong>Cliente:</strong> ${activo.cliente_nombre || 'N/A'}</div>
              <div><strong>Ubicación:</strong> ${activo.ubicacion_activo || 'N/A'}</div>
              <div><strong>Modelo:</strong> ${activo.modelo_ui || activo.modelo_ue || 'N/A'}</div>
              <div style="margin-top: 6px; font-size: 9px; color: #888;">Archivo: ${rawQr}</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(5, 12, 28, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(15, 25, 50, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 198, 255, 0.4)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(0, 198, 255, 0.15)',
          padding: '28px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', color: '#ffffff', margin: 0, fontWeight: 700 }}>
            🏷️ Código QR de Activo #{activo.id}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Sticker Preview Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          color: '#050c1c',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.05em' }}>
            VRF SYSTEMS®
          </div>
          <div style={{ fontSize: '9px', color: '#666', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            Etiqueta QR de Activo
          </div>
          
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-blue)' }}>
            ID: #{activo.id}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>
            {activo.id_identificador || 'Sin Identificador'}
          </div>

          <div style={{ margin: '12px 0' }}>
            <img
              src={qrFullUrl}
              alt={`QR Activo ${activo.id}`}
              style={{
                width: '180px',
                height: '180px',
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '4px'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${BACKEND_URL}/uploads/qr/qr_activo_${activo.id}.gif`;
              }}
            />
          </div>

          <div style={{ fontSize: '11px', color: '#444', textAlign: 'left', lineHeight: '1.4' }}>
            <div><strong>Cliente:</strong> {activo.cliente_nombre || 'N/A'}</div>
            <div><strong>Ubicación:</strong> {activo.ubicacion_activo || 'N/A'}</div>
            <div><strong>Modelo UI:</strong> {activo.modelo_ui || 'N/A'}</div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          📁 Archivo GIF guardado en: <code style={{ color: 'var(--accent-cyan)' }}>{rawQr}</code>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ flex: 1, padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            🖨️ Imprimir Etiqueta QR
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
