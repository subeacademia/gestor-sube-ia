import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';

declare var html2pdf: any;

@Component({
  selector: 'app-preview-contrato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-contrato.component.html',
  styleUrls: ['./preview-contrato.component.scss']
})
export class PreviewContratoComponent implements OnInit {
  // Variables del componente
  contrato: any = null;
  loading = true;
  error = false;
  errorMessage = '';
  generandoPDF = false;
  fechaActual = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    console.log('🚀 PreviewContratoComponent: Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('🔧 PreviewContratoComponent: ngOnInit ejecutado');
    this.cargarContrato();
  }

  async cargarContrato(): Promise<void> {
    try {
      this.loading = true;
      this.error = false;

      // Obtener ID del contrato desde los parámetros de la ruta
      const contratoId = this.route.snapshot.paramMap.get('id');
      
      if (!contratoId) {
        throw new Error('No se proporcionó ID de contrato');
      }

      console.log('📋 Cargando contrato para previsualización:', contratoId);

      // Obtener contrato específico
      this.contrato = await this.firebaseService.getContratoById(contratoId);

      if (!this.contrato) {
        throw new Error('Contrato no encontrado');
      }

      console.log('✅ Contrato cargado para previsualización:', this.contrato);

    } catch (error: any) {
      console.error('❌ Error al cargar contrato:', error);
      this.error = true;
      this.errorMessage = error.message || 'Error al cargar el contrato';
    } finally {
      this.loading = false;
    }
  }

