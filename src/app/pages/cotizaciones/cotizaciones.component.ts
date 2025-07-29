import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { QuoteCardComponent } from '../../shared/components/quote-card/quote-card.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';

declare var html2pdf: any;

interface Cotizacion {
  id: string;
  codigo: string;
  nombre: string;
  empresa: string;
  email: string;
  atendido: string;
  estado: string;
  valor: number;
  fecha: any;
  servicios: any[];
  [key: string]: any;
}

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, QuoteCardComponent],
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./cotizaciones.component.scss']
})
export class CotizacionesComponent implements OnInit {
  cotizaciones: Cotizacion[] = [];
  cotizacionesFiltradas: Cotizacion[] = [];
  
  // Estadísticas
  totalCotizaciones: number = 0;
  cotizacionesMes: number = 0;
  valorTotal: number = 0;
  totalAceptadas: number = 0;
  
  // Filtros
  searchTerm: string = '';
  filtroFecha: string = 'todos';
  filtroAtendedor: string = 'todos';
  filtroEstado: string = 'todos';
  
  // Estados disponibles
  estados = ['Emitida', 'Contestada', 'En Negociación', 'Aceptada', 'Rechazada'];
  
  // Modo de vista
  viewMode: 'kanban' | 'list' = 'kanban';
  
  // Drag & Drop
  draggedCotizacion: Cotizacion | null = null;

