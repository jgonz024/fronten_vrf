import React, { useState, useEffect } from 'react';
import { updateUsuario } from '../../api/usuarios.api';
import { cambiarPasswordApi } from '../../api/auth.api';

export default function PerfilModal({ userSession, onClose, onProfileUpdated }) {
  const usuario = userSession?.usuario || {};
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'password'

  // Formulario de datos personales
  const [nombre, setNombre] = useState(usuario.nombre || '');
  const [email, setEmail] = useState(usuario.email || '');
  const [telefono, setTelefono] = useState(usuario.telefono || '');

  // Formulario de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || '');
      setEmail(usuario.email || '');
      setTelefono(usuario.telefono || '');
    }
  }, [usuario]);

  const handleSaveDatos = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      setError('El nombre y el correo electrónico son requeridos');
      return;
    }
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const updatedUser = await updateUsuario(usuario.id, {
        nombre,
        email,
        telefono,
        activo: usuario.activo ?? true
      });
      setSuccess('Perfil actualizado con éxito');
      onProfileUpdated({ ...usuario, ...updatedUser, nombre, email, telefono });
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('Debes ingresar tu contraseña actual');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmación de la contraseña no coincide');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await cambiarPasswordApi(usuario.id, currentPassword, newPassword);
      setSuccess('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 10, 22, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '32px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
              color: '#ffffff'
            }}>
              {(nombre || 'US').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '18px', color: '#ffffff' }}>Mi Perfil de Usuario</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID #{usuario.id} • {usuario.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
            ✕ Cerrar
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <button
            onClick={() => { setActiveTab('datos'); setError(''); setSuccess(''); }}
            className={`btn ${activeTab === 'datos' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            👤 Datos Personales
          </button>
          <button
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            🔒 Cambiar Contraseña
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '13px', marginBottom: '16px' }}>
            ✓ {success}
          </div>
        )}

        {/* Tab 1: Datos Personales */}
        {activeTab === 'datos' && (
          <form onSubmit={handleSaveDatos}>
            <div className="form-group">
              <label className="form-label">Nombre Completo *</label>
              <input
                type="text"
                className="form-input"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input
                type="text"
                className="form-input"
                placeholder="+56 9 1234 5678"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roles Asignados (Lectura)</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {usuario.roles && usuario.roles.length > 0 ? (
                  usuario.roles.map(r => (
                    <span key={r.id || r.nombre} className="badge badge-role">
                      🔑 {r.nombre}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sin rol asignado</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Guardando...' : '💾 Guardar Datos'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Cambiar Contraseña */}
        {activeTab === 'password' && (
          <form onSubmit={handleSavePassword}>
            <div className="form-group">
              <label className="form-label">Contraseña Actual *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Ingresa tu clave actual"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nueva Contraseña *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Nueva Contraseña *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? 'Actualizando...' : '💾 Actualizar Contraseña'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
