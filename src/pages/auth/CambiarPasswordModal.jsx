import React, { useState } from 'react';
import { cambiarPasswordApi } from '../../api/auth.api';

export default function CambiarPasswordModal({ usuarioId, onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState('Vrf12345');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword === 'Vrf12345') {
      setError('Debes elegir una contraseña diferente a la clave inicial por defecto (Vrf12345)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('La confirmación de la contraseña no coincide');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await cambiarPasswordApi(usuarioId, currentPassword, newPassword);
      onPasswordChanged();
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
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔒</div>
          <h3 style={{ fontSize: '20px', color: '#ffffff' }}>Cambio Obligatorio de Contraseña</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Esta es tu primera vez ingresando o tu clave fue restablecida. Por seguridad debes establecer una nueva contraseña.
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Contraseña Actual (Por defecto: Vrf12345)</label>
            <input
              type="password"
              className="form-input"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '16px' }}
          >
            {isSubmitting ? 'Actualizando...' : '💾 Actualizar Contraseña e Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
