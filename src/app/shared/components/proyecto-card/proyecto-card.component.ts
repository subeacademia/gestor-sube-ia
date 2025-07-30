import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Proyecto {
  id?: string;
  nombreProyecto: string;
  clienteId: string;
  nombreCliente: string;
  contratoId?: string;
  tipoServicio: string;
  responsable: string;
  fechaEntregaEstimada: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  progreso: number;
  estadoProyecto: 'planificacion' | 'en-progreso' | 'en-revision' | 'completado';
  descripcion?: string;
  presupuesto?: number;
  prioridad: 'baja' | 'media' | 'alta';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

@Component({
  selector: 'app-proyecto-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyecto-card.component.html',
  styleUrls: ['./proyecto-card.component.scss']
})
export class ProyectoCardComponent {
  @Input() proyecto!: Proyecto;
  @Output() verDetalles = new EventEmitter<Proyecto>();
  @Output() editar = new EventEmitter<Proyecto>();
  @Output() navegarADetalle = new EventEmitter<string>();

  // Obtener texto del estado para mostrar
  getEstadoText(estado: string): string {
    const estados = {
      'planificacion': 'Planificación',
      'en-progreso': 'En Progreso',
      'en-revision': 'En Revisión',
      'completado': 'Completado'
    };
    return estados[estado as keyof typeof estados] || estado;
  }

  // Verificar si el proyecto es urgente (fecha de entrega próxima)
  esUrgente(): boolean {
    if (!this.proyecto.fechaEntregaEstimada) return false;
    
    const hoy = new Date();
    const fechaEntrega = new Date(this.proyecto.fechaEntregaEstimada);
    const diasRestantes = Math.ceil((fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    // Es urgente si faltan 7 días o menos y no está completado
    return diasRestantes <= 7 && this.proyecto.estadoProyecto !== 'completado';
  }

  // Emitir evento para ver detalles
  onVerDetalles(): void {
    this.verDetalles.emit(this.proyecto);
  }

  // Emitir evento para editar
  onEditar(): void {
    this.editar.emit(this.proyecto);
  }

  // Navegar a la vista de detalle
  onNavegarADetalle(): void {
    if (this.proyecto.id) {
      this.navegarADetalle.emit(this.proyecto.id);
    }
  }
}
