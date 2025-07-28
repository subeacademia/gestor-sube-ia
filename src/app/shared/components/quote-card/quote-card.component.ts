import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  formatDate(fecha: any): string {
    if (!fecha) return 'Sin fecha';
    
    try {
      if (fecha.toDate) {
        // Es un Timestamp de Firestore
        return fecha.toDate().toLocaleDateString('es-CL');
      } else if (fecha instanceof Date) {
        // Es una fecha de JavaScript
        return fecha.toLocaleDateString('es-CL');
      } else if (typeof fecha === 'string') {
        // Es una cadena de fecha
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
        return 'negociacion';
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
        return '📄';
      case 'contestada':
        return '💬';
      case 'en negociación':
        return '🤝';
      case 'aceptada':
        return '✅';
      case 'rechazada':
        return '❌';
      default:
        return '📄';
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

  verPDF() {
    // Implementar generación y visualización de PDF
    console.log('Generando PDF para cotización:', this.cotizacion.codigo);
    
    // Crear un div temporal para el PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '-9999px';
    pdfContainer.style.width = '210mm';
    pdfContainer.style.height = '297mm';
    pdfContainer.style.backgroundColor = 'white';
    pdfContainer.style.color = 'black';
    pdfContainer.style.padding = '20mm';
    pdfContainer.style.fontFamily = 'Arial, sans-serif';
    pdfContainer.style.fontSize = '12px';
    pdfContainer.style.lineHeight = '1.4';
    
    // Contenido del PDF
    pdfContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00d4ff; margin: 0;">SUBE IA TECH</h1>
        <h2 style="color: #333; margin: 10px 0;">COTIZACIÓN</h2>
        <p style="color: #666; margin: 0;">Código: ${this.cotizacion.codigo}</p>
        <p style="color: #666; margin: 0;">Fecha: ${this.formatDate(this.cotizacion.fecha)}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #00d4ff; padding-bottom: 5px;">Información del Cliente</h3>
        <p><strong>Nombre:</strong> ${this.cotizacion.nombre || this.cotizacion['nombreCliente']}</p>
        <p><strong>Empresa:</strong> ${this.cotizacion.empresa}</p>
        <p><strong>Email:</strong> ${this.cotizacion.email || this.cotizacion['emailCliente']}</p>
        <p><strong>RUT:</strong> ${this.cotizacion['rut'] || this.cotizacion['rutCliente']}</p>
        <p><strong>Atendido por:</strong> ${this.cotizacion.atendido}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #00d4ff; padding-bottom: 5px;">Servicios</h3>
        ${this.generarHTMLServicios()}
      </div>
      
      <div style="margin-top: 30px; text-align: right;">
        <h3 style="color: #333;">Total: ${this.formatCurrency(this.cotizacion['total'] || this.cotizacion['valorTotal'] || this.cotizacion.valor)}</h3>
      </div>
      
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc;">
        <p style="font-size: 10px; color: #666; text-align: center;">
          SUBE IA TECH - Desarrollo de Software y Consultoría Tecnológica<br>
          Email: contacto@subeia.com | Teléfono: +56 9 XXXX XXXX
        </p>
      </div>
    `;
    
    document.body.appendChild(pdfContainer);
    
    // Generar PDF usando html2pdf
    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      html2pdf().from(pdfContainer).save(`cotizacion-${this.cotizacion.codigo}.pdf`);
    } else {
      // Fallback: abrir en nueva ventana para imprimir
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(pdfContainer.innerHTML);
        newWindow.document.close();
        newWindow.print();
      }
    }
    
    // Limpiar el div temporal
    setTimeout(() => {
      document.body.removeChild(pdfContainer);
    }, 1000);
  }

  generarHTMLServicios(): string {
    if (!this.cotizacion.servicios) {
      return '<p>Servicios generales</p>';
    }
    
    if (Array.isArray(this.cotizacion.servicios)) {
      return this.cotizacion.servicios.map((servicio: any) => {
        if (typeof servicio === 'string') {
          return `<p>• ${servicio}</p>`;
        } else {
          return `<p>• ${servicio.nombre || servicio.detalle || 'Servicio'}: ${this.formatCurrency(servicio.subtotal || servicio.valor || 0)}</p>`;
        }
      }).join('');
    }
    
    return `<p>• ${this.cotizacion.servicios}</p>`;
  }

  generarContrato() {
    // Emitir evento para generar contrato
    this.estadoChanged.emit({
      cotizacionId: this.cotizacion.id,
      nuevoEstado: 'Aceptada'
    });
  }

  editarCotizacion() {
    // Implementar navegación a edición
    console.log('Editando cotización:', this.cotizacion.id);
  }

  eliminarCotizacion() {
    if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
      this.cotizacionDeleted.emit(this.cotizacion.id);
    }
  }
}
