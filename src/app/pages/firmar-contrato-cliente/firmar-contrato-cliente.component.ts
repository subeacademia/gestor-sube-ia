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
  @ViewChild('firmaCanvas', { static: false }) signaturePadElement!: ElementRef<HTMLCanvasElement>;
  private signaturePad: any = null;

  // Variables del componente
  contrato: any = null;
  loading = true;
  error = false;
  errorMessage = '';
  
  // Variables de firma
  firmaClienteGuardada = false;
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
      
      if (!contratoId) {
        throw new Error('Enlace inválido. Falta el ID del contrato.');
      }

      console.log('📋 Cargando contrato para firma del cliente:', contratoId);

      // Si hay token, validarlo
      if (token) {
        await this.validarTokenYCargarContrato(contratoId, token);
      } else {
        // Cargar contrato directamente (para desarrollo/testing)
        this.contrato = await this.firebaseService.getContratoById(contratoId);
        if (!this.contrato) {
          throw new Error('Contrato no encontrado');
        }
      }

      // Verificar si ya tiene firma del cliente
      this.verificarFirmaCliente();

      console.log('✅ Contrato cargado para firma del cliente:', this.contrato);

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

  verificarFirmaCliente(): void {
    console.log('🔍 Verificando firma del cliente existente...');

    if (this.contrato.firmaClienteBase64) {
      console.log('✅ Firma del cliente encontrada');
      this.firmaClienteGuardada = true;
      this.contratoFirmado = true;
    } else {
      console.log('❌ Firma del cliente no encontrada');
      this.firmaClienteGuardada = false;
    }
  }

  inicializarSignaturePad(): void {
    try {
      // Cargar SignaturePad dinámicamente si no está disponible
      if (typeof SignaturePad === 'undefined') {
        console.log('📦 SignaturePad no disponible, cargando dinámicamente...');
        this.cargarSignaturePad();
        return;
      }

      console.log('🎨 Inicializando SignaturePad para cliente...');

      // Inicializar SignaturePad solo si no hay firma guardada
      if (this.signaturePadElement && !this.firmaClienteGuardada) {
        this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement, {
          backgroundColor: 'rgb(250, 250, 250)',
          penColor: 'rgb(0, 0, 0)',
          penWidth: 2,
          minWidth: 0.5,
          maxWidth: 2.5
        });
        console.log('✅ SignaturePad cliente inicializado correctamente');
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
    // Mostrar firma del cliente si existe
    if (this.contrato.firmaClienteBase64 && this.signaturePadElement) {
      const img = new Image();
      img.onload = () => {
        const canvas = this.signaturePadElement.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = this.contrato.firmaClienteBase64;
    }
  }

  // Funciones de firma del cliente
  limpiarFirma(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
      console.log('🧹 Firma del cliente limpiada');
      this.mostrarNotificacion('Firma limpiada', 'success');
    }
  }

  async guardarFirmaCliente(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!this.signaturePad) {
      this.mostrarNotificacion('Error: Pad de firma no inicializado', 'error');
      return;
    }

    // Verificar si el pad de firma está vacío
    if (this.signaturePad.isEmpty()) {
      this.mostrarNotificacion('Por favor, firme en el área antes de continuar', 'error');
      return;
    }

    try {
      console.log('✍️ Guardando firma del cliente...');

      // Obtener la firma como imagen Base64
      const firmaBase64 = this.signaturePad.toDataURL('image/png');

      // Verificar si ya tiene firma del representante
      const tieneFirmaRepresentante = this.contrato.firmaInternaBase64 || this.contrato.firmaRepresentanteBase64;

      // Determinar el estado final
      let estadoFinal = 'Firmado';
      if (tieneFirmaRepresentante) {
        estadoFinal = 'Completamente Firmado'; // Ambas firmas completadas
      }

      // Actualizar firma del cliente
      await this.firebaseService.actualizarFirmaCliente(this.contrato.id, firmaBase64);

      // Actualizar estado del contrato
      await this.firebaseService.updateContrato(this.contrato.id, {
        estadoContrato: estadoFinal,
        fechaFirmaCliente: new Date(),
        fechaFirmaFinal: new Date(),
        contratoValido: true,
        ambasFirmasCompletadas: tieneFirmaRepresentante ? true : false
      });

      // Actualizar estado local
      this.firmaClienteGuardada = true;
      this.contrato.firmaClienteBase64 = firmaBase64;
      this.contrato.fechaFirmaCliente = new Date();
      this.contrato.estadoContrato = estadoFinal;

      console.log('✅ Firma del cliente guardada exitosamente');
      console.log(`📋 Estado actualizado a: ${estadoFinal}`);
      this.mostrarNotificacion('Firma del cliente guardada exitosamente', 'success');

      // Mostrar mensaje de éxito
      this.mostrarMensajeExito();

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

  // Método para eliminar firma del cliente y permitir firmar de nuevo
  async eliminarFirmaCliente(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar tu firma? Esto permitirá firmar de nuevo.')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando firma del cliente...');

      // Eliminar firma del cliente en Firebase
      await this.firebaseService.eliminarFirmaCliente(this.contrato.id);

      // Actualizar estado local
      this.firmaClienteGuardada = false;
      this.contrato.firmaClienteBase64 = null;
      this.contrato.fechaFirmaCliente = null;
      this.contrato.estadoContrato = 'Pendiente Firma Cliente';

      // Reinicializar SignaturePad
      setTimeout(() => {
        this.inicializarSignaturePad();
      }, 100);

      console.log('✅ Firma del cliente eliminada exitosamente');
      this.mostrarNotificacion('Firma eliminada. Puedes firmar de nuevo.', 'success');

    } catch (error: any) {
      console.error('❌ Error al eliminar firma del cliente:', error);
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
      month: 'short',
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