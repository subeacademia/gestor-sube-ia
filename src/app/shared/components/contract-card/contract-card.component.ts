import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  @Output() verDetalles = new EventEmitter<{ contratoId: string }>();
  @Output() editarContrato = new EventEmitter<{ contratoId: string }>();

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

  // Método para drag & drop
  onDragStart(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', this.contrato.id);
    }
  }

  onEstadoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const nuevoEstado = select.value;
    
    if (nuevoEstado !== this.contrato.estado) {
      this.estadoChanged.emit({
        contratoId: this.contrato.id,
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
    console.log('Generando PDF para contrato:', this.contrato.codigo || this.contrato.id);
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
    if (confirm('¿Estás seguro de que quieres eliminar este contrato?')) {
      this.contratoDeleted.emit(this.contrato.id);
    }
  }
}
