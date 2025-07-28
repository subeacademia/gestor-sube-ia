import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ContractCardComponent } from '../../shared/components/contract-card/contract-card.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';

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
  historialEstados?: any[];
  [key: string]: any;
}

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, ContractCardComponent],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  contratos: Contrato[] = [];
  contratosFiltrados: Contrato[] = [];
  
  // Estadísticas
  totalContratos: number = 0;
  contratosPendientes: number = 0;
  contratosFirmados: number = 0;
  valorTotalContratos: number = 0;
  
  // Filtros
  searchTerm: string = '';
  filtroEstado: string = 'todos';
  
  // Modal
  mostrarModal: boolean = false;
  nuevoContrato: any = {
    titulo: '',
    fechaInicio: '',
    fechaFin: '',
    valorTotal: 0,
    nombreCliente: '',
    emailCliente: '',
    rutCliente: '',
    empresa: '',
    descripcionServicios: '',
    terminosCondiciones: ''
  };

  // Modo de vista
  viewMode: 'kanban' | 'list' = 'kanban';
  
  // Drag & Drop
  draggedContrato: Contrato | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarContratos();
  }

  async cargarContratos() {
    try {
      this.contratos = await this.firebaseService.getContratosAsync();
      this.contratosFiltrados = [...this.contratos];
      this.calcularEstadisticas();
    } catch (error) {
      console.error('Error al cargar contratos:', error);
    }
  }

  calcularEstadisticas() {
    this.totalContratos = this.contratos.length;
    
    this.contratosPendientes = this.contratos.filter(cont => 
      cont.estado === 'Pendiente de Firma' || cont.estado === 'Enviado'
    ).length;
    
    this.contratosFirmados = this.contratos.filter(cont => 
      cont.estado === 'Firmado' || cont.estado === 'Finalizado'
    ).length;
    
    this.valorTotalContratos = this.contratos.reduce((sum, cont) => 
      sum + (cont.valorTotal || 0), 0
    );
  }

  onSearchChange() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtradas = [...this.contratos];

    // Filtro de búsqueda
    if (this.searchTerm) {
      const termino = this.searchTerm.toLowerCase();
      filtradas = filtradas.filter(cont => 
        cont.codigo?.toLowerCase().includes(termino) ||
        cont.titulo?.toLowerCase().includes(termino) ||
        cont.nombreCliente?.toLowerCase().includes(termino) ||
        cont.empresa?.toLowerCase().includes(termino)
      );
    }

    // Filtro de estado
    if (this.filtroEstado !== 'todos') {
      filtradas = filtradas.filter(cont => cont.estado === this.filtroEstado);
    }

    this.contratosFiltrados = filtradas;
  }

  getContratosPorEstado(estado: string): Contrato[] {
    return this.contratosFiltrados.filter(cont => cont.estado === estado);
  }

  // Métodos para cambio de vista
  setViewMode(mode: 'kanban' | 'list') {
    this.viewMode = mode;
  }

  // Métodos para drag & drop
  onDragStart(event: DragEvent, contrato: Contrato) {
    this.draggedContrato = contrato;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', contrato.id);
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
    
    if (this.draggedContrato && this.draggedContrato.estado !== nuevoEstado) {
      try {
        await this.firebaseService.updateContrato(this.draggedContrato.id, { estado: nuevoEstado });
        
        // Agregar al historial de estados
        const historialEstados = this.draggedContrato.historialEstados || [];
        historialEstados.push({
          estado: nuevoEstado,
          fecha: new Date(),
          comentario: `Contrato movido a ${nuevoEstado}`
        });
        
        await this.firebaseService.updateContrato(this.draggedContrato.id, { 
          historialEstados: historialEstados 
        });
        
        // Recargar contratos
        await this.cargarContratos();
        
        // Mostrar notificación de éxito
        this.mostrarNotificacion(`Contrato movido a ${nuevoEstado}`, 'success');
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        this.mostrarNotificacion('Error al cambiar estado', 'error');
      }
    }
    
    this.draggedContrato = null;
  }

  async onEstadoChanged(event: { contratoId: string, nuevoEstado: string }) {
    try {
      await this.firebaseService.updateContrato(event.contratoId, { estado: event.nuevoEstado });
      
      // Agregar al historial de estados
      const contrato = this.contratos.find(c => c.id === event.contratoId);
      if (contrato) {
        const historialEstados = contrato.historialEstados || [];
        historialEstados.push({
          estado: event.nuevoEstado,
          fecha: new Date(),
          comentario: `Estado cambiado manualmente`
        });
        
        await this.firebaseService.updateContrato(event.contratoId, { 
          historialEstados: historialEstados 
        });
      }
      
      await this.cargarContratos();
      this.mostrarNotificacion(`Estado cambiado a ${event.nuevoEstado}`, 'success');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.mostrarNotificacion('Error al cambiar estado', 'error');
    }
  }

  async onContratoDeleted(contratoId: string) {
    try {
      await this.firebaseService.deleteContrato(contratoId);
      await this.cargarContratos();
      this.mostrarNotificacion('Contrato eliminado', 'success');
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
      this.mostrarNotificacion('Error al eliminar contrato', 'error');
    }
  }

  // Métodos para firma de representante legal
  async onFirmaRepresentante(event: { contratoId: string }) {
    try {
      const contrato = this.contratos.find(c => c.id === event.contratoId);
      if (contrato) {
        const firmas = contrato.firmas || { cliente: false, representante: false };
        firmas.representante = true;
        
        // Si ambas firmas están completas, cambiar estado a Firmado
        let nuevoEstado = contrato.estado;
        if (firmas.cliente && firmas.representante) {
          nuevoEstado = 'Firmado';
        }
        
        await this.firebaseService.updateContrato(event.contratoId, { 
          firmas: firmas,
          estado: nuevoEstado
        });
        
        // Agregar al historial
        const historialEstados = contrato.historialEstados || [];
        historialEstados.push({
          estado: nuevoEstado,
          fecha: new Date(),
          comentario: 'Firmado por representante legal'
        });
        
        await this.firebaseService.updateContrato(event.contratoId, { 
          historialEstados: historialEstados 
        });
        
        await this.cargarContratos();
        this.mostrarNotificacion('Firmado por representante legal', 'success');
      }
    } catch (error) {
      console.error('Error al firmar como representante:', error);
      this.mostrarNotificacion('Error al firmar contrato', 'error');
    }
  }

  // Métodos para enviar a cliente
  async onEnviarCliente(event: { contratoId: string }) {
    try {
      const contrato = this.contratos.find(c => c.id === event.contratoId);
      if (contrato) {
        await this.firebaseService.updateContrato(event.contratoId, { 
          estado: 'Enviado'
        });
        
        // Agregar al historial
        const historialEstados = contrato.historialEstados || [];
        historialEstados.push({
          estado: 'Enviado',
          fecha: new Date(),
          comentario: 'Enviado al cliente para firma'
        });
        
        await this.firebaseService.updateContrato(event.contratoId, { 
          historialEstados: historialEstados 
        });
        
        await this.cargarContratos();
        this.mostrarNotificacion('Contrato enviado al cliente', 'success');
      }
    } catch (error) {
      console.error('Error al enviar contrato:', error);
      this.mostrarNotificacion('Error al enviar contrato', 'error');
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
  verPDF(contrato: Contrato) {
    // Implementar generación de PDF
    console.log('Generando PDF para:', contrato.codigo);
  }

  enviarCliente(contrato: Contrato) {
    this.onEnviarCliente({ contratoId: contrato.id });
  }

  editarContrato(contrato: Contrato) {
    // Implementar navegación a edición
    console.log('Editando contrato:', contrato.id);
  }

  eliminarContrato(contrato: Contrato) {
    if (confirm('¿Estás seguro de que quieres eliminar este contrato?')) {
      this.onContratoDeleted(contrato.id);
    }
  }

  mostrarModalCrearContrato() {
    this.mostrarModal = true;
    this.resetearFormulario();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.nuevoContrato = {
      titulo: '',
      fechaInicio: '',
      fechaFin: '',
      valorTotal: 0,
      nombreCliente: '',
      emailCliente: '',
      rutCliente: '',
      empresa: '',
      descripcionServicios: '',
      terminosCondiciones: ''
    };
  }

  async guardarContratoDirecto() {
    try {
      const contratoData = {
        codigo: `CON-${Date.now()}`,
        titulo: this.nuevoContrato.titulo,
        fechaCreacionContrato: new Date(),
        fechaInicio: this.nuevoContrato.fechaInicio ? new Date(this.nuevoContrato.fechaInicio) : new Date(),
        fechaFin: this.nuevoContrato.fechaFin ? new Date(this.nuevoContrato.fechaFin) : null,
        valorTotal: parseFloat(this.nuevoContrato.valorTotal) || 0,
        nombreCliente: this.nuevoContrato.nombreCliente,
        emailCliente: this.nuevoContrato.emailCliente,
        rutCliente: this.nuevoContrato.rutCliente,
        empresa: this.nuevoContrato.empresa,
        servicios: this.nuevoContrato.descripcionServicios,
        descripcionServicios: this.nuevoContrato.descripcionServicios,
        terminosCondiciones: this.nuevoContrato.terminosCondiciones,
        estado: 'Pendiente de Firma',
        atendido: 'Sistema',
        firmas: {
          cliente: false,
          representante: false
        },
        historialEstados: [
          {
            estado: 'Pendiente de Firma',
            fecha: new Date(),
            comentario: 'Contrato creado directamente'
          }
        ]
      };

      // Usar el método createContratoFromCotizacion pero pasando los datos del contrato
      await this.firebaseService.createContratoFromCotizacion(contratoData);
      
      this.cerrarModal();
      await this.cargarContratos();
      this.mostrarNotificacion('Contrato creado exitosamente', 'success');
      
      console.log('Contrato creado exitosamente');
    } catch (error) {
      console.error('Error al crear contrato:', error);
      this.mostrarNotificacion('Error al crear contrato', 'error');
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
}
