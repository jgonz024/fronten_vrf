import logoImg from '../assets/images/logo.png';
import { fetchEmpresa } from '../api/empresa.api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const formatFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export async function exportDosierPdf({ dosier, empresaData = null }) {
  if (!dosier) return;

  let empresa = empresaData;
  if (!empresa) {
    empresa = await fetchEmpresa().catch(() => null);
  }

  const printWindow = window.open('', '_blank', 'width=950,height=1000');
  if (!printWindow) {
    alert('Por favor permite las ventanas emergentes (popups) en tu navegador para ver y exportar el PDF del Informe Técnico.');
    return;
  }

  const logoUrl = empresa && empresa.logo_url
    ? formatFileUrl(empresa.logo_url)
    : (logoImg.startsWith('http') || logoImg.startsWith('data:') ? logoImg : `${window.location.origin}${logoImg.startsWith('/') ? '' : '/'}${logoImg}`);

  const razonSocial = empresa?.razon_social || 'VRF SYSTEMS';
  const rutEmpresa = empresa?.rut ? `RUT: ${empresa.rut}` : '';
  const giroEmpresa = empresa?.giro || 'Servicios y Mantenciones Técnicas Especializadas';
  const direccionEmpresa = empresa?.direccion || '';
  const telefonoEmpresa = empresa?.telefono_contacto ? `Tel: ${empresa.telefono_contacto}` : '';
  const emailEmpresa = empresa?.email ? `Email: ${empresa.email}` : '';

  const fechaEmision = dosier.fecha_emision
    ? new Date(dosier.fecha_emision).toLocaleDateString('es-CL', { timeZone: 'UTC' })
    : new Date().toLocaleDateString('es-CL');

  const ots = dosier.ordenes_trabajo || [];

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Informe Técnico ${dosier.folio} - ${dosier.cliente_nombre || 'Cliente'}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #1e293b;
            background: #ffffff;
            font-size: 10pt;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify: space-between;
            align-items: center;
            border-bottom: 3px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .brand img {
            max-height: 65px;
            max-width: 170px;
            object-fit: contain;
          }
          .brand-title {
            font-size: 15pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.5px;
          }
          .brand-sub {
            font-size: 8pt;
            color: #475569;
          }
          .doc-badge {
            text-align: right;
          }
          .badge-folio {
            background: #0f172a;
            color: #00c6ff;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 11pt;
            font-weight: 800;
            letter-spacing: 1px;
            display: inline-block;
          }
          .badge-fecha {
            font-size: 8.5pt;
            color: #64748b;
            margin-top: 4px;
          }
          .section-title {
            background: #f1f5f9;
            border-left: 4px solid #0284c7;
            padding: 6px 10px;
            font-size: 10pt;
            font-weight: 700;
            color: #0f172a;
            margin: 16px 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          .grid-table th, .grid-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 9px;
            text-align: left;
            font-size: 9pt;
          }
          .grid-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            width: 22%;
          }
          .grid-table td {
            color: #0f172a;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          .data-table th {
            background: #0f172a;
            color: #ffffff;
            padding: 6px 8px;
            font-size: 8.5pt;
            text-align: left;
            text-transform: uppercase;
          }
          .data-table td {
            border-bottom: 1px solid #e2e8f0;
            padding: 6px 8px;
            font-size: 8.5pt;
            color: #334155;
          }
          .ot-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 14px;
            background: #ffffff;
            page-break-inside: avoid;
          }
          .ot-card-header {
            display: flex;
            justify: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .ot-card-title {
            font-size: 10.5pt;
            font-weight: 800;
            color: #0284c7;
          }
          .images-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 8px;
          }
          .image-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 6px;
            background: #f8fafc;
            text-align: center;
            page-break-inside: avoid;
          }
          .image-card img {
            width: 100%;
            height: auto;
            max-height: 280px;
            object-fit: contain;
            border-radius: 4px;
            display: block;
          }
          .footer-signatures {
            margin-top: 30px;
            display: flex;
            justify: space-between;
            page-break-inside: avoid;
          }
          .signature-box {
            width: 44%;
            border-top: 1px solid #94a3b8;
            text-align: center;
            padding-top: 6px;
            font-size: 8.5pt;
            color: #475569;
          }
          .page-footer {
            margin-top: 24px;
            padding-top: 8px;
            border-top: 1px solid #cbd5e1;
            display: flex;
            justify-content: center;
            gap: 20px;
            font-size: 8pt;
            color: #64748b;
            text-align: center;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <!-- CABECERA DE EMPRESA Y DOSIER -->
        <div class="header">
          <div class="brand">
            <img src="${logoUrl}" alt="${razonSocial}" />
            <div>
              <div class="brand-title">${razonSocial}</div>
              <div class="brand-sub">${rutEmpresa} ${giroEmpresa ? '— ' + giroEmpresa : ''}</div>
              ${(direccionEmpresa || telefonoEmpresa || emailEmpresa) ? `
                <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">
                  ${direccionEmpresa ? direccionEmpresa + ' | ' : ''}
                  ${telefonoEmpresa ? telefonoEmpresa + ' | ' : ''}
                  ${emailEmpresa}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="doc-badge">
            <div class="badge-folio">${dosier.folio}</div>
            <div class="badge-fecha">Emisión: ${fechaEmision}</div>
            <div style="font-size: 8pt; color: #0284c7; font-weight: 700; margin-top: 2px;">INFORME TÉCNICO CONSOLIDADO</div>
          </div>
        </div>

        <!-- TÍTULO DEL DOSIER -->
        <div style="background: #0f172a; color: #ffffff; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px;">
          <div style="font-size: 13pt; font-weight: 800; letter-spacing: 0.3px;">${dosier.titulo}</div>
          ${dosier.observaciones ? `
            <div style="font-size: 9pt; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">
              ${dosier.observaciones.replace(/\n/g, '<br/>')}
            </div>
          ` : ''}
        </div>

        <!-- DATOS DEL CLIENTE -->
        <div class="section-title">DATOS DEL CLIENTE</div>
        <table class="grid-table">
          <tr>
            <th>CLIENTE / RAZÓN SOCIAL:</th>
            <td><strong>${dosier.cliente_nombre || 'N/A'}</strong></td>
            <th>RUT:</th>
            <td>${dosier.cliente_rut || 'N/A'}</td>
          </tr>
          <tr>
            <th>DIRECCIÓN:</th>
            <td>${dosier.cliente_direccion || 'N/A'}</td>
            <th>TIPO CLIENTE:</th>
            <td>${dosier.tipo_cliente_nombre || 'General'}</td>
          </tr>
          <tr>
            <th>TELÉFONO DE CONTACTO:</th>
            <td>${dosier.cliente_telefono || 'N/A'}</td>
            <th>CORREO ELECTRÓNICO:</th>
            <td>${dosier.cliente_email || 'N/A'}</td>
          </tr>
        </table>

        <!-- RESUMEN EJECUTIVO DE ÓRDENES DE TRABAJO INCLUIDAS -->
        <div class="section-title">RESUMEN DE ÓRDENES DE TRABAJO INCLUIDAS (${ots.length})</div>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 8%;">N° OT</th>
              <th style="width: 18%;">FOLIO</th>
              <th style="width: 32%;">TÍTULO / TRABAJO</th>
              <th style="width: 14%;">TIPO</th>
              <th style="width: 14%;">FECHA</th>
              <th style="width: 14%;">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            ${ots.map((ot, idx) => `
              <tr>
                <td><strong>#${ot.id}</strong></td>
                <td>${ot.folio || 'S/F'}</td>
                <td>${ot.titulo_ot || 'Sin título'}</td>
                <td>${ot.tipo_ot_nombre || 'N/A'}</td>
                <td>${ot.fecha_programacion ? new Date(ot.fecha_programacion).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : (ot.creado_en ? new Date(ot.creado_en).toLocaleDateString('es-CL') : 'N/A')}</td>
                <td><strong>${ot.estado_ot_nombre || 'Realizada'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- DETALLE EXHAUSTIVO POR CADA ORDEN DE TRABAJO -->
        <div class="section-title">DETALLE DE INTERVENCIONES Y FICHAS TÉCNICAS</div>
        ${ots.map((ot, idx) => {
          const activosOt = ot.activos || [];
          const informesOt = ot.informes || [];
          return `
            <div class="ot-card">
              <div class="ot-card-header">
                <div>
                  <span class="ot-card-title">OT #${ot.id} — ${ot.titulo_ot || 'Orden de Trabajo'}</span>
                  <span style="font-size: 8.5pt; color: #64748b; margin-left: 8px;">(Folio: ${ot.folio || 'N/A'})</span>
                </div>
                <div style="font-size: 8.5pt; font-weight: 700; color: #0284c7;">
                  ${ot.tipo_ot_nombre || 'Servicio Técnico'} · ${ot.estado_ot_nombre || 'Cerrada'}
                </div>
              </div>

              <!-- Info básica de la OT -->
              <table class="grid-table" style="margin-bottom: 8px;">
                <tr>
                  <th>TÉCNICO RESPONSABLE:</th>
                  <td>${ot.tecnico_encargado_nombre || 'No especificado'}</td>
                  <th>FECHA PROGRAMADA:</th>
                  <td>${ot.fecha_programacion ? new Date(ot.fecha_programacion).toLocaleDateString('es-CL', { timeZone: 'UTC' }) : 'N/A'}</td>
                </tr>
                <tr>
                  <th>ENCARGADO CLIENTE:</th>
                  <td>${ot.nombre_encargado || ot.nombre_encargado_direccion || 'N/A'}</td>
                  <th>TELÉFONO ENCARGADO:</th>
                  <td>${ot.telefono_encargado || 'N/A'}</td>
                </tr>
              </table>

              <!-- Activos / Equipos intervenidos en la OT -->
              ${activosOt.length > 0 ? `
                <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 8px 0 4px 0; text-transform: uppercase;">
                  Equipos / Activos Intervenidos (${activosOt.length})
                </div>
                <table class="data-table" style="margin-bottom: 8px;">
                  <thead>
                    <tr>
                      <th>IDENTIFICADOR</th>
                      <th>CATEGORÍA / TIPO</th>
                      <th>MARCA</th>
                      <th>MODELO UI / UE</th>
                      <th>SERIE</th>
                      <th>UBICACIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${activosOt.map(act => `
                      <tr>
                        <td><strong>${act.id_identificador || 'N/A'}</strong></td>
                        <td>${act.categoria_activo_nombre || ''} ${act.tipo_activo_nombre ? '· ' + act.tipo_activo_nombre : ''}</td>
                        <td>${act.marca_activo_nombre || 'N/A'}</td>
                        <td>${act.modelo_ui || ''} ${act.modelo_ue ? '/ ' + act.modelo_ue : ''}</td>
                        <td>${act.serie_ui || act.serie_ue || 'N/A'}</td>
                        <td>${act.ubicacion_activo || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : ''}

              <!-- Informes y hallazgos técnicos registrados -->
              ${informesOt.length > 0 ? `
                <div style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin: 8px 0 4px 0; text-transform: uppercase;">
                  Informes Técnicos y Hallazgos (${informesOt.length})
                </div>
                ${informesOt.map(inf => `
                  <div style="background: #f8fafc; border-left: 3px solid #00c6ff; padding: 8px 10px; margin-bottom: 6px; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                      <span>${inf.titulo || 'Informe Técnico'}</span>
                      <span style="color: #64748b; font-weight: normal;">Redactado por: ${inf.tecnico_nombre || 'Técnico'}</span>
                    </div>
                    <div style="font-size: 8.5pt; color: #334155; line-height: 1.4; white-space: pre-wrap;">
                      ${inf.resumen || 'Sin resumen registrado.'}
                    </div>

                    <!-- Fotografías adjuntas al informe técnico -->
                    ${inf.imagenes && inf.imagenes.length > 0 ? `
                      <div style="font-size: 8pt; font-weight: 700; color: #0284c7; margin-top: 8px; margin-bottom: 4px;">
                        REGISTRO FOTOGRÁFICO (${inf.imagenes.length} FOTO/S)
                      </div>
                      <div class="images-grid">
                        ${inf.imagenes.map((img, imgIdx) => `
                          <div class="image-card">
                            <img src="${formatFileUrl(img.url_imagen)}" alt="Foto #${imgIdx + 1}" />
                            <div style="font-size: 7.5pt; color: #64748b; margin-top: 4px;">Foto #${imgIdx + 1}</div>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              ` : ''}
            </div>
          `;
        }).join('')}

        <!-- FIRMAS DE CONFORMIDAD -->
        <div class="footer-signatures">
          <div class="signature-box">
            <strong>${dosier.usuario_nombre || 'Técnico / Responsable Emisor'}</strong><br />
            VRF Systems SpA<br />
            Firma Emisor de Informe
          </div>
          <div class="signature-box">
            <strong>${dosier.cliente_nombre || 'Receptor Autorizado'}</strong><br />
            ${dosier.cliente_rut ? `RUT: ${dosier.cliente_rut}` : ''}<br />
            Firma Conformidad Cliente
          </div>
        </div>

        <!-- PIE DE PÁGINA EMPRESA -->
        <div class="page-footer">
          ${razonSocial ? `<span><strong>${razonSocial}</strong></span>` : ''}
          ${telefonoEmpresa ? `<span>📞 ${empresa?.telefono_contacto || ''}</span>` : ''}
          ${emailEmpresa ? `<span>✉ ${empresa?.email || ''}</span>` : ''}
          ${direccionEmpresa ? `<span>📍 ${direccionEmpresa}</span>` : ''}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
