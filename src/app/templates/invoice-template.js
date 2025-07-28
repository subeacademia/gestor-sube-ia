// Plantilla para generar el HTML de las cotizaciones
export function renderInvoice({nombre, email, rut, empresa, moneda, codigo, fecha, serviciosData, total, atendedor, notasAdicionales, descuento}) {
  let totalConDescuento = total;
  let descuentoTexto = '';
  if (descuento && !isNaN(descuento) && descuento > 0) {
    totalConDescuento = Math.round(total * (1 - descuento / 100));
    descuentoTexto = `<div class="descuento-aplicado" style="color:#FF4EFF;font-weight:bold;text-align:right;margin:10px 0;">Descuento aplicado: <b>${descuento}%</b></div>`;
  }
  
  return `
  <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
    
    <!-- Header del PDF -->
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #00B8D9;">
      <img src="./assets/logo-blanco.png" alt="Logo SUBE IA TECH" style="height:80px; margin-bottom: 15px;">
      <h1 style="font-size:2.5rem;color:#23263A;font-weight:bold;margin:10px 0;">SUBE IA TECH</h1>
      <h2 style="font-size:1.8rem;color:#23263A;font-weight:600;margin:10px 0;">Cotización de Servicios</h2>
      <div style="color:#23263A;font-weight:bold;margin:10px 0;">
        <strong>Sube IA Tech Ltda.</strong><br>
        Fco. Mansilla 1007, Castro, Chile<br>
        RUT: 77.994.591-K<br>
        contacto@subeia.tech
      </div>
      <div style="color:#23263A;font-weight:bold;margin-top: 15px;">
        <span style="margin: 0 15px;"><b>Fecha:</b> ${fecha}</span>
        <span style="margin: 0 15px;"><b>Código:</b> <span style="font-family:monospace;color:#00B8D9;font-size:1.1em;">${codigo}</span></span>
      </div>
    </div>

    <!-- Información del Cliente -->
    <div style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">👤 Información del Cliente</h3>
      <div style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
          <div><strong>Nombre:</strong> ${nombre}</div>
          <div><strong>Email:</strong> ${email}</div>
          <div><strong>RUT:</strong> ${rut}</div>
          <div><strong>Empresa:</strong> ${empresa}</div>
        </div>
      </div>
      <div style="color:#23263A;margin:10px 0;">
        <b>Moneda de cotización:</b> ${moneda}
      </div>
    </div>

    <!-- Servicios -->
    <div style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">🛠️ Servicios Cotizados</h3>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;color:#23263A;">
        <thead>
          <tr style="background-color:#f2f2f2;">
            <th style="border:1px solid #ddd;padding:12px;text-align:left;font-weight:bold;">Categoría</th>
            <th style="border:1px solid #ddd;padding:12px;text-align:left;font-weight:bold;">Detalle</th>
            <th style="border:1px solid #ddd;padding:12px;text-align:left;font-weight:bold;">Modalidad</th>
            <th style="border:1px solid #ddd;padding:12px;text-align:left;font-weight:bold;">Cant. x Valor</th>
            <th style="border:1px solid #ddd;padding:12px;text-align:right;font-weight:bold;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${(serviciosData || []).map(s => {
            let cantidadValor = '-';
            let tipoCobroTexto = '';
            if (s.tipoCobro === 'sesion') {
              cantidadValor = `${s.detallesCobro?.sesiones || 1} x ${(s.detallesCobro?.valorSesion || 0).toLocaleString()}`;
              tipoCobroTexto = '<div style="font-size:0.85em;color:#888;">Por sesión</div>';
            } else if (s.tipoCobro === 'mes') {
              cantidadValor = `${s.detallesCobro?.meses || 1} x ${(s.detallesCobro?.valorMes || 0).toLocaleString()}`;
              tipoCobroTexto = '<div style="font-size:0.85em;color:#888;">Por mes</div>';
            } else if (s.tipoCobro === 'proyecto') {
              cantidadValor = '-';
              tipoCobroTexto = '<div style="font-size:0.85em;color:#888;">Total directo</div>';
            }
            return `<tr>
              <td style="border:1px solid #ddd;padding:10px;">${s.nombre || ''}</td>
              <td style="border:1px solid #ddd;padding:10px;">${s.detalle || ''}</td>
              <td style="border:1px solid #ddd;padding:10px;">${s.modalidad || '-'}</td>
              <td style="border:1px solid #ddd;padding:10px;">${cantidadValor}${tipoCobroTexto}</td>
              <td style="border:1px solid #ddd;padding:10px;text-align:right;font-weight:bold;">${(s.subtotal || 0).toLocaleString()}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Resumen Financiero -->
    <div style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">💰 Resumen Financiero</h3>
      <div style="background:#f8fafc;padding:20px;border-radius:8px;border:2px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="font-weight:bold;">Subtotal:</div>
          <div style="font-weight:bold;">${(total || 0).toLocaleString()} ${moneda || 'CLP'}</div>
        </div>
        ${descuento && !isNaN(descuento) && descuento > 0 ? `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;color:#FF4EFF;">
          <div>Descuento (${descuento}%):</div>
          <div>-${((total || 0) * descuento / 100).toLocaleString()} ${moneda || 'CLP'}</div>
        </div>
        ` : ''}
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid #00B8D9;padding-top:10px;">
          <div style="font-size:1.2em;font-weight:bold;color:#00B8D9;">Total Final:</div>
          <div style="font-size:1.2em;font-weight:bold;color:#00B8D9;">${totalConDescuento.toLocaleString()} ${moneda || 'CLP'}</div>
        </div>
      </div>
    </div>

    <!-- Información Adicional -->
    <div style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">📋 Información Adicional</h3>
      <div style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;">
        <div style="margin-bottom:10px;"><strong>Atendido por:</strong> ${atendedor}</div>
        <div style="margin-bottom:10px;"><strong>Válido:</strong> 15 días desde la fecha de emisión</div>
        <div style="margin-bottom:10px;"><strong>Condiciones de pago:</strong> 50% al aceptar, 50% contra entrega</div>
        <div><strong>Consultas:</strong> contacto@subeia.tech</div>
      </div>
    </div>

    ${notasAdicionales ? `
    <div style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">📝 Notas Adicionales</h3>
      <div style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;white-space:pre-wrap;color:#FF4EFF;">
        ${notasAdicionales}
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: 40px;text-align: center;border-top: 3px solid #00B8D9;padding-top: 20px;color:#23263A;">
      <div style="font-weight:bold;margin-bottom: 10px;">Sube IA Tech Ltda.</div>
      <div style="font-size:0.9em;color:#64748b;margin-bottom: 15px;">
        contacto@subeia.tech &mdash; Fco. Mansilla 1007, Castro, Chile
      </div>
      <div style="font-size:0.8em;color:#64748b;">
        Documento generado el ${new Date().toLocaleDateString('es-CL')}
      </div>
      <img src="./assets/logo-blanco.png" alt="Logo SUBE IA TECH" style="height:48px;margin-top: 15px;">
    </div>
  </div>
  `;
} 