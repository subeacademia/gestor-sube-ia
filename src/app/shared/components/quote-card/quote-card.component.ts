import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quote-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quote-card.component.html',
  styleUrls: ['./quote-card.component.scss']
})
export class QuoteCardComponent {
  @Input() cotizacion: any = {};
  @Output() verDetallesEvent = new EventEmitter<any>();
  @Output() editarEvent = new EventEmitter<any>();
  @Output() cambiarEstadoEvent = new EventEmitter<any>();
  @Output() generarContratoEvent = new EventEmitter<any>();
  @Output() eliminarEvent = new EventEmitter<any>();

  verDetalles() {
    this.verDetallesEvent.emit(this.cotizacion);
  }

  editarCotizacion() {
    this.editarEvent.emit(this.cotizacion);
  }

  cambiarEstado() {
    this.cambiarEstadoEvent.emit(this.cotizacion);
  }

  generarContrato() {
    this.generarContratoEvent.emit(this.cotizacion);
  }

  eliminarCotizacion() {
    this.eliminarEvent.emit(this.cotizacion);
  }
}
