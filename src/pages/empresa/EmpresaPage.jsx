import React, { useState, useEffect } from 'react';
import { fetchEmpresa, saveEmpresa } from '../../api/empresa.api';
import logoImg from '../../assets/images/logo.png';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const formatFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default function EmpresaPage({ userSession, onClose }) {
  const activeRoleName = (
    userSession?.activeRole?.nombre || 
    userSession?.usuario?.roles?.[0]?.nombre || 
    ''
  ).toUpperCase().trim();

  const isAdmin = !activeRoleName || activeRoleName === 'ADMINISTRADOR' || activeRoleName === 'ADMIN';

  const [empresaId, setEmpresaId] = useState(null);
  const [formData, setFormData] = useState({
    rut: '',
    razon_social: '',
    direccion: '',
    giro: '',
    telefono_contacto: '',
    email: '',
    logo_url: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadEmpresaData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: '#fca5a5', fontSize: '13px' }}>
        ⚠️ Acceso denegado. Solo los usuarios con el rol <strong>ADMINISTRADOR</strong> tienen permiso para acceder a la configuración de la empresa.
      </div>
    );
  }

  const loadEmpresaData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchEmpresa();
      if (data) {
        setEmpresaId(data.id);
        setFormData({
          rut: data.rut || '',
          razon_social: data.razon_social || '',
          direccion: data.direccion || '',
          giro: data.giro || '',
          telefono_contacto: data.telefono_contacto || '',
          email: data.email || '',
          logo_url: data.logo_url || '/uploads/empresa/logo/logo.png'
        });
      } else {
        // Formulario inicial de creación: Ya contiene la imagen existente logo.png por defecto
        setFormData(prev => ({
          ...prev,
          logo_url: '/uploads/empresa/logo/logo.png'
        }));
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return null;

    // Validación estricta de formato PNG
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    if (!isPng) {
      throw new Error('El logo de la empresa debe ser únicamente una imagen en formato PNG (.png)');
    }

    const body = new FormData();
    body.append('file', file);

    const res = await fetch(`${BACKEND_URL}/api/upload?type=empresa_logo`, {
      method: 'POST',
      body
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Error al procesar el archivo del logo PNG');
    }
    return json.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      let currentLogoUrl = formData.logo_url || '/uploads/empresa/logo/logo.png';

      if (logoFile) {
        const uploadedUrl = await handleLogoUpload(logoFile);
        if (uploadedUrl) {
          currentLogoUrl = uploadedUrl;
        }
      }

      const payload = {
        ...formData,
        logo_url: currentLogoUrl
      };

      const saved = await saveEmpresa(payload);
      setEmpresaId(saved.id);
      setFormData({
        rut: saved.rut || '',
        razon_social: saved.razon_social || '',
        direccion: saved.direccion || '',
        giro: saved.giro || '',
        telefono_contacto: saved.telefono_contacto || '',
        email: saved.email || '',
        logo_url: saved.logo_url || '/uploads/empresa/logo/logo.png'
      });
      setLogoFile(null);
      setSuccessMsg('✅ Datos de la empresa guardados correctamente en /src/assets/images/logo.png y base de datos.');
    } catch (err) {
      setError(err.message || 'Error al guardar datos de la empresa');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Cargando datos de la empresa...
      </div>
    );
  }

  // Resolver la URL de la imagen actual a mostrar con fallback garantizado a logoImg
  const displayLogoSrc = logoFile
    ? URL.createObjectURL(logoFile)
    : (formData.logo_url && formData.logo_url !== '/uploads/empresa/logo/logo.png'
       ? `${formatFileUrl(formData.logo_url)}?v=${Date.now()}`
       : logoImg);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              🏢 {empresaId ? 'Editar Datos de la Empresa' : 'Registrar Datos de la Empresa'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {empresaId ? 'Actualiza la información oficial y logotipo de la empresa.' : 'Registra por primera vez los datos oficiales de la empresa.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-active" style={{ fontSize: '10px', padding: '4px 8px' }}>
              {empresaId ? 'Registro Único Estructurado' : 'Nuevo Registro'}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Cerrar vista"
              >
                ✕ Cerrar
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '16px', fontSize: '12px' }}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-sm)', color: '#6ee7b7', marginBottom: '16px', fontSize: '12px' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* RUT */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>RUT de la Empresa *</label>
              <input
                type="text"
                className="form-input"
                value={formData.rut}
                onChange={e => setFormData({ ...formData, rut: e.target.value })}
                placeholder="Ej. 76.543.210-9"
                required
              />
            </div>

            {/* Razón Social */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Razón Social *</label>
              <input
                type="text"
                className="form-input"
                value={formData.razon_social}
                onChange={e => setFormData({ ...formData, razon_social: e.target.value })}
                placeholder="Ej. VRF Systems SpA"
                required
              />
            </div>
          </div>

          {/* Teléfono + Email de Contacto */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>📞 Teléfono de Contacto</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefono_contacto}
                onChange={e => setFormData({ ...formData, telefono_contacto: e.target.value })}
                placeholder="Ej. +56 9 1234 5678"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>✉️ Email de Contacto</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej. contacto@vrfsystems.cl"
              />
            </div>
          </div>

          {/* Giro Comercial */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>🏭 Giro Comercial</label>
            <input
              type="text"
              className="form-input"
              value={formData.giro}
              onChange={e => setFormData({ ...formData, giro: e.target.value })}
              placeholder="Ej. Climatización, Calefacción y Servicios Técnicos"
            />
          </div>

          {/* Dirección */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>📍 Dirección Matriz / Oficina</label>
            <input
              type="text"
              className="form-input"
              value={formData.direccion}
              onChange={e => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Ej. Av. Providencia 1234, Oficina 501, Santiago"
            />
          </div>

          {/* Imagen del Logo de la Empresa (Sólo PNG) */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', marginTop: '4px' }}>
            <label className="form-label" style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
              📷 Logotipo de la Empresa (Archivo logo.png - Únicamente formato PNG)
            </label>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
              Seleccione la nueva imagen corporativa en formato PNG (.png). Se actualizará como <strong>logo.png</strong> en <code>/src/assets/images/logo.png</code>.
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input
                type="file"
                accept="image/png"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
                    if (!isPng) {
                      setError('El logo de la empresa debe ser únicamente un archivo en formato PNG (.png).');
                      e.target.value = '';
                      return;
                    }
                    setError('');
                    setLogoFile(file);
                  }
                }}
                style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
              />

              <div style={{ position: 'relative', border: '1px solid rgba(0, 198, 255, 0.4)', borderRadius: '6px', padding: '4px', background: 'rgba(255,255,255,0.04)', height: '65px', width: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={displayLogoSrc}
                  alt="Logo Empresa"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = logoImg;
                  }}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 16px' }}
              >
                ✕ Cerrar
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '8px 20px' }}
            >
              {saving ? '💾 Guardando...' : (empresaId ? '💾 Guardar Datos de Empresa' : '✨ Crear Datos de Empresa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
