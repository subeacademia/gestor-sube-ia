import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';

declare var SignaturePad: any;

@Component({
  selector: 'app-firmar-contrato-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './firmar-contrato-cliente.component.html',
  styleUrls: ['./firmar-contrato-cliente.component.scss']
})
export class FirmarContratoClienteComponent implements OnInit, AfterViewInit {
  @ViewChild('firmaClienteCanvas', { static: false }) firmaClienteCanvas!: ElementRef<HTMLCanvasElement>;

  // Variables del componente
  contrato: any = null;
  loading = true;
  error = false;
  errorMessage = '';
  
  // Variables de firma
  signaturePadCliente: any = null;
  firmaClienteGuardada = false;
  
  // Variables de estado
  contratoFirmado = false;
  mostrandoExito = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    console.log('🚀 FirmarContratoClienteComponent: Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('🔧 FirmarContratoClienteComponent: ngOnInit ejecutado');
    this.cargarContrato();
  }

  ngAfterViewInit(): void {
    console.log('🎨 FirmarContratoClienteComponent: ngAfterViewInit ejecutado');
    // Inicializar SignaturePad después de que la vista esté lista
    setTimeout(() => {
      this.inicializarSignaturePad();
    }, 100);
  }

  async cargarContrato(): Promise<void> {
    try {
      this.loading = true;
      this.error = false;

      // Obtener parámetros desde la URL
      const contratoId = this.route.snapshot.paramMap.get('idContrato');
      const token = this.route.snapshot.paramMap.get('token');
      
      if (!contratoId || !token) {
        throw new Error('Enlace inválido. Faltan parámetros requeridos.');
      }

      console.log('📋 Cargando contrato para firma del cliente:', contratoId);

      // Validar token y cargar contrato
      await this.validarTokenYCargarContrato(contratoId, token);

    } catch (error: any) {
      console.error('❌ Error al cargar contrato:', error);
      this.error = true;
      this.errorMessage = error.message || 'Error al cargar el contrato';
    } finally {
      this.loading = false;
    }
  }

  async validarTokenYCargarContrato(contratoId: string, token: string): Promise<void> {
    try {
      // Validar token
      const tokenValido = await this.firebaseService.validarTokenFirma(contratoId, token);
      
      if (!tokenValido) {
        throw new Error('Token de firma inválido o contrato no disponible');
      }

      // Obtener contrato específico
      this.contrato = await this.firebaseService.getContratoById(contratoId);

      console.log('✅ Contrato validado y cargado para firma del cliente:', this.contrato);

    } catch (error: any) {
      console.error('❌ Error al validar token y cargar contrato:', error);
      throw error;
    }
  }

  inicializarSignaturePad(): void {
    try {
      // Verificar que SignaturePad esté disponible
      if (typeof SignaturePad === 'undefined') {
        throw new Error('SignaturePad no está disponible');
      }

      console.log('🎨 Inicializando SignaturePad para cliente...');

      // Inicializar SignaturePad para cliente
      if (this.firmaClienteCanvas) {
        this.signaturePadCliente = new SignaturePad(this.firmaClienteCanvas.nativeElement, {
          backgroundColor: 'rgb(250, 250, 250)',
          penColor: 'rgb(0, 0, 0)',
          penWidth: 2
        });
        console.log('✅ SignaturePad cliente inicializado');
      }

    } catch (error: any) {
      console.error('❌ Error al inicializar SignaturePad:', error);
      this.error = true;
      this.errorMessage = 'Error al inicializar el pad de firma: ' + error.message;
    }
  }

  // Funciones de firma del cliente
  limpiarFirma(): void {
    if (this.signaturePadCliente) {
      this.signaturePadCliente.clear();
      console.log('🧹 Firma del cliente limpiada');
      this.mostrarNotificacion('Firma limpiada', 'success');
    }
  }

  async firmarContrato(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!this.signaturePadCliente) {
      this.mostrarNotificacion('Error: Pad de firma no inicializado', 'error');
      return;
    }

    // Verificar si el pad de firma está vacío
    if (this.signaturePadCliente.isEmpty()) {
      this.mostrarNotificacion('Por favor, firme en el área antes de continuar', 'error');
      return;
    }

