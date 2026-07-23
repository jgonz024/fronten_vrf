import React, { useState, useEffect, useRef } from 'react';
import { fetchOrdenesTrabajo } from '../../api/ordenTrabajo.api';

/**
 * Buscador inteligente de Órdenes de Trabajo.
 * Permite buscar por folio, título, técnico, cliente, estado, fecha, etc.
 * Al seleccionar una OT, devuelve el ID al componente padre.
 */
export default function OtSearchPicker({ value, onChange, placeholder }) {
  const [ordenes, setOrdenes] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Load all OTs once
  useEffect(() => {
    setLoading(true);
    fetchOrdenesTrabajo(false)
      .then(data => {
        setOrdenes(data);
        // If there's already a value, set the label
        if (value) {
          const found = data.find(o => o.id === Number(value));
          if (found) {
            setSelectedLabel(`#${found.id} — ${found.folio || found.titulo_ot}`);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sync label when value changes externally
  useEffect(() => {
    if (value && ordenes.length > 0) {
      const found = ordenes.find(o => o.id === Number(value));
      if (found) {
        setSelectedLabel(`#${found.id} — ${found.folio || found.titulo_ot}`);
      }
    } else if (!value) {
      setSelectedLabel('');
    }
  }, [value, ordenes]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic — searches across multiple fields
  const filtered = ordenes.filter(o => {
    if (!searchText.trim()) return true;
    const term = searchText.toLowerCase();
    return (
      String(o.id).includes(term) ||
      (o.folio || '').toLowerCase().includes(term) ||
      (o.titulo_ot || '').toLowerCase().includes(term) ||
      (o.usuario_nombre || '').toLowerCase().includes(term) ||
      (o.cliente_nombre || '').toLowerCase().includes(term) ||
      (o.estado_ot_nombre || '').toLowerCase().includes(term) ||
      (o.tipo_ot_nombre || '').toLowerCase().includes(term) ||
      (o.fecha_programacion || '').toLowerCase().includes(term) ||
      (o.nombre_encargado || '').toLowerCase().includes(term)
    );
  });

  const handleSelect = (ot) => {
    onChange(String(ot.id));
    setSelectedLabel(`#${ot.id} — ${ot.folio || ot.titulo_ot}`);
    setSearchText('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSelectedLabel('');
    setSearchText('');
  };

  const formatDate = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {/* Display selected / Search input */}
      {selectedLabel ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 198, 255, 0.08)',
          border: '1px solid rgba(0, 198, 255, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '7px 10px',
          fontSize: '12px',
          color: '#ffffff'
        }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📋 {selectedLabel}
          </span>
          <button
            type="button"
            onClick={() => { handleClear(); setIsOpen(true); }}
            style={{
              background: 'rgba(239, 68, 68, 0.6)',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              color: '#fff',
              fontSize: '10px',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >✕</button>
        </div>
      ) : (
        <input
          type="text"
          className="form-input"
          style={{ fontSize: '12px' }}
          placeholder={placeholder || '🔍 Buscar OT por folio, técnico, cliente, estado...'}
          value={searchText}
          onChange={e => { setSearchText(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
        />
      )}

      {/* Results Dropdown */}
      {isOpen && !selectedLabel && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 999,
          maxHeight: '280px',
          overflowY: 'auto',
          background: 'rgba(12, 22, 50, 0.98)',
          border: '1px solid rgba(0, 198, 255, 0.3)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          marginTop: '4px'
        }}>
          {/* Search Stats */}
          <div style={{
            padding: '8px 12px',
            fontSize: '10px',
            color: 'var(--text-muted)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>{loading ? '⏳ Cargando...' : `${filtered.length} resultados`}</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Busca por folio, técnico, cliente, estado...</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              No se encontraron órdenes de trabajo.
            </div>
          ) : (
            filtered.slice(0, 50).map(ot => (
              <div
                key={ot.id}
                onClick={() => handleSelect(ot)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 198, 255, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '12px' }}>
                    #{ot.id} {ot.folio || ''}
                  </span>
                  <span className="badge badge-active" style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {ot.estado_ot_nombre || 'N/A'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ot.titulo_ot}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>🏢 {ot.cliente_nombre || 'Sin cliente'}</span>
                  <span>👤 {ot.usuario_nombre || 'Sin técnico'}</span>
                  <span>📅 {formatDate(ot.fecha_programacion)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
