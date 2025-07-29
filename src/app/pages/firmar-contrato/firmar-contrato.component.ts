import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { FormsModule } from '@angular/forms';

declare var SignaturePad: any;

@Component({
  selector: 'app-firmar-contrato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './firmar-contrato.component.html',
  styleUrls: ['./firmar-contrato.component.scss']
})
export class FirmarContratoComponent implements OnInit, AfterViewInit {
  @ViewChild('firmaRepresentanteCanvas', { static: false }) firmaRepresentanteCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('firmaClienteCanvas', { static: false }) firmaClienteCanvas!: ElementRef<HTMLCanvasElement>;

  // Variables del componente
  contrato: any = null;
  loading = true;
  error = false;
  errorMessage = '';
  
  // Variables de firma
  signaturePadRepresentante: any = null;
  signaturePadCliente: any = null;
  firmaRepresentanteGuardada = false;
  firmaClienteGuardada = false;
  
  // Variables de representante
  representantes = [
    { value: 'Bruno Villalobos - CEO', label: 'Bruno Villalobos - CEO' },
    { value: 'Mario Muñoz - CAO', label: 'Mario Muñoz - CAO' },
    { value: 'Rodrigo Carrillo - CTO', label: 'Rodrigo Carrillo - CTO' }
  ];
  representanteSeleccionado = '';
  
  // Variables de estado
  esPanelAdmin = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    console.log('🚀 FirmarContratoComponent: Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('🔧 FirmarContratoComponent: ngOnInit ejecutado');
    this.cargarContrato();
  }

