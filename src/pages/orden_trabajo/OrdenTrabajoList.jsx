import React, { useState, useMemo } from 'react';
import InformeOtModalView from './InformeOtModalView';

export default function OrdenTrabajoList({
  ordenes = [],
  isAdmin,
  selectedOrdenId,
  clientes = [],
  tiposOt = [],
  estadosOt = [],
  activos = [],
  tiposActivo = [],
  onAddNew,
  onSelectOrden,
  onDelete,
  onRestore
}) {
  const [displayMode, setDisplayMode] = useState('cards'); // 'cards' | 'list'
  const [reportModalOrden, setReportModalOrden] = useState(null);

  // --- FILTERS STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [selectedActivoId, setSelectedActivoId] = useState('');
  const [selectedTipoActivoId, setSelectedTipoActivoId] = useState('');
  const [selectedTipoOtId, setSelectedTipoOtId] = useState('');
  const [selectedEstadoId, setSelectedEstadoId] = useState('ALL'); // 'ALL' or estado ID

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Sin fecha';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        if (!isNaN(dateStr)) {
          const serial = Number(dateStr);
          const utcDays = Math.floor(serial - 25569);
          const date = new Date(utcDays * 86400 * 1000);
          return date.toLocaleDateString();
        }
        return dateStr;
      }
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const handleOpenReportsModal = (e, item) => {
    e.stopPropagation();
    setReportModalOrden(item);
  };

  // --- FILTERING LOGIC ---
  const filteredOrdenes = useMemo(() => {
    return ordenes.filter(item => {
      // 1. Search Query (ID, Folio, Título)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = item.id ? item.id.toString().includes(q) : false;
        const matchFolio = item.folio ? item.folio.toLowerCase().includes(q) : false;
        const matchTitle = item.titulo_ot ? item.titulo_ot.toLowerCase().includes(q) : false;
        if (!matchId && !matchFolio && !matchTitle) return false;
      }

      // 2. Cliente Filter
      if (selectedClienteId && Number(item.id_cliente) !== Number(selectedClienteId)) {
        return false;
      }

      // 3. Tipo de OT Filter
      if (selectedTipoOtId && Number(item.id_tipo_ot) !== Number(selectedTipoOtId)) {
        return false;
      }

      // 4. Estado de OT Filter
      if (selectedEstadoId !== 'ALL' && Number(item.id_estado_ot) !== Number(selectedEstadoId)) {
        return false;
      }

      // 5. Activo Filter
      if (selectedActivoId) {
        const hasActivo = item.activos_asociados && item.activos_asociados.some(a => Number(a.id_activo) === Number(selectedActivoId));
        if (!hasActivo) return false;
      }

      // 6. Tipo de Activo Filter
      if (selectedTipoActivoId) {
        const hasTipoActivo = item.activos_asociados && item.activos_asociados.some(a => Number(a.id_tipo_activo) === Number(selectedTipoActivoId));
        if (!hasTipoActivo) return false;
      }

      return true;
    });
  }, [ordenes, searchQuery, selectedClienteId, selectedTipoOtId, selectedEstadoId, selectedActivoId, selectedTipoActivoId]);

  // Conteo de OTs por estado para las tarjetas superiores de agrupación
  const estadoCounts = useMemo(() => {
    const counts = { ALL: ordenes.length };
    estadosOt.forEach(e => {
      counts[e.id] = ordenes.filter(o => Number(o.id_estado_ot) === Number(e.id)).length;
    });
    return counts;
  }, [ordenes, estadosOt]);

  const hasActiveFilters = Boolean(
    searchQuery || selectedClienteId || selectedActivoId || selectedTipoActivoId || selectedTipoOtId || (selectedEstadoId !== 'ALL')
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClienteId('');
    setSelectedActivoId('');
    setSelectedTipoActivoId('');
    setSelectedTipoOtId('');
    setSelectedEstadoId('ALL');
  };

  return (
    <div className="glass-panel" style={{ padding: '18px' }}>
      {/* Header Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Listado de Órdenes de Trabajo
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            {filteredOrdenes.length} de {ordenes.length} orden(es) encontrada(s)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Selector de Modo de Visualización */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setDisplayMode('cards')}
              style={{
                background: displayMode === 'cards' ? 'var(--accent-cyan)' : 'transparent',
                color: displayMode === 'cards' ? '#000' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🎴 Tarjetas
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              style={{
                background: displayMode === 'list' ? 'var(--accent-cyan)' : 'transparent',
                color: displayMode === 'list' ? '#000' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📋 Lista
            </button>
          </div>

          <button onClick={onAddNew} className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 14px' }}>
            + Nueva OT
          </button>
        </div>
      </div>

      {/* --- TARJETAS AGRUPADAS POR ESTADOS DE ÓRDENES (INICIAL) --- */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Agrupación por Estados de OT
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '8px' }}>
          <button
            onClick={() => setSelectedEstadoId('ALL')}
            style={{
              background: selectedEstadoId === 'ALL' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: selectedEstadoId === 'ALL' ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '8px 10px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ fontSize: '10px', color: selectedEstadoId === 'ALL' ? '#fff' : 'var(--text-secondary)', fontWeight: 600 }}>
              Todas las OTs
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: selectedEstadoId === 'ALL' ? 'var(--accent-cyan)' : '#fff' }}>
              {estadoCounts['ALL'] || 0}
            </div>
          </button>

          {estadosOt.map(est => {
            const isSelected = Number(selectedEstadoId) === Number(est.id);
            const count = estadoCounts[est.id] || 0;
            return (
              <button
                key={est.id}
                onClick={() => setSelectedEstadoId(est.id)}
                style={{
                  background: isSelected ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '10px', color: isSelected ? '#fff' : 'var(--text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {est.estado}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? 'var(--accent-cyan)' : '#fff' }}>
                  {count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- BARRA DE FILTROS ACUMULABLES --- */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '10px',
        alignItems: 'center'
      }}>
        {/* Filtro por N° / Folio / Título */}
        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
            N° Orden / Folio / Título
          </label>
          <input
            type="text"
            className="form-input"
            style={{ fontSize: '11px', padding: '5px 8px' }}
            placeholder="🔍 Buscar N° OT, folio..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtro por Cliente */}
        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
            Cliente
          </label>
          <select
            className="form-input"
            style={{ fontSize: '11px', padding: '5px 8px' }}
            value={selectedClienteId}
            onChange={e => setSelectedClienteId(e.target.value)}
          >
            <option value="">-- Todos los clientes --</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.cliente}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo de OT */}
        <div>
          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
            Tipo de OT
          </label>
          <select
            className="form-input"
            style={{ fontSize: '11px', padding: '5px 8px' }}
            value={selectedTipoOtId}
            onChange={e => setSelectedTipoOtId(e.target.value)}
          >
            <option value="">-- Todos los tipos --</option>
            {tiposOt.map(t => (
              <option key={t.id} value={t.id}>{t.tipo}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Activo */}
        {activos.length > 0 && (
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
              Activo / Equipo
            </label>
            <select
              className="form-input"
              style={{ fontSize: '11px', padding: '5px 8px' }}
              value={selectedActivoId}
              onChange={e => setSelectedActivoId(e.target.value)}
            >
              <option value="">-- Todos los activos --</option>
              {activos.map(a => (
                <option key={a.id} value={a.id}>#{a.id} - {a.id_identificador || a.modelo_ui || 'Activo'}</option>
              ))}
            </select>
          </div>
        )}

        {/* Filtro por Tipo de Activo */}
        {tiposActivo.length > 0 && (
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
              Tipo de Activo
            </label>
            <select
              className="form-input"
              style={{ fontSize: '11px', padding: '5px 8px' }}
              value={selectedTipoActivoId}
              onChange={e => setSelectedTipoActivoId(e.target.value)}
            >
              <option value="">-- Todos los tipos activo --</option>
              {tiposActivo.map(ta => (
                <option key={ta.id} value={ta.id}>{ta.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Botón Limpiar Filtros */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <button
              onClick={resetFilters}
              className="btn btn-secondary"
              style={{ fontSize: '10px', padding: '6px 10px', width: '100%' }}
            >
              🧹 Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* VISTA EN MODO TARJETAS (CARDS) */}
      {displayMode === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filteredOrdenes.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '11px' }}>
              No se encontraron órdenes de trabajo que coincidan con los filtros aplicados.
            </div>
          ) : (
            filteredOrdenes.map(item => {
              const isDeleted = item.eliminado;
              const isSelected = selectedOrdenId === item.id;
              const numInformes = item.total_informes || 0;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectOrden(item)}
                  style={{
                    background: isSelected ? 'rgba(0, 198, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    gap: '10px',
                    cursor: 'pointer',
                    opacity: isDeleted ? 0.6 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    {/* Header Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: isDeleted ? '#f87171' : 'var(--accent-cyan)' }}>
                        #{item.id} {item.folio ? `— ${item.folio}` : ''}
                      </span>
                      {isDeleted ? (
                        <span className="badge badge-danger" style={{ fontSize: '9px', padding: '2px 6px' }}>🗑️ Eliminada</span>
                      ) : (
                        <span className="badge badge-active" style={{ fontSize: '9px', padding: '2px 6px' }}>{item.estado_ot_nombre || 'Activa'}</span>
                      )}
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '10px', lineHeight: '1.3' }}>
                      {item.titulo_ot}
                    </div>

                    {/* Info Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
                      <div style={{ color: 'var(--text-primary)' }}>
                        🏢 <strong>Cliente:</strong> {item.cliente_nombre || 'N/A'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        👤 <strong>Técnico:</strong> {item.usuario_nombre || 'Sin asignar'}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        📅 <strong>Programación:</strong> {formatDate(item.fecha_programacion)}
                      </div>
                      {item.activos_asociados && item.activos_asociados.length > 0 && (
                        <div style={{ color: 'var(--accent-cyan)', fontSize: '10px', marginTop: '2px' }}>
                          ⚡ {item.activos_asociados.length} activo(s) vinculado(s)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions & Reports */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {numInformes > 0 ? (
                        <button
                          onClick={(e) => handleOpenReportsModal(e, item)}
                          style={{
                            background: 'rgba(6, 182, 212, 0.15)',
                            border: '1px solid rgba(6, 182, 212, 0.35)',
                            color: 'var(--accent-cyan)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            fontSize: '10px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          📄 {numInformes} {numInformes === 1 ? 'Informe' : 'Informes'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sin informes</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => onSelectOrden(item)} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '10px' }}>
                        ✏️ Editar
                      </button>
                      {isDeleted ? (
                        isAdmin && (
                          <button onClick={() => onRestore(item.id)} className="btn btn-primary" style={{ padding: '3px 6px', fontSize: '10px' }}>
                            🔄
                          </button>
                        )
                      ) : (
                        <button onClick={() => onDelete(item.id)} className="btn btn-danger" style={{ padding: '3px 6px', fontSize: '10px' }}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* VISTA EN MODO LISTA (TABLA COMPACTA) */
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase' }}>FOLIO</th>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase' }}>TÍTULO / TRABAJO</th>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase' }}>CLIENTE</th>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase' }}>TÉCNICO</th>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase' }}>PROGRAMACIÓN</th>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase' }}>INFORMES</th>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase' }}>ESTADO</th>
                <th style={{ padding: '8px 6px', fontSize: '10px', textTransform: 'uppercase', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrdenes.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    No se encontraron órdenes de trabajo que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOrdenes.map(item => {
                  const isDeleted = item.eliminado;
                  const isSelected = selectedOrdenId === item.id;
                  const numInformes = item.total_informes || 0;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectOrden(item)}
                      style={{
                        cursor: 'pointer',
                        opacity: isDeleted ? 0.55 : 1,
                        background: isSelected
                          ? 'rgba(0, 198, 255, 0.15)'
                          : isDeleted ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '6px 6px' }}>
                        <span style={{ fontWeight: 700, color: isDeleted ? '#f87171' : 'var(--accent-cyan)', fontSize: '11px' }}>
                          #{item.id}
                        </span>
                      </td>
                      <td style={{ padding: '6px 6px' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '11px' }}>
                          {item.folio || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '6px 6px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '11px' }}>
                          {item.titulo_ot}
                        </span>
                      </td>
                      <td style={{ padding: '6px 6px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                          🏢 {item.cliente_nombre || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '6px 6px', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          👤 {item.usuario_nombre || 'Sin asignar'}
                        </span>
                      </td>
                      <td style={{ padding: '6px 6px', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          📅 {formatDate(item.fecha_programacion)}
                        </span>
                      </td>
                      <td style={{ padding: '6px 6px' }}>
                        {numInformes > 0 ? (
                          <button
                            onClick={(e) => handleOpenReportsModal(e, item)}
                            style={{
                              background: 'rgba(6, 182, 212, 0.12)',
                              border: '1px solid rgba(6, 182, 212, 0.3)',
                              color: 'var(--accent-cyan)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Ver informe(s) técnico(s)"
                          >
                            📄 {numInformes} {numInformes === 1 ? 'Informe' : 'Informes'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 6px' }}>
                        {isDeleted ? (
                          <span className="badge badge-danger" style={{ fontSize: '9px', padding: '2px 5px' }}>
                            🗑️ Eliminada
                          </span>
                        ) : (
                          <span className="badge badge-active" style={{ fontSize: '9px', padding: '2px 5px' }}>
                            {item.estado_ot_nombre || 'Activa'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '6px 6px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => onSelectOrden(item)} className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                            ✏️
                          </button>
                          {isDeleted ? (
                            isAdmin && (
                              <button onClick={() => onRestore(item.id)} className="btn btn-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                                🔄
                              </button>
                            )
                          ) : (
                            <button onClick={() => onDelete(item.id)} className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '10px' }}>
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
      )}

      {/* Modal de Previsualización de Informes Técnicos */}
      {reportModalOrden && (
        <InformeOtModalView
          orden={reportModalOrden}
          onClose={() => setReportModalOrden(null)}
        />
      )}
    </div>
  );
}
