import React, { useState } from 'react';

export default function ClienteList({ clientes, tipos, categorias, isAdmin, onAddNew, onEdit, onDelete, onRestore }) {
  const [displayMode, setDisplayMode] = useState('cards'); // 'list' | 'cards'
  const [groupBy, setGroupBy] = useState('categoria'); // 'none' | 'categoria' | 'tipo'
  
  // Filtros acumulables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [selectedTipoId, setSelectedTipoId] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filtrado acumulable (AND)
  const filteredClientes = clientes.filter(c => {
    // 1. Buscador de texto acumulable
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchText = (
        (c.cliente && c.cliente.toLowerCase().includes(term)) ||
        (c.contacto && c.contacto.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.rut && c.rut.toLowerCase().includes(term)) ||
        (c.telefono && c.telefono.toLowerCase().includes(term)) ||
        (c.idcliente && c.idcliente.toLowerCase().includes(term)) ||
        (c.n_cliente && c.n_cliente.toLowerCase().includes(term))
      );
      if (!matchText) return false;
    }

    // 2. Filtro por Marca / Categoría
    if (selectedCategoriaId !== '') {
      if (Number(c.id_categoria_cliente) !== Number(selectedCategoriaId)) {
        return false;
      }
    }

    // 3. Filtro por Tipo de Cliente
    if (selectedTipoId !== '') {
      if (Number(c.id_tipo_cliente) !== Number(selectedTipoId)) {
        return false;
      }
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategoriaId('');
    setSelectedTipoId('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategoriaId !== '' || selectedTipoId !== '';

  // Lógica de Agrupación para Modo Tarjetas
  const getGroupedData = () => {
    if (groupBy === 'none') {
      return { 'Todos los Clientes': filteredClientes };
    }

    const grouped = {};
    filteredClientes.forEach(item => {
      let key = 'Sin Especificar';
      if (groupBy === 'categoria') {
        key = item.categoria_cliente_nombre || 'Sin Categoría / Marca';
      } else if (groupBy === 'tipo') {
        key = item.tipo_cliente_nombre || 'Sin Tipo de Cliente';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  };

  // Paginación para Modo Lista
  const totalPages = Math.ceil(filteredClientes.length / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const currentListItems = filteredClientes.slice(startIdx, startIdx + pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Panel Superior de Controles y Filtros Acumulables */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>Directorio de Clientes</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Filtra y agrupa los clientes por Marca, Tipo o Texto en tiempo real ({filteredClientes.length} de {clientes.length})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Toggle Modo de Visualización (Lista vs Tarjetas) */}
            <div style={{ display: 'flex', background: 'rgba(10, 18, 41, 0.7)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', padding: '2px' }}>
              <button
                onClick={() => setDisplayMode('cards')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: displayMode === 'cards' ? 'var(--accent-blue)' : 'transparent',
                  color: displayMode === 'cards' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🎴 Tarjetas
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: displayMode === 'list' ? 'var(--accent-blue)' : 'transparent',
                  color: displayMode === 'list' ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📋 Lista
              </button>
            </div>

            <button onClick={onAddNew} className="btn btn-primary">
              + Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Barra de Filtros Acumulables (Buscador, Categoría, Tipo, Agrupador) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          alignItems: 'end',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Buscador general */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🔍 Buscar por texto</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nombre, contacto, email..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Filtro Marca / Categoría */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>⭐ Marca / Categoría</label>
            <select
              className="form-input"
              value={selectedCategoriaId}
              onChange={e => { setSelectedCategoriaId(e.target.value); setCurrentPage(1); }}
            >
              <option value="" style={{ background: '#0b1329' }}>Todas las Marcas</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id} style={{ background: '#0b1329' }}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Tipo de Cliente */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🏢 Tipo de Cliente</label>
            <select
              className="form-input"
              value={selectedTipoId}
              onChange={e => { setSelectedTipoId(e.target.value); setCurrentPage(1); }}
            >
              <option value="" style={{ background: '#0b1329' }}>Todos los Tipos</option>
              {tipos.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0b1329' }}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Agrupación (solo para modo Tarjetas) */}
          {displayMode === 'cards' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>📑 Agrupar Tarjetas por</label>
              <select
                className="form-input"
                value={groupBy}
                onChange={e => setGroupBy(e.target.value)}
              >
                <option value="categoria" style={{ background: '#0b1329' }}>Por Marca / Categoría</option>
                <option value="tipo" style={{ background: '#0b1329' }}>Por Tipo de Cliente</option>
                <option value="none" style={{ background: '#0b1329' }}>Sin Agrupar</option>
              </select>
            </div>
          )}

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ height: '38px', justifyContent: 'center', fontSize: '12px' }}
            >
              🧹 Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* VISTA 1: MODO TARJETAS (CARDS VIEW) */}
      {displayMode === 'cards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {Object.keys(getGroupedData()).length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No se encontraron clientes que coincidan con la combinación de filtros aplicada.
            </div>
          ) : (
            Object.entries(getGroupedData()).map(([groupName, groupItems]) => (
              <div key={groupName} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Cabecera del Grupo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(15, 25, 50, 0.8)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid var(--accent-cyan)',
                  border: '1px solid rgba(0, 198, 255, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {groupBy === 'categoria' ? '⭐' : groupBy === 'tipo' ? '🏢' : '📂'}
                    </span>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      {groupName}
                    </h4>
                  </div>
                  <span className="badge" style={{ background: 'rgba(0, 198, 255, 0.15)', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 700 }}>
                    {groupItems.length} {groupItems.length === 1 ? 'cliente' : 'clientes'}
                  </span>
                </div>

                {/* Grid de Tarjetas */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '16px'
                }}>
                  {groupItems.map(item => {
                    const isDeleted = item.eliminado;
                    return (
                      <div
                        key={item.id}
                        className="glass-panel"
                        style={{
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '14px',
                          position: 'relative',
                          opacity: isDeleted ? 0.55 : 1,
                          background: isDeleted ? 'rgba(239, 68, 68, 0.06)' : 'rgba(15, 25, 50, 0.65)',
                          border: isDeleted ? '1px dashed rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                      >
                        {/* Header de la Tarjeta */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>
                              #{item.id}
                            </span>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {item.categoria_cliente_nombre && (
                                <button
                                  onClick={() => setSelectedCategoriaId(String(item.id_categoria_cliente))}
                                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                  title="Filtrar por esta marca"
                                >
                                  <span className="badge badge-active" style={{ fontSize: '10px' }}>
                                    ⭐ {item.categoria_cliente_nombre}
                                  </span>
                                </button>
                              )}
                              {item.tipo_cliente_nombre && (
                                <button
                                  onClick={() => setSelectedTipoId(String(item.id_tipo_cliente))}
                                  style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                  title="Filtrar por este tipo"
                                >
                                  <span className="badge badge-role" style={{ fontSize: '10px' }}>
                                    {item.tipo_cliente_nombre}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Nombre de la Empresa / Cliente */}
                          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '4px', lineHeight: 1.3 }}>
                            🏢 {item.cliente}
                          </h4>
                          {isDeleted && (
                            <span style={{ fontSize: '11px', color: '#fca5a5', fontWeight: 600 }}>
                              🗑️ Eliminado (Lógico)
                            </span>
                          )}
                        </div>

                        {/* Datos de Contacto y Detalles */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          background: 'rgba(10, 18, 41, 0.4)',
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                          {item.contacto && (
                            <div>👤 <strong style={{ color: 'var(--text-primary)' }}>Contacto:</strong> {item.contacto}</div>
                          )}
                          {item.telefono && (
                            <div>📞 <strong style={{ color: 'var(--text-primary)' }}>Teléfono:</strong> {item.telefono}</div>
                          )}
                          {item.email && (
                            <div style={{ wordBreak: 'break-all' }}>
                              ✉️ <strong style={{ color: 'var(--text-primary)' }}>Email:</strong>{' '}
                              <span style={{ color: 'var(--accent-cyan)' }}>{item.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Botones de Acción de la Tarjeta */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          {isDeleted ? (
                            isAdmin && (
                              <button onClick={() => onRestore(item.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', width: '100%', justifyContent: 'center' }}>
                                🔄 Restaurar Cliente
                              </button>
                            )
                          ) : (
                            <>
                              <button onClick={() => onEdit(item)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', flex: 1, justifyContent: 'center' }}>
                                ✏️ Editar
                              </button>
                              <button onClick={() => onDelete(item.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px', flex: 1, justifyContent: 'center' }}>
                                🗑️ Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VISTA 2: MODO LISTA (TABLE VIEW) */}
      {displayMode === 'list' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NOMBRE</th>
                  <th>MARCA / CATEGORÍA</th>
                  <th>TIPO</th>
                  <th>CONTACTO</th>
                  <th>TELÉFONO</th>
                  <th>EMAIL</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {currentListItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No se encontraron clientes que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  currentListItems.map(item => {
                    const isDeleted = item.eliminado;
                    return (
                      <tr
                        key={item.id}
                        style={isDeleted ? { opacity: 0.55, background: 'rgba(239, 68, 68, 0.08)' } : {}}
                      >
                        <td><span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>#{item.id}</span></td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            🏢 {item.cliente}
                            {isDeleted && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#fca5a5' }}>(Eliminado)</span>}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-active" style={{ fontSize: '11px' }}>
                            ⭐ {item.categoria_cliente_nombre || 'General'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-role" style={{ fontSize: '11px' }}>
                            {item.tipo_cliente_nombre || 'Sin Tipo'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.contacto || '-'}</td>
                        <td style={{ fontSize: '12px' }}>{item.telefono || '-'}</td>
                        <td style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>{item.email || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {isDeleted ? (
                              isAdmin && (
                                <button onClick={() => onRestore(item.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                  🔄 Restaurar
                                </button>
                              )
                            ) : (
                              <>
                                <button onClick={() => onEdit(item)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                  ✏️ Editar
                                </button>
                                <button onClick={() => onDelete(item.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                  🗑️ Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación Modo Lista */}
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
      )}
    </div>
  );
}
