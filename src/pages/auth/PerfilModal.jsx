import React, { useState, useEffect } from 'react';
import { updateUsuario } from '../../api/usuarios.api';
import { cambiarPasswordApi } from '../../api/auth.api';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function PerfilModal({ userSession, onClose, onProfileUpdated }) {
  const usuario = userSession?.usuario || {};
  const [activeTab, setActiveTab] = useState('datos');

  const [telefono, setTelefono] = useState(usuario.telefono || '');
  const [fotoUrl, setFotoUrl] = useState(usuario.foto_url || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (usuario) {
      setTelefono(usuario.telefono || '');
      setFotoUrl(usuario.foto_url || '');
    }
  }, [usuario]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE_URL}/upload/usuario`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error al subir la imagen al servidor');
      }

      const json = await res.json();
      if (json.success && json.url) {
        setFotoUrl(json.url);
        setSuccess('Fotografía guardada en servidor correctamente');
      }
    } catch (err) {
      setError(err.message || 'Error al subir la fotografía');
    }
  };

  const handleSaveDatos = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const updatedUser = await updateUsuario(usuario.id, {
        telefono,
        foto_url: fotoUrl
      });
      
      setSuccess('Perfil actualizado con éxito');
      onProfileUpdated({
        ...usuario,
        ...updatedUser,
        telefono,
        foto_url: fotoUrl
      });
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

  const fullFotoUrl = fotoUrl && fotoUrl.startsWith('/') ? `${BACKEND_URL}${fotoUrl}` : fotoUrl;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              {fullFotoUrl ? (
                <img
                  src={fullFotoUrl}
                  alt="Avatar"
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--accent-cyan)',
                    boxShadow: '0 0 12px rgba(0, 198, 255, 0.4)'
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#ffffff'
                }}>
                  {(usuario.nombre || 'US').substring(0, 2).toUpperCase()}
                </div>
              )}
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
            👤 Datos y Fotografía
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

        {/* Tab 1: Datos y Fotografía */}
        {activeTab === 'datos' && (
          <form onSubmit={handleSaveDatos}>
            <div className="form-group" style={{ background: 'rgba(10, 18, 41, 0.5)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>📷 Foto de Perfil (Guardada en /uploads/usuarios/)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="profile-photo-input"
                />
                <label htmlFor="profile-photo-input" className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '12px' }}>
                  📁 Seleccionar / Subir Imagen
                </label>
                {fotoUrl && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
                    {fotoUrl}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Nombre Completo <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(No editable)</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={usuario.nombre || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.03)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Correo Electrónico <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(No editable)</span>
              </label>
              <input
                type="email"
                className="form-input"
                value={usuario.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255, 255, 255, 0.03)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Contacto (Editable)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+56 9 1234 5678"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roles Asignados (Desde Base de Datos)</label>
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
                {isSubmitting ? 'Guardando...' : '💾 Guardar Foto y Datos'}
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