  ngAfterViewInit(): void {
    console.log('🎨 FirmarContratoComponent: ngAfterViewInit ejecutado');
    // Inicializar SignaturePads después de que la vista esté lista
    setTimeout(() => {
      this.inicializarSignaturePads();
    }, 100);
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

      // Verificar firmas existentes
      this.verificarFirmasExistentes();

    } catch (error: any) {
      console.error('❌ Error al cargar contrato:', error);
      this.error = true;
      this.errorMessage = error.message || 'Error al cargar el contrato';
    } finally {
      this.loading = false;
    }
  }

  verificarFirmasExistentes(): void {
    console.log('🔍 Verificando firmas existentes...');

    // Verificar firma del representante
    if (this.contrato.firmaRepresentanteBase64) {
      console.log('✅ Firma del representante encontrada');
      this.firmaRepresentanteGuardada = true;
      this.representanteSeleccionado = this.contrato.representanteLegal || '';
    } else {
      console.log('❌ Firma del representante no encontrada');
      this.firmaRepresentanteGuardada = false;
    }

    // Verificar firma del cliente
    if (this.contrato.firmaClienteBase64) {
      console.log('✅ Firma del cliente encontrada');
      this.firmaClienteGuardada = true;
    } else {
      console.log('❌ Firma del cliente no encontrada');
      this.firmaClienteGuardada = false;
    }
  }

  inicializarSignaturePads(): void {
    try {
      // Cargar SignaturePad dinámicamente si no está disponible
      if (typeof SignaturePad === 'undefined') {
        this.cargarSignaturePad();
        return;
      }

      console.log('🎨 Inicializando SignaturePads...');

      // Inicializar SignaturePad para representante
      if (this.firmaRepresentanteCanvas && !this.firmaRepresentanteGuardada) {
        this.signaturePadRepresentante = new SignaturePad(this.firmaRepresentanteCanvas.nativeElement, {
          backgroundColor: 'rgb(250, 250, 250)',
          penColor: 'rgb(0, 0, 0)',
          penWidth: 2
        });
        console.log('✅ SignaturePad representante inicializado');
      }

      // Inicializar SignaturePad para cliente
      if (this.firmaClienteCanvas && !this.firmaClienteGuardada) {
        this.signaturePadCliente = new SignaturePad(this.firmaClienteCanvas.nativeElement, {
          backgroundColor: 'rgb(250, 250, 250)',
          penColor: 'rgb(0, 0, 0)',
          penWidth: 2
        });
        console.log('✅ SignaturePad cliente inicializado');
      }

      // Mostrar firmas existentes si las hay
      this.mostrarFirmasExistentes();

    } catch (error: any) {
      console.error('❌ Error al inicializar SignaturePads:', error);
      this.error = true;
      this.errorMessage = 'Error al inicializar los pads de firma: ' + error.message;
    }
  }

  cargarSignaturePad(): void {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js';
    script.onload = () => {
      console.log('✅ SignaturePad cargado dinámicamente');
      setTimeout(() => {
        this.inicializarSignaturePads();
      }, 100);
    };
    script.onerror = () => {
      console.error('❌ Error al cargar SignaturePad');
      this.mostrarNotificacion('Error al cargar SignaturePad. La funcionalidad de firma no estará disponible.', 'error');
    };
    document.head.appendChild(script);
  }

  mostrarFirmasExistentes(): void {
    // Mostrar firma del representante si existe
    if (this.contrato.firmaRepresentanteBase64 && this.firmaRepresentanteCanvas) {
      const img = new Image();
      img.onload = () => {
        const canvas = this.firmaRepresentanteCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = this.contrato.firmaRepresentanteBase64;
    }

    // Mostrar firma del cliente si existe
    if (this.contrato.firmaClienteBase64 && this.firmaClienteCanvas) {
      const img = new Image();
      img.onload = () => {
        const canvas = this.firmaClienteCanvas.nativeElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = this.contrato.firmaClienteBase64;
    }
  }

  // Funciones de firma del representante
  limpiarFirmaRepresentante(): void {
    if (this.signaturePadRepresentante) {
      this.signaturePadRepresentante.clear();
      console.log('🧹 Firma del representante limpiada');
    }
  }

  async guardarFirmaRepresentante(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!this.signaturePadRepresentante) {
      this.mostrarNotificacion('Error: Pad de firma del representante no inicializado', 'error');
      return;
    }

    // Verificar si se seleccionó un representante legal
    if (!this.representanteSeleccionado) {
      this.mostrarNotificacion('Por favor, selecciona un representante legal', 'error');
      return;
    }

    // Verificar si el pad de firma está vacío
    if (this.signaturePadRepresentante.isEmpty()) {
      this.mostrarNotificacion('Por favor, firma en el área del representante antes de continuar', 'error');
      return;
    }

    try {
      console.log('✍️ Guardando firma del representante...');

      // Obtener la firma como imagen Base64
      const firmaBase64 = this.signaturePadRepresentante.toDataURL('image/png');

      // Actualizar el contrato en Firestore
      await this.firebaseService.actualizarFirmaRepresentante(
        this.contrato.id, 
        firmaBase64, 
        this.representanteSeleccionado
      );

      // Actualizar estado local
      this.firmaRepresentanteGuardada = true;
      this.contrato.firmaRepresentanteBase64 = firmaBase64;
      this.contrato.representanteLegal = this.representanteSeleccionado;
      this.contrato.fechaFirmaRepresentante = new Date();
      this.contrato.estado = 'Pendiente de Firma Cliente';

      console.log('✅ Firma del representante guardada exitosamente');
      this.mostrarNotificacion('Firma del representante guardada exitosamente. El contrato está listo para ser enviado al cliente.', 'success');

      // Mostrar opciones para enviar al cliente
      this.mostrarOpcionesEnvioCliente();

    } catch (error: any) {
      console.error('❌ Error al guardar firma del representante:', error);
      this.mostrarNotificacion('Error al guardar la firma del representante: ' + error.message, 'error');
    }
  }

  // Funciones de firma del cliente
  limpiarFirmaCliente(): void {
    if (this.signaturePadCliente) {
      this.signaturePadCliente.clear();
      console.log('🧹 Firma del cliente limpiada');
    }
  }

  async guardarFirmaCliente(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!this.signaturePadCliente) {
      this.mostrarNotificacion('Error: Pad de firma del cliente no inicializado', 'error');
      return;
    }

    // Verificar si el pad de firma está vacío
    if (this.signaturePadCliente.isEmpty()) {
      this.mostrarNotificacion('Por favor, firma en el área del cliente antes de continuar', 'error');
      return;
    }

    try {
      console.log('✍️ Guardando firma del cliente...');

      // Obtener la firma como imagen Base64
      const firmaBase64 = this.signaturePadCliente.toDataURL('image/png');

      // Actualizar el contrato en Firestore
      await this.firebaseService.actualizarFirmaCliente(this.contrato.id, firmaBase64);

      // Actualizar estado del contrato
      await this.firebaseService.updateContrato(this.contrato.id, {
        estado: 'Completamente Firmado',
        fechaFirmaCliente: new Date(),
        fechaFirmaFinal: new Date(),
        contratoValido: true,
        ambasFirmasCompletadas: true
      });

      // Actualizar estado local
      this.firmaClienteGuardada = true;
      this.contrato.firmaClienteBase64 = firmaBase64;
      this.contrato.fechaFirmaCliente = new Date();
      this.contrato.estado = 'Completamente Firmado';

      console.log('✅ Firma del cliente guardada exitosamente');
      this.mostrarNotificacion('Firma del cliente guardada exitosamente. El contrato está completamente firmado.', 'success');

    } catch (error: any) {
      console.error('❌ Error al guardar firma del cliente:', error);
      this.mostrarNotificacion('Error al guardar la firma del cliente: ' + error.message, 'error');
    }
  }

  // Función para enviar email al cliente
  enviarEmailCliente(): void {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    // Redirigir a la página de enviar firma
    this.router.navigate(['/enviar-firma', this.contrato.id]);
  }

  // Función para finalizar contrato
  async finalizarContrato(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!this.firmaRepresentanteGuardada || !this.firmaClienteGuardada) {
      this.mostrarNotificacion('Error: Ambas firmas deben estar completadas para finalizar el contrato', 'error');
      return;
    }

    try {
      console.log('✅ Finalizando contrato...');

      // Actualizar el contrato en Firestore
      await this.firebaseService.finalizarContrato(this.contrato.id);

      // Actualizar estado local
      this.contrato.estado = 'Finalizado';
      this.contrato.fechaFinalizacion = new Date();

      console.log('✅ Contrato finalizado exitosamente');
      this.mostrarNotificacion('Contrato finalizado exitosamente. El contrato está completamente procesado.', 'success');

      // Redirigir al listado de contratos
      setTimeout(() => {
        this.router.navigate(['/contratos']);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error al finalizar contrato:', error);
      this.mostrarNotificacion('Error al finalizar el contrato: ' + error.message, 'error');
    }
  }

  mostrarOpcionesEnvioCliente(): void {
    const opciones = confirm(`
      ✅ Firma del representante guardada exitosamente!
      
      ¿Qué deseas hacer ahora?
      
      - Aceptar: Ir a la página de envío de firma al cliente
      - Cancelar: Volver al listado de contratos
    `);

    if (opciones) {
      // Navegar a la página de enviar firma
      this.router.navigate(['/enviar-firma', this.contrato.id]);
    } else {
      // Volver al listado de contratos
      this.router.navigate(['/contratos']);
    }
  }

  // Función para generar link de firma del cliente
  generarLinkCliente(): void {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    // Redirigir a la página de enviar firma
    this.router.navigate(['/enviar-firma', this.contrato.id]);
  }

  // Función para volver a contratos
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
