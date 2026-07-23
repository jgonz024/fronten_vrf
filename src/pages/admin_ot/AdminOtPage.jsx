import React, { useState } from 'react';
import TipoOtsPage from '../tipo_ot/TipoOtsPage';
import EstadosOtsPage from '../estados_ot/EstadosOtsPage';
import GenericChildOtPage from './GenericChildOtPage';

import { fetchGastosOt, createGastoOt, deleteGastoOt, restoreGastoOt } from '../../api/gastosOt.api';
import { fetchPausasOt, createPausaOt, deletePausaOt, restorePausaOt } from '../../api/pausasOt.api';
import { fetchDocumentosAdjuntosOt, createDocumentoAdjuntoOt, deleteDocumentoAdjuntoOt, restoreDocumentoAdjuntoOt } from '../../api/documentoAdjuntoOt.api';
import { fetchActivosOt, createActivoOt, deleteActivoOt, restoreActivoOt } from '../../api/activosOt.api';
import { fetchTecnicosOt, createTecnicoOt, deleteTecnicoOt, restoreTecnicoOt } from '../../api/tecnicosOt.api';
import { fetchComentariosOt, createComentarioOt, deleteComentarioOt, restoreComentarioOt } from '../../api/comentariosOt.api';
import { fetchImagenesOt, createImagenOt, deleteImagenOt, restoreImagenOt } from '../../api/imagenesOt.api';
import { fetchMensajesOt, createMensajeOt, deleteMensajeOt, restoreMensajeOt } from '../../api/mensajesOt.api';
import { fetchInformesOt, createInformeOt, deleteInformeOt, restoreInformeOt } from '../../api/informeOt.api';
import { fetchImagenesInformeOt, createImagenInformeOt, deleteImagenInformeOt, restoreImagenInformeOt } from '../../api/imagenesInformeOt.api';

