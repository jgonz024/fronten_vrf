import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrScannerModal({ onClose, onScanSuccess }) {
  const [mode, setMode] = useState('file'); // 'file' | 'camera'
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error al detener cámara QR:', err);
      }
    }
    setIsCameraActive(false);
  };

  const parseQrResult = (decodedText) => {
    let activoId = null;
    try {
      const obj = JSON.parse(decodedText);
      if (obj.id_activo) activoId = Number(obj.id_activo);
      else if (obj.id) activoId = Number(obj.id);
    } catch {
      const match = decodedText.match(/\d+/);
      if (match) activoId = Number(match[0]);
    }

    if (activoId) {
      stopCamera();
      onScanSuccess(activoId, decodedText);
      onClose();
    } else {
      setError(`No se pudo leer un ID de activo válido en el QR: "${decodedText}"`);
    }
  };

  const startCamera = async () => {
    setError('');
    setStatusText('Iniciando cámara...');
    try {
      const html5QrCode = new Html5Qrcode('qr-camera-view');
      html5QrCodeRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          parseQrResult(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
      setStatusText('Apunte la cámara al código QR del activo...');
    } catch (err) {
      console.error('Error iniciando cámara:', err);
      setError('No se pudo acceder a la cámara del dispositivo. Puede subir el archivo GIF/PNG del QR directamente.');
      setIsCameraActive(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setStatusText('Procesando imagen del QR...');
    try {
      const html5QrCode = new Html5Qrcode('qr-file-view');
      const decodedText = await html5QrCode.scanFile(file, true);
      parseQrResult(decodedText);
    } catch (err) {
      console.error('Error escaneando archivo QR:', err);
      setError('No se detectó un código QR válido en la imagen. Por favor suba una foto o archivo GIF del QR claro.');
    } finally {
      setStatusText('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 12, 28, 0.92)',
      backdropFilter: 'blur(12px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'rgba(15, 25, 50, 0.96)',
        border: '1px solid rgba(0, 198, 255, 0.4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: '#ffffff', margin: 0, fontWeight: 700 }}>
              📷 Escanear QR de Activo
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Lectura automática del ID de activo para asignación en Orden de Trabajo
            </p>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons: Archivo / Cámara */}
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => { stopCamera(); setMode('file'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'file' ? 'var(--accent-cyan)' : 'transparent',
              color: mode === 'file' ? '#050c1c' : '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            📁 Cargar Archivo GIF / Imagen
          </button>
          <button
            onClick={() => { setMode('camera'); startCamera(); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'camera' ? 'var(--accent-cyan)' : 'transparent',
              color: mode === 'camera' ? '#050c1c' : '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🎥 Usar Cámara
          </button>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minHeight: '220px', justifyContent: 'center' }}>
          {error && (
            <div style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(255, 77, 77, 0.15)',
              border: '1px solid rgba(255, 77, 77, 0.4)',
              borderRadius: '8px',
              color: '#ff6b6b',
              fontSize: '13px',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          {statusText && (
            <div style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {statusText}
            </div>
          )}

          {mode === 'file' && (
            <div style={{
              width: '100%',
              border: '2px dashed rgba(0, 198, 255, 0.4)',
              borderRadius: '12px',
              padding: '30px 20px',
              textAlign: 'center',
              background: 'rgba(0, 198, 255, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '40px' }}>🖼️</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                  Selecciona la foto o archivo GIF del código QR
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Sombra, GIF, PNG o JPG capturados por el técnico
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                id="qr-file-input"
                style={{ display: 'none' }}
              />

              <label
                htmlFor="qr-file-input"
                className="btn btn-primary"
                style={{ cursor: 'pointer', marginTop: '8px', padding: '10px 20px', fontSize: '13px' }}
              >
                📂 Seleccionar Archivo
              </label>
              <div id="qr-file-view" style={{ display: 'none' }}></div>
            </div>
          )}

          {mode === 'camera' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                id="qr-camera-view"
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid var(--accent-cyan)'
                }}
              ></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="btn btn-secondary"
            style={{ padding: '8px 20px' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
