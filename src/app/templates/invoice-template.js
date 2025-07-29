// Plantilla para generar el HTML de las cotizaciones
export function renderInvoice({nombre, email, rut, empresa, moneda, codigo, fecha, serviciosData, total, atendedor, notasAdicionales, descuento}) {
  let totalConDescuento = total;
  let descuentoTexto = '';
  if (descuento && !isNaN(descuento) && descuento > 0) {
    totalConDescuento = Math.round(total * (1 - descuento / 100));
    descuentoTexto = `<div class="descuento-aplicado" style="color:#FF4EFF;font-weight:bold;text-align:right;margin:10px 0;">Descuento aplicado: <b>${descuento}%</b></div>`;
  }
  
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 12px;">
    
    <!-- Header del PDF con diseño mejorado -->
    <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 2px solid #e2e8f0;">
      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #00B8D9, #FF4EFF); border-radius: 12px; margin-right: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">SUBE</div>
        <div>
          <h1 style="font-size: 2.8rem; color: #1e293b; font-weight: 800; margin: 0; letter-spacing: -0.025em;">SUBE IA TECH</h1>
          <h2 style="font-size: 1.4rem; color: #64748b; font-weight: 600; margin: 5px 0 0 0;">Cotización de Servicios</h2>
        </div>
      </div>
      
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="color: #1e293b; font-weight: 600; margin-bottom: 10px;">
          <strong>Sube IA Tech Ltda.</strong>
        </div>
        <div style="color: #64748b; font-size: 0.95rem; line-height: 1.5;">
          Fco. Mansilla 1007, Castro, Chile<br>
          RUT: 77.994.591-K<br>
          contacto@subeia.tech
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="text-align: left;">
          <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 5px;">Fecha de Emisión</div>
          <div style="color: #1e293b; font-weight: 600; font-size: 1.1rem;">${fecha}</div>
        </div>
        <div style="text-align: right;">
          <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 5px;">Código de Cotización</div>
          <div style="color: #00B8D9; font-weight: 700; font-size: 1.2rem; font-family: 'Courier New', monospace; letter-spacing: 1px;">${codigo}</div>
        </div>
      </div>
    </div>

    <!-- Información del Cliente -->
    <div style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 4px; height: 24px; background: linear-gradient(135deg, #00B8D9, #FF4EFF); border-radius: 2px; margin-right: 12px;"></div>
        <h3 style="font-weight: 700; color: #1e293b; margin: 0; font-size: 1.3rem;">👤 Información del Cliente</h3>
      </div>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Nombre Completo</div>
            <div style="color: #1e293b; font-weight: 600; font-size: 1.1rem;">${nombre}</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Email</div>
            <div style="color: #1e293b; font-weight: 600; font-size: 1.1rem;">${email}</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">RUT</div>
            <div style="color: #1e293b; font-weight: 600; font-size: 1.1rem;">${rut}</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Empresa</div>
            <div style="color: #1e293b; font-weight: 600; font-size: 1.1rem;">${empresa}</div>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Moneda de Cotización</div>
          <div style="color: #00B8D9; font-weight: 700; font-size: 1.2rem;">${moneda}</div>
        </div>
      </div>
    </div>

    <!-- Servicios -->
    <div style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 4px; height: 24px; background: linear-gradient(135deg, #00B8D9, #FF4EFF); border-radius: 2px; margin-right: 12px;"></div>
        <h3 style="font-weight: 700; color: #1e293b; margin: 0; font-size: 1.3rem;">🛠️ Servicios Cotizados</h3>
      </div>
      
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; color: #1e293b;">
          <thead>
            <tr style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);">
              <th style="padding: 16px 20px; text-align: left; font-weight: 700; color: #1e293b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Categoría</th>
              <th style="padding: 16px 20px; text-align: left; font-weight: 700; color: #1e293b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Detalle</th>
              <th style="padding: 16px 20px; text-align: left; font-weight: 700; color: #1e293b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Modalidad</th>
              <th style="padding: 16px 20px; text-align: left; font-weight: 700; color: #1e293b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Cant. x Valor</th>
              <th style="padding: 16px 20px; text-align: right; font-weight: 700; color: #1e293b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${(serviciosData || []).map((s, index) => {
              let cantidadValor = '-';
              let tipoCobroTexto = '';
              if (s.tipoCobro === 'sesion') {
                cantidadValor = `${s.detallesCobro?.sesiones || 1} x ${(s.detallesCobro?.valorSesion || 0).toLocaleString()}`;
                tipoCobroTexto = '<div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Por sesión</div>';
              } else if (s.tipoCobro === 'mes') {
                cantidadValor = `${s.detallesCobro?.meses || 1} x ${(s.detallesCobro?.valorMes || 0).toLocaleString()}`;
                tipoCobroTexto = '<div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Por mes</div>';
              } else if (s.tipoCobro === 'proyecto') {
                cantidadValor = '-';
                tipoCobroTexto = '<div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Total directo</div>';
              }
              return `<tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${s.nombre || ''}</td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b; line-height: 1.4;">${s.detalle || ''}</td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                  <span style="background: #00B8D9; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 500;">${s.modalidad || '-'}</span>
                </td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                  <div style="font-weight: 600; color: #1e293b;">${cantidadValor}</div>
                  ${tipoCobroTexto}
                </td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #00B8D9; font-size: 1.1rem;">${(s.subtotal || 0).toLocaleString()}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Resumen Financiero -->
    <div style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 4px; height: 24px; background: linear-gradient(135deg, #00B8D9, #FF4EFF); border-radius: 2px; margin-right: 12px;"></div>
        <h3 style="font-weight: 700; color: #1e293b; margin: 0; font-size: 1.3rem;">💰 Resumen Financiero</h3>
      </div>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
            <div style="color: #64748b; font-size: 1rem; font-weight: 500;">Subtotal:</div>
            <div style="color: #1e293b; font-weight: 600; font-size: 1.1rem;">${(total || 0).toLocaleString()} ${moneda || 'CLP'}</div>
          </div>
          
          ${descuento && !isNaN(descuento) && descuento > 0 ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
            <div style="color: #FF4EFF; font-size: 1rem; font-weight: 500;">Descuento (${descuento}%):</div>
            <div style="color: #FF4EFF; font-weight: 600; font-size: 1.1rem;">-${((total || 0) * descuento / 100).toLocaleString()} ${moneda || 'CLP'}</div>
          </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; background: linear-gradient(135deg, #00B8D9, #FF4EFF); margin: 0 -25px -25px -25px; padding: 25px; border-radius: 0 0 8px 8px;">
            <div style="color: white; font-size: 1.3rem; font-weight: 700;">Total Final:</div>
            <div style="color: white; font-size: 1.5rem; font-weight: 800;">${totalConDescuento.toLocaleString()} ${moneda || 'CLP'}</div>
          </div>
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
    <div style="margin-top: 50px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <img src="./assets/logo-blanco.png" alt="Logo SUBE IA TECH" style="height: 40px; margin-right: 15px; filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);">
          <div style="text-align: left;">
            <div style="font-weight: 700; color: #1e293b; font-size: 1.2rem; margin-bottom: 5px;">Sube IA Tech Ltda.</div>
            <div style="color: #64748b; font-size: 0.9rem;">contacto@subeia.tech</div>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 10px;">
            Fco. Mansilla 1007, Castro, Chile &mdash; RUT: 77.994.591-K
          </div>
          <div style="color: #64748b; font-size: 0.8rem;">
            Documento generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
} 