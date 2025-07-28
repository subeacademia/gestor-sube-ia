import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Contrato {
  id: string;
  codigo: string;
  titulo: string;
  nombreCliente: string;
  empresa: string;
  emailCliente: string;
  rutCliente: string;
  estado: string;
  valorTotal: number;
  fechaCreacionContrato: any;
  firmas?: {
    cliente: boolean;
    representante: boolean;
  };
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

  // Métodos para firma
  firmarRepresentante() {
    this.firmaRepresentante.emit({
      contratoId: this.contrato.id
    });
  }

  enviarFirma() {
    this.enviarCliente.emit({
      contratoId: this.contrato.id
    });
  }

  verPDF() {
    // Implementar generación y visualización de PDF
    console.log('Generando PDF para contrato:', this.contrato.codigo);
    
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
        <h2 style="color: #333; margin: 10px 0;">CONTRATO</h2>
        <p style="color: #666; margin: 0;">Código: ${this.contrato.codigo}</p>
        <p style="color: #666; margin: 0;">Fecha: ${this.formatDate(this.contrato.fechaCreacionContrato)}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #00d4ff; padding-bottom: 5px;">Información del Contrato</h3>
        <p><strong>Título:</strong> ${this.contrato.titulo}</p>
        <p><strong>Cliente:</strong> ${this.contrato.nombreCliente}</p>
        <p><strong>Empresa:</strong> ${this.contrato.empresa}</p>
        <p><strong>Email:</strong> ${this.contrato.emailCliente}</p>
        <p><strong>RUT:</strong> ${this.contrato.rutCliente}</p>
        <p><strong>Estado:</strong> ${this.contrato.estado}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; border-bottom: 2px solid #00d4ff; padding-bottom: 5px;">Servicios</h3>
        <p>${this.contrato['servicios'] || this.contrato['descripcionServicios'] || 'Servicios contratados'}</p>
      </div>
      
      <div style="margin-top: 30px; text-align: right;">
        <h3 style="color: #333;">Total: ${this.formatCurrency(this.contrato.valorTotal)}</h3>
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
      html2pdf().from(pdfContainer).save(`contrato-${this.contrato.codigo}.pdf`);
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

  editarContrato() {
    // Implementar edición de contrato
    console.log('Editando contrato:', this.contrato.id);
  }

  eliminarContrato() {
    if (confirm('¿Estás seguro de que quieres eliminar este contrato?')) {
      this.contratoDeleted.emit(this.contrato.id);
    }
  }
}
