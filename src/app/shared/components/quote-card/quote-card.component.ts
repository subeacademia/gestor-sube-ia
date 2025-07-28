import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Cotizacion {
  id: string;
  codigo: string;
  estado: string;
  empresa: string;
  atendido: string;
  [key: string]: any;
}

@Component({
  selector: 'app-quote-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote-card.component.html',
  styleUrls: ['./quote-card.component.scss']
})
export class QuoteCardComponent {
  @Input() cotizacion!: Cotizacion;
  @Input() draggable: boolean = false;
  @Output() estadoChanged = new EventEmitter<{ cotizacionId: string, nuevoEstado: string }>();
  @Output() cotizacionDeleted = new EventEmitter<string>();
  @Output() generarContratoEvent = new EventEmitter<string>();

  mostrarModal: boolean = false;

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
    const estado = this.cotizacion.estado?.toLowerCase() || '';
    switch (estado) {
      case 'emitida':
        return 'emitida';
      case 'contestada':
        return 'contestada';
      case 'en negociación':
        return 'en-negociacion';
      case 'aceptada':
        return 'aceptada';
      case 'rechazada':
        return 'rechazada';
      default:
        return 'emitida';
    }
  }

  getEstadoIcon(): string {
    const estado = this.cotizacion.estado?.toLowerCase() || '';
    switch (estado) {
      case 'emitida':
        return '⏳';
      case 'contestada':
        return '📝';
      case 'en negociación':
        return '🤝';
      case 'aceptada':
        return '✅';
      case 'rechazada':
        return '❌';
      default:
        return '⏳';
    }
  }

  // Método para drag & drop
  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.cotizacion.id);
    }
  }

  onEstadoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value;
    
    if (nuevoEstado !== this.cotizacion.estado) {
      this.estadoChanged.emit({
        cotizacionId: this.cotizacion.id,
        nuevoEstado: nuevoEstado
      });
    }
  }

  // Métodos para modal
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // Métodos de acciones
  verPDF(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('Generando PDF para cotización:', this.cotizacion.codigo);
  }

  generarContrato(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.generarContratoEvent.emit(this.cotizacion.id);
  }

  editarCotizacion(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    console.log('Editando cotización:', this.cotizacion.id);
  }

  eliminarCotizacion(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      this.cotizacionDeleted.emit(this.cotizacion.id);
    }
  }
}
