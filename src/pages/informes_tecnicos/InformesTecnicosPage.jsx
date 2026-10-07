import React, { useState, useEffect, useMemo } from 'react';
import { fetchDosieres, deleteDosier, restoreDosier, fetchDosierById } from '../../api/dosierInformeTecnico.api';
import { fetchEmpresa } from '../../api/empresa.api';
import { exportDosierPdf } from '../../utils/exportDosierPdf';
import DosierAddModal from './DosierAddModal';
import DosierViewModal from './DosierViewModal';
import DosierEmailModal from './DosierEmailModal';

export default function InformesTecnicosPage({ userSession }) {
  const [dosieres, setDosieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [empresa, setEmpresa] = useState(null);

  // Filtros
  const [searchText, setSearchText] = useState('');
  const [filterEmailStatus, setFilterEmailStatus] = useState('ALL'); // ALL, SENT, PENDING
  const [viewMode, setViewMode] = useState('cards'); // 'cards' o 'table'

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDosierId, setSelectedDosierId] = useState(null);
  const [emailModalDosier, setEmailModalDosier] = useState(null);

  const activeRoleName = (
    userSession?.activeRole?.nombre ||
    userSession?.usuario?.roles?.[0]?.nombre ||
    ''
  ).toUpperCase().trim();

  const isAdmin = !activeRoleName || activeRoleName === 'ADMINISTRADOR' || activeRoleName === 'ADMIN';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dData, empData] = await Promise.all([
        fetchDosieres(false),
        fetchEmpresa().catch(() => null)
      ]);
      setDosieres(dData || []);
      setEmpresa(empData);
    } catch (err) {
      setError(err.message || 'Error al cargar informes técnicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado reactivo
  const filteredDosieres = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return dosieres.filter(d => {
      const matchText = !q ||
        (d.folio && d.folio.toLowerCase().includes(q)) ||
        (d.titulo && d.titulo.toLowerCase().includes(q)) ||
        (d.cliente_nombre && d.cliente_nombre.toLowerCase().includes(q)) ||
        (d.cliente_rut && d.cliente_rut.toLowerCase().includes(q));

      const matchEmail =
        filterEmailStatus === 'ALL' ||
        (filterEmailStatus === 'SENT' && d.email_enviado) ||
        (filterEmailStatus === 'PENDING' && !d.email_enviado);

      return matchText && matchEmail;
    });
  }, [dosieres, searchText, filterEmailStatus]);

  // Métricas
  const totalInformes = dosieres.length;
  const totalOtsConsolidadas = dosieres.reduce((acc, d) => acc + (d.total_ots || 0), 0);
  const totalEnviados = dosieres.filter(d => d.email_enviado).length;
  const clientesUnicos = new Set(dosieres.map(d => d.id_cliente)).size;

  // Acciones directas
  const handleDirectPrintPdf = async (dosier) => {
    try {
      const fullDosier = await fetchDosierById(dosier.id);
      exportDosierPdf({ dosier: fullDosier, empresaData: empresa });
    } catch (err) {
      alert(`Error al generar PDF: ${err.message}`);
    }
  };

  const handleDelete = async (id, folio) => {
    if (!window.confirm(`¿Estás seguro de eliminar el informe técnico ${folio}? Las órdenes de trabajo asociadas quedarán liberadas para otros informes.`)) {
      return;
    }
    try {
      await deleteDosier(id);
      loadData();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '4px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── HEADER Y MÉTRICAS ── */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
              GESTIÓN DE INFORMES TÉCNICOS
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>
              📑 Informes Técnicos y Dosieres de Trabajo
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Genera informes consolidados por cliente reuniendo sus órdenes de trabajo en un único expediente digital con fotos y fichas de servicio.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(0,198,255,0.3)' }}
          >
            ➕ Nuevo Informe Técnico
          </button>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Informes</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{totalInformes}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Clientes con Dosier</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '2px' }}>{clientesUnicos}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>OTs Consolidadas</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{totalOtsConsolidadas}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Enviados por Correo</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>{totalEnviados}</div>
          </div>
        </div>
      </div>

      {/* ── BARRA DE FILTROS ── */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Buscar por folio, título, cliente o RUT..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ maxWidth: '380px', fontSize: '12px' }}
          />

          <select
            className="form-input"
            value={filterEmailStatus}
            onChange={e => setFilterEmailStatus(e.target.value)}
            style={{ width: '180px', fontSize: '12px' }}
          >
            <option value="ALL" style={{ background: '#0b1329' }}>Todos los Estados</option>
            <option value="SENT" style={{ background: '#0b1329' }}>✉️ Enviados por Correo</option>
            <option value="PENDING" style={{ background: '#0b1329' }}>⏳ Pendientes de Envío</option>
          </select>
        </div>

        {/* Toggle vista tarjetas / tabla */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setViewMode('cards')}
            className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '11px' }}
            title="Vista de Tarjetas"
          >
            🗂️ Tarjetas
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '11px' }}
            title="Vista de Tabla"
          >
            📄 Tabla
          </button>
        </div>
      </div>

      {/* ── LISTADO PRINCIPAL ── */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          ⏳ Cargando informes técnicos desde la base de datos MySQL...
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '20px', color: '#fca5a5', background: 'rgba(239,68,68,0.1)' }}>
          ⚠️ {error}
        </div>
      ) : filteredDosieres.length === 0 ? (
        <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📑</div>
          <h3 style={{ fontSize: '16px', color: '#fff', margin: '0 0 6px 0' }}>
            {dosieres.length === 0 ? 'No hay informes técnicos registrados' : 'No hay resultados con los filtros aplicados'}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
            {dosieres.length === 0
              ? 'Comienza generando el primer informe técnico consolidado para un cliente.'
              : 'Intenta limpiar o cambiar los términos de búsqueda.'}
          </p>
          {dosieres.length === 0 && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ fontSize: '12px' }}>
              ➕ Crear Primer Informe Técnico
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* VISTA DE TARJETAS */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredDosieres.map(d => (
            <div
              key={d.id}
              className="glass-panel"
              style={{
                padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(0,198,255,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              {/* Header tarjeta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <span className="badge badge-active" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                  {d.folio}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  📅 {d.fecha_emision}
                </span>
              </div>

              {/* Título y cliente */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                  {d.titulo}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  🏢 {d.cliente_nombre || 'Cliente sin nombre'}
                </div>
                {d.cliente_rut && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    RUT: {d.cliente_rut}
                  </div>
                )}
              </div>

              {/* Badges de estado */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="badge" style={{ fontSize: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                  🔧 {d.total_ots} Órdenes de Trabajo
                </span>
                {d.email_enviado ? (
                  <span className="badge" style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac' }}>
                    ✉️ Enviado
                  </span>
                ) : (
                  <span className="badge" style={{ fontSize: '10px', background: 'rgba(234, 179, 8, 0.15)', color: '#fde047' }}>
                    ⏳ Pendiente envío
                  </span>
                )}
              </div>

              {/* Observaciones breves */}
              {d.observaciones && (
                <div style={{
                  fontSize: '11px', color: 'var(--text-secondary)',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '4px'
                }}>
                  {d.observaciones}
                </div>
              )}

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setSelectedDosierId(d.id)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '11px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  title="Ver detalle del informe"
                >
                  👁️ Ver Detalle
                </button>
                <button
                  onClick={() => handleDirectPrintPdf(d)}
                  className="btn btn-primary"
                  style={{ fontSize: '11px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Abrir e imprimir PDF en el PC"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => setEmailModalDosier(d)}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 10px', border: '1px solid var(--accent-cyan)' }}
                  title="Enviar por correo electrónico"
                >
                  ✉️
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(d.id, d.folio)}
                    className="btn btn-danger"
                    style={{ fontSize: '11px', padding: '6px 8px' }}
                    title="Eliminar dosier"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA DE TABLA */
        <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#111c30', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-cyan)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>FOLIO</th>
                <th style={{ padding: '12px 16px' }}>TÍTULO DEL INFORME</th>
                <th style={{ padding: '12px 16px' }}>CLIENTE</th>
                <th style={{ padding: '12px 16px' }}>FECHA</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>TOTAL OTS</th>
                <th style={{ padding: '12px 16px' }}>ESTADO ENVÍO</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredDosieres.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    {d.folio}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#fff', fontWeight: 600 }}>
                    {d.titulo}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                    {d.cliente_nombre}
                  </td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>
                    {d.fecha_emision}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <span className="badge badge-active" style={{ fontSize: '10px' }}>
                      {d.total_ots} OTs
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {d.email_enviado ? (
                      <span style={{ color: '#34d399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ✓ Enviado
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        ⏳ Pendiente
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedDosierId(d.id)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        title="Ver detalle"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleDirectPrintPdf(d)}
                        className="btn btn-primary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        title="Abrir PDF en PC"
                      >
                        📄
                      </button>
                      <button
                        onClick={() => setEmailModalDosier(d)}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        title="Enviar por email"
                      >
                        ✉️
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(d.id, d.folio)}
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODALES ── */}
      {showAddModal && (
        <DosierAddModal
          userSession={userSession}
          onClose={() => setShowAddModal(false)}
          onCreated={(nuevo) => {
            loadData();
            setSelectedDosierId(nuevo.id);
          }}
        />
      )}

      {selectedDosierId && (
        <DosierViewModal
          dosierId={selectedDosierId}
          onClose={() => setSelectedDosierId(null)}
          onUpdated={loadData}
        />
      )}

      {emailModalDosier && (
        <DosierEmailModal
          dosier={emailModalDosier}
          onClose={() => setEmailModalDosier(null)}
          onSent={loadData}
        />
      )}
    </div>
  );
}
