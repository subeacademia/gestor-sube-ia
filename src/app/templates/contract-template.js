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
  const descuentoTexto = descuento > 0 ? `<div class="descuento-aplicado" style="color:#FF4EFF;font-weight:bold;">Descuento aplicado: <b>${descuento}%</b></div>` : '';

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
    <div class="seccion-firmas" style="margin-top: 50px; page-break-before: always;">
      <div style="display: flex; align-items: center; margin-bottom: 30px;">
        <div style="width: 4px; height: 24px; background: linear-gradient(135deg, #00B8D9, #FF4EFF); border-radius: 2px; margin-right: 12px;"></div>
        <h3 style="font-weight: 700; color: #1e293b; margin: 0; font-size: 1.3rem;">✍️ Firmas Digitales</h3>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <!-- Firma del Representante Legal -->
        <div class="firma-representante" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h4 style="color: #1e293b; font-weight: 700; margin-bottom: 20px; text-align: center; font-size: 1.1rem;">👤 Firma del Representante Legal</h4>
            
            ${representanteLegal ? `
              <div style="margin-bottom: 15px; padding: 12px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #00B8D9;">
                <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Representante</div>
                <div style="color: #1e293b; font-weight: 600;">${representanteLegal}</div>
              </div>
            ` : ''}
            
            ${fechaFirmaRepresentante ? `
              <div style="margin-bottom: 15px; padding: 12px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #00B8D9;">
                <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Fecha de Firma</div>
                <div style="color: #1e293b; font-weight: 600;">${formatearFecha(fechaFirmaRepresentante)}</div>
              </div>
            ` : ''}
            
            ${(firmaInternaBase64 || firmaRepresentanteBase64) ? `
              <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f0fdf4; border: 2px solid #10B981; border-radius: 8px;">
                <img src="${firmaInternaBase64 || firmaRepresentanteBase64}" alt="Firma del Representante" style="max-width: 250px; max-height: 120px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="margin-top: 15px; color: #10B981; font-weight: 700; font-size: 1.1rem;">✅ Firma Válida</div>
              </div>
            ` : `
              <div style="text-align: center; color: #64748b; font-style: italic; margin-top: 20px; padding: 30px; background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 8px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">⏳</div>
                <div style="font-weight: 600; color: #92400e;">Firma pendiente</div>
              </div>
            `}
          </div>
        </div>
        
        <!-- Firma del Cliente -->
        <div class="firma-cliente" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h4 style="color: #1e293b; font-weight: 700; margin-bottom: 20px; text-align: center; font-size: 1.1rem;">👤 Firma del Cliente</h4>
            
            <div style="margin-bottom: 15px; padding: 12px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #00B8D9;">
              <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</div>
              <div style="color: #1e293b; font-weight: 600;">${nombre}</div>
            </div>
            
            <div style="margin-bottom: 15px; padding: 12px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #00B8D9;">
              <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Empresa</div>
              <div style="color: #1e293b; font-weight: 600;">${empresa}</div>
            </div>
            
            ${fechaFirmaCliente ? `
              <div style="margin-bottom: 15px; padding: 12px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #00B8D9;">
                <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Fecha de Firma</div>
                <div style="color: #1e293b; font-weight: 600;">${formatearFecha(fechaFirmaCliente)}</div>
              </div>
            ` : ''}
            
            ${firmaClienteBase64 ? `
              <div style="text-align: center; margin-top: 20px; padding: 20px; background: #f0fdf4; border: 2px solid #10B981; border-radius: 8px;">
                <img src="${firmaClienteBase64}" alt="Firma del Cliente" style="max-width: 250px; max-height: 120px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="margin-top: 15px; color: #10B981; font-weight: 700; font-size: 1.1rem;">✅ Firma Válida</div>
              </div>
            ` : `
              <div style="text-align: center; color: #64748b; font-style: italic; margin-top: 20px; padding: 30px; background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 8px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">⏳</div>
                <div style="font-weight: 600; color: #92400e;">Firma pendiente</div>
              </div>
            `}
          </div>
        </div>
      </div>
      
      <!-- Estado del contrato -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #10B981; border-radius: 12px; padding: 25px; text-align: center; margin-top: 30px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="color: #065f46; font-weight: 700; font-size: 1.2rem; margin-bottom: 10px;">Estado del Contrato: ${estadoContrato}</div>
          ${(firmaInternaBase64 || firmaRepresentanteBase64) && firmaClienteBase64 ? `
            <div style="color: #10B981; font-weight: 700; font-size: 1.1rem; margin-bottom: 5px;">✅ Contrato Completamente Firmado</div>
            <div style="color: #065f46; font-size: 0.9rem;">Documento válido y legalmente vinculante</div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 12px;">
    
    <!-- Header del PDF con diseño mejorado -->
    <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 2px solid #e2e8f0;">
      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #00B8D9, #FF4EFF); border-radius: 12px; margin-right: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">SUBE</div>
        <div>
          <h1 style="font-size: 2.8rem; color: #1e293b; font-weight: 800; margin: 0; letter-spacing: -0.025em;">SUBE IA TECH</h1>
          <h2 style="font-size: 1.4rem; color: #64748b; font-weight: 600; margin: 5px 0 0 0;">${tituloContrato}</h2>
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
          <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 5px;">Código de Contrato</div>
          <div style="color: #00B8D9; font-weight: 700; font-size: 1.2rem; font-family: 'Courier New', monospace; letter-spacing: 1px;">${codigoCotizacion}</div>
        </div>
        <div style="text-align: right;">
          <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 5px;">Estado</div>
          <div style="color: #FF4EFF; font-weight: 700; font-size: 1.1rem;">${estadoContrato}</div>
        </div>
      </div>
    </div>

  <div class="pdf-body" style="color:#23263A;font-size:14px;line-height:1.6;">
    
    <div class="seccion" style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">📋 Información General</h3>
      <div class="info-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
        <div class="info-item" style="background:#f8fafc;padding:12px;border-radius:8px;border-left:4px solid #00B8D9;">
          <strong>Fecha de Creación:</strong><br>
          <span style="color:#64748b;">${formatearFecha(fechaCreacionContrato)}</span>
        </div>
        <div class="info-item" style="background:#f8fafc;padding:12px;border-radius:8px;border-left:4px solid #00B8D9;">
          <strong>Atendido por:</strong><br>
          <span style="color:#64748b;">${atendido}</span>
        </div>
        ${fechaInicio ? `
        <div class="info-item" style="background:#f8fafc;padding:12px;border-radius:8px;border-left:4px solid #00B8D9;">
          <strong>Fecha de Inicio:</strong><br>
          <span style="color:#64748b;">${formatearFecha(fechaInicio)}</span>
        </div>
        ` : ''}
        ${fechaFin ? `
        <div class="info-item" style="background:#f8fafc;padding:12px;border-radius:8px;border-left:4px solid #00B8D9;">
          <strong>Fecha de Fin:</strong><br>
          <span style="color:#64748b;">${formatearFecha(fechaFin)}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <div class="seccion" style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">👤 Información del Cliente</h3>
      <div class="datos-cliente" style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
          <div><strong>Nombre:</strong> ${nombre}</div>
          <div><strong>Email:</strong> ${email}</div>
          <div><strong>RUT:</strong> ${rut}</div>
          <div><strong>Empresa:</strong> ${empresa}</div>
        </div>
      </div>
    </div>

    <div class="seccion" style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">💰 Información Financiera</h3>
      <div class="info-financiera" style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>Valor Total del Contrato:</strong>
            ${descuento > 0 ? `<br><span style="color:#64748b;text-decoration:line-through;">$${(total || 0).toLocaleString()}</span>` : ''}
          </div>
          <div style="text-align:right;">
            <span style="font-size:1.2em;font-weight:bold;color:#00B8D9;">$${totalFinal.toLocaleString()}</span>
            ${descuento > 0 ? `<br><span style="color:#FF4EFF;font-weight:bold;">Con ${descuento}% descuento</span>` : ''}
          </div>
        </div>
      </div>
    </div>

    ${partesInvolucradas ? `
    <div class="seccion" style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">🤝 Partes Involucradas</h3>
      <div class="partes-involucradas" style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;white-space:pre-wrap;">
        ${partesInvolucradas}
      </div>
    </div>
    ` : ''}

    ${objetoContrato ? `
    <div class="seccion" style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">📄 Objeto del Contrato</h3>
      <div class="objeto-contrato" style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;white-space:pre-wrap;">
        ${objetoContrato}
      </div>
    </div>
    ` : ''}

    ${descripcionServicios ? `
    <div class="seccion" style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">📝 Descripción de Servicios</h3>
      <div class="descripcion-servicios" style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;white-space:pre-wrap;">
        ${descripcionServicios}
      </div>
    </div>
    ` : ''}

    ${clausulas ? `
    <div class="seccion" style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">📜 Cláusulas y Términos</h3>
      <div class="clausulas-terminos" style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;white-space:pre-wrap;">
        ${clausulas}
      </div>
    </div>
    ` : ''}

    ${terminosCondiciones ? `
    <div class="seccion" style="margin-bottom: 25px;">
      <h3 style="font-weight:bold;color:#00B8D9;border-bottom: 2px solid #00B8D9;padding-bottom: 8px;margin-bottom: 15px;">📋 Términos y Condiciones</h3>
      <div class="terminos-condiciones" style="background:#f8fafc;padding:15px;border-radius:8px;border:2px solid #e2e8f0;white-space:pre-wrap;">
        ${terminosCondiciones}
      </div>
    </div>
    ` : ''}

  </div>

  ${seccionFirmas}

  <div class="footer" style="margin-top: 40px;text-align: center;border-top: 3px solid #00B8D9;padding-top: 20px;color:#23263A;">
    <div style="font-weight:bold;margin-bottom: 10px;">Sube IA Tech Ltda.</div>
    <div style="font-size:0.9em;color:#64748b;margin-bottom: 15px;">
      contacto@subeia.tech &mdash; Fco. Mansilla 1007, Castro, Chile
    </div>
    <div style="font-size:0.8em;color:#64748b;">
      Documento generado el ${new Date().toLocaleDateString('es-CL')}
    </div>
    <img src="./assets/logo-blanco.png" alt="Logo SUBE IA TECH" style="height:48px;margin-top: 15px;">
  </div>
  `;
} 