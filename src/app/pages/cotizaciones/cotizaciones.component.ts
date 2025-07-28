import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { QuoteCardComponent } from '../../shared/components/quote-card/quote-card.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';

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
        this.mostrarNotificacion(`Cotización movida a ${nuevoEstado}`, 'success');
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        this.mostrarNotificacion('Error al cambiar estado', 'error');
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
          await this.firebaseService.createContratoFromCotizacion(cotizacion);
        }
      }
      
      // Recargar cotizaciones
      await this.cargarCotizaciones();
      
      // Mostrar notificación
      this.mostrarNotificacion(`Estado cambiado a ${event.nuevoEstado}`, 'success');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.mostrarNotificacion('Error al cambiar estado', 'error');
    }
  }

  async onCotizacionDeleted(cotizacionId: string) {
    try {
      // Usar el método deleteDoc directamente
      const { deleteDoc, doc } = await import('@angular/fire/firestore');
      const cotizacionRef = doc(this.firebaseService['firestore'], 'cotizaciones', cotizacionId);
      await deleteDoc(cotizacionRef);
      await this.cargarCotizaciones();
      this.mostrarNotificacion('Cotización eliminada', 'success');
    } catch (error) {
      console.error('Error al eliminar cotización:', error);
      this.mostrarNotificacion('Error al eliminar cotización', 'error');
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
    this.mostrarNotificacion('Abriendo vista previa del PDF...', 'info');
  }

  cerrarModalPDF() {
    this.mostrarModalPDF = false;
    this.cotizacionSeleccionada = null;
  }

  descargarPDF() {
    if (!this.cotizacionSeleccionada) return;
    
    console.log('📥 CotizacionesComponent: Descargando PDF para:', this.cotizacionSeleccionada.codigo);
    
    // Crear contenido HTML para el PDF
    const contenidoHTML = this.generarContenidoPDF(this.cotizacionSeleccionada);
    
    // Crear una nueva ventana para imprimir/descargar
    const ventanaPDF = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (ventanaPDF) {
      ventanaPDF.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PDF - ${this.cotizacionSeleccionada.codigo}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              background: white;
              color: #333;
            }
            .pdf-container {
              background: white;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #007bff;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              color: #007bff;
              margin: 0;
            }
            .subtitle {
              font-size: 16px;
              color: #666;
              margin: 10px 0;
            }
            .section {
              margin: 20px 0;
              padding: 15px;
              border-left: 4px solid #007bff;
              background: #f8f9fa;
            }
            .section h3 {
              margin: 0 0 10px 0;
              color: #007bff;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              padding: 5px 0;
              border-bottom: 1px solid #eee;
            }
            .label {
              font-weight: bold;
              color: #555;
            }
            .value {
              color: #333;
            }
            .services {
              margin: 20px 0;
            }
            .service-item {
              background: #f8f9fa;
              padding: 15px;
              margin: 10px 0;
              border-radius: 5px;
              border-left: 3px solid #28a745;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              text-align: right;
              color: #007bff;
              border-top: 2px solid #007bff;
              padding-top: 15px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .pdf-container { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            ${contenidoHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      ventanaPDF.document.close();
      this.mostrarNotificacion('PDF generado. Se abrirá la ventana de impresión.', 'success');
    } else {
      this.mostrarNotificacion('Error al generar PDF', 'error');
    }
  }

  generarContenidoPDF(cotizacion: Cotizacion): string {
    const serviciosHTML = cotizacion.servicios?.map(servicio => `
      <div class="service-item">
        <div class="info-row">
          <span class="label">Servicio:</span>
          <span class="value">${servicio.nombre || 'Sin nombre'}</span>
        </div>
        <div class="info-row">
          <span class="label">Detalle:</span>
          <span class="value">${servicio.detalle || 'Sin detalle'}</span>
        </div>
        <div class="info-row">
          <span class="label">Modalidad:</span>
          <span class="value">${servicio.modalidad || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="label">Alumnos:</span>
          <span class="value">${servicio.alumnos || 0}</span>
        </div>
        <div class="info-row">
          <span class="label">Subtotal:</span>
          <span class="value">${this.formatCurrency(servicio.subtotal || 0)}</span>
        </div>
      </div>
    `).join('') || '<p>No hay servicios registrados</p>';

    return `
      <div class="header">
        <h1 class="title">COTIZACIÓN</h1>
        <p class="subtitle">${cotizacion.codigo}</p>
        <p class="subtitle">Fecha: ${this.formatDate(cotizacion.fecha)}</p>
      </div>

      <div class="section">
        <h3>Información del Cliente</h3>
        <div class="info-row">
          <span class="label">Nombre:</span>
          <span class="value">${cotizacion.nombre || 'No especificado'}</span>
        </div>
        <div class="info-row">
          <span class="label">Empresa:</span>
          <span class="value">${cotizacion.empresa || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="label">Email:</span>
          <span class="value">${cotizacion.email || 'No especificado'}</span>
        </div>
        <div class="info-row">
          <span class="label">Atendido por:</span>
          <span class="value">${cotizacion.atendido || 'No especificado'}</span>
        </div>
      </div>

      <div class="section">
        <h3>Servicios Cotizados</h3>
        <div class="services">
          ${serviciosHTML}
        </div>
      </div>

      <div class="total">
        <div class="info-row">
          <span class="label">TOTAL:</span>
          <span class="value">${this.formatCurrency(cotizacion.valor || 0)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Esta cotización es válida por 30 días desde su emisión.</p>
        <p>Para cualquier consulta, contacte a ${cotizacion.atendido || 'nuestro equipo'}.</p>
      </div>
    `;
  }

  async onGenerarContrato(cotizacionId: string) {
    try {
      // Buscar la cotización
      const cotizacion = this.cotizaciones.find(c => c.id === cotizacionId);
      if (!cotizacion) {
        this.mostrarNotificacion('Cotización no encontrada', 'error');
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
        this.mostrarNotificacion('Contrato generado correctamente', 'success');
        
        // Navegar a la página de contratos
        setTimeout(() => {
          this.router.navigate(['/contratos']);
        }, 1500);
      } else {
        this.mostrarNotificacion('Error al generar contrato', 'error');
      }
    } catch (error) {
      console.error('Error al generar contrato:', error);
      this.mostrarNotificacion('Error al generar contrato', 'error');
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
        this.mostrarNotificacion('Contrato generado correctamente. Redirigiendo...', 'success');
        
        // Recargar cotizaciones para reflejar el cambio de estado
        await this.cargarCotizaciones();
        
        // Navegar a la página de contratos después de un breve delay
        setTimeout(() => {
          this.router.navigate(['/contratos']);
        }, 1500);
      } else {
        this.mostrarNotificacion('Error al generar contrato', 'error');
      }
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error al generar contrato:', error);
      this.mostrarNotificacion('Error al generar contrato: ' + error, 'error');
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
        this.mostrarNotificacion('Cotización actualizada correctamente', 'success');
        await this.cargarCotizaciones();
        cerrarModal();
      } catch (error) {
        console.error('Error al actualizar cotización:', error);
        this.mostrarNotificacion('Error al actualizar cotización', 'error');
      }
    });
  }

  eliminarCotizacion(cotizacion: Cotizacion) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      this.onCotizacionDeleted(cotizacion.id);
    }
  }

  async crearDatosPrueba() {
    try {
      console.log('🧪 CotizacionesComponent: Creando datos de prueba...');
      await this.firebaseService.crearDatosPrueba();
      console.log('✅ CotizacionesComponent: Datos de prueba creados exitosamente');
      this.mostrarNotificacion('21 cotizaciones de prueba creadas exitosamente', 'success');
      
      // Recargar cotizaciones después de crear los datos
      await this.cargarCotizaciones();
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error al crear datos de prueba:', error);
      this.mostrarNotificacion('Error al crear datos de prueba: ' + error, 'error');
    }
  }

  // Método para mostrar notificaciones
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'info' = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
      <div class="notificacion-contenido">
        <span class="notificacion-icono">${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="notificacion-mensaje">${mensaje}</span>
      </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => notificacion.classList.add('mostrar'), 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notificacion.classList.remove('mostrar');
      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          document.body.removeChild(notificacion);
        }
      }, 300);
    }, 3000);
  }

  onLogout() {
    // El logout se maneja en el header component
  }
}
