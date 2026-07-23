import React, { useState } from 'react';
import ActivoBatchQrModal from './ActivoBatchQrModal';

export default function ActivoList({
  activos,
  isAdmin,
  selectedActivoId,
  onAddNew,
  onSelectActivo,
  onOpenQrModal,
  onDelete,
  onRestore,
  clients,
  categories,
  types,
  brands
}) {
  const [displayMode, setDisplayMode] = useState('cards'); // 'cards' | 'list'
  
  // Selección múltiple para impresión masiva de QR
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [batchQrModalOpen, setBatchQrModalOpen] = useState(false);
  
  // Filtros acumulables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedMarcaId, setSelectedMarcaId] = useState('');
  const [selectedTipoId, setSelectedTipoId] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Conteo de activos por categoría
  const getCategoriaCounts = () => {
    const counts = {};
    activos.forEach(a => {
      if (!a.eliminado || isAdmin) {
        const catId = a.id_categoria_activo;
        if (catId) {
          counts[catId] = (counts[catId] || 0) + 1;
        }
      }
    });
    return counts;
  };

  const categoriaCounts = getCategoriaCounts();

  // Filtrado acumulable (AND)
  const filteredActivos = activos.filter(item => {
    // 1. Buscador de texto libre
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        (item.id_identificador || '').toLowerCase().includes(term) ||
        (item.modelo_ui || '').toLowerCase().includes(term) ||
        (item.modelo_ue || '').toLowerCase().includes(term) ||
        (item.serie_ui || '').toLowerCase().includes(term) ||
        (item.serie_ue || '').toLowerCase().includes(term) ||
        (item.codigo_qr || '').toLowerCase().includes(term) ||
        (item.cliente_nombre || '').toLowerCase().includes(term) ||
        (item.direccion_texto || '').toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // 2. Filtro categoría
    if (selectedCategoriaId !== '') {
      if (Number(item.id_categoria_activo) !== Number(selectedCategoriaId)) {
        return false;
      }
    }

    // 3. Filtro cliente
    if (selectedClienteId !== '') {
      if (Number(item.id_cliente) !== Number(selectedClienteId)) {
        return false;
      }
    }

    // 4. Filtro marca
    if (selectedMarcaId !== '') {
      if (Number(item.id_marca_activo) !== Number(selectedMarcaId)) {
        return false;
      }
    }

    // 5. Filtro tipo activo
    if (selectedTipoId !== '') {
      if (Number(item.id_tipo_activo) !== Number(selectedTipoId)) {
        return false;
      }
    }

    // 6. Filtro estado operativo
    if (selectedEstado !== '') {
      if ((item.estado_activo || '').toLowerCase() !== selectedEstado.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategoriaId('');
    setSelectedClienteId('');
    setSelectedMarcaId('');
    setSelectedTipoId('');
    setSelectedEstado('');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedCategoriaId !== '' || 
    selectedClienteId !== '' || 
    selectedMarcaId !== '' || 
    selectedTipoId !== '' || 
    selectedEstado !== '';

  // Emojis según categoría de activo
  const getCategoryEmoji = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('climatizac')) return '❄️';
    if (n.includes('ventilac')) return '💨';
    if (n.includes('refrigerac')) return '🧊';
    if (n.includes('conexio')) return '🔌';
    return '📦';
  };

  // Categoría seleccionada
  const activeCategoria = categories.find(c => String(c.id) === String(selectedCategoriaId));

  // Paginación Modo Lista
  const totalPages = Math.ceil(filteredActivos.length / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const currentListItems = filteredActivos.slice(startIdx, startIdx + pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Panel Superior de Controles y Filtros */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>Directorio de Activos</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {selectedCategoriaId === '' && displayMode === 'cards'
                ? 'Selecciona una categoría de activo para explorar sus equipos'
                : `Mostrando ${filteredActivos.length} activos`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Selector Modo Visualización */}
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

        {/* Formulario de Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'end',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Buscador */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🔍 Buscar por texto</label>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              placeholder="Identificador, modelo, serie, QR..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Categoría */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🏷️ Categoría</label>
            <select
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              value={selectedCategoriaId}
              onChange={e => { setSelectedCategoriaId(e.target.value); setCurrentPage(1); }}
            >
              <option value="" style={{ background: '#0b1329' }}>Ver Categorías Principales</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} style={{ background: '#0b1329' }}>
                  {cat.nombre} ({categoriaCounts[cat.id] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🏢 Cliente</label>
            <select
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              value={selectedClienteId}
              onChange={e => { setSelectedClienteId(e.target.value); setCurrentPage(1); }}
            >
              <option value="" style={{ background: '#0b1329' }}>Todos los Clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0b1329' }}>
                  {c.cliente}
                </option>
              ))}
            </select>
          </div>

          {/* Marca */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🔧 Marca</label>
            <select
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              value={selectedMarcaId}
              onChange={e => { setSelectedMarcaId(e.target.value); setCurrentPage(1); }}
            >
              <option value="" style={{ background: '#0b1329' }}>Todas las Marcas</option>
              {brands.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#0b1329' }}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo Activo */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>⚙️ Tipo Activo</label>
            <select
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              value={selectedTipoId}
              onChange={e => { setSelectedTipoId(e.target.value); setCurrentPage(1); }}
            >
              <option value="" style={{ background: '#0b1329' }}>Todos los Tipos</option>
              {types.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0b1329' }}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Operativo */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🚦 Estado Operativo</label>
            <select
              className="form-input"
              style={{ fontSize: '12px', padding: '8px 10px' }}
              value={selectedEstado}
              onChange={e => { setSelectedEstado(e.target.value); setCurrentPage(1); }}
            >
              <option value="" style={{ background: '#0b1329' }}>Todos los Estados</option>
              <option value="Operativo" style={{ background: '#0b1329' }}>Operativo</option>
              <option value="Medianamente Operativo" style={{ background: '#0b1329' }}>Medianamente Operativo</option>
              <option value="Fuera de Servicio" style={{ background: '#0b1329' }}>Fuera de Servicio</option>
            </select>
          </div>

          {/* Limpiar Filtros */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ height: '38px', justifyContent: 'center', fontSize: '12px' }}
            >
              Defectos 🧹 Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* MODO TARJETAS */}
      {displayMode === 'cards' && (
        <>
          {/* ESTADO 1: Sin Categoría seleccionada -> Mostrar Categorías Principales */}
          {selectedCategoriaId === '' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Selecciona una Categoría para explorar sus activos:
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '18px'
              }}>
                {categories.map(cat => {
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
                        <span style={{ fontSize: '28px' }}>{getCategoryEmoji(cat.nombre)}</span>
                        <span className="badge" style={{ background: 'rgba(0, 198, 255, 0.15)', color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 700, padding: '6px 12px' }}>
                          {count} {count === 1 ? 'Activo' : 'Activos'}
                        </span>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: '0 0 6px 0' }}>
                          {cat.nombre}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          {cat.descripcion || 'Ver equipos registrados de esta categoría'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '8px' }}>
                        <span>Ver activos</span>
                        <span>→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ESTADO 2: Categoría seleccionada -> Mostrar Activos de esa Categoría */
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
                  <span style={{ fontSize: '20px' }}>{getCategoryEmoji(activeCategoria ? activeCategoria.nombre : '')}</span>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      Categoría: {activeCategoria ? activeCategoria.nombre : 'Seleccionada'}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Mostrando {filteredActivos.length} activos. Haz clic en una tarjeta para editar en el panel derecho.
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

              {filteredActivos.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No hay activos registrados en esta categoría que coincidan con los filtros aplicados.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {filteredActivos.map(item => {
                    const isDeleted = item.eliminado;
                    const isSelected = selectedActivoId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectActivo(item)}
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
                        {/* Header */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>
                              #{item.id}
                            </span>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {item.categoria_activo_nombre && (
                                <span className="badge badge-active" style={{ fontSize: '10px' }}>
                                  🏷️ {item.categoria_activo_nombre}
                                </span>
                              )}
                              {item.tipo_activo_nombre && (
                                <span className="badge badge-role" style={{ fontSize: '10px' }}>
                                  {item.tipo_activo_nombre}
                                </span>
                              )}
                              {item.marca_activo_nombre && (
                                <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', fontSize: '10px', fontWeight: 700 }}>
                                  {item.marca_activo_nombre}
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '4px', lineHeight: 1.3 }}>
                            📦 {item.id_identificador || 'S/Identificador'}
                          </h4>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {item.codigo_qr && <span>QR: {item.codigo_qr}</span>}
                          </div>

                          {isDeleted && (
                            <span style={{ fontSize: '11px', color: '#fca5a5', fontWeight: 600 }}>
                              🗑️ Dado de Baja (Inactivo)
                            </span>
                          )}
                        </div>

                        {/* Detalles de Cliente */}
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
                          <div>🏢 <strong style={{ color: 'var(--text-primary)' }}>Cliente:</strong> {item.cliente_nombre || `Cliente #${item.id_cliente}`}</div>
                          {item.direccion_texto && (
                            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={item.direccion_texto}>
                              📍 <strong style={{ color: 'var(--text-primary)' }}>Dirección:</strong> {item.direccion_texto}
                            </div>
                          )}
                        </div>

                        {/* Detalles Técnicos */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '6px',
                          fontSize: '11px',
                          color: 'var(--text-muted)'
                        }}>
                          <div><strong>Modelo UI:</strong> {item.modelo_ui || '-'}</div>
                          <div><strong>Modelo UE:</strong> {item.modelo_ue || '-'}</div>
                          <div><strong>Serie UI:</strong> {item.serie_ui || '-'}</div>
                          <div><strong>Serie UE:</strong> {item.serie_ue || '-'}</div>
                        </div>

                        {/* Estado y Selección */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', paddingTop: '4px' }}>
                          <span className={`badge ${
                            (item.estado_activo || '').toLowerCase().includes('operativo') 
                              ? (item.estado_activo || '').toLowerCase().includes('mediana')
                                ? 'badge-warning'
                                : 'badge-active'
                              : 'badge-danger'
                          }`} style={{ fontSize: '10px', padding: '4px 8px' }}>
                            {item.estado_activo || 'Sin Estado'}
                          </span>
                          
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenQrModal) onOpenQrModal(item);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title="Ver e imprimir etiqueta QR"
                            >
                              🏷️ QR
                            </button>
                            <span style={{ color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
                              {isSelected ? '▶ Seleccionado' : 'Clic para editar'}
                            </span>
                          </div>
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

      {/* MODO LISTA */}
      {displayMode === 'list' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* BARRA DE ACCIÓN MASIVA DE QR */}
          {selectedRowIds.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '12px 18px',
              background: 'rgba(0, 198, 255, 0.12)',
              border: '1px solid rgba(0, 198, 255, 0.4)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 15px rgba(0, 198, 255, 0.1)'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'var(--accent-cyan)', color: '#050c1c', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  {selectedRowIds.length}
                </span>
                Activo(s) seleccionado(s) para imprimir QR
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setBatchQrModalOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  🖨️ Imprimir QRs Seleccionados ({selectedRowIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRowIds([])}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Deseleccionar todo
                </button>
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={
                        currentListItems.length > 0 &&
                        currentListItems.every(i => selectedRowIds.includes(i.id))
                      }
                      onChange={() => {
                        const currentPageIds = currentListItems.map(item => item.id);
                        const allSelected = currentPageIds.every(id => selectedRowIds.includes(id));
                        if (allSelected) {
                          setSelectedRowIds(prev => prev.filter(id => !currentPageIds.includes(id)));
                        } else {
                          setSelectedRowIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
                        }
                      }}
                      title="Seleccionar todos los activos de esta página"
                      style={{ cursor: 'pointer', transform: 'scale(1.25)' }}
                    />
                  </th>
                  <th>ID</th>
                  <th>IDENTIFICADOR / QR</th>
                  <th>CLIENTE & DIRECCIÓN</th>
                  <th>CARACTERÍSTICAS</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {currentListItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No se encontraron activos que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  currentListItems.map(item => {
                    const isDeleted = item.eliminado;
                    const isSelected = selectedActivoId === item.id;
                    const isChecked = selectedRowIds.includes(item.id);

                    return (
                      <tr
                        key={item.id}
                        onClick={() => onSelectActivo(item)}
                        style={{
                          cursor: 'pointer',
                          opacity: isDeleted ? 0.55 : 1,
                          background: isChecked
                            ? 'rgba(0, 198, 255, 0.2)'
                            : isSelected
                              ? 'rgba(0, 198, 255, 0.15)'
                              : isDeleted ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                        }}
                      >
                        <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedRowIds(prev =>
                                prev.includes(item.id)
                                  ? prev.filter(id => id !== item.id)
                                  : [...prev, item.id]
                              );
                            }}
                            style={{ cursor: 'pointer', transform: 'scale(1.25)' }}
                          />
                        </td>
                        <td><span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>#{item.id}</span></td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              📦 {item.id_identificador || 'S/Identificador'}
                            </span>
                            {item.codigo_qr && (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                QR: {item.codigo_qr}
                              </span>
                            )}
                            {isDeleted && <span style={{ fontSize: '10px', color: '#fca5a5' }}>(Dado de baja)</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{item.cliente_nombre || `Cliente #${item.id_cliente}`}</strong>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }} title={item.direccion_texto}>
                              📍 {item.direccion_texto || 'Dirección no especificada'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {item.categoria_activo_nombre && (
                              <span className="badge badge-active" style={{ fontSize: '11px' }}>
                                🏷️ {item.categoria_activo_nombre}
                              </span>
                            )}
                            {item.tipo_activo_nombre && (
                              <span className="badge badge-role" style={{ fontSize: '11px' }}>
                                {item.tipo_activo_nombre}
                              </span>
                            )}
                            {item.marca_activo_nombre && (
                              <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', fontSize: '11px', fontWeight: 700 }}>
                                {item.marca_activo_nombre}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            (item.estado_activo || '').toLowerCase().includes('operativo') 
                              ? (item.estado_activo || '').toLowerCase().includes('mediana')
                                ? 'badge-warning'
                                : 'badge-active'
                              : 'badge-danger'
                          }`} style={{ fontSize: '10px', display: 'inline-block', textAlign: 'center', width: '100%' }}>
                            {item.estado_activo || 'Sin Estado'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => onSelectActivo(item)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                              ✏️ Editar
                            </button>
                            {isDeleted ? (
                              isAdmin && (
                                <button onClick={() => onRestore(item.id)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                  🔄
                                </button>
                              )
                            ) : (
                              <button onClick={() => onDelete(item.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>
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
      )}

      {/* Modal de Impresión Masiva de QRs */}
      {batchQrModalOpen && (
        <ActivoBatchQrModal
          selectedActivos={activos.filter(a => selectedRowIds.includes(a.id))}
          onClose={() => setBatchQrModalOpen(false)}
        />
      )}
    </div>
  );
}
