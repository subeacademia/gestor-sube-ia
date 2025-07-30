import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { FirebaseService } from '../../../core/services/firebase.service';

declare var html2pdf: any;

interface Contrato {
  id: string;
  codigo?: string;
  titulo: string;
  estado: string;
  nombreCliente: string;
  empresa: string;
  emailCliente: string;
  rutCliente: string;
  valorTotal: number;
  fechaCreacionContrato: any;
  firmas?: { cliente: boolean; representante: boolean; };
  historialEstados?: any[];
  [key: string]: any;
}

@Component({
  selector: 'app-contract-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-card.component.html',
  styleUrls: ['./contract-card.component.scss']
})
export class ContractCardComponent {
  @Input() contrato!: Contrato;
  @Input() draggable: boolean = false;
  @Output() estadoChanged = new EventEmitter<{ contratoId: string, nuevoEstado: string }>();
  @Output() contratoDeleted = new EventEmitter<string>();
  @Output() firmaRepresentante = new EventEmitter<{ contratoId: string }>();
  @Output() enviarCliente = new EventEmitter<{ contratoId: string }>();
  @Output() verDetalles = new EventEmitter<Contrato>();
  @Output() editarContrato = new EventEmitter<{ contratoId: string }>();
  @Output() eliminarFirmaCliente = new EventEmitter<string>();

  // Modal de detalles
  mostrarModal = false;
  mostrarModalEnvio = false;
  
  // Modal de PDF
  mostrarModalPDF = false;
  pdfUrl: string | null = null;
  generandoPDF = false;

  constructor(
    private notificationService: NotificationService,
    private firebaseService: FirebaseService
  ) {}

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

  // Métodos para estados visuales
  getEstadoClass(): string {
    const estado = this.contrato.estado?.toLowerCase() || '';
    switch (estado) {
      case 'pendiente de firma':
        return 'pendiente';
      case 'enviado':
        return 'enviado';
      case 'firmado':
        return 'firmado';
      case 'finalizado':
        return 'finalizado';
      default:
        return 'pendiente';
    }
  }

  getEstadoIcon(): string {
    const estado = this.contrato.estado?.toLowerCase() || '';
    switch (estado) {
      case 'pendiente de firma':
        return '⏳';
      case 'enviado':
        return '📤';
      case 'firmado':
        return '✅';
      case 'finalizado':
        return '🎉';
      default:
        return '⏳';
    }
  }

  // Verificar si el contrato está firmado
  isContratoFirmado(): boolean {
    const estado = this.contrato['estadoContrato']?.toLowerCase() || this.contrato.estado?.toLowerCase() || '';
    return estado === 'firmado' || estado === 'finalizado' || estado === 'completamente firmado';
  }

  // Verificar si tiene firmas
  tieneFirmas(): boolean {
    return !!(this.contrato['firmaInternaBase64'] || 
              this.contrato['firmaRepresentanteBase64'] || 
              this.contrato['firmaClienteBase64'] ||
              this.contrato['firmaRepresentanteBase64'] || 
              this.contrato['firmaClienteBase64']);
  }

  // Verificar si tiene firma interna (representante)
  tieneFirmaInterna(): boolean {
    return !!(this.contrato['firmaInternaBase64'] || 
              this.contrato['firmaRepresentanteBase64']);
  }

  // Verificar si tiene firma del cliente
  tieneFirmaCliente(): boolean {
    return !!(this.contrato['firmaClienteBase64']);
  }

  onDragStart(event: DragEvent) {
    if (this.draggable && event.dataTransfer) {
      event.dataTransfer.setData('text/plain', this.contrato.id);
    }
  }

  onEstadoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value;
    this.estadoChanged.emit({ contratoId: this.contrato.id, nuevoEstado });
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  cerrarModalEnvio() {
    this.mostrarModalEnvio = false;
  }

  confirmarEnvio() {
    this.cerrarModalEnvio();
    this.enviarCliente.emit({ contratoId: this.contrato.id });
  }

