import logoImg from '../assets/images/logo.png';
import { fetchEmpresa } from '../api/empresa.api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const formatFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

export async function exportInformeOtPdf({ informe, orden, reportImages = [], empresaData = null }) {
  if (!informe || !orden) return;

  let empresa = empresaData;
  if (!empresa) {
    empresa = await fetchEmpresa().catch(() => null);
  }

  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Por favor permite las ventanas emergentes (popups) para exportar el PDF del Informe Técnico.');
    return;
  }

  const logoUrl = empresa && empresa.logo_url
    ? formatFileUrl(empresa.logo_url)
    : (logoImg.startsWith('http') || logoImg.startsWith('data:') ? logoImg : `${window.location.origin}${logoImg.startsWith('/') ? '' : '/'}${logoImg}`);

  const razonSocial = empresa?.razon_social || 'VRF SYSTEMS';
  const rutEmpresa = empresa?.rut ? `RUT: ${empresa.rut}` : 'Servicios y Mantenciones Técnicas Especializadas';
  const direccionEmpresa = empresa?.direccion || '';
  const telefonoEmpresa = empresa?.telefono_contacto ? `Tel: ${empresa.telefono_contacto}` : '';
  const emailEmpresa = empresa?.email ? `Email: ${empresa.email}` : '';
  const giroEmpresa = empresa?.giro || '';

  const fechaInforme = informe.fecha_hora
    ? new Date(informe.fecha_hora).toLocaleDateString()
    : (orden.fecha_programacion ? new Date(orden.fecha_programacion).toLocaleDateString() : new Date().toLocaleDateString());

  const activosList = orden.activos_asociados || [];

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Informe Técnico OT #${orden.id} - ${informe.titulo || 'Informe'}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #1e293b;
            background: #ffffff;
            font-size: 11pt;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify: space-between;
            align-items: center;
            border-bottom: 3px solid #00c6ff;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .brand img {
            max-height: 60px;
            max-width: 160px;
            object-fit: contain;
          }
          .brand-title {
            font-size: 16pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.5px;
          }
          .brand-sub {
            font-size: 8.5pt;
            color: #475569;
          }
          .document-badge {
            text-align: right;
          }
          .badge-title {
            background: #0f172a;
            color: #00c6ff;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12pt;
            font-weight: 800;
            letter-spacing: 1px;
            display: inline-block;
          }
          .badge-sub {
            font-size: 8.5pt;
            color: #64748b;
            margin-top: 4px;
          }
          .section-title {
            background: #f1f5f9;
            border-left: 4px solid #00c6ff;
            padding: 6px 10px;
            font-size: 11pt;
            font-weight: 700;
            color: #0f172a;
            margin: 16px 0 10px 0;
            text-transform: uppercase;
          }
          .grid-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          .grid-table th, .grid-table td {
            border: 1px solid #cbd5e1;
            padding: 7px 10px;
            text-align: left;
            font-size: 9.5pt;
          }
          .grid-table th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            width: 25%;
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
            font-size: 9pt;
            text-align: left;
            text-transform: uppercase;
          }
          .data-table td {
            border-bottom: 1px solid #e2e8f0;
            padding: 6px 8px;
            font-size: 9pt;
            color: #334155;
          }
          .report-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 14px;
            margin-bottom: 16px;
          }
          .report-box-title {
            font-size: 12pt;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 8px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
          }
          .report-text {
            font-size: 10pt;
            color: #1e293b;
            white-space: pre-wrap;
            line-height: 1.5;
          }
          .images-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 10px;
            page-break-inside: auto;
          }
          .image-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 6px;
            background: #ffffff;
            text-align: center;
            page-break-inside: avoid;
          }
          .image-card img {
            width: 100%;
            height: 180px;
            object-fit: cover;
            border-radius: 4px;
          }
          .footer-signatures {
            margin-top: 30px;
            display: flex;
            justify: space-between;
            page-break-inside: avoid;
          }
          .signature-box {
            width: 45%;
            border-top: 1px solid #94a3b8;
            text-align: center;
            padding-top: 6px;
            font-size: 9pt;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <!-- CABECERA DE LA EMPRESA Y DOCUMENTO -->
        <div class="header">
          <div class="brand">
            <img src="${logoUrl}" alt="${razonSocial}" />
            <div>
              <div class="brand-title">${razonSocial}</div>
              <div class="brand-sub">${rutEmpresa} ${giroEmpresa ? '— ' + giroEmpresa : ''}</div>
              ${(direccionEmpresa || telefonoEmpresa || emailEmpresa) ? `
                <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">
                  ${direccionEmpresa ? direccionEmpresa + (telefonoEmpresa || emailEmpresa ? ' | ' : '') : ''}
                  ${telefonoEmpresa ? telefonoEmpresa + (emailEmpresa ? ' | ' : '') : ''}
                  ${emailEmpresa}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="document-badge">
            <div class="badge-title">INFORME TÉCNICO</div>
            <div class="badge-sub">Emisión: ${fechaInforme}</div>
          </div>
        </div>

        <!-- DATOS DE LA ORDEN DE TRABAJO Y CLIENTE -->
        <div class="section-title">DATOS DE LA ORDEN DE TRABAJO</div>
        <table class="grid-table">
          <tr>
            <th>N° ORDEN DE TRABAJO:</th>
            <td><strong>#${orden.id}</strong></td>
            <th>FOLIO / REF:</th>
            <td>${orden.folio || 'N/A'}</td>
          </tr>
          <tr>
            <th>TÍTULO DE LA OT:</th>
            <td colspan="3"><strong>${orden.titulo_ot || 'Sin título'}</strong></td>
          </tr>
          <tr>
            <th>CLIENTE:</th>
            <td>${orden.cliente_nombre || 'N/A'}</td>
            <th>TÉCNICO REDACTOR:</th>
            <td><strong>${informe.tecnico_nombre || 'N/A'}</strong></td>
          </tr>
          <tr>
            <th>FECHA PROGRAMACIÓN:</th>
            <td>${orden.fecha_programacion ? new Date(orden.fecha_programacion).toLocaleDateString() : 'N/A'}</td>
            <th>ESTADO DE OT:</th>
            <td>${orden.estado_ot_nombre || 'Activa'}</td>
          </tr>
        </table>

        <!-- ACTIVOS / EQUIPOS INVOLUCRADOS -->
        ${activosList.length > 0 ? `
          <div class="section-title">EQUIPOS / ACTIVOS INVOLUCRADOS (${activosList.length})</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>IDENTIFICADOR</th>
                <th>MODELO</th>
              </tr>
            </thead>
            <tbody>
              ${activosList.map(a => `
                <tr>
                  <td>#${a.id_activo}</td>
                  <td><strong>${a.identificador || 'Sin código'}</strong></td>
                  <td>${a.modelo_ui || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <!-- DETALLE DEL INFORME TÉCNICO -->
        <div class="section-title">DETALLE DEL INFORME TÉCNICO</div>
        <div class="report-box">
          <div class="report-box-title">${informe.titulo || 'Informe Técnico'}</div>
          <div class="report-text">${informe.resumen || 'Sin resumen o conclusiones especificadas.'}</div>
        </div>

        <!-- GALERÍA DE FOTOGRAFÍAS -->
        ${reportImages.length > 0 ? `
          <div class="section-title">REGISTRO FOTOGRÁFICO DE TERRENO (${reportImages.length} FOTO/S)</div>
          <div class="images-grid">
            ${reportImages.map((img, idx) => `
              <div class="image-card">
                <img src="${formatFileUrl(img.url_imagen)}" alt="Foto #${idx + 1}" />
                <div style="font-size: 8.5pt; color: #64748b; margin-top: 4px;">Foto #${idx + 1}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- FIRMAS DE CONFORMIDAD + PIE DE EMPRESA -->
        <div class="footer-signatures">
          <div class="signature-box">
            <strong>${informe.tecnico_nombre || 'Técnico Responsable'}</strong><br />
            Firma Técnico Redactor
          </div>
          <div class="signature-box">
            <strong>${orden.cliente_nombre || 'Cliente / Receptor'}</strong><br />
            Firma Conformidad Cliente
          </div>
        </div>

        <!-- PIE DE PÁGINA EMPRESA -->
        <div style="margin-top: 24px; padding-top: 10px; border-top: 1px solid #cbd5e1; display: flex; justify-content: center; gap: 28px; font-size: 8pt; color: #64748b; text-align: center;">
          ${razonSocial ? `<span><strong>${razonSocial}</strong></span>` : ''}
          ${telefonoEmpresa ? `<span>📞 ${empresa?.telefono_contacto || ''}</span>` : ''}
          ${emailEmpresa ? `<span>✉ ${empresa?.email || ''}</span>` : ''}
          ${direccionEmpresa ? `<span>📍 ${direccionEmpresa}</span>` : ''}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
