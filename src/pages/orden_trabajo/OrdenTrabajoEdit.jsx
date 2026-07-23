import React, { useState, useEffect } from 'react';
import ClienteSearchPicker from '../admin_ot/ClienteSearchPicker';
import TecnicoSearchPicker from '../admin_ot/TecnicoSearchPicker';
import ActivoSearchPicker from '../admin_ot/ActivoSearchPicker';
import { fetchActivos } from '../../api/activo.api';
import { fetchGastosOt, createGastoOt, deleteGastoOt } from '../../api/gastosOt.api';
import { fetchPausasOt, createPausaOt, updatePausaOt } from '../../api/pausasOt.api';
import { fetchDocumentosAdjuntosOt, createDocumentoAdjuntoOt, deleteDocumentoAdjuntoOt } from '../../api/documentoAdjuntoOt.api';
import { fetchActivosOt, createActivoOt, deleteActivoOt } from '../../api/activosOt.api';
import { fetchTecnicosOt, createTecnicoOt, deleteTecnicoOt } from '../../api/tecnicosOt.api';
import { fetchComentariosOt, createComentarioOt, deleteComentarioOt } from '../../api/comentariosOt.api';
import { fetchImagenesOt, createImagenOt, deleteImagenOt } from '../../api/imagenesOt.api';
import { fetchMensajesOt, createMensajeOt } from '../../api/mensajesOt.api';
import { fetchInformesOt, createInformeOt, updateInformeOt } from '../../api/informeOt.api';
import { fetchImagenesInformeOt, createImagenInformeOt, deleteImagenInformeOt } from '../../api/imagenesInformeOt.api';

