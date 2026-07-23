import React, { useState, useEffect, useRef } from 'react';
import { fetchActivos } from '../../api/activo.api';
import QrScannerModal from '../../components/common/QrScannerModal';

/**
 * Buscador inteligente de Activos/Equipos con lector de Código QR incorporado.
 */
export default function ActivoSearchPicker({ value, onChange, placeholder }) {
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchActivos(false)
      .then(data => {
        setItems(data);
        if (value) {
          const found = data.find(a => a.id === Number(value));
          if (found) {
            setSelectedLabel(`#${found.id} — ${found.id_identificador || found.modelo_ui || 'Activo ' + found.id}`);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (value && items.length > 0) {
      const found = items.find(a => a.id === Number(value));
      if (found) {
        setSelectedLabel(`#${found.id} — ${found.id_identificador || found.modelo_ui || 'Activo ' + found.id}`);
      }
    } else if (!value) {
      setSelectedLabel('');
    }
  }, [value, items]);

  useEffect(() => {
    const handle = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleSelect = (item) => {
    setSelectedLabel(`#${item.id} — ${item.id_identificador || item.modelo_ui || 'Activo ' + item.id}`);
    onChange(item.id);
    setIsOpen(false);
    setSearchText('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedLabel('');
    onChange('');
    setSearchText('');
  };

  const handleQrScanSuccess = (scannedActivoId) => {
    const found = items.find(a => Number(a.id) === Number(scannedActivoId));
    if (found) {
      handleSelect(found);
    } else {
      // Si el id existía de forma directa
      onChange(scannedActivoId);
      setSelectedLabel(`Activo #${scannedActivoId}`);
    }
  };

  const filtered = items.filter(a => {
    if (!searchText.trim()) return true;
    const t = searchText.toLowerCase();
    return (
      String(a.id).includes(t) ||
      (a.id_identificador || '').toLowerCase().includes(t) ||
      (a.modelo_ui || '').toLowerCase().includes(t) ||
      (a.modelo_ue || '').toLowerCase().includes(t) ||
      (a.serie_ui || '').toLowerCase().includes(t) ||
      (a.serie_ue || '').toLowerCase().includes(t) ||
      (a.cliente_nombre || '').toLowerCase().includes(t) ||
      (a.direccion_texto || '').toLowerCase().includes(t)
    );
  });

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {showQrScanner && (
        <QrScannerModal
          onClose={() => setShowQrScanner(false)}
          onScanSuccess={handleQrScanSuccess}
        />
      )}

      <div style={{ display: 'flex', gap: '6px' }}>
        <div
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(15, 25, 50, 0.7)',
            border: isOpen ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: selectedLabel ? '#ffffff' : 'var(--text-muted)',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: isOpen ? '0 0 10px rgba(0, 198, 255, 0.25)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <span style={{ fontSize: '14px', color: 'var(--accent-cyan)' }}>📦</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedLabel || placeholder || 'Buscar o escanear QR de activo...'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedLabel && (
              <span
                onClick={handleClear}
                style={{ fontSize: '14px', color: '#ff6b6b', padding: '0 4px', cursor: 'pointer' }}
                title="Limpiar selección"
              >
                ✕
              </span>
            )}
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>▼</span>
          </div>
        </div>

        {/* Botón Escanear QR */}
        <button
          type="button"
          onClick={() => setShowQrScanner(true)}
          className="btn btn-primary"
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
          title="Escanear código QR impreso en el activo con cámara o GIF/Foto"
        >
          📷 QR
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#0c162d',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          maxHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Input de filtro */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Escribe ID, identificador, serie o modelo..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              autoFocus
              style={{ fontSize: '12px', padding: '8px 10px' }}
            />
          </div>

          {/* Lista de sugerencias */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                ⏳ Cargando activos...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                No se encontraron activos con "{searchText}"
              </div>
            ) : (
              filtered.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    background: Number(value) === item.id ? 'rgba(0, 198, 255, 0.15)' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 198, 255, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = Number(value) === item.id ? 'rgba(0, 198, 255, 0.15)' : 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      #{item.id} — {item.id_identificador || 'Sin ID Identificador'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {item.cliente_nombre || ''}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    UI: {item.modelo_ui || '-'} | UE: {item.modelo_ue || '-'} | Ubicación: {item.ubicacion_activo || 'N/A'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