    try {
      console.log('✍️ Guardando firma del cliente...');

      // Obtener la firma como imagen Base64
      const firmaBase64 = this.signaturePadCliente.toDataURL('image/png');

      // Actualizar firma del cliente
      await this.firebaseService.actualizarFirmaCliente(this.contrato.id, firmaBase64);

      // Actualizar estado local
      this.firmaClienteGuardada = true;
      this.contrato.firmaClienteBase64 = firmaBase64;

      console.log('✅ Firma del cliente guardada exitosamente');
      this.mostrarNotificacion('Firma del cliente guardada exitosamente', 'success');

      // Mostrar mensaje de éxito
      this.mostrarMensajeExito();

      // Enviar email de confirmación
      await this.enviarEmailConfirmacion();

    } catch (error: any) {
      console.error('❌ Error al guardar firma del cliente:', error);
      this.mostrarNotificacion('Error al guardar la firma: ' + error.message, 'error');
    }
  }

  // Función para mostrar mensaje de éxito
  mostrarMensajeExito(): void {
    this.contratoFirmado = true;
    this.mostrandoExito = true;
    
    // Scroll hacia arriba para mostrar el mensaje
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Función para enviar email de confirmación
  async enviarEmailConfirmacion(): Promise<void> {
    try {
      console.log('📧 Enviando email de confirmación...');

      // Generar contenido del email de confirmación
      const asunto = `✅ Contrato Firmado - ${this.contrato.tituloContrato || this.contrato.codigoCotizacion}`;
      const mensaje = `
Estimado ${this.contrato.cliente?.nombre || this.contrato.nombreCliente || 'Cliente'},

Su contrato ha sido firmado exitosamente.

Detalles del contrato:
- Título: ${this.contrato.tituloContrato || this.contrato.titulo || 'Sin título'}
- Código: ${this.contrato.codigoCotizacion || this.contrato.codigo || 'Sin código'}
- Valor: $${(this.contrato.totalConDescuento || this.contrato.valorTotal || this.contrato.total || 0).toLocaleString()}
- Fecha de firma: ${this.formatearFecha(new Date())}

Adjunto encontrará una copia del contrato firmado.

Saludos cordiales,
Equipo SUBE IA
www.subeia.tech
      `;

      // Enviar email al cliente
      await this.enviarEmail(this.contrato.cliente?.email || this.contrato.emailCliente, asunto, mensaje);

      // Enviar copia al administrador
      const asuntoAdmin = `📋 Contrato Firmado - ${this.contrato.cliente?.nombre || this.contrato.nombreCliente} - ${this.contrato.codigoCotizacion || this.contrato.codigo}`;
      const mensajeAdmin = `
Se ha firmado un nuevo contrato:

Cliente: ${this.contrato.cliente?.nombre || this.contrato.nombreCliente}
Empresa: ${this.contrato.cliente?.empresa || this.contrato.empresa}
Email: ${this.contrato.cliente?.email || this.contrato.emailCliente}
Contrato: ${this.contrato.tituloContrato || this.contrato.titulo}
Código: ${this.contrato.codigoCotizacion || this.contrato.codigo}
Valor: $${(this.contrato.totalConDescuento || this.contrato.valorTotal || this.contrato.total || 0).toLocaleString()}
Fecha: ${this.formatearFecha(new Date())}

El contrato está listo para ser marcado como finalizado.
      `;

      // Enviar al email del administrador (configurar en variables de entorno)
      await this.enviarEmail('admin@subeia.tech', asuntoAdmin, mensajeAdmin);

      console.log('✅ Emails de confirmación enviados');

    } catch (error) {
      console.error('❌ Error al enviar email de confirmación:', error);
    }
  }

  // Función de envío de email
  async enviarEmail(destinatario: string, asunto: string, mensaje: string): Promise<boolean> {
    try {
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('📧 Enviando email:');
      console.log('   Destinatario:', destinatario);
      console.log('   Asunto:', asunto);
      console.log('   Mensaje:', mensaje);
      
      // En un entorno real, aquí se integraría con un servicio de email
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Firebase Functions + Nodemailer
      
      return true;
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      throw error;
    }
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 