export default function OrdenTrabajoEdit({ orden, usuarios, clientes, tiposOt, estadosOt, isAdmin, onSave, onDelete, onRestore, onCancel }) {
  const [activeSubTab, setActiveSubTab] = useState('general'); // 'general' | 'activos' | 'tecnicos' | 'informe' | 'multimedia' | 'gastos' | 'bitacora'

  // General Form State
  const [formData, setFormData] = useState({
    titulo_ot: '', ido: '', folio: '', id_usuario: '', id_tipo_ot: '', id_cliente: '',
    fecha_crecion_ot: '', fecha_programacion: '', tiempo_estimado: 0, id_estado_ot: '',
    tiempo_en_llegar: 0, fecha_inicio: '', fecha_fin: '', ubicacion_ingreso: '',
    ubicacion_egreso: '', horas_parciales: 0, nombre_encargado: '', firma_encargado: '',
    nombre_encargado_direccion: '', telefono_encargado: ''
  });

  // Master Lists for drop-downs
  const [allAssets, setAllAssets] = useState([]);

  // Sub-tab States
  const [otAssets, setOtAssets] = useState([]);
  const [otTechs, setOtTechs] = useState([]);
  const [otExpenses, setOtExpenses] = useState([]);
  const [otDocs, setOtDocs] = useState([]);
  const [otImages, setOtImages] = useState([]);
  const [otPauses, setOtPauses] = useState([]);
  const [otComments, setOtComments] = useState([]);
  const [otMessages, setOtMessages] = useState([]);
  
  // Technical Report State
  const [report, setReport] = useState(null);
  const [reportForm, setReportForm] = useState({ titulo: '', resumen: '', id_tecnico: '' });
  const [reportImages, setReportImages] = useState([]);

  // Sub-tab Form Inputs
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [expenseForm, setExpenseForm] = useState({ explicacion: '', valor: 0 });
  const [docForm, setDocForm] = useState({ nombre_adjunto: '', descripcion: '', file: null });
  const [imageFile, setImageFile] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [reportImageFile, setReportImageFile] = useState(null);

  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  // 1. Initial Populate & Master data load
  useEffect(() => {
    if (orden) {
      setFormData({
        titulo_ot: orden.titulo_ot || '',
        ido: orden.ido || '',
        folio: orden.folio || '',
        id_usuario: orden.id_usuario || '',
        id_tipo_ot: orden.id_tipo_ot || '',
        id_cliente: orden.id_cliente || '',
        fecha_crecion_ot: formatForInput(orden.fecha_crecion_ot),
        fecha_programacion: formatForInput(orden.fecha_programacion),
        tiempo_estimado: orden.tiempo_estimado || 0,
        id_estado_ot: orden.id_estado_ot || '',
        tiempo_en_llegar: orden.tiempo_en_llegar || 0,
        fecha_inicio: formatForInput(orden.fecha_inicio),
        fecha_fin: formatForInput(orden.fecha_fin),
        ubicacion_ingreso: orden.ubicacion_ingreso || '',
        ubicacion_egreso: orden.ubicacion_egreso || '',
        horas_parciales: orden.horas_parciales || 0,
        nombre_encargado: orden.nombre_encargado || '',
        firma_encargado: orden.firma_encargado || '',
        nombre_encargado_direccion: orden.nombre_encargado_direccion || '',
        telefono_encargado: orden.telefono_encargado || ''
      });
      setError('');
      setSuccessInfo('');
      loadSubTabData();
    }
  }, [orden]);

  // Load master assets list
  useEffect(() => {
    fetchActivos(false)
      .then(setAllAssets)
      .catch(console.error);
  }, []);

  // 2. Fetch all child data for tabs
  const loadSubTabData = async () => {
    if (!orden?.id) return;
    try {
      const [assets, techs, expenses, docs, imgs, pauses, comments, msgs, reports] = await Promise.all([
        fetchActivosOt(orden.id),
        fetchTecnicosOt(orden.id),
        fetchGastosOt(orden.id),
        fetchDocumentosAdjuntosOt(orden.id),
        fetchImagenesOt(orden.id),
        fetchPausasOt(orden.id),
        fetchComentariosOt(orden.id),
        fetchMensajesOt(orden.id),
        fetchInformesOt(orden.id)
      ]);

      setOtAssets(assets);
      setOtTechs(techs);
      setOtExpenses(expenses);
      setOtDocs(docs);
      setOtImages(imgs);
      setOtPauses(pauses);
      setOtComments(comments);
      setOtMessages(msgs);

      // Handle technical report
      if (reports && reports.length > 0) {
        const rep = reports[0];
        setReport(rep);
        setReportForm({
          titulo: rep.titulo || '',
          resumen: rep.resumen || '',
          id_tecnico: rep.id_tecnico || ''
        });
        const repImgs = await fetchImagenesInformeOt(rep.id);
        setReportImages(repImgs);
      } else {
        setReport(null);
        setReportForm({ titulo: '', resumen: '', id_tecnico: '' });
        setReportImages([]);
      }

    } catch (err) {
      console.error('Error al cargar datos complementarios de OT:', err);
    }
  };

  // File Upload Helper
  const handleFileUpload = async (file, type) => {
    const fData = new FormData();
    fData.append('file', file);
    const res = await fetch(`/api/upload?type=${type}`, {
      method: 'POST',
      body: fData
    });
    if (!res.ok) throw new Error('Error al subir el archivo');
    const json = await res.json();
    return json.url;
  };

  // --- ACTIONS ---

  // Update OT General Info
  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessInfo('');
    setIsSubmitting(true);
    try {
      const cleanData = {};
      Object.keys(formData).forEach(key => {
        const val = formData[key];
        cleanData[key] = val === '' ? null : val;
      });
      await onSave(orden.id, cleanData);
      setSuccessInfo('✓ Cambios guardados correctamente');
    } catch (err) {
      setError(err.message || 'Error al guardar cambios');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Associated Assets
  const handleAddAsset = async () => {
    if (!selectedAssetId) return;
    try {
      await createActivoOt({
        id_ot: orden.id,
        id_activo: Number(selectedAssetId),
        id_estado_activo: 'Operativo'
      });
      setSelectedAssetId('');
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveAsset = async (id) => {
    if (window.confirm('¿Desasociar este activo de la OT?')) {
      await deleteActivoOt(id);
      await loadSubTabData();
    }
  };

  // Assigned Techs
  const handleAddTech = async () => {
    if (!selectedTechId) return;
    try {
      await createTecnicoOt({
        id_ot: orden.id,
        id_tecnicos: Number(selectedTechId)
      });
      setSelectedTechId('');
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveTech = async (id) => {
    if (window.confirm('¿Desasignar este técnico de la OT?')) {
      await deleteTecnicoOt(id);
      await loadSubTabData();
    }
  };

  // Technical Report
  const handleSaveReport = async (e) => {
    e.preventDefault();
    try {
      if (report) {
        await updateInformeOt(report.id, { id_ot: orden.id, ...reportForm });
      } else {
        await createInformeOt({ id_ot: orden.id, ...reportForm });
      }
      alert('Informe técnico guardado correctamente');
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadReportImage = async () => {
    if (!reportImageFile || !report) return;
    try {
      const url = await handleFileUpload(reportImageFile, 'imagen_informe');
      await createImagenInformeOt({
        id_informe: report.id,
        url_imagen: url
      });
      setReportImageFile(null);
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveReportImage = async (id) => {
    if (window.confirm('¿Eliminar esta imagen del informe?')) {
      await deleteImagenInformeOt(id);
      await loadSubTabData();
    }
  };

  // Multimedia (Docs & Images)
  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!docForm.nombre_adjunto || !docForm.file) return;
    try {
      const url = await handleFileUpload(docForm.file, 'adjunto');
      await createDocumentoAdjuntoOt({
        id_ot: orden.id,
        nombre_adjunto: docForm.nombre_adjunto,
        descripcion: docForm.descripcion,
        url_archivo: url
      });
      setDocForm({ nombre_adjunto: '', descripcion: '', file: null });
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveDoc = async (id) => {
    if (window.confirm('¿Eliminar este documento adjunto?')) {
      await deleteDocumentoAdjuntoOt(id);
      await loadSubTabData();
    }
  };

  const handleAddImage = async () => {
    if (!imageFile) return;
    try {
      const url = await handleFileUpload(imageFile, 'imagen_ot');
      await createImagenOt({
        id_ot: orden.id,
        url_imagen: url
      });
      setImageFile(null);
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveImage = async (id) => {
    if (window.confirm('¿Eliminar esta imagen?')) {
      await deleteImagenOt(id);
      await loadSubTabData();
    }
  };

  // Expenses
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.explicacion || expenseForm.valor <= 0) return;
    try {
      await createGastoOt({
        id_ot: orden.id,
        explicacion: expenseForm.explicacion,
        valor: Number(expenseForm.valor)
      });
      setExpenseForm({ explicacion: '', valor: 0 });
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveExpense = async (id) => {
    if (window.confirm('¿Eliminar este registro de gasto?')) {
      await deleteGastoOt(id);
      await loadSubTabData();
    }
  };

  // Bitacora (Pauses, Comments, Chat Messages)
  const handleTogglePause = async () => {
    const activePause = otPauses.find(p => !p.fin && !p.eliminado);
    try {
      if (activePause) {
        await updatePausaOt(activePause.id, {
          ...activePause,
          fin: new Date().toISOString()
        });
      } else {
        await createPausaOt({
          id_ot: orden.id,
          inicio: new Date().toISOString()
        });
      }
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await createComentarioOt({
        id_ot: orden.id,
        comentario: commentText
      });
      setCommentText('');
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveComment = async (id) => {
    if (window.confirm('¿Eliminar este comentario?')) {
      await deleteComentarioOt(id);
      await loadSubTabData();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await createMensajeOt({
        id_ot: orden.id,
        mensaje: messageText
      });
      setMessageText('');
      await loadSubTabData();
    } catch (err) {
      alert(err.message);
    }
  };

  const isDeleted = orden?.eliminado;
  const isPauseActive = otPauses.some(p => !p.fin && !p.eliminado);

  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      border: '1px solid rgba(0, 198, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.1em' }}>
            GESTIÓN DE ORDEN DE TRABAJO
          </div>
          <h3 style={{ fontSize: '15px', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📝 {orden?.folio || `OT #${orden?.id}`}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDeleted ? (
            isAdmin && (
              <button type="button" onClick={() => onRestore(orden.id)} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                🔄 Restaurar
              </button>
            )
          ) : (
            <button type="button" onClick={() => onDelete(orden.id)} className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '12px' }}>
              🗑️
            </button>
          )}
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>✕</button>
        </div>
      </div>

      {/* Internal Sub-Tabs Navigation */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
        {[
          { id: 'general', label: 'General' },
          { id: 'activos', label: 'Activos' },
          { id: 'tecnicos', label: 'Técnicos' },
          { id: 'informe', label: 'Informe' },
          { id: 'multimedia', label: 'Multimedia' },
          { id: 'gastos', label: 'Gastos' },
          { id: 'bitacora', label: 'Bitácora' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id)}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              background: activeSubTab === t.id ? 'var(--accent-cyan)' : 'transparent',
              color: activeSubTab === t.id ? '#0a1229' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', fontSize: '12px' }}>⚠️ {error}</div>}
      {successInfo && <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '12px' }}>{successInfo}</div>}

      {/* TAB CONTENT */}

      {/* 1. GENERAL */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleGeneralSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(90vh - 180px)', overflowY: 'auto', paddingRight: '8px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px' }}>Título del Trabajo *</label>
            <input type="text" className="form-input" value={formData.titulo_ot} onChange={e => setFormData({ ...formData, titulo_ot: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Folio</label><input type="text" className="form-input" value={formData.folio} onChange={e => setFormData({ ...formData, folio: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>ID AppSheet (ido)</label><input type="text" className="form-input" value={formData.ido} onChange={e => setFormData({ ...formData, ido: e.target.value })} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Cliente *</label>
              <ClienteSearchPicker
                value={formData.id_cliente}
                onChange={val => setFormData({ ...formData, id_cliente: val })}
                placeholder="🔍 Buscar cliente por nombre, RUT..."
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Técnico Principal</label>
              <TecnicoSearchPicker
                value={formData.id_usuario}
                onChange={val => setFormData({ ...formData, id_usuario: val })}
                placeholder="🔍 Buscar técnico por nombre..."
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Tipo de OT *</label>
              <select className="form-input" value={formData.id_tipo_ot} onChange={e => setFormData({ ...formData, id_tipo_ot: e.target.value })} required>
                <option value="">-- Seleccionar --</option>
                {tiposOt.map(t => <option key={t.id} value={t.id}>{t.tipo}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Estado de OT *</label>
              <select className="form-input" value={formData.id_estado_ot} onChange={e => setFormData({ ...formData, id_estado_ot: e.target.value })} required>
                <option value="">-- Seleccionar --</option>
                {estadosOt.map(e => <option key={e.id} value={e.id}>{e.estado}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Fecha Creación</label><input type="datetime-local" className="form-input" value={formData.fecha_crecion_ot} onChange={e => setFormData({ ...formData, fecha_crecion_ot: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Fecha Programación</label><input type="datetime-local" className="form-input" value={formData.fecha_programacion} onChange={e => setFormData({ ...formData, fecha_programacion: e.target.value })} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Tiempo Estimado (Hrs)</label><input type="number" step="any" className="form-input" value={formData.tiempo_estimado} onChange={e => setFormData({ ...formData, tiempo_estimado: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Tiempo en Llegar (Mins)</label><input type="number" className="form-input" value={formData.tiempo_en_llegar} onChange={e => setFormData({ ...formData, tiempo_en_llegar: e.target.value })} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Fecha/Hora Inicio</label><input type="datetime-local" className="form-input" value={formData.fecha_inicio} onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Fecha/Hora Fin</label><input type="datetime-local" className="form-input" value={formData.fecha_fin} onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Ubicación Ingreso</label><input type="text" className="form-input" placeholder="Coordenadas GPS o dirección..." value={formData.ubicacion_ingreso} onChange={e => setFormData({ ...formData, ubicacion_ingreso: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Ubicación Egreso</label><input type="text" className="form-input" placeholder="Coordenadas GPS o dirección..." value={formData.ubicacion_egreso} onChange={e => setFormData({ ...formData, ubicacion_egreso: e.target.value })} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Horas Parciales</label><input type="number" step="any" className="form-input" value={formData.horas_parciales} onChange={e => setFormData({ ...formData, horas_parciales: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Mesa Desarrollo OT</label><input type="text" className="form-input" placeholder="Comentarios de mesa..." value={formData.mesa_desarrollo_ot} onChange={e => setFormData({ ...formData, mesa_desarrollo_ot: e.target.value })} /></div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '8px' }}>
              DATOS DEL ENCARGADO / FIRMA
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Nombre Encargado</label><input type="text" className="form-input" value={formData.nombre_encargado} onChange={e => setFormData({ ...formData, nombre_encargado: e.target.value })} /></div>
              <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Teléfono Encargado</label><input type="text" className="form-input" placeholder="+569..." value={formData.telefono_encargado} onChange={e => setFormData({ ...formData, telefono_encargado: e.target.value })} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Dirección Encargado</label><input type="text" className="form-input" value={formData.nombre_encargado_direccion} onChange={e => setFormData({ ...formData, nombre_encargado_direccion: e.target.value })} /></div>
              <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label" style={{ fontSize: '11px' }}>Firma (URL/Base64)</label><input type="text" className="form-input" placeholder="URL de firma..." value={formData.firma_encargado} onChange={e => setFormData({ ...formData, firma_encargado: e.target.value })} /></div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ fontSize: '12px', marginTop: '10px', alignSelf: 'flex-end' }}>
            {isSubmitting ? 'Guardando...' : '✏️ Guardar Cambios'}
          </button>
        </form>
      )}

      {/* 2. ACTIVOS */}
      {activeSubTab === 'activos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <ActivoSearchPicker
                value={selectedAssetId}
                onChange={setSelectedAssetId}
                placeholder="🔍 Buscar activo por ID, código, modelo, serie..."
              />
            </div>
            <button onClick={handleAddAsset} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Asociar</button>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="data-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Categoría</th>
                  <th>Modelo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {otAssets.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin activos asociados</td></tr>
                ) : (
                  otAssets.map(a => (
                    <tr key={a.id}>
                      <td>{a.id_activo}</td>
                      <td>{a.categoria_activo_nombre || 'N/A'}</td>
                      <td>{a.modelo_ui || 'N/A'}</td>
                      <td><button onClick={() => handleRemoveAsset(a.id)} className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '10px' }}>✕</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TÉCNICOS */}
      {activeSubTab === 'tecnicos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <TecnicoSearchPicker
                value={selectedTechId}
                onChange={setSelectedTechId}
                placeholder="🔍 Buscar técnico por nombre, email..."
              />
            </div>
            <button onClick={handleAddTech} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Asignar</button>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="data-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Técnico</th>
                  <th>Email</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {otTechs.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin técnicos asignados</td></tr>
                ) : (
                  otTechs.map(t => (
                    <tr key={t.id}>
                      <td>{t.tecnico_nombre || `Usuario #${t.id_tecnicos}`}</td>
                      <td>{t.tecnico_email || 'N/A'}</td>
                      <td><button onClick={() => handleRemoveTech(t.id)} className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '10px' }}>✕</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. INFORME TÉCNICO */}
      {activeSubTab === 'informe' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <form onSubmit={handleSaveReport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Título del Informe</label>
              <input type="text" className="form-input" value={reportForm.titulo} onChange={e => setReportForm({ ...reportForm, titulo: e.target.value })} required placeholder="Ej. Informe de Mantención Preventiva" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Técnico Redactor</label>
              <TecnicoSearchPicker
                value={reportForm.id_tecnico}
                onChange={val => setReportForm({ ...reportForm, id_tecnico: val })}
                placeholder="🔍 Buscar técnico por nombre..."
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '11px' }}>Resumen / Conclusión Técnica</label>
              <textarea className="form-input" rows="3" value={reportForm.resumen} onChange={e => setReportForm({ ...reportForm, resumen: e.target.value })} placeholder="Detalles de los hallazgos técnicos..." />
            </div>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px' }}>💾 Guardar Informe</button>
          </form>

          {report && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>FOTOS DEL INFORME TÉCNICO</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input type="file" accept="image/*" onChange={e => setReportImageFile(e.target.files[0])} style={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                <button onClick={handleUploadReportImage} className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>Subir Foto</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {reportImages.map(img => (
                  <div key={img.id} style={{ position: 'relative', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '60px' }}>
                    <img src={img.url_imagen} alt="Reporte" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => handleRemoveReportImage(img.id)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239, 68, 68, 0.85)', border: 'none', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. MULTIMEDIA */}
      {activeSubTab === 'multimedia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Docs Section */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>DOCUMENTOS ADJUNTOS (PDF, XLS, DOC)</div>
            <form onSubmit={handleAddDoc} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <input type="text" className="form-input" style={{ fontSize: '12px' }} placeholder="Nombre del adjunto" value={docForm.nombre_adjunto} onChange={e => setDocForm({ ...docForm, nombre_adjunto: e.target.value })} required />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="file" onChange={e => setDocForm({ ...docForm, file: e.target.files[0] })} required style={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                <button type="submit" className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>Adjuntar</button>
              </div>
            </form>
            <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
              {otDocs.map(d => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', marginBottom: '4px', fontSize: '12px' }}>
                  <a href={d.url_archivo} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>📄 {d.nombre_adjunto}</a>
                  <button onClick={() => handleRemoveDoc(d.id)} className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '9px' }}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>FOTOS DE CONTROL DE OBRA</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
              <button onClick={handleAddImage} className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }}>Subir Foto</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
              {otImages.map(img => (
                <div key={img.id} style={{ position: 'relative', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '60px' }}>
                  <img src={img.url_imagen} alt="OT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => handleRemoveImage(img.id)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239, 68, 68, 0.85)', border: 'none', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. GASTOS */}
      {activeSubTab === 'gastos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <form onSubmit={handleAddExpense} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '8px' }}>
            <input type="text" className="form-input" placeholder="Explicación del gasto (Ej. Peaje)" value={expenseForm.explicacion} onChange={e => setExpenseForm({ ...expenseForm, explicacion: e.target.value })} required />
            <input type="number" className="form-input" placeholder="Valor ($)" value={expenseForm.valor || ''} onChange={e => setExpenseForm({ ...expenseForm, valor: e.target.value })} required />
            <button type="submit" className="btn btn-primary">Añadir</button>
          </form>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table className="data-table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Valor</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {otExpenses.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Sin gastos registrados</td></tr>
                ) : (
                  otExpenses.map(g => (
                    <tr key={g.id}>
                      <td>{g.explicacion}</td>
                      <td>${g.valor}</td>
                      <td><button onClick={() => handleRemoveExpense(g.id)} className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '10px' }}>✕</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. BITÁCORA */}
      {activeSubTab === 'bitacora' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Pause Timer Control */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>Control de Pausa / Espera</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Registra tiempos de espera en obra</div>
            </div>
            <button onClick={handleTogglePause} className={`btn ${isPauseActive ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '11px', padding: '6px 12px' }}>
              {isPauseActive ? '⏱️ Reanudar OT' : '⏸️ Pausar OT'}
            </button>
          </div>

          {/* Comments Section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>COMENTARIOS INTERNOS</div>
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="text" className="form-input" placeholder="Escribir comentario..." value={commentText} onChange={e => setCommentText(e.target.value)} required />
              <button type="submit" className="btn btn-secondary">Agregar</button>
            </form>
            <div style={{ maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {otComments.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginRight: '6px' }}>{new Date(c.fecha_hora).toLocaleTimeString()}</span>
                    <span>{c.comentario}</span>
                  </div>
                  <button onClick={() => handleRemoveComment(c.id)} style={{ border: 'none', background: 'transparent', color: 'rgba(239,68,68,0.8)', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>BITÁCORA DE MENSAJES / CHAT DE TERRENO</div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="text" className="form-input" placeholder="Enviar mensaje..." value={messageText} onChange={e => setMessageText(e.target.value)} required />
              <button type="submit" className="btn btn-primary">Enviar</button>
            </form>
            <div style={{ maxHeight: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {otMessages.map(m => (
                <div key={m.id} style={{ background: 'rgba(0,198,255,0.05)', borderLeft: '2px solid var(--accent-cyan)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', marginRight: '6px' }}>{new Date(m.fecha_hora).toLocaleTimeString()}</span>
                  <span>{m.mensaje}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
