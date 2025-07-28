import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contract-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract-card.component.html',
  styleUrl: './contract-card.component.scss'
})
export class ContractCardComponent {
  @Input() contrato: any;
  @Output() verContrato = new EventEmitter<string>();
  @Output() editarContrato = new EventEmitter<string>();
  @Output() eliminarContrato = new EventEmitter<string>();
  @Output() cambiarEstado = new EventEmitter<{id: string, estado: string}>();
  @Output() enviarFirma = new EventEmitter<string>();
  @Output() generarPDF = new EventEmitter<string>();

  dropdownOpen = false;

  onVerContrato() {
    this.verContrato.emit(this.contrato.id);
  }

  onEditarContrato() {
    this.editarContrato.emit(this.contrato.id);
  }

  onEliminarContrato() {
    this.eliminarContrato.emit(this.contrato.id);
  }

  onCambiarEstado(nuevoEstado: string) {
    this.cambiarEstado.emit({ id: this.contrato.id, estado: nuevoEstado });
    this.dropdownOpen = false;
  }

  onEnviarFirma() {
    this.enviarFirma.emit(this.contrato.id);
    this.dropdownOpen = false;
  }

  onGenerarPDF() {
    this.generarPDF.emit(this.contrato.id);
    this.dropdownOpen = false;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pendiente de Firma': return 'estado-pendiente-firma';
      case 'Enviado': return 'estado-enviado';
      case 'Firmado': return 'estado-firmado';
      case 'Finalizado': return 'estado-finalizado';
      default: return 'estado-default';
    }
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return 'N/A';
    const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearMoneda(valor: string | number): string {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(num);
  }
}
