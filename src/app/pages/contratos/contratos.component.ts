import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ContractCardComponent } from '../../shared/components/contract-card/contract-card.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { EmailService } from '../../core/services/email.service';
import { Router } from '@angular/router';

declare var html2pdf: any;

interface Contrato {
  id: string;
  codigo: string;
  titulo: string;
  nombreCliente: string;
  empresa: string;
  emailCliente: string;
  rutCliente: string;
  estado: string;
  valorTotal: number;
  fechaCreacionContrato: any;
  firmas?: {
    cliente: boolean;
    representante: boolean;
  };
  historialEstados?: any[];
  [key: string]: any;
}

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ContractCardComponent],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  contratos: Contrato[] = [];
  contratosFiltrados: Contrato[] = [];
  
  // Arrays para el Kanban basado en firmas
  contratosPendienteFirmaInterna: Contrato[] = [];
  contratosPendienteFirmaCliente: Contrato[] = [];
  contratosFirmadoCliente: Contrato[] = [];
  contratosFinalizados: Contrato[] = [];
  
  // Estadísticas
  totalContratos: number = 0;
  contratosPendientes: number = 0;
  contratosFirmados: number = 0;
  valorTotalContratos: number = 0;
  
  // Filtros
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  
  // Modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  contratoEditando: any = null;
  nuevoContrato: any = {
    titulo: '',
    fechaInicio: '',
    fechaFin: '',
    valorTotal: 0,
    nombreCliente: '',
    emailCliente: '',
    rutCliente: '',
    empresa: '',
    descripcionServicios: '',
    terminosCondiciones: ''
  };

  // Modal de envío
  mostrarModalEnvio: boolean = false;
  contratoSeleccionado: Contrato | null = null;
  emailEnvio: any = {
    para: '',
    asunto: '',
    mensaje: ''
  };

  // Modo de vista
  viewMode: 'kanban' | 'list' = 'kanban';
  
  // Drag & Drop
  draggedContrato: Contrato | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    private emailService: EmailService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarContratos();
  }

  async cargarContratos() {
    try {
      this.contratos = await this.firebaseService.getContratosAsync();
      console.log('🔍 ContratosComponent: Contratos cargados:', this.contratos.length);
      console.log('📋 ContratosComponent: Estados de contratos:', this.contratos.map(c => ({ id: c.id, estado: c.estado, codigo: c.codigo })));
      
      this.contratosFiltrados = [...this.contratos];
      this.categorizarContratosPorFirmas();
      this.calcularEstadisticas();
      
      // Debug: Verificar contratos por categoría
      console.log('🔍 ContratosComponent: Contratos por categoría:');
      console.log('Pendiente Firma Interna:', this.contratosPendienteFirmaInterna.length);
      console.log('Pendiente Firma Cliente:', this.contratosPendienteFirmaCliente.length);
      console.log('Firmado por Cliente:', this.contratosFirmadoCliente.length);
      console.log('Finalizados:', this.contratosFinalizados.length);
      
    } catch (error) {
      console.error('❌ ContratosComponent: Error al cargar contratos:', error);
      this.notificationService.showError('Error al cargar los contratos');
    }
  }

  // Método para categorizar contratos según el estado de las firmas
  categorizarContratosPorFirmas() {
    this.contratosPendienteFirmaInterna = [];
    this.contratosPendienteFirmaCliente = [];
    this.contratosFirmadoCliente = [];
    this.contratosFinalizados = [];

    console.log('🔍 Categorizando contratos...');
    console.log('📋 Total de contratos:', this.contratos.length);

    this.contratos.forEach((contrato, index) => {
      const tieneFirmaInterna = !!(contrato['firmaInternaBase64'] || contrato['firmaRepresentanteBase64']);
      const tieneFirmaCliente = !!contrato['firmaClienteBase64'];
      const esFinalizado = contrato.estado === 'Finalizado';

      console.log(`📋 Contrato ${index + 1}:`, {
        id: contrato.id,
        codigo: contrato.codigo,
        estado: contrato.estado,
        firmaInternaBase64: !!contrato['firmaInternaBase64'],
        firmaRepresentanteBase64: !!contrato['firmaRepresentanteBase64'],
        firmaClienteBase64: !!contrato['firmaClienteBase64'],
        tieneFirmaInterna,
        tieneFirmaCliente,
        esFinalizado
      });

      if (esFinalizado) {
        this.contratosFinalizados.push(contrato);
        console.log(`✅ ${contrato.codigo} → Finalizados`);
      } else if (tieneFirmaInterna && tieneFirmaCliente) {
        this.contratosFirmadoCliente.push(contrato);
        console.log(`✅ ${contrato.codigo} → Firmado por Cliente`);
      } else if (tieneFirmaInterna && !tieneFirmaCliente) {
        this.contratosPendienteFirmaCliente.push(contrato);
        console.log(`✅ ${contrato.codigo} → Pendiente Firma Cliente`);
      } else {
        this.contratosPendienteFirmaInterna.push(contrato);
        console.log(`✅ ${contrato.codigo} → Pendiente Firma Interna`);
      }
    });

    console.log('📊 Resumen de categorización:');
    console.log('Pendiente Firma Interna:', this.contratosPendienteFirmaInterna.length);
    console.log('Pendiente Firma Cliente:', this.contratosPendienteFirmaCliente.length);
    console.log('Firmado por Cliente:', this.contratosFirmadoCliente.length);
    console.log('Finalizados:', this.contratosFinalizados.length);
  }

  calcularEstadisticas() {
    this.totalContratos = this.contratos.length;
    this.contratosPendientes = this.contratos.filter(c => c.estado === 'Pendiente de Firma').length;
    this.contratosFirmados = this.contratos.filter(c => 
      c.estado === 'Firmado' || c.estado === 'Finalizado' || c.estado === 'Completamente Firmado'
    ).length;
    this.valorTotalContratos = this.contratos.reduce((total, c) => total + (c.valorTotal || 0), 0);
  }

  onSearchChange() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.contratos];

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(contrato =>
        contrato.titulo?.toLowerCase().includes(termino) ||
        contrato.nombreCliente?.toLowerCase().includes(termino) ||
        contrato.empresa?.toLowerCase().includes(termino) ||
        contrato.codigo?.toLowerCase().includes(termino) ||
        contrato.emailCliente?.toLowerCase().includes(termino)
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      filtrados = filtrados.filter(contrato => contrato.estado === this.filtroEstado);
    }

    this.contratosFiltrados = filtrados;
  }

  getEstadosUnicos(): string[] {
    return [...new Set(this.contratos.map(c => c.estado))];
  }

  trackByContratoId(index: number, contrato: Contrato): string {
    return contrato.id;
  }

  getEstadoClass(estado: string): string {
    return estado.toLowerCase().replace(/\s+/g, '-');
  }

  getContratosPorEstado(estado: string): Contrato[] {
    return this.contratos.filter(c => c.estado === estado);
  }

  // Verificar si el contrato está firmado
  isContratoFirmado(contrato: Contrato): boolean {
    const estado = contrato.estado?.toLowerCase() || '';
    return estado === 'firmado' || estado === 'finalizado' || estado === 'completamente firmado';
  }

  // Verificar si tiene firmas
  tieneFirmas(contrato: Contrato): boolean {
    return !!(contrato['firmaRepresentanteBase64'] || contrato['firmaClienteBase64']);
  }

  setViewMode(mode: 'kanban' | 'list') {
    this.viewMode = mode;
  }

  onDragStart(event: DragEvent, contrato: Contrato) {
    this.draggedContrato = contrato;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', contrato.id);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  async onDrop(event: DragEvent, nuevoEstado: string) {
    event.preventDefault();
    
    if (this.draggedContrato && this.draggedContrato.estado !== nuevoEstado) {
      try {
        console.log(`🔄 Moviendo contrato ${this.draggedContrato.id} de "${this.draggedContrato.estado}" a "${nuevoEstado}"`);
        
        await this.firebaseService.updateContrato(this.draggedContrato.id, {
          estado: nuevoEstado,
          fechaActualizacion: new Date()
        });

        // Actualizar estado local
        this.draggedContrato.estado = nuevoEstado;
        this.calcularEstadisticas();
        
        console.log('✅ Contrato movido exitosamente');
        this.notificationService.showSuccess(`Contrato movido a ${nuevoEstado}`);
        
      } catch (error) {
        console.error('❌ Error al mover contrato:', error);
        this.notificationService.showError('Error al mover el contrato');
      }
    }
    
    this.draggedContrato = null;
  }

  async onEstadoChanged(event: { contratoId: string, nuevoEstado: string }) {
    try {
      console.log(`🔄 Cambiando estado del contrato ${event.contratoId} a "${event.nuevoEstado}"`);
      
      await this.firebaseService.updateContrato(event.contratoId, {
        estado: event.nuevoEstado,
        fechaActualizacion: new Date()
      });

      // Actualizar estado local
      const contrato = this.contratos.find(c => c.id === event.contratoId);
      if (contrato) {
        contrato.estado = event.nuevoEstado;
        this.categorizarContratosPorFirmas();
        this.calcularEstadisticas();
      }
      
      console.log('✅ Estado del contrato actualizado exitosamente');
      this.notificationService.showSuccess(`Estado actualizado a ${event.nuevoEstado}`);
      
    } catch (error) {
      console.error('❌ Error al actualizar estado del contrato:', error);
      this.notificationService.showError('Error al actualizar el estado del contrato');
    }
  }

  async onContratoDeleted(contratoId: string) {
    try {
      console.log(`🗑️ Eliminando contrato ${contratoId}`);
      
      await this.firebaseService.deleteContrato(contratoId);
      
      // Remover de la lista local
      this.contratos = this.contratos.filter(c => c.id !== contratoId);
      this.contratosFiltrados = this.contratosFiltrados.filter(c => c.id !== contratoId);
      this.categorizarContratosPorFirmas();
      this.calcularEstadisticas();
      
      console.log('✅ Contrato eliminado exitosamente');
      this.notificationService.showSuccess('Contrato eliminado exitosamente');
      
    } catch (error) {
      console.error('❌ Error al eliminar contrato:', error);
      this.notificationService.showError('Error al eliminar el contrato');
    }
  }

  async onFirmaRepresentante(event: { contratoId: string }) {
    try {
      console.log(`✍️ Navegando a firma del representante para contrato ${event.contratoId}`);
      
      // Navegar a la página de firma
      this.router.navigate(['/firmar-contrato', event.contratoId]);
      
    } catch (error) {
      console.error('❌ Error al navegar a firma:', error);
      this.notificationService.showError('Error al abrir la página de firma');
    }
  }

  async onEnviarCliente(event: { contratoId: string }) {
    try {
      console.log(`📧 Abriendo modal de envío para contrato ${event.contratoId}`);
      
      // Buscar el contrato seleccionado
      this.contratoSeleccionado = this.contratos.find(c => c.id === event.contratoId) || null;
      
      if (!this.contratoSeleccionado) {
        this.notificationService.showError('No se encontró el contrato seleccionado');
        return;
      }
      
      // Pre-llenar el formulario de envío
      this.emailEnvio = {
        para: this.contratoSeleccionado.emailCliente || '',
        asunto: `Firma de contrato - ${this.contratoSeleccionado.codigo || this.contratoSeleccionado.id}`,
        mensaje: `Estimado ${this.contratoSeleccionado.nombreCliente}, adjunto el enlace para la firma de su contrato. Saludos.`
      };
      
      // Abrir el modal
      this.mostrarModalEnvio = true;
      
    } catch (error) {
      console.error('❌ Error al abrir modal de envío:', error);
      this.notificationService.showError('Error al abrir el modal de envío');
    }
  }

  cerrarModalEnvio() {
    this.mostrarModalEnvio = false;
    this.contratoSeleccionado = null;
    this.emailEnvio = {
      para: '',
      asunto: '',
      mensaje: ''
    };
  }

  async enviarEmailCliente() {
    try {
      if (!this.contratoSeleccionado) {
        this.notificationService.showError('No hay contrato seleccionado');
        return;
      }

      if (!this.emailEnvio.para || !this.emailEnvio.asunto || !this.emailEnvio.mensaje) {
        this.notificationService.showError('Por favor complete todos los campos del email');
        return;
      }

      console.log('📧 Enviando email para firma...');
      
      // Generar link de firma
      const linkFirma = `${window.location.origin}/firmar-contrato-cliente/${this.contratoSeleccionado.id}`;
      
      // Enviar email
      await this.emailService.enviarEmail({
        para: this.emailEnvio.para,
        asunto: this.emailEnvio.asunto,
        mensaje: this.emailEnvio.mensaje + `\n\nEnlace para firma: ${linkFirma}`,
        contratoId: this.contratoSeleccionado.id
      });

      // Actualizar estado del contrato
      await this.firebaseService.updateContrato(this.contratoSeleccionado.id, {
        estado: 'Pendiente de Firma Cliente',
        fechaEnvioCliente: new Date(),
        emailEnviado: true
      });

      // Recategorizar contratos
      this.categorizarContratosPorFirmas();
      this.calcularEstadisticas();
      
      console.log('✅ Email enviado exitosamente');
      this.notificationService.showSuccess('Email enviado exitosamente al cliente');
      
      // Cerrar modal
      this.cerrarModalEnvio();
      
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      this.notificationService.showError('Error al enviar el email: ' + error);
    }
  }

  formatDate(fecha: any): string {
    if (!fecha) return 'Sin fecha';
    
    try {
      if (fecha.toDate) {
        return fecha.toDate().toLocaleDateString('es-CL');
      } else if (fecha instanceof Date) {
        return fecha.toLocaleDateString('es-CL');
      } else if (typeof fecha === 'string') {
        return new Date(fecha).toLocaleDateString('es-CL');
      } else {
        return 'Fecha inválida';
      }
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  formatCurrency(valor: number | string): string {
    if (!valor) return '$0';
    
    const numValor = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numValor)) return '$0';
    
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValor);
  }

  verPDF(contrato: Contrato) {
    this.descargarPDF(contrato);
  }

  enviarCliente(contrato: Contrato) {
    this.router.navigate(['/enviar-firma', contrato.id]);
  }

  eliminarContrato(contrato: Contrato) {
    if (confirm('¿Estás seguro de que deseas eliminar este contrato?')) {
      this.onContratoDeleted(contrato.id);
    }
  }

  mostrarModalCrearContrato() {
    this.modoEdicion = false;
    this.contratoEditando = null;
    this.resetearFormulario();
    this.mostrarModal = true;
  }

  editarContrato(contrato: Contrato) {
    this.modoEdicion = true;
    this.contratoEditando = contrato;
    this.cargarDatosContrato(contrato);
    this.mostrarModal = true;
  }

  cargarDatosContrato(contrato: Contrato) {
    this.nuevoContrato = {
      titulo: contrato.titulo || '',
      fechaInicio: this.formatDateForInput(contrato['fechaInicio']),
      fechaFin: this.formatDateForInput(contrato['fechaFin']),
      valorTotal: contrato.valorTotal || 0,
      nombreCliente: contrato.nombreCliente || '',
      emailCliente: contrato.emailCliente || '',
      rutCliente: contrato.rutCliente || '',
      empresa: contrato.empresa || '',
      descripcionServicios: contrato['descripcionServicios'] || '',
      terminosCondiciones: contrato['terminosCondiciones'] || ''
    };
  }

  formatDateForInput(fecha: any): string {
    if (!fecha) return '';
    
    try {
      let fechaObj: Date;
      
      if (fecha.toDate) {
        fechaObj = fecha.toDate();
      } else if (fecha instanceof Date) {
        fechaObj = fecha;
      } else {
        fechaObj = new Date(fecha);
      }
      
      if (isNaN(fechaObj.getTime())) {
        return '';
      }
      
      return fechaObj.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.contratoEditando = null;
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.nuevoContrato = {
      titulo: '',
      fechaInicio: '',
      fechaFin: '',
      valorTotal: 0,
      nombreCliente: '',
      emailCliente: '',
      rutCliente: '',
      empresa: '',
      descripcionServicios: '',
      terminosCondiciones: ''
    };
  }

  async guardarContratoDirecto() {
    try {
      console.log('💾 Guardando contrato...');
      
      const contratoData = {
        ...this.nuevoContrato,
        fechaCreacionContrato: new Date(),
        estado: 'Pendiente de Firma',
        codigo: await this.firebaseService.generarCodigoCotizacion()
      };

      const docRef = await this.firebaseService.createContrato(contratoData);
      
      console.log('✅ Contrato creado exitosamente:', docRef.id);
      this.notificationService.showSuccess('Contrato creado exitosamente');
      
      this.cerrarModal();
      this.cargarContratos();
      
    } catch (error) {
      console.error('❌ Error al crear contrato:', error);
      this.notificationService.showError('Error al crear el contrato');
    }
  }

  // Función para descargar PDF
  async descargarPDF(contrato: Contrato): Promise<void> {
    try {
      console.log('📄 Iniciando descarga de PDF...');

      // Verificar si el contrato tiene firmas
      const tieneFirmas = contrato['firmaRepresentanteBase64'] || contrato['firmaClienteBase64'];
      if (!tieneFirmas) {
        this.notificationService.showError('Este contrato no tiene firmas. Solo se puede descargar contratos firmados.');
        return;
      }

      // Cargar html2pdf si no está disponible
      if (typeof html2pdf === 'undefined') {
        await this.cargarHtml2Pdf();
      }

      // Importar el template dinámicamente
      const templateModule = await import('../../templates/contract-template.js');
      const { renderContract } = templateModule as any;

      // Preparar datos del contrato
      const datosContrato = {
        ...contrato,
        tituloContrato: contrato.titulo,
        codigoCotizacion: contrato.codigo,
        estadoContrato: contrato.estado,
        fechaCreacionContrato: contrato.fechaCreacionContrato,
        cliente: {
          nombre: contrato.nombreCliente,
          email: contrato.emailCliente,
          rut: contrato.rutCliente,
          empresa: contrato.empresa
        },
        totalConDescuento: contrato.valorTotal,
        total: contrato.valorTotal,
        descuento: contrato['descuento'] || 0,
        atendido: contrato['atendido'],
        // Firmas
        firmaRepresentanteBase64: contrato['firmaRepresentanteBase64'],
        firmaClienteBase64: contrato['firmaClienteBase64'],
        representanteLegal: contrato['representanteLegal'],
        fechaFirmaRepresentante: contrato['fechaFirmaRepresentante'],
        fechaFirmaCliente: contrato['fechaFirmaCliente']
      };

      // Generar HTML del contrato
      const htmlContrato = renderContract(datosContrato);

      // Crear elemento temporal
      const elemento = document.createElement('div');
      elemento.innerHTML = htmlContrato;
      elemento.style.position = 'absolute';
      elemento.style.left = '-9999px';
      elemento.style.top = '-9999px';
      elemento.style.width = '210mm'; // A4 width
      elemento.style.padding = '20px';
      elemento.style.backgroundColor = 'white';
      document.body.appendChild(elemento);

      // Configuración de html2pdf
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `contrato-firmado-${contrato.codigo || contrato.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      // Generar PDF
      await html2pdf().set(opt).from(elemento).save();

      // Limpiar elemento temporal
      document.body.removeChild(elemento);

      console.log('✅ PDF generado y descargado exitosamente');
      this.notificationService.showSuccess('PDF del contrato firmado descargado exitosamente');

    } catch (error: any) {
      console.error('❌ Error al generar PDF:', error);
      this.notificationService.showError('Error al generar el PDF: ' + error.message);
    }
  }

  // Cargar html2pdf dinámicamente
  async cargarHtml2Pdf(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        console.log('✅ html2pdf cargado dinámicamente');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Error al cargar html2pdf');
        reject(new Error('No se pudo cargar html2pdf'));
      };
      document.head.appendChild(script);
    });
  }

}
