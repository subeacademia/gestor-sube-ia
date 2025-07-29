// Plantilla para generar el HTML de las cotizaciones
export function renderInvoice({nombre, email, rut, empresa, moneda, codigo, fecha, serviciosData, total, atendedor, notasAdicionales, descuento}) {
  let totalConDescuento = total;
  let descuentoTexto = '';
  if (descuento && !isNaN(descuento) && descuento > 0) {
    totalConDescuento = Math.round(total * (1 - descuento / 100));
    descuentoTexto = `<div class="descuento-aplicado" style="color:#FF4EFF;font-weight:bold;text-align:right;margin:10px 0;">Descuento aplicado: <b>${descuento}%</b></div>`;
  }
  
  return `
  <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-radius: 16px;">
    
    <!-- Header del PDF con diseño ultra moderno -->
    <div style="text-align: center; margin-bottom: 40px; padding: 40px; background: linear-gradient(135deg, #0D1117 0%, #161B22 100%); border-radius: 16px; border: 1px solid #30363D; position: relative; overflow: hidden;">
      <!-- Efecto de partículas de fondo -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 20% 80%, rgba(88, 166, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(247, 120, 186, 0.1) 0%, transparent 50%);"></div>
      
      <div style="position: relative; z-index: 1;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #58A6FF 0%, #F778BA 100%); border-radius: 16px; margin-right: 25px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; box-shadow: 0 8px 32px rgba(88, 166, 255, 0.3);">SUBE</div>
          <div>
            <h1 style="font-size: 3.2rem; color: #E6EDF3; font-weight: 800; margin: 0; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">SUBE IA TECH</h1>
            <h2 style="font-size: 1.6rem; color: #8B949E; font-weight: 600; margin: 8px 0 0 0; letter-spacing: 0.02em;">Cotización de Servicios</h2>
          </div>
        </div>
        
        <div style="background: rgba(22, 27, 34, 0.8); backdrop-filter: blur(10px); padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #30363D; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <div style="color: #E6EDF3; font-weight: 700; margin-bottom: 12px; font-size: 1.1rem;">
            <strong>Sube IA Tech Ltda.</strong>
          </div>
          <div style="color: #8B949E; font-size: 1rem; line-height: 1.6;">
            Fco. Mansilla 1007, Castro, Chile<br>
            RUT: 77.994.591-K<br>
            contacto@subeia.tech
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(22, 27, 34, 0.8); backdrop-filter: blur(10px); padding: 20px 30px; border-radius: 12px; border: 1px solid #30363D; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <div style="text-align: left;">
            <div style="color: #8B949E; font-size: 0.9rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Fecha de Emisión</div>
            <div style="color: #E6EDF3; font-weight: 600; font-size: 1.2rem;">${fecha}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #8B949E; font-size: 0.9rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Código de Cotización</div>
            <div style="color: #58A6FF; font-weight: 700; font-size: 1.4rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 2px; text-shadow: 0 0 20px rgba(88, 166, 255, 0.5);">${codigo}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información del Cliente -->
    <div style="margin-bottom: 40px;">
      <div style="display: flex; align-items: center; margin-bottom: 25px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">👤 Información del Cliente</h3>
      </div>
      
      <div style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 30px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
            <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Nombre Completo</div>
            <div style="color: #0D1117; font-weight: 700; font-size: 1.2rem;">${nombre}</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
            <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Email</div>
            <div style="color: #0D1117; font-weight: 700; font-size: 1.2rem;">${email}</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
            <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">RUT</div>
            <div style="color: #0D1117; font-weight: 700; font-size: 1.2rem;">${rut}</div>
          </div>
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
            <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Empresa</div>
            <div style="color: #0D1117; font-weight: 700; font-size: 1.2rem;">${empresa}</div>
          </div>
        </div>
        
        <div style="margin-top: 25px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Moneda de Cotización</div>
          <div style="color: #58A6FF; font-weight: 700; font-size: 1.4rem;">${moneda}</div>
        </div>
      </div>
    </div>

    <!-- Servicios -->
    <div style="margin-bottom: 40px;">
      <div style="display: flex; align-items: center; margin-bottom: 25px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">🛠️ Servicios Cotizados</h3>
      </div>
      
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
        <table style="width: 100%; border-collapse: collapse; color: #0D1117;">
          <thead>
            <tr style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%);">
              <th style="padding: 20px 25px; text-align: left; font-weight: 700; color: #0D1117; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E1E4E8;">Categoría</th>
              <th style="padding: 20px 25px; text-align: left; font-weight: 700; color: #0D1117; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E1E4E8;">Detalle</th>
              <th style="padding: 20px 25px; text-align: left; font-weight: 700; color: #0D1117; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E1E4E8;">Modalidad</th>
              <th style="padding: 20px 25px; text-align: left; font-weight: 700; color: #0D1117; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E1E4E8;">Cant. x Valor</th>
              <th style="padding: 20px 25px; text-align: right; font-weight: 700; color: #0D1117; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E1E4E8;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${(serviciosData || []).map((s, index) => {
              let cantidadValor = '-';
              let tipoCobroTexto = '';
              if (s.tipoCobro === 'sesion') {
                cantidadValor = `${s.detallesCobro?.sesiones || 1} x ${(s.detallesCobro?.valorSesion || 0).toLocaleString()}`;
                tipoCobroTexto = '<div style="font-size: 0.8rem; color: #6E7781; margin-top: 6px;">Por sesión</div>';
              } else if (s.tipoCobro === 'mes') {
                cantidadValor = `${s.detallesCobro?.meses || 1} x ${(s.detallesCobro?.valorMes || 0).toLocaleString()}`;
                tipoCobroTexto = '<div style="font-size: 0.8rem; color: #6E7781; margin-top: 6px;">Por mes</div>';
              } else if (s.tipoCobro === 'proyecto') {
                cantidadValor = '-';
                tipoCobroTexto = '<div style="font-size: 0.8rem; color: #6E7781; margin-top: 6px;">Total directo</div>';
              }
              return `<tr style="background: ${index % 2 === 0 ? '#ffffff' : '#F6F8FA'};">
                <td style="padding: 20px 25px; border-bottom: 1px solid #E1E4E8; font-weight: 600; color: #0D1117;">${s.nombre || ''}</td>
                <td style="padding: 20px 25px; border-bottom: 1px solid #E1E4E8; color: #6E7781; line-height: 1.5;">${s.detalle || ''}</td>
                <td style="padding: 20px 25px; border-bottom: 1px solid #E1E4E8;">
                  <span style="background: linear-gradient(135deg, #58A6FF, #F778BA); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; box-shadow: 0 2px 8px rgba(88, 166, 255, 0.3);">${s.modalidad || '-'}</span>
                </td>
                <td style="padding: 20px 25px; border-bottom: 1px solid #E1E4E8;">
                  <div style="font-weight: 600; color: #0D1117;">${cantidadValor}</div>
                  ${tipoCobroTexto}
                </td>
                <td style="padding: 20px 25px; border-bottom: 1px solid #E1E4E8; text-align: right; font-weight: 700; color: #58A6FF; font-size: 1.2rem;">${(s.subtotal || 0).toLocaleString()}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Resumen Financiero -->
    <div style="margin-bottom: 40px;">
      <div style="display: flex; align-items: center; margin-bottom: 25px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">💰 Resumen Financiero</h3>
      </div>
      
      <div style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 35px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #E1E4E8;">
            <div style="color: #6E7781; font-size: 1.1rem; font-weight: 500;">Subtotal:</div>
            <div style="color: #0D1117; font-weight: 600; font-size: 1.2rem;">${(total || 0).toLocaleString()} ${moneda || 'CLP'}</div>
          </div>
          
          ${descuento && !isNaN(descuento) && descuento > 0 ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #E1E4E8;">
            <div style="color: #F778BA; font-size: 1.1rem; font-weight: 500;">Descuento (${descuento}%):</div>
            <div style="color: #F778BA; font-weight: 600; font-size: 1.2rem;">-${((total || 0) * descuento / 100).toLocaleString()} ${moneda || 'CLP'}</div>
          </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); margin: 0 -30px -30px -30px; border-radius: 0 0 12px 12px; box-shadow: 0 8px 32px rgba(88, 166, 255, 0.3);">
            <div style="color: white; font-size: 1.4rem; font-weight: 700;">Total Final:</div>
            <div style="color: white; font-size: 1.8rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${totalConDescuento.toLocaleString()} ${moneda || 'CLP'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información Adicional -->
    <div style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">📋 Información Adicional</h3>
      </div>
      <div style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="margin-bottom: 12px; display: flex; align-items: center;">
            <span style="color: #58A6FF; font-weight: 600; margin-right: 8px;">👤</span>
            <span style="color: #0D1117; font-weight: 600;">Atendido por:</span>
            <span style="color: #6E7781; margin-left: 8px;">${atendedor}</span>
          </div>
          <div style="margin-bottom: 12px; display: flex; align-items: center;">
            <span style="color: #58A6FF; font-weight: 600; margin-right: 8px;">⏰</span>
            <span style="color: #0D1117; font-weight: 600;">Válido:</span>
            <span style="color: #6E7781; margin-left: 8px;">15 días desde la fecha de emisión</span>
          </div>
          <div style="margin-bottom: 12px; display: flex; align-items: center;">
            <span style="color: #58A6FF; font-weight: 600; margin-right: 8px;">💳</span>
            <span style="color: #0D1117; font-weight: 600;">Condiciones de pago:</span>
            <span style="color: #6E7781; margin-left: 8px;">50% al aceptar, 50% contra entrega</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="color: #58A6FF; font-weight: 600; margin-right: 8px;">📧</span>
            <span style="color: #0D1117; font-weight: 600;">Consultas:</span>
            <span style="color: #6E7781; margin-left: 8px;">contacto@subeia.tech</span>
          </div>
        </div>
      </div>
    </div>

    ${notasAdicionales ? `
    <div style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">📝 Notas Adicionales</h3>
      </div>
      <div style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8; white-space: pre-wrap; color: #F778BA; font-weight: 500; line-height: 1.6;">
          ${notasAdicionales}
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="margin-top: 60px; text-align: center; background: linear-gradient(135deg, #0D1117 0%, #161B22 100%); padding: 40px; border-radius: 16px; border: 1px solid #30363D; position: relative; overflow: hidden;">
      <!-- Efecto de partículas de fondo -->
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 20% 80%, rgba(88, 166, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(247, 120, 186, 0.1) 0%, transparent 50%);"></div>
      
      <div style="position: relative; z-index: 1;">
        <div style="background: rgba(22, 27, 34, 0.8); backdrop-filter: blur(10px); padding: 30px; border-radius: 12px; border: 1px solid #30363D; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 25px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 12px; margin-right: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; box-shadow: 0 8px 32px rgba(88, 166, 255, 0.3);">SUBE</div>
            <div style="text-align: left;">
              <div style="font-weight: 700; color: #E6EDF3; font-size: 1.3rem; margin-bottom: 6px;">Sube IA Tech Ltda.</div>
              <div style="color: #8B949E; font-size: 1rem;">contacto@subeia.tech</div>
            </div>
          </div>
          
          <div style="border-top: 1px solid #30363D; padding-top: 25px; margin-top: 25px;">
            <div style="color: #8B949E; font-size: 1rem; margin-bottom: 12px;">
              Fco. Mansilla 1007, Castro, Chile &mdash; RUT: 77.994.591-K
            </div>
            <div style="color: #6E7681; font-size: 0.9rem;">
              Documento generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
} 