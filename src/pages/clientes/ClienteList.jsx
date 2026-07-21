import React, { useState } from 'react';

export default function ClienteList({ clientes, onAddNew, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filtered = clientes.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.cliente && c.cliente.toLowerCase().includes(term)) ||
      (c.contacto && c.contacto.toLowerCase().includes(term)) ||
      (c.rut && c.rut.toLowerCase().includes(term)) ||
      (c.idcliente && c.idcliente.toLowerCase().includes(term)) ||
      (c.n_cliente && c.n_cliente.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const currentItems = filtered.slice(startIdx, startIdx + pageSize);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Listado General de Clientes</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Mostrando {filtered.length} de {clientes.length} clientes registrados en PostgreSQL
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Buscar por cliente, RUT, contacto, email..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: '320px' }}
          />
          <button onClick={onAddNew} className="btn btn-primary">
            + Nuevo Cliente
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>CÓDIGO</th>
              <th>CLIENTE / RAZÓN SOCIAL</th>
              <th>TIPO</th>
              <th>MARCA / CAT.</th>
              <th>CONTACTO</th>
              <th>RUT</th>
              <th>TELÉFONO</th>
              <th>EMAIL</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                  No se encontraron clientes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              currentItems.map(item => (
                <tr key={item.id}>
                  <td><span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>#{item.id}</span></td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-primary)', fontSize: '11px' }}>
                      {item.n_cliente || item.idcliente || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🏢 {item.cliente}</div>
                  </td>
                  <td>
                    <span className="badge badge-role" style={{ fontSize: '11px' }}>
                      {item.tipo_cliente_nombre || 'Sin Tipo'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-active" style={{ fontSize: '11px' }}>
                      ⭐ {item.categoria_cliente_nombre || 'General'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.contacto || '-'}</td>
                  <td style={{ fontSize: '13px', fontFamily: 'monospace' }}>{item.rut || '-'}</td>
                  <td style={{ fontSize: '12px' }}>{item.telefono || '-'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>{item.email || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => onEdit(item)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        ✏️
                      </button>
                      <button onClick={() => onDelete(item.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <div>
          Página {currentPage} de {totalPages}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            ← Anterior
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
