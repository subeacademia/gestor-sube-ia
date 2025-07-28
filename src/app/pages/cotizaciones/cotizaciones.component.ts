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

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarCotizaciones();
  }

  async cargarCotizaciones() {
    try {
      this.cotizaciones = await this.firebaseService.getCotizacionesAsync();
      this.cotizacionesFiltradas = [...this.cotizaciones];
      this.calcularEstadisticas();
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
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

  aplicarFiltros() {
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
    }

    // Filtro de atendido
    if (this.filtroAtendedor !== 'todos') {
      filtradas = filtradas.filter(cot => cot.atendido === this.filtroAtendedor);
    }

    // Filtro de estado
    if (this.filtroEstado !== 'todos') {
      filtradas = filtradas.filter(cot => cot.estado === this.filtroEstado);
    }

    this.cotizacionesFiltradas = filtradas;
  }

  getCotizacionesPorEstado(estado: string): Cotizacion[] {
    return this.cotizacionesFiltradas.filter(cot => cot.estado === estado);
  }

  // Métodos para cambio de vista
  setViewMode(mode: 'kanban' | 'list') {
    this.viewMode = mode;
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
    // Implementar generación de PDF
    console.log('Generando PDF para:', cotizacion.codigo);
  }

  generarContrato(cotizacion: Cotizacion) {
    this.onEstadoChanged({
      cotizacionId: cotizacion.id,
      nuevoEstado: 'Aceptada'
    });
  }

  editarCotizacion(cotizacion: Cotizacion) {
    // Implementar navegación a edición
    console.log('Editando cotización:', cotizacion.id);
  }

  eliminarCotizacion(cotizacion: Cotizacion) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      this.onCotizacionDeleted(cotizacion.id);
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