  async generarPDF(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    try {
      this.generandoPDF = true;
      console.log('📄 Generando PDF del contrato...');

      // Crear elemento temporal para el PDF
      const elementoPDF = this.crearElementoPDF();
      document.body.appendChild(elementoPDF);

      // Configuración de html2pdf
      const opciones = {
        margin: [10, 10, 10, 10],
        filename: `contrato-${this.contrato.codigo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      // Generar PDF
      await html2pdf().from(elementoPDF).set(opciones).save();

      // Limpiar elemento temporal
      document.body.removeChild(elementoPDF);

      console.log('✅ PDF generado exitosamente');
      this.mostrarNotificacion('PDF generado y descargado exitosamente', 'success');

    } catch (error: any) {
      console.error('❌ Error al generar PDF:', error);
      this.mostrarNotificacion('Error al generar PDF: ' + error.message, 'error');
    } finally {
      this.generandoPDF = false;
    }
  }

  crearElementoPDF(): HTMLElement {
    const elemento = document.createElement('div');
    elemento.className = 'pdf-container';
    elemento.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 210mm;
      background: white;
      padding: 20mm;
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
    `;

    elemento.innerHTML = `
      <div class="pdf-header">
        <div class="logo-section">
          <h1 style="color: #667eea; margin: 0; font-size: 24px;">SUBE IA</h1>
          <p style="margin: 5px 0; color: #666;">Tecnología e Innovación</p>
        </div>
        <div class="contract-info">
          <h2 style="margin: 0 0 10px 0; color: #333;">${this.contrato.titulo || 'Contrato de Servicios'}</h2>
          <p style="margin: 5px 0;"><strong>Código:</strong> ${this.contrato.codigo}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${this.formatearFecha(this.contrato.fechaCreacionContrato)}</p>
        </div>
      </div>

      <div class="pdf-content">
        <div class="section">
          <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;">INFORMACIÓN DEL CLIENTE</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <tr>
              <td style="padding: 5px; border: 1px solid #ddd;"><strong>Nombre:</strong></td>
              <td style="padding: 5px; border: 1px solid #ddd;">${this.contrato.nombreCliente}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 5px; border: 1px solid #ddd;">${this.contrato.emailCliente}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #ddd;"><strong>Empresa:</strong></td>
              <td style="padding: 5px; border: 1px solid #ddd;">${this.contrato.empresa || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #ddd;"><strong>RUT:</strong></td>
              <td style="padding: 5px; border: 1px solid #ddd;">${this.contrato.rutCliente || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;">SERVICIOS</h3>
          <p style="margin: 10px 0;">${this.contrato.servicios || 'Servicios generales'}</p>
          ${this.contrato.descripcionServicios ? `<p style="margin: 10px 0;"><strong>Descripción:</strong><br>${this.contrato.descripcionServicios}</p>` : ''}
        </div>

        <div class="section">
          <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;">INFORMACIÓN FINANCIERA</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Valor Total:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-size: 16px; font-weight: bold; color: #667eea;">${this.formatearMoneda(this.contrato.valorTotal)}</td>
            </tr>
          </table>
        </div>

        ${this.contrato.terminosCondiciones ? `
        <div class="section">
          <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;">TÉRMINOS Y CONDICIONES</h3>
          <p style="margin: 10px 0; text-align: justify;">${this.contrato.terminosCondiciones}</p>
        </div>
        ` : ''}

        <div class="section">
          <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;">FIRMAS</h3>
          <div style="display: flex; justify-content: space-between; margin: 20px 0;">
            <div style="width: 45%; text-align: center;">
              <h4 style="margin: 10px 0;">Representante Legal</h4>
              ${this.contrato.firmaRepresentanteBase64 ? 
                `<img src="${this.contrato.firmaRepresentanteBase64}" style="max-width: 200px; max-height: 100px; border: 1px solid #ddd;" />` : 
                '<div style="height: 100px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999;">Sin firma</div>'
              }
              <p style="margin: 5px 0; font-size: 11px;">${this.contrato.representanteLegal || 'Representante Legal'}</p>
              <p style="margin: 5px 0; font-size: 11px;">${this.contrato.fechaFirmaRepresentante ? this.formatearFecha(this.contrato.fechaFirmaRepresentante) : 'Fecha: ________'}</p>
            </div>
            <div style="width: 45%; text-align: center;">
              <h4 style="margin: 10px 0;">Cliente</h4>
              ${this.contrato.firmaClienteBase64 ? 
                `<img src="${this.contrato.firmaClienteBase64}" style="max-width: 200px; max-height: 100px; border: 1px solid #ddd;" />` : 
                '<div style="height: 100px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999;">Sin firma</div>'
              }
              <p style="margin: 5px 0; font-size: 11px;">${this.contrato.nombreCliente}</p>
              <p style="margin: 5px 0; font-size: 11px;">${this.contrato.fechaFirmaCliente ? this.formatearFecha(this.contrato.fechaFirmaCliente) : 'Fecha: ________'}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;">ESTADO DEL CONTRATO</h3>
          <p style="margin: 10px 0;"><strong>Estado:</strong> ${this.contrato.estado}</p>
          ${this.contrato.fechaFirmaFinal ? `<p style="margin: 10px 0;"><strong>Fecha de Finalización:</strong> ${this.formatearFecha(this.contrato.fechaFirmaFinal)}</p>` : ''}
        </div>
      </div>

      <div class="pdf-footer" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #666;">
        <p>SUBE IA - Tecnología e Innovación</p>
        <p>www.subeia.tech | admin@subeia.tech</p>
        <p>Documento generado el ${this.formatearFecha(new Date())}</p>
      </div>
    `;

    return elemento;
  }

  volverContratos(): void {
    this.router.navigate(['/contratos']);
  }

  // Función para mostrar notificaciones
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    console.log(`🔔 Notificación [${tipo}]:`, mensaje);
    
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
      <div class="notificacion-contenido">
        <span class="notificacion-icono">${tipo === 'success' ? '✅' : '❌'}</span>
        <span class="notificacion-mensaje">${mensaje}</span>
        <button class="notificacion-cerrar" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Agregar estilos
    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Animación de entrada
    setTimeout(() => {
      notificacion.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      notificacion.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notificacion.parentElement) {
          notificacion.remove();
        }
      }, 300);
    }, 5000);
  }

  // Función para formatear fechas
  formatearFecha(fecha: any): string {
    if (!fecha) return 'Fecha no disponible';
    
    let fechaObj: Date;
    
    // Si es un timestamp de Firestore
    if (fecha && typeof fecha === 'object' && fecha.toDate) {
      fechaObj = fecha.toDate();
    }
    // Si es una fecha válida
    else if (fecha instanceof Date) {
      fechaObj = fecha;
    }
    // Si es un string o número, intentar crear Date
    else {
      fechaObj = new Date(fecha);
    }
    
    // Verificar que la fecha sea válida
    if (isNaN(fechaObj.getTime())) {
      return 'Fecha no disponible';
    }
    
    return fechaObj.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Función para obtener la clase CSS del estado
  getEstadoClass(estado: string): string {
    const estadoNormalizado = (estado || 'pendiente-de-firma').toLowerCase().replace(/\s+/g, '-');
    return `estado-${estadoNormalizado}`;
  }

  // Función para formatear moneda
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(valor);
  }
} 