  verPDF(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.descargarPDF();
  }

  enviarFirma(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.enviarCliente.emit({ contratoId: this.contrato.id });
  }

  firmarRepresentante(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.firmaRepresentante.emit({ contratoId: this.contrato.id });
  }

  editarContratoCard(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.editarContrato.emit({ contratoId: this.contrato.id });
  }

  eliminarContrato(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('¿Estás seguro de que deseas eliminar este contrato?')) {
      this.contratoDeleted.emit(this.contrato.id);
    }
  }

  // Método para eliminar firma del representante
  eliminarFirmaRepresentante(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('¿Estás seguro de que deseas eliminar la firma del representante? Esto permitirá firmar de nuevo.')) {
      this.firebaseService.eliminarFirmaRepresentante(this.contrato.id)
        .then(() => {
          this.notificationService.showSuccess('Firma del representante eliminada exitosamente');
          // Emitir evento para actualizar la lista
          this.estadoChanged.emit({ contratoId: this.contrato.id, nuevoEstado: 'Pendiente de Firma' });
        })
        .catch((error) => {
          console.error('Error al eliminar firma del representante:', error);
          this.notificationService.showError('Error al eliminar la firma del representante');
        });
    }
  }

  // Método para eliminar firma del cliente
  onEliminarFirmaCliente(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('¿Estás seguro de que deseas eliminar la firma del cliente? Esto permitirá firmar de nuevo.')) {
      this.firebaseService.eliminarFirmaCliente(this.contrato.id)
        .then(() => {
          this.notificationService.showSuccess('Firma del cliente eliminada exitosamente');
          // Emitir evento para actualizar la lista
          this.estadoChanged.emit({ contratoId: this.contrato.id, nuevoEstado: 'Pendiente Firma Cliente' });
        })
        .catch((error) => {
          console.error('Error al eliminar firma del cliente:', error);
          this.notificationService.showError('Error al eliminar la firma del cliente');
        });
    }
  }

  // Función para descargar PDF
  async descargarPDF(): Promise<void> {
    try {
      console.log('📄 Iniciando descarga de PDF...');

      // Verificar si el contrato tiene firmas
      const tieneFirmas = this.contrato['firmaInternaBase64'] || 
                         this.contrato['firmaRepresentanteBase64'] || 
                         this.contrato['firmaClienteBase64'];
      if (!tieneFirmas) {
        this.notificationService.showError('Este contrato no tiene firmas. Solo se puede descargar contratos firmados.');
        return;
      }

      // Cargar html2pdf si no está disponible
      if (typeof html2pdf === 'undefined') {
        await this.cargarHtml2Pdf();
      }

      // Importar el template dinámicamente
      const templateModule = await import('../../../templates/contract-template.js');
      const { renderContract } = templateModule as any;

      // Preparar datos del contrato
      const datosContrato = {
        ...this.contrato,
        tituloContrato: this.contrato.titulo,
        codigoCotizacion: this.contrato.codigo,
        estadoContrato: this.contrato.estado,
        fechaCreacionContrato: this.contrato.fechaCreacionContrato,
        cliente: {
          nombre: this.contrato.nombreCliente,
          email: this.contrato.emailCliente,
          rut: this.contrato.rutCliente,
          empresa: this.contrato.empresa
        },
        totalConDescuento: this.contrato.valorTotal,
        total: this.contrato.valorTotal,
        descuento: this.contrato['descuento'] || 0,
        atendido: this.contrato['atendido'],
        // Firmas
        firmaRepresentanteBase64: this.contrato['firmaRepresentanteBase64'],
        firmaClienteBase64: this.contrato['firmaClienteBase64'],
        representanteLegal: this.contrato['representanteLegal'],
        fechaFirmaRepresentante: this.contrato['fechaFirmaRepresentante'],
        fechaFirmaCliente: this.contrato['fechaFirmaCliente']
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
        filename: `contrato-firmado-${this.contrato.codigo || this.contrato.id}.pdf`,
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

  // Método para abrir modal de PDF
  async abrirModalPDF(event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    
    this.mostrarModalPDF = true;
    this.generandoPDF = true;
    
    try {
      await this.generarPDFParaModal();
    } catch (error) {
      console.error('Error al generar PDF para modal:', error);
      this.notificationService.showError('Error al generar el PDF');
    } finally {
      this.generandoPDF = false;
    }
  }

  // Método para generar PDF para la modal
  private async generarPDFParaModal(): Promise<void> {
    try {
      // Verificar si el contrato tiene firmas
      const tieneFirmas = this.contrato['firmaInternaBase64'] || 
                         this.contrato['firmaRepresentanteBase64'] || 
                         this.contrato['firmaClienteBase64'];
      if (!tieneFirmas) {
        this.notificationService.showError('Este contrato no tiene firmas. Solo se puede visualizar contratos firmados.');
        return;
      }

      // Cargar html2pdf si no está disponible
      if (typeof html2pdf === 'undefined') {
        await this.cargarHtml2Pdf();
      }

      // Importar el template dinámicamente
      const templateModule = await import('../../../templates/contract-template.js');
      const { renderContract } = templateModule as any;

      // Preparar datos del contrato
      const datosContrato = {
        ...this.contrato,
        tituloContrato: this.contrato.titulo,
        codigoCotizacion: this.contrato.codigo,
        estadoContrato: this.contrato.estado,
        fechaCreacionContrato: this.contrato.fechaCreacionContrato,
        cliente: {
          nombre: this.contrato.nombreCliente,
          email: this.contrato.emailCliente,
          rut: this.contrato.rutCliente,
          empresa: this.contrato.empresa
        },
        totalConDescuento: this.contrato.valorTotal,
        total: this.contrato.valorTotal,
        descuento: this.contrato['descuento'] || 0,
        atendido: this.contrato['atendido'],
        // Firmas
        firmaRepresentanteBase64: this.contrato['firmaRepresentanteBase64'],
        firmaClienteBase64: this.contrato['firmaClienteBase64'],
        representanteLegal: this.contrato['representanteLegal'],
        fechaFirmaRepresentante: this.contrato['fechaFirmaRepresentante'],
        fechaFirmaCliente: this.contrato['fechaFirmaCliente']
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

      // Configuración de html2pdf para generar blob
      const opt = {
        margin: [10, 10, 10, 10],
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

      // Generar PDF como blob
      const pdfBlob = await html2pdf().set(opt).from(elemento).outputPdf('blob');
      
      // Crear URL del blob
      this.pdfUrl = URL.createObjectURL(pdfBlob);

      // Limpiar elemento temporal
      document.body.removeChild(elemento);

      console.log('✅ PDF generado para modal exitosamente');

    } catch (error: any) {
      console.error('❌ Error al generar PDF para modal:', error);
      throw error;
    }
  }

  // Método para descargar PDF desde la modal
  async descargarPDFDesdeModal(): Promise<void> {
    if (!this.pdfUrl) {
      this.notificationService.showError('No hay PDF disponible para descargar');
      return;
    }

    try {
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = this.pdfUrl;
      link.download = `contrato-firmado-${this.contrato.codigo || this.contrato.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.notificationService.showSuccess('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      this.notificationService.showError('Error al descargar el PDF');
    }
  }

  // Método para imprimir PDF desde la modal
  imprimirPDFDesdeModal(): void {
    if (!this.pdfUrl) {
      this.notificationService.showError('No hay PDF disponible para imprimir');
      return;
    }

    try {
      const printWindow = window.open(this.pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error al imprimir PDF:', error);
      this.notificationService.showError('Error al imprimir el PDF');
    }
  }

  // Método para cerrar modal de PDF
  cerrarModalPDF(): void {
    this.mostrarModalPDF = false;
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = null;
    }
  }

  // Método para abrir PDF en nueva pestaña
  abrirEnNuevaPestana(): void {
    if (this.pdfUrl) {
      window.open(this.pdfUrl, '_blank');
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
