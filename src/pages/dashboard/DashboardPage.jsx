import React, { useState, useEffect, useMemo } from 'react';
import { fetchOrdenesTrabajo } from '../../api/ordenTrabajo.api';
import { fetchClientes } from '../../api/clientes.api';
import { fetchActivos } from '../../api/activo.api';
import { fetchUsuarios } from '../../api/usuarios.api';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = keyFn(item) || 'Sin clasificar';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

const OT_STATE_COLORS = {
  default: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.5)', text: '#a5b4fc', icon: '📋' },
  pendiente: { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.5)', text: '#fbbf24', icon: '⏳' },
  activa: { bg: 'rgba(0,198,255,0.15)', border: 'rgba(0,198,255,0.5)', text: '#00c6ff', icon: '🔧' },
  'en proceso': { bg: 'rgba(0,198,255,0.15)', border: 'rgba(0,198,255,0.5)', text: '#00c6ff', icon: '⚙️' },
  cerrada: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(52,211,153,0.5)', text: '#34d399', icon: '✅' },
  completada: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(52,211,153,0.5)', text: '#34d399', icon: '✅' },
  cancelada: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.5)', text: '#f87171', icon: '❌' },
  pausada: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.5)', text: '#c084fc', icon: '⏸️' },
};

function getOtColor(stateName) {
  if (!stateName) return OT_STATE_COLORS.default;
  const key = stateName.toLowerCase().trim();
  for (const [k, v] of Object.entries(OT_STATE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return OT_STATE_COLORS.default;
}

const PALETTE = [
  '#00c6ff', '#7c3aed', '#22c55e', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#a855f7'
];

// ─── Subcomponentes ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sublabel, color = '#00c6ff', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, rgba(15,25,50,0.85), rgba(10,18,41,0.7))',
        border: `1px solid ${color}44`,
        borderRadius: '16px',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 8px 28px ${color}33`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      }}
    >
      {/* Glow decorativo */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: `${color}18`, filter: 'blur(20px)', pointerEvents: 'none'
      }} />

      <div style={{ fontSize: '26px' }}>{icon}</div>
      <div style={{ fontSize: '32px', fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{label}</div>
      {sublabel && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sublabel}</div>
      )}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: 0 }}>{title}</h2>
      </div>
      {subtitle && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 30px' }}>{subtitle}</p>
      )}
    </div>
  );
}

function GroupedBarCard({ title, icon, data, color, onClickItem }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{title}</span>
        </div>
        <span style={{
          background: `${color}22`, color, border: `1px solid ${color}55`,
          borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 700
        }}>
          Total: {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sorted.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
            Sin datos registrados
          </div>
        ) : sorted.map(([name, count], idx) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const barColor = PALETTE[idx % PALETTE.length];
          return (
            <div
              key={name}
              onClick={() => onClickItem && onClickItem(name)}
              style={{ cursor: onClickItem ? 'pointer' : 'default' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{name}</span>
                <span style={{ fontSize: '12px', color: barColor, fontWeight: 700 }}>{count} ({pct}%)</span>
              </div>
              <div style={{
                height: '8px', borderRadius: '4px',
                background: 'rgba(255,255,255,0.07)',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: '4px',
                  background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`,
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                  minWidth: pct > 0 ? '6px' : '0'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OtStateCard({ stateName, count, total, onClick }) {
  const colors = getOtColor(stateName);
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '14px',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 24px ${colors.border}55`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '24px' }}>{colors.icon}</span>
        <span style={{
          fontSize: '28px', fontWeight: 800, color: colors.text, lineHeight: 1
        }}>{count}</span>
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
          {stateName}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pct}% del total</div>
      </div>
      {/* Mini progress bar */}
      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: '2px',
          background: colors.text,
          transition: 'width 0.8s ease',
          minWidth: pct > 0 ? '4px' : '0'
        }} />
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export default function DashboardPage({ userSession, onNavigate }) {
  const [data, setData] = useState({
    ordenes: [],
    clientes: [],
    activos: [],
    usuarios: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordenes, clientes, activos, usuarios] = await Promise.all([
        fetchOrdenesTrabajo(),
        fetchClientes(),
        fetchActivos(),
        fetchUsuarios()
      ]);
      setData({ ordenes, clientes, activos, usuarios });
      setLastRefresh(new Date());
    } catch (err) {
      setError('No se pudo cargar la información del dashboard. Intente nuevamente.');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Cómputos derivados ──
  const stats = useMemo(() => {
    const { ordenes, clientes, activos, usuarios } = data;

    // OT por estado
    const otPorEstado = groupBy(ordenes, o => o.estado_ot_nombre);

    // Clientes por tipo
    const clientesPorTipo = groupBy(
      clientes.filter(c => !c.eliminado),
      c => c.tipo_cliente_nombre || 'Sin Tipo'
    );

    // Clientes por marca/categoría
    const clientesPorMarca = groupBy(
      clientes.filter(c => !c.eliminado),
      c => c.categoria_cliente_nombre || 'Sin Categoría'
    );

    // Activos por marca
    const activosPorMarca = groupBy(
      activos.filter(a => !a.eliminado),
      a => a.marca_activo_nombre || 'Sin Marca'
    );

    // Usuarios técnicos (roles que contengan "tecnico" o "técnico")
    const tecnicoKeyword = ['tecnico', 'técnico', 'techni'];
    const tecnicosFiltrados = usuarios.filter(u => {
      const roles = u.roles || [];
      return roles.some(r => {
        const rName = (r.nombre || '').toLowerCase();
        return tecnicoKeyword.some(k => rName.includes(k));
      });
    });

    // Usuarios por rol (todos los roles)
    const usuariosPorRol = {};
    usuarios.filter(u => !u.eliminado).forEach(u => {
      (u.roles || []).forEach(r => {
        const rn = r.nombre || 'Sin Rol';
        usuariosPorRol[rn] = (usuariosPorRol[rn] || 0) + 1;
      });
    });

    return {
      totalOt: ordenes.length,
      otPorEstado,
      totalClientes: clientes.filter(c => !c.eliminado).length,
      clientesPorTipo,
      clientesPorMarca,
      totalActivos: activos.filter(a => !a.eliminado).length,
      activosPorMarca,
      totalTecnicos: tecnicosFiltrados.length,
      usuariosPorRol,
      totalUsuarios: usuarios.filter(u => !u.eliminado).length,
    };
  }, [data]);

  const userName = userSession?.usuario?.nombre || userSession?.usuario?.username || 'Usuario';
  const roleName = userSession?.activeRole?.nombre || '';

  // ── Hora del día ──
  const hora = new Date().getHours();
  const greeting = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
        <div style={{
          width: '48px', height: '48px', border: '3px solid rgba(0,198,255,0.2)',
          borderTopColor: '#00c6ff', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Cargando dashboard…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* ── Bienvenida ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,114,255,0.18), rgba(0,198,255,0.08))',
        border: '1px solid rgba(0,198,255,0.25)',
        borderRadius: '18px',
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {greeting}, {userName} 👋
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            Panel de Control
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
            Resumen general del sistema VRF Systems
            {roleName && <span style={{ marginLeft: '8px', color: 'var(--accent-cyan)', fontWeight: 600 }}>· {roleName}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {lastRefresh && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Actualizado: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadData}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Métricas Globales ── */}
      <div>
        <SectionTitle icon="📊" title="Resumen General" subtitle="Totales registrados en el sistema" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
          <StatCard
            icon="📋" label="Órdenes de Trabajo" value={stats.totalOt}
            sublabel={`${Object.keys(stats.otPorEstado).length} estado(s) distintos`}
            color="#00c6ff" onClick={() => onNavigate('ordenes_trabajo')}
          />
          <StatCard
            icon="🏢" label="Clientes Activos" value={stats.totalClientes}
            sublabel={`${Object.keys(stats.clientesPorTipo).length} tipo(s) de cliente`}
            color="#7c3aed" onClick={() => onNavigate('clientes')}
          />
          <StatCard
            icon="🔩" label="Activos / Equipos" value={stats.totalActivos}
            sublabel={`${Object.keys(stats.activosPorMarca).length} marca(s) registradas`}
            color="#22c55e" onClick={() => onNavigate('activos')}
          />
          <StatCard
            icon="👷" label="Técnicos Registrados" value={stats.totalTecnicos}
            sublabel={`de ${stats.totalUsuarios} usuario(s) total`}
            color="#f59e0b" onClick={() => onNavigate('usuarios')}
          />
        </div>
      </div>

      {/* ── OT por Estado ── */}
      <div>
        <SectionTitle
          icon="🗂️"
          title="Órdenes de Trabajo por Estado"
          subtitle={`${stats.totalOt} órdenes en total — haz clic en una tarjeta para ir al listado`}
        />
        {Object.keys(stats.otPorEstado).length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No hay órdenes de trabajo registradas.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {Object.entries(stats.otPorEstado)
              .sort((a, b) => b[1] - a[1])
              .map(([state, count]) => (
                <OtStateCard
                  key={state}
                  stateName={state}
                  count={count}
                  total={stats.totalOt}
                  onClick={() => onNavigate('ordenes_trabajo')}
                />
              ))
            }
          </div>
        )}
      </div>

      {/* ── Clientes ── */}
      <div>
        <SectionTitle icon="👥" title="Clientes" subtitle="Distribución por tipo y categoría de marca" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          <GroupedBarCard
            title="Por Tipo de Cliente"
            icon="🏷️"
            data={stats.clientesPorTipo}
            color="#7c3aed"
            onClickItem={() => onNavigate('clientes')}
          />
          <GroupedBarCard
            title="Por Marca / Categoría"
            icon="🏭"
            data={stats.clientesPorMarca}
            color="#ec4899"
            onClickItem={() => onNavigate('clientes')}
          />
        </div>
      </div>

      {/* ── Activos ── */}
      <div>
        <SectionTitle icon="🔩" title="Activos / Equipos" subtitle="Distribución por marca de equipo" />
        <GroupedBarCard
          title="Activos por Marca"
          icon="⚙️"
          data={stats.activosPorMarca}
          color="#22c55e"
          onClickItem={() => onNavigate('activos')}
        />
      </div>

      {/* ── Usuarios por Rol ── */}
      <div>
        <SectionTitle icon="👤" title="Usuarios por Rol" subtitle="Distribución de roles asignados en el sistema" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          <GroupedBarCard
            title="Usuarios por Rol"
            icon="🔐"
            data={stats.usuariosPorRol}
            color="#f59e0b"
            onClickItem={() => onNavigate('usuarios')}
          />

          {/* Tarjeta resumen técnicos */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px'
              }}>👷</div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
                  {stats.totalTecnicos}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Técnicos Registrados</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Con rol de técnico en el sistema
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Proporción técnicos / total usuarios
              </div>
              <div style={{ height: '10px', borderRadius: '5px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: stats.totalUsuarios > 0 ? `${Math.round((stats.totalTecnicos / stats.totalUsuarios) * 100)}%` : '0%',
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                  borderRadius: '5px',
                  transition: 'width 0.8s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
                  {stats.totalUsuarios > 0 ? Math.round((stats.totalTecnicos / stats.totalUsuarios) * 100) : 0}% técnicos
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {stats.totalUsuarios} usuarios totales
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('usuarios')}
              className="btn btn-secondary"
              style={{ fontSize: '12px', marginTop: '4px' }}
            >
              Ver Usuarios →
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