  // Modal de PDF
  mostrarModalPDF: boolean = false;
  cotizacionSeleccionada: Cotizacion | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarCotizaciones();
  }

  async cargarCotizaciones() {
    try {
      console.log('🚀 CotizacionesComponent: Iniciando carga de cotizaciones...');
      this.cotizaciones = await this.firebaseService.getCotizacionesAsync();
      console.log('✅ CotizacionesComponent: Cotizaciones cargadas:', this.cotizaciones.length);
      
      // Debug: mostrar detalles de las primeras 3 cotizaciones
      if (this.cotizaciones.length > 0) {
        console.log('🔍 CotizacionesComponent: Detalles de las primeras 3 cotizaciones:');
        this.cotizaciones.slice(0, 3).forEach((cot, index) => {
          console.log(`  ${index + 1}. ID: ${cot.id}`);
          console.log(`     Código: ${cot.codigo}`);
          console.log(`     Nombre: ${cot.nombre}`);
          console.log(`     Empresa: ${cot.empresa}`);
          console.log(`     Email: ${cot.email}`);
          console.log(`     Atendido: ${cot.atendido}`);
          console.log(`     Estado: ${cot.estado}`);
          console.log(`     Valor: ${cot.valor}`);
          console.log(`     Fecha: ${cot.fecha}`);
          console.log(`     ---`);
        });
      }
      
      // Inicializar cotizacionesFiltradas con todas las cotizaciones
      this.cotizacionesFiltradas = [...this.cotizaciones];
      console.log('📊 CotizacionesComponent: Cotizaciones filtradas inicializadas:', this.cotizacionesFiltradas.length);
      
      this.calcularEstadisticas();
      console.log('📈 CotizacionesComponent: Estadísticas calculadas');
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error al cargar cotizaciones:', error);
      this.cotizaciones = [];
      this.cotizacionesFiltradas = [];
    }
  }

  calcularEstadisticas() {
    this.totalCotizaciones = this.cotizaciones.length;
    
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();
    
    this.cotizacionesMes = this.cotizaciones.filter(cot => {
      const fecha = cot.fecha?.toDate ? cot.fecha.toDate() : new Date(cot.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;
    
    this.valorTotal = this.cotizaciones.reduce((sum, cot) => sum + (cot.valor || 0), 0);
    
    this.totalAceptadas = this.cotizaciones
      .filter(cot => cot.estado === 'Aceptada')
      .reduce((sum, cot) => sum + (cot.valor || 0), 0);
  }

  onSearchChange() {
    this.aplicarFiltros();
  }

  aplicarFiltros(limpiarFiltros: boolean = false) {
    console.log('🔍 CotizacionesComponent: Aplicando filtros...');
    console.log('📊 CotizacionesComponent: Total de cotizaciones:', this.cotizaciones.length);
    
    if (limpiarFiltros) {
      console.log('🧹 CotizacionesComponent: Limpiando filtros...');
      this.searchTerm = '';
      this.filtroFecha = 'todos';
      this.filtroAtendedor = 'todos';
      this.filtroEstado = 'todos';
    }
    
    console.log('🔍 CotizacionesComponent: Término de búsqueda:', this.searchTerm);
    console.log('📅 CotizacionesComponent: Filtro fecha:', this.filtroFecha);
    console.log('👤 CotizacionesComponent: Filtro atendido:', this.filtroAtendedor);
    console.log('🏷️ CotizacionesComponent: Filtro estado:', this.filtroEstado);
    
    let filtradas = [...this.cotizaciones];

    // Filtro de búsqueda
    if (this.searchTerm) {
      const termino = this.searchTerm.toLowerCase();
      filtradas = filtradas.filter(cot => 
        cot.codigo?.toLowerCase().includes(termino) ||
        cot.nombre?.toLowerCase().includes(termino) ||
        cot.empresa?.toLowerCase().includes(termino) ||
        cot.email?.toLowerCase().includes(termino) ||
        cot.atendido?.toLowerCase().includes(termino)
      );
      console.log('🔍 CotizacionesComponent: Después de filtro búsqueda:', filtradas.length);
    }

    // Filtro de fecha
    if (this.filtroFecha !== 'todos') {
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      const semana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
      const mes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

      filtradas = filtradas.filter(cot => {
        const fecha = cot.fecha?.toDate ? cot.fecha.toDate() : new Date(cot.fecha);
        
        switch (this.filtroFecha) {
          case 'hoy':
            return fecha >= hoy;
          case 'semana':
            return fecha >= semana;
          case 'mes':
            return fecha >= mes;
          default:
            return true;
        }
      });
      console.log('📅 CotizacionesComponent: Después de filtro fecha:', filtradas.length);
    }

    // Filtro de atendido
    if (this.filtroAtendedor !== 'todos') {
      filtradas = filtradas.filter(cot => cot.atendido === this.filtroAtendedor);
      console.log('👤 CotizacionesComponent: Después de filtro atendido:', filtradas.length);
    }

    // Filtro de estado
    if (this.filtroEstado !== 'todos') {
      filtradas = filtradas.filter(cot => cot.estado === this.filtroEstado);
      console.log('🏷️ CotizacionesComponent: Después de filtro estado:', filtradas.length);
    }

    this.cotizacionesFiltradas = filtradas;
    console.log('✅ CotizacionesComponent: Filtros aplicados, resultado final:', this.cotizacionesFiltradas.length);
  }

  getCotizacionesPorEstado(estado: string): Cotizacion[] {
    const cotizacionesPorEstado = this.cotizacionesFiltradas.filter(cot => cot.estado === estado);
    console.log(`📊 CotizacionesComponent: Cotizaciones con estado "${estado}":`, cotizacionesPorEstado.length);
    return cotizacionesPorEstado;
  }

  // Métodos para cambio de vista
  setViewMode(mode: 'kanban' | 'list') {
    console.log('🔄 CotizacionesComponent: Cambiando a vista:', mode);
    this.viewMode = mode;
    
    if (mode === 'list') {
      console.log('📊 CotizacionesComponent: Vista lista activada');
      console.log('📋 CotizacionesComponent: Total de cotizaciones:', this.cotizaciones.length);
      console.log('🔍 CotizacionesComponent: Cotizaciones filtradas:', this.cotizacionesFiltradas.length);
      
      // Debug: mostrar las primeras 3 cotizaciones
      if (this.cotizacionesFiltradas.length > 0) {
        console.log('📄 CotizacionesComponent: Primeras 3 cotizaciones:');
        this.cotizacionesFiltradas.slice(0, 3).forEach((cot, index) => {
          console.log(`  ${index + 1}. ${cot.codigo} - ${cot.nombre} - ${cot.empresa} - $${cot.valor}`);
        });
      }
    }
  }

  trackByCotizacion(index: number, cotizacion: Cotizacion): string {
    return cotizacion.id;
  }

  // Métodos para drag & drop
  onDragStart(event: DragEvent, cotizacion: Cotizacion) {
    this.draggedCotizacion = cotizacion;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', cotizacion.id);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  async onDrop(event: DragEvent, nuevoEstado: string) {
    event.preventDefault();
    
    if (this.draggedCotizacion && this.draggedCotizacion.estado !== nuevoEstado) {
      try {
        await this.firebaseService.updateCotizacion(this.draggedCotizacion.id, { estado: nuevoEstado });
        
        // Si el estado es "Aceptada", crear contrato
        if (nuevoEstado === 'Aceptada') {
          await this.firebaseService.createContratoFromCotizacion(this.draggedCotizacion);
        }
        
        // Recargar cotizaciones
        await this.cargarCotizaciones();
        
        // Mostrar notificación de éxito
        this.notificationService.showSuccess(`Cotización movida a ${nuevoEstado}`);
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        this.notificationService.showError('Error al cambiar estado');
      }
    }
    
    this.draggedCotizacion = null;
  }

  async onEstadoChanged(event: { cotizacionId: string, nuevoEstado: string }) {
    try {
      await this.firebaseService.updateCotizacion(event.cotizacionId, { estado: event.nuevoEstado });
      
      // Si el estado es "Aceptada", crear contrato
      if (event.nuevoEstado === 'Aceptada') {
        const cotizacion = this.cotizaciones.find(c => c.id === event.cotizacionId);
        if (cotizacion) {
          try {
            await this.firebaseService.createContratoFromCotizacion(cotizacion);
            this.notificationService.showSuccess('Cotización enviada a Gestión de Contratos');
            console.log('✅ CotizacionesComponent: Contrato creado automáticamente desde cotización aceptada');
          } catch (error) {
            console.error('❌ CotizacionesComponent: Error al crear contrato automáticamente:', error);
            this.notificationService.showError('Error al crear contrato automáticamente');
          }
        }
      }
      
      // Recargar cotizaciones
      await this.cargarCotizaciones();
      
      // Mostrar notificación
      this.notificationService.showSuccess(`Estado cambiado a ${event.nuevoEstado}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.notificationService.showError('Error al cambiar estado');
    }
  }

  async onCotizacionDeleted(cotizacionId: string) {
    try {
      // Usar el método deleteDoc directamente
      const { deleteDoc, doc } = await import('@angular/fire/firestore');
      const cotizacionRef = doc(this.firebaseService['firestore'], 'cotizaciones', cotizacionId);
      await deleteDoc(cotizacionRef);
      await this.cargarCotizaciones();
      this.notificationService.showSuccess('Cotización eliminada');
    } catch (error) {
      console.error('Error al eliminar cotización:', error);
      this.notificationService.showError('Error al eliminar cotización');
    }
  }

  // Métodos para vista lista
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

  // Métodos de acciones para vista lista
  verPDF(cotizacion: Cotizacion) {
    console.log('Generando vista previa de PDF para:', cotizacion.codigo);
    this.cotizacionSeleccionada = cotizacion;
    this.mostrarModalPDF = true;
    this.notificationService.showInfo('Abriendo vista previa del PDF...');
  }

  cerrarModalPDF() {
    this.mostrarModalPDF = false;
    this.cotizacionSeleccionada = null;
  }

  async descargarPDF() {
    if (!this.cotizacionSeleccionada) return;
    
    try {
      console.log('📄 Iniciando descarga de PDF...');

      // Cargar html2pdf si no está disponible
      if (typeof html2pdf === 'undefined') {
        await this.cargarHtml2Pdf();
      }

      // Importar el template dinámicamente
      const templateModule = await import('../../templates/invoice-template.js');
      const { renderInvoice } = templateModule as any;

      // Preparar datos de la cotización
      const datosCotizacion = {
        nombre: this.cotizacionSeleccionada.nombre,
        email: this.cotizacionSeleccionada.email,
        rut: this.cotizacionSeleccionada['rut'],
        empresa: this.cotizacionSeleccionada.empresa,
        moneda: 'CLP',
        codigo: this.cotizacionSeleccionada.codigo,
        fecha: this.cotizacionSeleccionada.fecha,
        serviciosData: this.cotizacionSeleccionada.servicios || [],
        total: this.cotizacionSeleccionada.valor,
        atendedor: this.cotizacionSeleccionada.atendido,
        notasAdicionales: this.cotizacionSeleccionada['notasAdicionales'],
        descuento: this.cotizacionSeleccionada['descuento'] || 0
      };

      // Generar HTML de la cotización
      const htmlCotizacion = renderInvoice(datosCotizacion);

      // Crear elemento temporal
      const elemento = document.createElement('div');
      elemento.innerHTML = htmlCotizacion;
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
        filename: `cotizacion-${this.cotizacionSeleccionada.codigo || this.cotizacionSeleccionada.id}.pdf`,
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
      this.notificationService.showSuccess('PDF de la cotización descargado exitosamente');

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



  async onGenerarContrato(cotizacionId: string) {
    try {
      // Buscar la cotización
      const cotizacion = this.cotizaciones.find(c => c.id === cotizacionId);
      if (!cotizacion) {
        this.notificationService.showError('Cotización no encontrada');
        return;
      }

      // Cambiar estado a "En Negociación"
      await this.onEstadoChanged({
        cotizacionId: cotizacionId,
        nuevoEstado: 'En Negociación'
      });

      // Generar contrato usando el servicio de Firebase
      const contratoGenerado = await this.firebaseService.createContratoFromCotizacion(cotizacion);
      
      if (contratoGenerado) {
        this.notificationService.showSuccess('Contrato generado correctamente');
        
        // Navegar a la página de contratos
        setTimeout(() => {
          this.router.navigate(['/contratos']);
        }, 1500);
      } else {
        this.notificationService.showError('Error al generar contrato');
      }
    } catch (error) {
      console.error('Error al generar contrato:', error);
      this.notificationService.showError('Error al generar contrato');
    }
  }

  async generarContrato(cotizacion: Cotizacion) {
    try {
      console.log('🔄 CotizacionesComponent: Generando contrato para:', cotizacion.codigo);
      
      // Primero cambiar el estado a "Aceptada"
      await this.firebaseService.updateCotizacion(cotizacion.id, { estado: 'Aceptada' });
      console.log('✅ CotizacionesComponent: Estado cambiado a Aceptada');
      
      // Generar contrato usando el servicio de Firebase
      const contratoGenerado = await this.firebaseService.createContratoFromCotizacion(cotizacion);
      
      if (contratoGenerado) {
        this.notificationService.showSuccess('Contrato generado correctamente. Redirigiendo...');
        
        // Recargar cotizaciones para reflejar el cambio de estado
        await this.cargarCotizaciones();
        
        // Navegar a la página de contratos después de un breve delay
        setTimeout(() => {
          this.router.navigate(['/contratos']);
        }, 1500);
      } else {
        this.notificationService.showError('Error al generar contrato');
      }
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error al generar contrato:', error);
      this.notificationService.showError('Error al generar contrato: ' + error);
    }
  }

  editarCotizacion(cotizacion: Cotizacion) {
    console.log('✏️ CotizacionesComponent: Editando cotización:', cotizacion.codigo);
    
    // Por ahora, mostrar un modal de edición simple
    // En el futuro, esto podría navegar a una página de edición dedicada
    this.mostrarModalEdicion(cotizacion);
  }

  mostrarModalEdicion(cotizacion: Cotizacion) {
    // Crear un modal de edición simple
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #1a1b26;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="color: white; margin: 0;">✏️ Editar Cotización</h3>
        <button id="cerrarModal" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
      </div>
      
      <form id="formEdicion">
        <div style="margin-bottom: 16px;">
          <label style="display: block; color: white; margin-bottom: 8px;">Código:</label>
          <input type="text" id="codigo" value="${cotizacion.codigo}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #333; background: #2a2b36; color: white;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; color: white; margin-bottom: 8px;">Nombre del Cliente:</label>
          <input type="text" id="nombre" value="${cotizacion.nombre || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #333; background: #2a2b36; color: white;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; color: white; margin-bottom: 8px;">Empresa:</label>
          <input type="text" id="empresa" value="${cotizacion.empresa || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #333; background: #2a2b36; color: white;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; color: white; margin-bottom: 8px;">Email:</label>
          <input type="email" id="email" value="${cotizacion.email || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #333; background: #2a2b36; color: white;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; color: white; margin-bottom: 8px;">Valor Total:</label>
          <input type="number" id="valor" value="${cotizacion.valor || 0}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #333; background: #2a2b36; color: white;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; color: white; margin-bottom: 8px;">Estado:</label>
          <select id="estado" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #333; background: #2a2b36; color: white;">
            <option value="Emitida" ${cotizacion.estado === 'Emitida' ? 'selected' : ''}>Emitida</option>
            <option value="Contestada" ${cotizacion.estado === 'Contestada' ? 'selected' : ''}>Contestada</option>
            <option value="En Negociación" ${cotizacion.estado === 'En Negociación' ? 'selected' : ''}>En Negociación</option>
            <option value="Aceptada" ${cotizacion.estado === 'Aceptada' ? 'selected' : ''}>Aceptada</option>
            <option value="Rechazada" ${cotizacion.estado === 'Rechazada' ? 'selected' : ''}>Rechazada</option>
          </select>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" id="cancelarEdicion" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #666; background: #333; color: white; cursor: pointer;">Cancelar</button>
          <button type="submit" style="padding: 8px 16px; border-radius: 6px; border: none; background: #00d4ff; color: white; cursor: pointer;">Guardar Cambios</button>
        </div>
      </form>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Event listeners
    const cerrarModal = () => {
      document.body.removeChild(modal);
    };

    modal.querySelector('#cerrarModal')?.addEventListener('click', cerrarModal);
    modal.querySelector('#cancelarEdicion')?.addEventListener('click', cerrarModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModal();
    });

    // Manejar el envío del formulario
    modal.querySelector('#formEdicion')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        codigo: (modal.querySelector('#codigo') as HTMLInputElement).value,
        nombre: (modal.querySelector('#nombre') as HTMLInputElement).value,
        empresa: (modal.querySelector('#empresa') as HTMLInputElement).value,
        email: (modal.querySelector('#email') as HTMLInputElement).value,
        valor: parseFloat((modal.querySelector('#valor') as HTMLInputElement).value),
        estado: (modal.querySelector('#estado') as HTMLSelectElement).value
      };

      try {
        await this.firebaseService.updateCotizacion(cotizacion.id, formData);
        this.notificationService.showSuccess('Cotización actualizada correctamente');
        await this.cargarCotizaciones();
        cerrarModal();
      } catch (error) {
        console.error('Error al actualizar cotización:', error);
        this.notificationService.showError('Error al actualizar cotización');
      }
    });
  }

  eliminarCotizacion(cotizacion: Cotizacion) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      this.onCotizacionDeleted(cotizacion.id);
    }
  }

  async crearCotizacionPrueba() {
    try {
      console.log('🧪 CotizacionesComponent: Creando 1 cotización de prueba...');
      await this.firebaseService.crearCotizacionPrueba();
      console.log('✅ CotizacionesComponent: Cotización de prueba creada exitosamente');
      this.notificationService.showSuccess('1 cotización de prueba creada exitosamente');
      
      // Recargar cotizaciones después de crear los datos
      await this.cargarCotizaciones();
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error al crear cotización de prueba:', error);
      this.notificationService.showError('Error al crear cotización de prueba: ' + error);
    }
  }

  navegarACrearCotizacion() {
    console.log('🔗 CotizacionesComponent: Navegando a crear cotización...');
    this.router.navigate(['/cotizaciones/crear']).then(() => {
      console.log('✅ CotizacionesComponent: Navegación a crear cotización exitosa');
    }).catch((error) => {
      console.error('❌ CotizacionesComponent: Error al navegar a crear cotización:', error);
    });
  }

  async recargarDatos() {
    try {
      console.log('🔄 CotizacionesComponent: Recargando datos...');
      await this.cargarCotizaciones();
      this.notificationService.showSuccess('Datos recargados correctamente');
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error al recargar datos:', error);
      this.notificationService.showError('Error al recargar datos: ' + error);
    }
  }



  onLogout() {
    // El logout se maneja en el header component
  }
}