export default function AdminOtPage({ userSession }) {
  const [activeTab, setActiveTab] = useState('tipos');
  const isAdmin = userSession?.usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR');

  const tabs = [
    { id: 'tipos', label: '📋 Tipos OT' },
    { id: 'estados', label: '🚦 Estados OT' },
    { id: 'gastos', label: '💰 Gastos' },
    { id: 'pausas', label: '⏸️ Pausas' },
    { id: 'adjuntos', label: '📄 Adjuntos' },
    { id: 'activos', label: '❄️ Activos OT' },
    { id: 'tecnicos', label: '👷 Técnicos OT' },
    { id: 'comentarios', label: '💬 Comentarios' },
    { id: 'imagenes', label: '📷 Imágenes OT' },
    { id: 'mensajes', label: '📨 Mensajes' },
    { id: 'informes', label: '📝 Informes' },
    { id: 'img_informes', label: '🖼️ Img. Informes' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '10px'
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 600,
              background: activeTab === t.id ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === t.id ? '#0a1229' : 'var(--text-secondary)',
              border: activeTab === t.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === t.id ? '0 0 10px rgba(0, 198, 255, 0.3)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'tipos' && <TipoOtsPage userSession={userSession} />}
        {activeTab === 'estados' && <EstadosOtsPage userSession={userSession} />}

        {activeTab === 'gastos' && (
          <GenericChildOtPage
            fetchFn={fetchGastosOt}
            createFn={createGastoOt}
            deleteFn={deleteGastoOt}
            restoreFn={restoreGastoOt}
            entityName="Gastos de OT"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'explicacion', label: 'Explicación' },
              { key: 'valor', label: 'Valor ($)' },
              { key: 'fecha_hora', label: 'Fecha/Hora', isDate: true }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'explicacion', label: 'Explicación', type: 'text', required: true, placeholder: 'Ej. Peaje' },
              { key: 'valor', label: 'Valor ($)', type: 'number', required: true, placeholder: '0' }
            ]}
          />
        )}

        {activeTab === 'pausas' && (
          <GenericChildOtPage
            fetchFn={fetchPausasOt}
            createFn={createPausaOt}
            deleteFn={deletePausaOt}
            restoreFn={restorePausaOt}
            entityName="Pausas de OT"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'inicio', label: 'Inicio', isDate: true },
              { key: 'fin', label: 'Fin', isDate: true }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'inicio', label: 'Fecha/Hora Inicio', type: 'datetime-local', required: true },
              { key: 'fin', label: 'Fecha/Hora Fin', type: 'datetime-local' }
            ]}
          />
        )}

        {activeTab === 'adjuntos' && (
          <GenericChildOtPage
            fetchFn={fetchDocumentosAdjuntosOt}
            createFn={createDocumentoAdjuntoOt}
            deleteFn={deleteDocumentoAdjuntoOt}
            restoreFn={restoreDocumentoAdjuntoOt}
            entityName="Documentos Adjuntos de OT"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'nombre_adjunto', label: 'Nombre' },
              { key: 'descripcion', label: 'Descripción' },
              { key: 'url_archivo', label: 'Archivo', render: (val) => val ? <a href={val} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)' }}>📄 Ver</a> : '—' }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'nombre_adjunto', label: 'Nombre', type: 'text', required: true, placeholder: 'Ej. Presupuesto.pdf' },
              { key: 'descripcion', label: 'Descripción', type: 'text', placeholder: 'Descripción del archivo' },
              { key: 'url_archivo', label: 'URL Archivo', type: 'text', placeholder: '/uploads/ordenes/adjuntos/...' }
            ]}
          />
        )}

        {activeTab === 'activos' && (
          <GenericChildOtPage
            fetchFn={fetchActivosOt}
            createFn={createActivoOt}
            deleteFn={deleteActivoOt}
            restoreFn={restoreActivoOt}
            entityName="Activos Asociados a OT"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'id_activo', label: 'ID Activo' },
              { key: 'id_estado_activo', label: 'Estado Activo' }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'id_activo', label: 'Activo / Equipo', required: true, placeholder: '🔍 Buscar por ID, código, modelo...' },
              { key: 'id_estado_activo', label: 'Estado del Activo', type: 'text', placeholder: 'Ej. Operativo' }
            ]}
          />
        )}

        {activeTab === 'tecnicos' && (
          <GenericChildOtPage
            fetchFn={fetchTecnicosOt}
            createFn={createTecnicoOt}
            deleteFn={deleteTecnicoOt}
            restoreFn={restoreTecnicoOt}
            entityName="Técnicos Asignados a OT"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'id_tecnicos', label: 'ID Técnico' },
              { key: 'tecnico_nombre', label: 'Nombre' },
              { key: 'tecnico_email', label: 'Email' }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'id_tecnicos', label: 'Técnico Asignado', required: true, placeholder: '🔍 Buscar por nombre, email...' }
            ]}
          />
        )}

        {activeTab === 'comentarios' && (
          <GenericChildOtPage
            fetchFn={fetchComentariosOt}
            createFn={createComentarioOt}
            deleteFn={deleteComentarioOt}
            restoreFn={restoreComentarioOt}
            entityName="Comentarios de OT"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'comentario', label: 'Comentario' },
              { key: 'fecha_hora', label: 'Fecha/Hora', isDate: true }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'comentario', label: 'Comentario', type: 'text', required: true, placeholder: 'Escribir comentario...' }
            ]}
          />
        )}

        {activeTab === 'imagenes' && (
          <GenericChildOtPage
            fetchFn={fetchImagenesOt}
            createFn={createImagenOt}
            deleteFn={deleteImagenOt}
            restoreFn={restoreImagenOt}
            entityName="Imágenes de OT"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'url_imagen', label: 'Imagen', render: (val) => val ? <img src={val} alt="OT" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /> : '—' },
              { key: 'fecha_carga', label: 'Fecha Carga', isDate: true }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'url_imagen', label: 'URL Imagen', type: 'text', required: true, placeholder: '/uploads/ordenes/imagenes/...' }
            ]}
          />
        )}

        {activeTab === 'mensajes' && (
          <GenericChildOtPage
            fetchFn={fetchMensajesOt}
            createFn={createMensajeOt}
            deleteFn={deleteMensajeOt}
            restoreFn={restoreMensajeOt}
            entityName="Mensajes de OT"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'mensaje', label: 'Mensaje' },
              { key: 'fecha_hora', label: 'Fecha/Hora', isDate: true }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'mensaje', label: 'Mensaje', type: 'text', required: true, placeholder: 'Escribir mensaje...' }
            ]}
          />
        )}

        {activeTab === 'informes' && (
          <GenericChildOtPage
            fetchFn={fetchInformesOt}
            createFn={createInformeOt}
            deleteFn={deleteInformeOt}
            restoreFn={restoreInformeOt}
            entityName="Informes Técnicos"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_ot', label: 'OT' },
              { key: 'titulo', label: 'Título' },
              { key: 'resumen', label: 'Resumen' },
              { key: 'tecnico_nombre', label: 'Técnico' },
              { key: 'fecha_hora', label: 'Fecha', isDate: true }
            ]}
            formFields={[
              { key: 'id_ot', label: 'Orden de Trabajo', required: true, placeholder: '🔍 Buscar por folio, técnico, cliente...' },
              { key: 'titulo', label: 'Título', type: 'text', required: true, placeholder: 'Informe de mantención...' },
              { key: 'resumen', label: 'Resumen', type: 'text', placeholder: 'Detalle de hallazgos...' },
              { key: 'id_tecnico', label: 'Técnico Redactor', placeholder: '🔍 Buscar por nombre, email...' }
            ]}
          />
        )}

        {activeTab === 'img_informes' && (
          <GenericChildOtPage
            fetchFn={fetchImagenesInformeOt}
            createFn={createImagenInformeOt}
            deleteFn={deleteImagenInformeOt}
            restoreFn={restoreImagenInformeOt}
            entityName="Imágenes de Informes Técnicos"
            isAdmin={isAdmin}
            columns={[
              { key: 'id_informe', label: 'ID Informe' },
              { key: 'url_imagen', label: 'Imagen', render: (val) => val ? <img src={val} alt="Informe" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /> : '—' },
              { key: 'fecha_hora', label: 'Fecha', isDate: true }
            ]}
            formFields={[
              { key: 'id_informe', label: 'ID Informe Técnico', type: 'number', required: true, placeholder: 'Ej. 1' },
              { key: 'url_imagen', label: 'URL Imagen', type: 'text', required: true, placeholder: '/uploads/informes/imagenes/...' }
            ]}
          />
        )}
      </div>
    </div>
  );
}
