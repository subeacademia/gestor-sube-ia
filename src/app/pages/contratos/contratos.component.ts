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

  async onEstadoChanged(event: { contratoId: string, nuevoEstado: string }) {
    try {
      await this.firebaseService.updateContrato(event.contratoId, { estado: event.nuevoEstado });
      await this.cargarContratos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }

  async onContratoDeleted(contratoId: string) {
    try {
      await this.firebaseService.deleteContrato(contratoId);
      await this.cargarContratos();
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
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
      
      console.log('Contrato creado exitosamente');
    } catch (error) {
      console.error('Error al crear contrato:', error);
    }
  }
}
