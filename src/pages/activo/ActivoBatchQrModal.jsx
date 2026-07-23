import React from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ActivoBatchQrModal({ selectedActivos, onClose }) {
  if (!selectedActivos || selectedActivos.length === 0) return null;

  const handlePrintBatch = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (!printWindow) return;

    const cardsHtml = selectedActivos.map(activo => {
      const rawQr = activo.codigo_qr || `/uploads/qr/qr_activo_${activo.id}.gif`;
      const qrFullUrl = rawQr.startsWith('http') ? rawQr : `${BACKEND_URL}${rawQr}`;

      return `
        <div class="ticket">
          <div class="brand">VRF SYSTEMS®</div>
          <div class="sub-brand">ETIQUETA OFICIAL DE ACTIVO</div>
          <div class="id-box">ID ACTIVO: #${activo.id}</div>
          <div class="identificador">${activo.id_identificador || 'S/Identificador'}</div>
          <img src="${qrFullUrl}" class="qr-img" alt="QR Activo #${activo.id}" />
          <div class="details">
            <div><strong>Cliente:</strong> ${activo.cliente_nombre || 'N/A'}</div>
            <div><strong>Ubicación:</strong> ${activo.ubicacion_activo || 'N/A'}</div>
            <div><strong>Modelo UI:</strong> ${activo.modelo_ui || 'N/A'}</div>
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impresión Masiva de Etiquetas QR (${selectedActivos.length})</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: #ffffff;
              color: #000000;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
              gap: 16px;
              justify-content: center;
            }
            .ticket {
              padding: 16px;
              background: #ffffff;
              border: 2px solid #000000;
              border-radius: 10px;
              text-align: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.08);
              page-break-inside: avoid;
            }
            .brand {
              font-size: 15px;
              font-weight: 800;
              color: #050c1c;
              letter-spacing: 1px;
            }
            .sub-brand {
              font-size: 9px;
              color: #555;
              margin-bottom: 8px;
              text-transform: uppercase;
              font-weight: bold;
            }
            .id-box {
              font-size: 16px;
              font-weight: 800;
              color: #0088cc;
            }
            .identificador {
              font-weight: 700;
              font-size: 13px;
              margin-bottom: 4px;
            }
            .qr-img {
              width: 170px;
              height: 170px;
              object-fit: contain;
              margin: 8px 0;
              border: 1px solid #ccc;
              padding: 4px;
              border-radius: 6px;
            }
            .details {
              font-size: 10px;
              color: #222;
              line-height: 1.3;
              text-align: left;
              border-top: 1px dashed #ccc;
              padding-top: 6px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 20px;" class="no-print">
            <h2>🏷️ Impresión Masiva: ${selectedActivos.length} Etiquetas QR</h2>
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; font-weight: bold; cursor: pointer; background: #0088cc; color: white; border: none; border-radius: 6px;">
              🖨️ Confirmar e Imprimir
            </button>
          </div>
          <div class="grid">
            ${cardsHtml}
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
        background: 'rgba(5, 12, 28, 0.5)',
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
          maxWidth: '720px',
          maxHeight: '90vh',
          background: 'rgba(15, 25, 50, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 198, 255, 0.4)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.85)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '17px', color: '#ffffff', margin: 0, fontWeight: 700 }}>
            🖨️ Impresión Masiva de Etiquetas QR ({selectedActivos.length} Seleccionados)
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{
          overflowY: 'auto',
          maxHeight: '60vh',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '14px',
          padding: '10px',
          background: 'rgba(5, 12, 28, 0.5)',
          borderRadius: 'var(--radius-sm)'
        }}>
          {selectedActivos.map(activo => {
            const rawQr = activo.codigo_qr || `/uploads/qr/qr_activo_${activo.id}.gif`;
            const qrFullUrl = rawQr.startsWith('http') ? rawQr : `${BACKEND_URL}${rawQr}`;

            return (
              <div key={activo.id} style={{
                background: '#ffffff',
                borderRadius: '8px',
                padding: '12px',
                color: '#050c1c',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  ID: #{activo.id}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activo.id_identificador || 'Sin Identificador'}
                </div>
                <img
                  src={qrFullUrl}
                  alt={`QR #${activo.id}`}
                  style={{ width: '110px', height: '110px', objectFit: 'contain', margin: '6px 0', border: '1px solid #ddd', borderRadius: '4px', padding: '2px' }}
                />
                <div style={{ fontSize: '9px', color: '#555', textAlign: 'left', lineHeight: '1.2' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Cliente:</strong> {activo.cliente_nombre || 'N/A'}</div>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Ubicación:</strong> {activo.ubicacion_activo || 'N/A'}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            onClick={handlePrintBatch}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🖨️ Imprimir {selectedActivos.length} Etiquetas QR
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
