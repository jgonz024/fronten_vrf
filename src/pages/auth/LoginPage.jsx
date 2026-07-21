import React, { useState } from 'react';
import { loginApi, solicitarRecuperacionApi } from '../../api/auth.api';
import logoImg from '../../assets/images/logo.png';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'recovery'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsSubmitting(true);
    try {
      const data = await loginApi(email, password);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsSubmitting(true);
    try {
      const res = await solicitarRecuperacionApi(email);
      setInfo(res.message || 'Se han enviado las instrucciones a su correo.');
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 30%, rgba(0, 198, 255, 0.1) 0%, transparent 60%), #0b1329'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 0 24px rgba(0, 198, 255, 0.35)',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '16px'
          }}>
            <img
              src={logoImg}
              alt="VRF Systems Logo"
              style={{ height: '48px', objectFit: 'contain' }}
            />
            <span style={{
              fontSize: '10px',
              color: '#0072ff',
              letterSpacing: '0.12em',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              SUPPORT MANAGEMENT
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Acceso al Sistema de Gestión & Soporte Técnico
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {info && (
          <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '13px', marginBottom: '20px' }}>
            ℹ️ {info}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="usuario@vrfsystems.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setMode('recovery')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '12px' }}>
              {isSubmitting ? 'Iniciando sesión...' : '🔐 Ingresar al Sistema'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecoverySubmit}>
            <h4 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '8px' }}>Recuperación de Contraseña</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Ingresa tu correo para recibir un enlace seguro de restablecimiento.
            </p>

            <div className="form-group">
              <label className="form-label">Correo Electrónico Registrado</label>
              <input
                type="email"
                className="form-input"
                placeholder="ejemplo@vrfsystems.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '12px' }}>
              {isSubmitting ? 'Enviando...' : '📧 Enviar Instrucciones por Email'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '10px' }}
            >
              ← Volver al Inicio de Sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
