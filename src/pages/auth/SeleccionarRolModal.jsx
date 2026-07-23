import React, { useState } from 'react';
import logoImg from '../../assets/images/logo.png';

export default function SeleccionarRolModal({ usuario, onConfirmRole }) {
  const ALL_SYSTEM_ROLES = [
    { id: 1, nombre: 'ADMINISTRADOR', descripcion: 'Acceso total a usuarios, roles y configuración' },
    { id: 2, nombre: 'SUPERVISOR', descripcion: 'Gestión de clientes, activos y órdenes de trabajo' },
    { id: 3, nombre: 'TECNICO', descripcion: 'Operación en terreno y ejecución de órdenes' },
    { id: 4, nombre: 'GERENTE DE OPERACIONES', descripcion: 'Supervisión ejecutiva de operaciones y clientes' },
    { id: 5, nombre: 'CLIENTE', descripcion: 'Consulta exclusiva de sus activos y órdenes propias' }
  ];

  // Si el usuario tiene múltiples roles asignados en BD, usamos esos; de lo contrario permitimos elegir entre los roles del sistema
  const userRoles = usuario?.roles && usuario.roles.length > 1 ? usuario.roles : ALL_SYSTEM_ROLES;
  const [selectedRoleId, setSelectedRoleId] = useState(userRoles[0].id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const chosenRole = userRoles.find(r => r.id === Number(selectedRoleId)) || userRoles[0];
    onConfirmRole(chosenRole);
  };

  const getRoleIcon = (nombre) => {
    const n = (nombre || '').toUpperCase();
    if (n.includes('ADMIN')) return '👑';
    if (n.includes('SUPERVISOR')) return '👔';
    if (n.includes('TECNICO') || n.includes('TÉCNICO')) return '👷';
    if (n.includes('GERENTE')) return '📈';
    if (n.includes('CLIENTE')) return '🏢';
    return '🔑';
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 30%, rgba(0, 198, 255, 0.12) 0%, transparent 60%), #0b1329'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '36px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        border: '1px solid rgba(0, 198, 255, 0.35)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Header Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(15, 25, 50, 0.5)',
            padding: '16px 20px',
            borderRadius: '14px',
            border: '1px solid rgba(0, 198, 255, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <img src={logoImg} alt="VRF SYSTEMS" style={{ maxHeight: '44px', objectFit: 'contain' }} />
          </div>

          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.12em' }}>
            AUTENTICACIÓN EXITOSA — SELECCIONA TU ROL
          </div>
          <h2 style={{ fontSize: '20px', color: '#ffffff', margin: '4px 0 0 0', fontWeight: 600 }}>
            Hola, {usuario?.nombre || 'Usuario'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
            Selecciona el rol con el que deseas ingresar a la plataforma:
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {userRoles.map(r => {
              const isSelected = selectedRoleId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(0, 198, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(0, 198, 255, 0.25)' : 'none'
                  }}
                >
                  <input
                    type="radio"
                    name="roleSelection"
                    checked={isSelected}
                    onChange={() => setSelectedRoleId(r.id)}
                    style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '22px' }}>{getRoleIcon(r.nombre)}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--accent-cyan)' : '#ffffff' }}>
                      {r.nombre}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {r.descripcion || 'Perfil de usuario del sistema'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600, marginTop: '6px' }}
          >
            🚀 Entrar al Sistema con perfil {userRoles.find(r => r.id === selectedRoleId)?.nombre || ''}
          </button>
        </form>
      </div>
    </div>
  );
}
