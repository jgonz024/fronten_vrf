import React, { useState, useEffect, useRef } from 'react';
import { fetchClientes } from '../../api/clientes.api';

/**
 * Buscador inteligente de Clientes.
 * Busca por ID, nombre de cliente, RUT, dirección.
 */
export default function ClienteSearchPicker({ value, onChange, placeholder }) {
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchClientes(false)
      .then(data => {
        setItems(data);
        if (value) {
          const found = data.find(c => c.id === Number(value));
          if (found) setSelectedLabel(`#${found.id} — ${found.cliente}`);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (value && items.length > 0) {
      const found = items.find(c => c.id === Number(value));
      if (found) setSelectedLabel(`#${found.id} — ${found.cliente}`);
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

  const filtered = items.filter(c => {
    if (!searchText.trim()) return true;
    const t = searchText.toLowerCase();
    return (
      String(c.id).includes(t) ||
      (c.cliente || '').toLowerCase().includes(t) ||
      (c.rut || '').toLowerCase().includes(t) ||
      (c.email || '').toLowerCase().includes(t) ||
      (c.telefono || '').toLowerCase().includes(t)
    );
  });

  const handleSelect = (c) => {
    onChange(String(c.id));
    setSelectedLabel(`#${c.id} — ${c.cliente}`);
    setSearchText('');
    setIsOpen(false);
  };

  const handleClear = () => { onChange(''); setSelectedLabel(''); setSearchText(''); };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {selectedLabel ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 198, 255, 0.08)', border: '1px solid rgba(0, 198, 255, 0.3)', borderRadius: 'var(--radius-sm)', padding: '7px 10px', fontSize: '12px', color: '#ffffff' }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🏢 {selectedLabel}</span>
          <button type="button" onClick={() => { handleClear(); setIsOpen(true); }} style={{ background: 'rgba(239, 68, 68, 0.6)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', color: '#fff', fontSize: '10px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      ) : (
        <input type="text" className="form-input" style={{ fontSize: '12px' }} placeholder={placeholder || '🔍 Buscar cliente por nombre, RUT...'} value={searchText} onChange={e => { setSearchText(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} />
      )}

      {isOpen && !selectedLabel && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999, maxHeight: '240px', overflowY: 'auto', background: 'rgba(12, 22, 50, 0.98)', border: '1px solid rgba(0, 198, 255, 0.3)', borderRadius: 'var(--radius-sm)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)', marginTop: '4px' }}>
          <div style={{ padding: '6px 12px', fontSize: '10px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {loading ? '⏳ Cargando...' : `${filtered.length} clientes`}
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>Sin resultados</div>
          ) : (
            filtered.slice(0, 30).map(c => (
              <div key={c.id} onClick={() => handleSelect(c)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 198, 255, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '12px' }}>#{c.id} {c.cliente}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {c.rut ? `🪪 ${c.rut}` : ''} {c.email ? `📧 ${c.email}` : ''} {c.telefono ? `📱 ${c.telefono}` : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
