import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../core/services/email.service';

declare var SignaturePad: any;
declare global {
  interface Window {
    SignaturePad: any;
  }
}

@Component({
  selector: 'app-firmar-contrato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './firmar-contrato.component.html',
  styleUrls: ['./firmar-contrato.component.scss']
})
export class FirmarContratoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('firmaCanvas', { static: false }) signaturePadElement!: ElementRef<HTMLCanvasElement>;
  private signaturePad: any = null;

  // Variables del componente
  contrato: any = null;
  loading = true;
  error = false;
  errorMessage = '';
  
  // Variables de firma
  firmaInternaGuardada = false;
  mostrandoModalEnvio = false;
  
  // Variables de representante
  representantes = [
    { value: 'Bruno Villalobos - CEO', label: 'Bruno Villalobos - CEO' },
    { value: 'Mario Muñoz - CAO', label: 'Mario Muñoz - CAO' },
    { value: 'Rodrigo Carrillo - CTO', label: 'Rodrigo Carrillo - CTO' }
  ];
  representanteSeleccionado = '';
  
  // Variables para el modal de envío
  emailCliente = '';
  mensajePersonalizado = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private emailService: EmailService
  ) {
    console.log('🚀 FirmarContratoComponent: Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('🔧 FirmarContratoComponent: ngOnInit ejecutado');
    this.cargarContrato();
    
    // Agregar listener para redimensionamiento de ventana
    window.addEventListener('resize', () => {
      if (this.signaturePad) {
        setTimeout(() => {
          this.configurarCanvas();
        }, 100);
      }
    });
  }

  ngAfterViewInit(): void {
    console.log('🎨 FirmarContratoComponent: ngAfterViewInit ejecutado');
    // Inicializar SignaturePad después de que la vista esté lista y el contrato esté cargado
    setTimeout(() => {
      if (this.contrato && !this.loading) {
        this.inicializarSignaturePad();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar el listener de redimensionamiento
    window.removeEventListener('resize', () => {
      if (this.signaturePad) {
        setTimeout(() => {
          this.configurarCanvas();
        }, 100);
      }
    });
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

      console.log('📋 Cargando contrato:', contratoId);

      // Obtener contrato específico
      this.contrato = await this.firebaseService.getContratoById(contratoId);

      if (!this.contrato) {
        throw new Error('Contrato no encontrado');
      }

      console.log('✅ Contrato cargado:', this.contrato);

      // Verificar firma interna existente
      this.verificarFirmaInterna();

      // Pre-llenar email del cliente
      this.emailCliente = this.contrato.cliente?.email || this.contrato.emailCliente || '';

      // Inicializar SignaturePad después de cargar el contrato
      setTimeout(() => {
        this.inicializarSignaturePad();
      }, 100);

    } catch (error: any) {
      console.error('❌ Error al cargar contrato:', error);
      this.error = true;
      this.errorMessage = error.message || 'Error al cargar el contrato';
    } finally {
      this.loading = false;
    }
  }

  verificarFirmaInterna(): void {
    console.log('🔍 Verificando firma interna existente...');
    console.log('Contrato:', this.contrato);
    console.log('firmaInternaBase64:', this.contrato?.firmaInternaBase64);
    console.log('firmaRepresentanteBase64:', this.contrato?.firmaRepresentanteBase64);

    if (this.contrato && (this.contrato.firmaInternaBase64 || this.contrato.firmaRepresentanteBase64)) {
      console.log('✅ Firma interna encontrada');
      this.firmaInternaGuardada = true;
      this.representanteSeleccionado = this.contrato.representanteLegal || '';
      console.log('firmaInternaGuardada establecida a:', this.firmaInternaGuardada);
    } else {
      console.log('❌ Firma interna no encontrada');
      this.firmaInternaGuardada = false;
      console.log('firmaInternaGuardada establecida a:', this.firmaInternaGuardada);
    }
  }

  inicializarSignaturePad(): void {
    try {
      console.log('🎨 Inicializando SignaturePad...');

      // Verificar que el contrato esté cargado
      if (!this.contrato) {
        console.log('⏳ Contrato no cargado aún, esperando...');
        return;
      }

      // Verificar que el elemento canvas existe
      if (!this.signaturePadElement || !this.signaturePadElement.nativeElement) {
        console.log('⏳ Elemento canvas no disponible aún, esperando...');
        setTimeout(() => {
          this.inicializarSignaturePad();
        }, 200);
        return;
      }

      // Cargar SignaturePad dinámicamente si no está disponible
      if (typeof SignaturePad === 'undefined' && typeof window.SignaturePad === 'undefined') {
        console.log('📦 SignaturePad no disponible, cargando dinámicamente...');
        this.cargarSignaturePad();
        return;
      }

      // Usar SignaturePad global si está disponible
      const SignaturePadClass = SignaturePad || window.SignaturePad;
      if (!SignaturePadClass) {
        console.log('⏳ SignaturePad aún no disponible, esperando...');
        setTimeout(() => {
          this.inicializarSignaturePad();
        }, 200);
        return;
      }

      // Inicializar SignaturePad solo si no hay firma guardada
      if (!this.firmaInternaGuardada) {
        try {
          // Configurar el canvas antes de inicializar SignaturePad
          this.configurarCanvas();
          
          this.signaturePad = new SignaturePadClass(this.signaturePadElement.nativeElement, {
            backgroundColor: 'rgb(250, 250, 250)',
            penColor: 'rgb(0, 0, 0)',
            penWidth: 2,
            minWidth: 0.5,
            maxWidth: 2.5
          });
          
          console.log('✅ SignaturePad inicializado correctamente');
        } catch (error: any) {
          console.error('❌ Error al inicializar SignaturePad:', error);
          this.error = true;
          this.errorMessage = 'Error al inicializar el pad de firma: ' + (error.message || 'Error desconocido');
        }
      }

      // Mostrar firma existente si la hay
      this.mostrarFirmaExistente();

    } catch (error: any) {
      console.error('❌ Error al inicializar SignaturePad:', error);
      this.error = true;
      this.errorMessage = 'Error al inicializar el pad de firma: ' + error.message;
    }
  }

  cargarSignaturePad(): void {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js';
    script.onload = () => {
      console.log('✅ SignaturePad cargado dinámicamente');
      // Verificar que SignaturePad esté disponible globalmente
      if (typeof (window as any).SignaturePad !== 'undefined') {
        (window as any).SignaturePad = (window as any).SignaturePad;
        console.log('✅ SignaturePad disponible globalmente');
      }
      setTimeout(() => {
        this.inicializarSignaturePad();
      }, 100);
    };
    script.onerror = () => {
      console.error('❌ Error al cargar SignaturePad');
      this.mostrarNotificacion('Error al cargar SignaturePad. La funcionalidad de firma no estará disponible.', 'error');
    };
    document.head.appendChild(script);
  }

  mostrarFirmaExistente(): void {
    // Mostrar firma interna si existe
    const firmaBase64 = this.contrato?.firmaInternaBase64 || this.contrato?.firmaRepresentanteBase64;
    
    if (this.contrato && firmaBase64 && this.signaturePadElement && this.signaturePadElement.nativeElement) {
      const img = new Image();
      img.onload = () => {
        const canvas = this.signaturePadElement.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = firmaBase64;
    }
  }

  // Funciones de firma interna
  limpiarFirma(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
      console.log('🧹 Firma limpiada');
    }
  }

  probarSignaturePad(): void {
    console.log('🧪 Probando SignaturePad...');
    console.log('Contrato:', this.contrato);
    console.log('SignaturePadElement:', this.signaturePadElement);
    console.log('SignaturePad global:', typeof SignaturePad);
    console.log('SignaturePad window:', typeof window.SignaturePad);
    console.log('SignaturePad instance:', this.signaturePad);
    
    if (this.signaturePad) {
      console.log('✅ SignaturePad está inicializado');
      this.mostrarNotificacion('SignaturePad está funcionando correctamente', 'success');
    } else {
      console.log('❌ SignaturePad no está inicializado');
      this.mostrarNotificacion('SignaturePad no está inicializado', 'error');
      // Intentar reinicializar
      this.inicializarSignaturePad();
    }
  }

  configurarCanvas(): void {
    if (!this.signaturePadElement || !this.signaturePadElement.nativeElement) {
      return;
    }

    const canvas = this.signaturePadElement.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return;
    }

    // Obtener las dimensiones del contenedor
    const container = canvas.parentElement;
    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    
    // Establecer las dimensiones del canvas (sin el borde)
    const borderWidth = 2; // 1px border * 2 sides
    const newWidth = Math.max(containerRect.width - borderWidth, 300); // Mínimo 300px
    const newHeight = 200; // Altura fija para el pad de firma
    
    // Solo redimensionar si las dimensiones han cambiado
    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Limpiar el canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Configurar el contexto para escalado correcto
      ctx.scale(1, 1);
      
      // Si SignaturePad ya existe, limpiarlo
      if (this.signaturePad) {
        this.signaturePad.clear();
        console.log('✅ Canvas redimensionado y SignaturePad limpiado');
      }
    }
    
    console.log('🎨 Canvas configurado con dimensiones:', canvas.width, 'x', canvas.height);
  }

  async guardarFirmaInterna(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!this.signaturePad) {
      this.mostrarNotificacion('Error: Pad de firma no inicializado', 'error');
      return;
    }

    // Verificar si se seleccionó un representante legal
    if (!this.representanteSeleccionado) {
      this.mostrarNotificacion('Por favor, selecciona un representante legal', 'error');
      return;
    }

    // Verificar si el pad de firma está vacío
    if (this.signaturePad.isEmpty()) {
      this.mostrarNotificacion('Por favor, firma en el área antes de continuar', 'error');
      return;
    }

    try {
      console.log('✍️ Guardando firma interna...');

      // Obtener la firma como imagen Base64
      const firmaBase64 = this.signaturePad.toDataURL('image/png');

      // Actualizar el contrato en Firestore
      await this.firebaseService.actualizarFirmaRepresentante(
        this.contrato.id, 
        firmaBase64, 
        this.representanteSeleccionado
      );

      // Actualizar estado local
      this.firmaInternaGuardada = true;
      this.contrato.firmaInternaBase64 = firmaBase64;
      this.contrato.representanteLegal = this.representanteSeleccionado;
      this.contrato.fechaFirmaRepresentante = new Date();
      this.contrato.estadoContrato = 'Pendiente Firma Cliente';

      console.log('✅ Firma interna guardada exitosamente');
      this.mostrarNotificacion('Firma interna guardada exitosamente. El contrato está listo para ser enviado al cliente.', 'success');

    } catch (error: any) {
      console.error('❌ Error al guardar firma interna:', error);
      this.mostrarNotificacion('Error al guardar la firma interna: ' + error.message, 'error');
    }
  }

  // Funciones para el envío al cliente
  abrirModalEnvio(): void {
    if (!this.firmaInternaGuardada) {
      this.mostrarNotificacion('Debes guardar la firma interna antes de enviar al cliente', 'error');
      return;
    }
    this.mostrandoModalEnvio = true;
  }

  cerrarModalEnvio(): void {
    this.mostrandoModalEnvio = false;
  }

  async probarGeneracionToken(): Promise<void> {
    try {
      console.log('🧪 Probando generación de token...');
      console.log('🔍 ID del contrato:', this.contrato.id);
      
      // Generar token
      const token = await this.firebaseService.generarTokenFirma(this.contrato.id);
      console.log('✅ Token generado:', token);
      
      // Generar link
      const baseUrl = window.location.origin;
      const linkFirma = `${baseUrl}/firmar-cliente/${this.contrato.id}/${token}`;
      console.log('🔗 Link generado:', linkFirma);
      
      // Verificar que el token se guardó correctamente
      const contratoActualizado = await this.firebaseService.getContratoById(this.contrato.id);
      console.log('📋 Contrato actualizado:', contratoActualizado);
      console.log('🔑 Token en contrato:', contratoActualizado.tokenFirma);
      
      this.mostrarNotificacion(`Token generado exitosamente: ${token}`, 'success');
      
    } catch (error: any) {
      console.error('❌ Error al probar generación de token:', error);
      this.mostrarNotificacion('Error al generar token: ' + error.message, 'error');
    }
  }

  async enviarACliente(): Promise<void> {
    if (!this.emailCliente) {
      this.mostrarNotificacion('Por favor, ingresa el email del cliente', 'error');
      return;
    }

    try {
      console.log('📧 Enviando contrato al cliente...');
      console.log('🔍 ID del contrato:', this.contrato.id);
      console.log('📧 Email del cliente:', this.emailCliente);

      // Generar token único para el enlace de firma
      console.log('🔗 Generando token de firma...');
      const token = await this.firebaseService.generarTokenFirma(this.contrato.id);
      console.log('✅ Token generado:', token);
      
      // Generar enlace de firma del cliente
      const baseUrl = window.location.origin;
      const linkFirma = `${baseUrl}/firmar-cliente/${this.contrato.id}/${token}`;
      console.log('🔗 Link de firma generado:', linkFirma);

      // Preparar parámetros del email
      const templateParams = {
        to_email: this.emailCliente,
        to_name: this.contrato.cliente?.nombre || this.contrato.nombreCliente || 'Cliente',
        empresa: this.contrato.cliente?.empresa || this.contrato.empresa || 'Su empresa',
        contrato_titulo: this.contrato.tituloContrato || this.contrato.titulo || 'Contrato',
        contrato_codigo: this.contrato.codigoCotizacion || this.contrato.codigo || 'Sin código',
        valor_total: this.formatearMoneda(this.contrato.totalConDescuento || this.contrato.valorTotal || this.contrato.total || 0),
        link_firma: linkFirma,
        mensaje_personalizado: this.mensajePersonalizado || 'Por favor, revise y firme el contrato adjunto.'
      };

      console.log('📧 Parámetros del email:', templateParams);

      // Enviar email usando EmailJS
      console.log('📧 Enviando email con EmailJS...');
      await this.emailService.enviarEmail(templateParams);
      console.log('✅ Email enviado con EmailJS');

      // Registrar el envío en Firestore
      console.log('📝 Registrando envío en Firestore...');
      await this.firebaseService.registrarEnvioEmail(
        this.contrato.id,
        this.emailCliente,
        'Firma de Contrato - ' + (this.contrato.tituloContrato || this.contrato.titulo),
        this.mensajePersonalizado,
        linkFirma
      );
      console.log('✅ Envío registrado en Firestore');

      console.log('✅ Email enviado exitosamente');
      this.mostrarNotificacion('Contrato enviado al cliente exitosamente. Se ha enviado un email con el enlace de firma.', 'success');

      // Cerrar modal
      this.cerrarModalEnvio();

      // Redirigir al listado de contratos después de un momento
      setTimeout(() => {
        this.router.navigate(['/contratos']);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error al enviar email:', error);
      console.error('❌ Stack trace:', error.stack);
      this.mostrarNotificacion('Error al enviar el email: ' + error.message, 'error');
    }
  }

  // Función para volver a contratos
  volverContratos(): void {
    this.router.navigate(['/contratos']);
  }

  // Método para eliminar firma del representante y permitir firmar de nuevo
  async eliminarFirmaRepresentante(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar la firma del representante? Esto permitirá firmar de nuevo.')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando firma del representante...');

      // Eliminar firma del representante en Firebase
      await this.firebaseService.eliminarFirmaRepresentante(this.contrato.id);

      // Actualizar estado local
      this.firmaInternaGuardada = false;
      this.contrato.firmaInternaBase64 = null;
      this.contrato.firmaRepresentanteBase64 = null;
      this.contrato.representanteLegal = null;
      this.contrato.fechaFirmaRepresentante = null;
      this.contrato.estadoContrato = 'Pendiente de Firma';

      // Limpiar el canvas si existe
      if (this.signaturePadElement && this.signaturePadElement.nativeElement) {
        const canvas = this.signaturePadElement.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      // Limpiar SignaturePad si existe
      if (this.signaturePad) {
        this.signaturePad.clear();
      }

      // Reinicializar SignaturePad
      setTimeout(() => {
        console.log('🔄 Reinicializando SignaturePad después de eliminar firma...');
        this.inicializarSignaturePad();
        // Forzar detección de cambios
        setTimeout(() => {
          console.log('✅ Reinicialización completada');
        }, 200);
      }, 100);

      console.log('✅ Firma del representante eliminada exitosamente');
      this.mostrarNotificacion('Firma del representante eliminada. Puedes firmar de nuevo.', 'success');

    } catch (error: any) {
      console.error('❌ Error al eliminar firma del representante:', error);
      this.mostrarNotificacion('Error al eliminar la firma: ' + error.message, 'error');
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
