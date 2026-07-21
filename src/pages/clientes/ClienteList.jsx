import React, { useState } from 'react';

export default function ClienteList({ clientes, tipos, categorias, isAdmin, selectedClienteId, onAddNew, onSelectCliente, onDelete, onRestore }) {
  const [displayMode, setDisplayMode] = useState('cards'); // 'cards' | 'list'
  
  // Filtros acumulables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [selectedTipoId, setSelectedTipoId] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Conteo de clientes por categoría para las Tarjetas Resumen de Categorías
  const getCategoriaCounts = () => {
    const counts = {};
    clientes.forEach(c => {
      if (!c.eliminado || isAdmin) {
        const catId = c.id_categoria_cliente;
        if (catId) {
          counts[catId] = (counts[catId] || 0) + 1;
        }
      }
    });
    return counts;
  };

  const categoriaCounts = getCategoriaCounts();

  // Filtrado acumulable (AND) para la lista / tarjetas de clientes
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
        (c.n_cliente && c.n_cliente.toLowerCase().includes(term)) ||
        (c.cliente_padre_nombre && c.cliente_padre_nombre.toLowerCase().includes(term))
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

  // Categoría actualmente seleccionada
  const activeCategoria = categorias.find(c => String(c.id) === String(selectedCategoriaId));

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
              {selectedCategoriaId === '' && displayMode === 'cards'
                ? 'Selecciona una categoría de marca para explorar sus clientes'
                : `Mostrando ${filteredClientes.length} clientes`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Toggle Modo de Visualización (Tarjetas vs Lista) */}
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
              + Añadir
            </button>
          </div>
        </div>

        {/* Barra de Filtros Acumulables */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'end',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Buscador por texto */}
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
            <label className="form-label" style={{ fontSize: '11px' }}>🏷️ Marca / Categoría</label>
            <select
              className="form-input"
              value={selectedCategoriaId}
              onChange={e => { setSelectedCategoriaId(e.target.value); setCurrentPage(1); }}
            >
              <option value="" style={{ background: '#0b1329' }}>Ver Categorías Principales</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id} style={{ background: '#0b1329' }}>
                  {cat.nombre} ({categoriaCounts[cat.id] || 0})
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

      {/* VISTA MODO TARJETAS */}
      {displayMode === 'cards' && (
        <>
          {/* ESTADO 1: Ninguna categoría seleccionada -> Mostrar Tarjetas Resumen de Categorías */}
          {selectedCategoriaId === '' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Selecciona una Categoría / Marca para explorar sus clientes:
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '18px'
              }}>
                {categorias.map(cat => {
                  const count = categoriaCounts[cat.id] || 0;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoriaId(String(cat.id));
                        setCurrentPage(1);
                      }}
                      className="glass-panel"
                      style={{
                        padding: '24px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px',
                        background: 'linear-gradient(135deg, rgba(15, 25, 50, 0.8), rgba(10, 18, 41, 0.6))',
                        border: '1px solid rgba(0, 198, 255, 0.25)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 198, 255, 0.25)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '28px' }}>🏷️</span>
                        <span className="badge" style={{ background: 'rgba(0, 198, 255, 0.15)', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 700, padding: '6px 12px' }}>
                          {count} {count === 1 ? 'Cliente' : 'Clientes'}
                        </span>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>
                          {cat.nombre}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {cat.descripcion || 'Ver clientes registrados de esta categoría'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '8px' }}>
                        <span>Ver clientes</span>
                        <span>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ESTADO 2: Categoría seleccionada -> Mostrar Tarjetas de Clientes */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(15, 25, 50, 0.8)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(0, 198, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🏷️</span>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      Categoría: {activeCategoria ? activeCategoria.nombre : 'Seleccionada'}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Mostrando {filteredClientes.length} clientes. Haz clic en una tarjeta para editar en el panel derecho.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCategoriaId('')}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  ← Ver Todas las Categorías
                </button>
              </div>

              {filteredClientes.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay clientes registrados en esta categoría que coincidan con los filtros aplicados.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredClientes.map(item => {
                    const isDeleted = item.eliminado;
                    const isSelected = selectedClienteId === item.id;
                    const isClienteFinal = Boolean(item.id_cliente_padre);
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectCliente(item)}
                        className="glass-panel"
                        style={{
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '14px',
                          cursor: 'pointer',
                          opacity: isDeleted ? 0.55 : 1,
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(0, 198, 255, 0.18), rgba(0, 114, 255, 0.08))'
                            : isDeleted ? 'rgba(239, 68, 68, 0.06)' : 'rgba(15, 25, 50, 0.65)',
                          border: isSelected
                            ? '2px solid var(--accent-cyan)'
                            : isDeleted ? '1px dashed rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                          boxShadow: isSelected ? '0 0 16px rgba(0, 198, 255, 0.3)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Header Tarjeta Cliente */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>
                              #{item.id}
                            </span>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {item.categoria_cliente_nombre && (
                                <span className="badge badge-active" style={{ fontSize: '10px' }}>
                                  🏷️ {item.categoria_cliente_nombre}
                                </span>
                              )}
                              {item.tipo_cliente_nombre && (
                                <span className="badge badge-role" style={{ fontSize: '10px' }}>
                                  {item.tipo_cliente_nombre}
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '4px', lineHeight: 1.3 }}>
                            🏢 {item.cliente}
                          </h4>

                          {isClienteFinal && (
                            <div style={{ margin: '4px 0' }}>
                              <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.18)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '10px', fontWeight: 700 }}>
                                🔗 Cliente Final (Padre: {item.cliente_padre_nombre})
                              </span>
                            </div>
                          )}

                          {isDeleted && (
                            <span style={{ fontSize: '11px', color: '#fca5a5', fontWeight: 600 }}>
                              🗑️ Eliminado (Lógico)
                            </span>
                          )}
                        </div>

                        {/* Detalles de contacto */}
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

                        {/* Indicador de Selección */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600, paddingTop: '4px' }}>
                          <span>{isSelected ? '▶ Seleccionado' : 'Clic para editar'}</span>
                          <span>{isSelected ? '✏️' : '→'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* VISTA MODO LISTA (TABLE VIEW) */}
      {displayMode === 'list' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NOMBRE</th>
                  <th>MARCA / CATEGORÍA / TIPO</th>
                  <th>CONTACTO</th>
                  <th>TELÉFONO</th>
                  <th>EMAIL</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {currentListItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No se encontraron clientes que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  currentListItems.map(item => {
                    const isDeleted = item.eliminado;
                    const isSelected = selectedClienteId === item.id;
                    const isClienteFinal = Boolean(item.id_cliente_padre);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => onSelectCliente(item)}
                        style={{
                          cursor: 'pointer',
                          opacity: isDeleted ? 0.55 : 1,
                          background: isSelected
                            ? 'rgba(0, 198, 255, 0.15)'
                            : isDeleted ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                        }}
                      >
                        <td><span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>#{item.id}</span></td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            🏢 {item.cliente}
                            {isClienteFinal && (
                              <div style={{ marginTop: '2px' }}>
                                <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.18)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '10px', fontWeight: 700 }}>
                                  🔗 Cliente Final (Padre: {item.cliente_padre_nombre})
                                </span>
                              </div>
                            )}
                            {isDeleted && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#fca5a5' }}>(Eliminado)</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {item.categoria_cliente_nombre && (
                              <span className="badge badge-active" style={{ fontSize: '11px' }}>
                                🏷️ {item.categoria_cliente_nombre}
                              </span>
                            )}
                            {item.tipo_cliente_nombre && (
                              <span className="badge badge-role" style={{ fontSize: '11px' }}>
                                {item.tipo_cliente_nombre}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.contacto || '-'}</td>
                        <td style={{ fontSize: '12px' }}>{item.telefono || '-'}</td>
                        <td style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>{item.email || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={(e) => { e.stopPropagation(); onSelectCliente(item); }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                              ✏️ Editar
                            </button>
                            {isDeleted ? (
                              isAdmin && (
                                <button onClick={(e) => { e.stopPropagation(); onRestore(item.id); }} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                  🔄
                                </button>
                              )
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                🗑️
                              </button>
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
