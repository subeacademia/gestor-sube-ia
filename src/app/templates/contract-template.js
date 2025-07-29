// Plantilla para generar el HTML de los contratos con firmas
export function renderContract(contratoData) {
  const {
    tituloContrato = 'Contrato de Servicios',
    codigoCotizacion = 'Sin código',
    estadoContrato = 'Pendiente de Firma',
    fechaCreacionContrato,
    atendido = 'No especificado',
    fechaInicio,
    fechaFin,
    cliente = {},
    totalConDescuento,
    total,
    descuento = 0,
    descripcionServicios,
    terminosCondiciones,
    // Firmas
    firmaInternaBase64,
    firmaRepresentanteBase64,
    firmaClienteBase64,
    representanteLegal,
    fechaFirmaRepresentante,
    fechaFirmaCliente,
    // Información adicional
    partesInvolucradas,
    objetoContrato,
    clausulas
  } = contratoData;

  const { nombre = 'No especificado', email = 'No especificado', rut = 'No especificado', empresa = 'No especificada' } = cliente;

  // Calcular total
  const totalFinal = totalConDescuento || total || 0;
  const descuentoTexto = descuento > 0 ? `<div class="descuento-aplicado" style="color:#F778BA;font-weight:bold;">Descuento aplicado: <b>${descuento}%</b></div>` : '';

  // Formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    try {
      if (fecha && typeof fecha === 'object' && fecha.toDate) {
        return fecha.toDate().toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(fecha).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  // Sección de firmas
  const seccionFirmas = `
    <div class="seccion-firmas" style="margin-top: 60px; page-break-before: always;">
      <div style="display: flex; align-items: center; margin-bottom: 35px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">✍️ Firmas Digitales</h3>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 35px; margin-bottom: 35px;">
        <!-- Firma del Representante Legal -->
        <div class="firma-representante" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); border: 1px solid #E1E4E8; border-radius: 16px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
            <h4 style="color: #0D1117; font-weight: 700; margin-bottom: 25px; text-align: center; font-size: 1.2rem;">👤 Firma del Representante Legal</h4>
            
            ${representanteLegal ? `
              <div style="margin-bottom: 18px; padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF; box-shadow: 0 2px 8px rgba(88, 166, 255, 0.1);">
                <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Representante</div>
                <div style="color: #0D1117; font-weight: 700;">${representanteLegal}</div>
              </div>
            ` : ''}
            
            ${fechaFirmaRepresentante ? `
              <div style="margin-bottom: 18px; padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF; box-shadow: 0 2px 8px rgba(88, 166, 255, 0.1);">
                <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Fecha de Firma</div>
                <div style="color: #0D1117; font-weight: 700;">${formatearFecha(fechaFirmaRepresentante)}</div>
              </div>
            ` : ''}
            
            ${(firmaInternaBase64 || firmaRepresentanteBase64) ? `
              <div style="text-align: center; margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px solid #10B981; border-radius: 12px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);">
                <img src="${firmaInternaBase64 || firmaRepresentanteBase64}" alt="Firma del Representante" style="max-width: 280px; max-height: 140px; border: 1px solid #E1E4E8; border-radius: 8px; background: white; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
                <div style="margin-top: 18px; color: #10B981; font-weight: 700; font-size: 1.2rem;">✅ Firma Válida</div>
              </div>
            ` : `
              <div style="text-align: center; color: #6E7781; font-style: italic; margin-top: 25px; padding: 35px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px dashed #F59E0B; border-radius: 12px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);">
                <div style="font-size: 3.5rem; margin-bottom: 18px;">⏳</div>
                <div style="font-weight: 700; color: #92400E;">Firma pendiente</div>
              </div>
            `}
          </div>
        </div>
        
        <!-- Firma del Cliente -->
        <div class="firma-cliente" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); border: 1px solid #E1E4E8; border-radius: 16px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
            <h4 style="color: #0D1117; font-weight: 700; margin-bottom: 25px; text-align: center; font-size: 1.2rem;">👤 Firma del Cliente</h4>
            
            <div style="margin-bottom: 18px; padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF; box-shadow: 0 2px 8px rgba(88, 166, 255, 0.1);">
              <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Cliente</div>
              <div style="color: #0D1117; font-weight: 700;">${nombre}</div>
            </div>
            
            <div style="margin-bottom: 18px; padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF; box-shadow: 0 2px 8px rgba(88, 166, 255, 0.1);">
              <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Empresa</div>
              <div style="color: #0D1117; font-weight: 700;">${empresa}</div>
            </div>
            
            ${fechaFirmaCliente ? `
              <div style="margin-bottom: 18px; padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF; box-shadow: 0 2px 8px rgba(88, 166, 255, 0.1);">
                <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Fecha de Firma</div>
                <div style="color: #0D1117; font-weight: 700;">${formatearFecha(fechaFirmaCliente)}</div>
              </div>
            ` : ''}
            
            ${firmaClienteBase64 ? `
              <div style="text-align: center; margin-top: 25px; padding: 25px; background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px solid #10B981; border-radius: 12px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);">
                <img src="${firmaClienteBase64}" alt="Firma del Cliente" style="max-width: 280px; max-height: 140px; border: 1px solid #E1E4E8; border-radius: 8px; background: white; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
                <div style="margin-top: 18px; color: #10B981; font-weight: 700; font-size: 1.2rem;">✅ Firma Válida</div>
              </div>
            ` : `
              <div style="text-align: center; color: #6E7781; font-style: italic; margin-top: 25px; padding: 35px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px dashed #F59E0B; border-radius: 12px; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.1);">
                <div style="font-size: 3.5rem; margin-bottom: 18px;">⏳</div>
                <div style="font-weight: 700; color: #92400E;">Firma pendiente</div>
              </div>
            `}
          </div>
        </div>
      </div>
      
      <!-- Estado del contrato -->
      <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px solid #10B981; border-radius: 16px; padding: 30px; text-align: center; margin-top: 35px; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);">
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="color: #065F46; font-weight: 700; font-size: 1.3rem; margin-bottom: 12px;">Estado del Contrato: ${estadoContrato}</div>
          ${(firmaInternaBase64 || firmaRepresentanteBase64) && firmaClienteBase64 ? `
            <div style="color: #10B981; font-weight: 700; font-size: 1.2rem; margin-bottom: 8px;">✅ Contrato Completamente Firmado</div>
            <div style="color: #065F46; font-size: 1rem;">Documento válido y legalmente vinculante</div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

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
            <h2 style="font-size: 1.6rem; color: #8B949E; font-weight: 600; margin: 8px 0 0 0; letter-spacing: 0.02em;">${tituloContrato}</h2>
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
            <div style="color: #8B949E; font-size: 0.9rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Código de Contrato</div>
            <div style="color: #58A6FF; font-weight: 700; font-size: 1.4rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 2px; text-shadow: 0 0 20px rgba(88, 166, 255, 0.5);">${codigoCotizacion}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #8B949E; font-size: 0.9rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Estado</div>
            <div style="color: #F778BA; font-weight: 700; font-size: 1.2rem;">${estadoContrato}</div>
          </div>
        </div>
      </div>
    </div>

  <div class="pdf-body" style="color:#0D1117;font-size:14px;line-height:1.6;">
    
    <div class="seccion" style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">📋 Información General</h3>
      </div>
      <div class="info-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="info-item" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 18px; border-radius: 12px; border-left: 4px solid #58A6FF; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Fecha de Creación</div>
          <div style="color: #0D1117; font-weight: 700;">${formatearFecha(fechaCreacionContrato)}</div>
        </div>
        <div class="info-item" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 18px; border-radius: 12px; border-left: 4px solid #58A6FF; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Atendido por</div>
          <div style="color: #0D1117; font-weight: 700;">${atendido}</div>
        </div>
        ${fechaInicio ? `
        <div class="info-item" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 18px; border-radius: 12px; border-left: 4px solid #58A6FF; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Fecha de Inicio</div>
          <div style="color: #0D1117; font-weight: 700;">${formatearFecha(fechaInicio)}</div>
        </div>
        ` : ''}
        ${fechaFin ? `
        <div class="info-item" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 18px; border-radius: 12px; border-left: 4px solid #58A6FF; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Fecha de Fin</div>
          <div style="color: #0D1117; font-weight: 700;">${formatearFecha(fechaFin)}</div>
        </div>
        ` : ''}
      </div>
    </div>

    <div class="seccion" style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">👤 Información del Cliente</h3>
      </div>
      <div class="datos-cliente" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div style="padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF;">
              <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Nombre</div>
              <div style="color: #0D1117; font-weight: 700;">${nombre}</div>
            </div>
            <div style="padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF;">
              <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Email</div>
              <div style="color: #0D1117; font-weight: 700;">${email}</div>
            </div>
            <div style="padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF;">
              <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">RUT</div>
              <div style="color: #0D1117; font-weight: 700;">${rut}</div>
            </div>
            <div style="padding: 15px; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border-radius: 8px; border-left: 4px solid #58A6FF;">
              <div style="color: #6E7781; font-size: 0.85rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Empresa</div>
              <div style="color: #0D1117; font-weight: 700;">${empresa}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="seccion" style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">💰 Información Financiera</h3>
      </div>
      <div class="info-financiera" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="color: #0D1117; font-weight: 700; font-size: 1.1rem;">Valor Total del Contrato:</div>
              ${descuento > 0 ? `<div style="color:#6E7781;text-decoration:line-through;margin-top:5px;">$${(total || 0).toLocaleString()}</div>` : ''}
            </div>
            <div style="text-align:right;">
              <span style="font-size:1.4em;font-weight:800;color:#58A6FF;text-shadow: 0 2px 4px rgba(88, 166, 255, 0.3);">$${totalFinal.toLocaleString()}</span>
              ${descuento > 0 ? `<div style="color:#F778BA;font-weight:700;margin-top:5px;">Con ${descuento}% descuento</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>

    ${partesInvolucradas ? `
    <div class="seccion" style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">🤝 Partes Involucradas</h3>
      </div>
      <div class="partes-involucradas" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08); white-space:pre-wrap;">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8; line-height: 1.6;">
          ${partesInvolucradas}
        </div>
      </div>
    </div>
    ` : ''}

    ${objetoContrato ? `
    <div class="seccion" style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">📄 Objeto del Contrato</h3>
      </div>
      <div class="objeto-contrato" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08); white-space:pre-wrap;">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8; line-height: 1.6;">
          ${objetoContrato}
        </div>
      </div>
    </div>
    ` : ''}

    ${descripcionServicios ? `
    <div class="seccion" style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">📝 Descripción de Servicios</h3>
      </div>
      <div class="descripcion-servicios" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08); white-space:pre-wrap;">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8; line-height: 1.6;">
          ${descripcionServicios}
        </div>
      </div>
    </div>
    ` : ''}

    ${clausulas ? `
    <div class="seccion" style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">📜 Cláusulas y Términos</h3>
      </div>
      <div class="clausulas-terminos" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08); white-space:pre-wrap;">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8; line-height: 1.6;">
          ${clausulas}
        </div>
      </div>
    </div>
    ` : ''}

    ${terminosCondiciones ? `
    <div class="seccion" style="margin-bottom: 30px;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="width: 6px; height: 30px; background: linear-gradient(135deg, #58A6FF, #F778BA); border-radius: 3px; margin-right: 15px;"></div>
        <h3 style="font-weight: 700; color: #0D1117; margin: 0; font-size: 1.5rem;">📋 Términos y Condiciones</h3>
      </div>
      <div class="terminos-condiciones" style="background: linear-gradient(135deg, #F6F8FA 0%, #E1E4E8 100%); padding: 25px; border-radius: 16px; border: 1px solid #E1E4E8; box-shadow: 0 8px 32px rgba(0,0,0,0.08); white-space:pre-wrap;">
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #E1E4E8; line-height: 1.6;">
          ${terminosCondiciones}
        </div>
      </div>
    </div>
    ` : ''}

  </div>

  ${seccionFirmas}

  <div class="footer" style="margin-top: 50px; text-align: center; background: linear-gradient(135deg, #0D1117 0%, #161B22 100%); padding: 40px; border-radius: 16px; border: 1px solid #30363D; position: relative; overflow: hidden;">
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
  `;
} 