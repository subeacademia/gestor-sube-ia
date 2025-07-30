import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { FirebaseService } from '../../core/services/firebase.service';

interface Cliente {
  id?: string;
  empresa: string;
  rut: string;
  nombre: string;
  cargo?: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  notas?: string;
  valorTotalFacturado?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  contratosRelacionados?: string[];
  origen?: string;
}

interface Cotizacion {
  id?: string;
  codigo: string;
  nombre: string;
  empresa: string;
  email: string;
  rut: string;
  valorTotal: number;
  estado: string;
  fechaCreacion: Date;
  atendido: string;
}

interface Contrato {
  id?: string;
  codigo: string;
  titulo: string;
  nombreCliente: string;
  empresa: string;
  valorTotal: number;
  estado: string;
  fechaCreacionContrato: Date;
  firmas: {
    cliente: boolean;
    representante: boolean;
  };
}

@Component({
  selector: 'app-cliente-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './cliente-detalle.component.html',
  styleUrls: ['./cliente-detalle.component.scss']
})
export class ClienteDetalleComponent implements OnInit, OnDestroy {
  cliente: Cliente | null = null;
  cotizaciones$: Observable<Cotizacion[]> = of([]);
  contratos$: Observable<Contrato[]> = of([]);
  loading = true;
  error = false;
  errorMessage = '';
  activeTab = 'cotizaciones';
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit(): void {
    console.log('🚀 ClienteDetalleComponent: Inicializando...');
    this.cargarCliente();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async cargarCliente(): Promise<void> {
    try {
      console.log('📋 ClienteDetalleComponent: Cargando cliente...');
      this.loading = true;
      this.error = false;

      // Obtener el ID del cliente desde los parámetros de la ruta
      const clienteId = this.route.snapshot.paramMap.get('id');
      
      if (!clienteId) {
        throw new Error('ID de cliente no encontrado');
      }

      console.log('🔍 ClienteDetalleComponent: ID del cliente:', clienteId);

      // Cargar datos del cliente
      this.cliente = await this.firebaseService.getClienteById(clienteId);
      
      if (!this.cliente) {
        throw new Error('Cliente no encontrado');
      }

      console.log('✅ ClienteDetalleComponent: Cliente cargado:', this.cliente);

      // Cargar cotizaciones y contratos del cliente
      this.cargarCotizacionesYContratos(clienteId);

    } catch (error) {
      console.error('❌ ClienteDetalleComponent: Error al cargar cliente:', error);
      this.error = true;
      this.errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar el cliente';
    } finally {
      this.loading = false;
    }
  }

  private cargarCotizacionesYContratos(clienteId: string): void {
    console.log('📊 ClienteDetalleComponent: Cargando cotizaciones y contratos...');

    // Cargar cotizaciones del cliente
    this.cotizaciones$ = this.firebaseService.getCotizacionesByCliente(clienteId).pipe(
      catchError(error => {
        console.error('❌ ClienteDetalleComponent: Error al cargar cotizaciones:', error);
        return of([]);
      })
    );

    // Cargar contratos del cliente
    this.contratos$ = this.firebaseService.getContratosByCliente(clienteId).pipe(
      catchError(error => {
        console.error('❌ ClienteDetalleComponent: Error al cargar contratos:', error);
        return of([]);
      })
    );
  }

  cambiarTab(tab: string): void {
    console.log('🔄 ClienteDetalleComponent: Cambiando a pestaña:', tab);
    this.activeTab = tab;
  }

  navegarAtras(): void {
    console.log('⬅️ ClienteDetalleComponent: Navegando hacia atrás');
    this.router.navigate(['/clientes']);
  }

  editarCliente(): void {
    console.log('✏️ ClienteDetalleComponent: Editando cliente');
    // Por ahora navegamos de vuelta a la lista donde se puede editar
    this.router.navigate(['/clientes']);
  }

  // Métodos auxiliares para formateo
  formatearFecha(fecha: any): string {
    if (!fecha) return 'No especificada';
    
    const date = fecha instanceof Date ? fecha : fecha.toDate ? fecha.toDate() : new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  obtenerEstadoColor(estado: string): string {
    const estados: { [key: string]: string } = {
      'Emitida': 'warning',
      'Contestada': 'info',
      'En Negociación': 'primary',
      'Aceptada': 'success',
      'Rechazada': 'danger',
      'Contratada': 'success',
      'Pendiente de Firma': 'warning',
      'Firmado': 'success',
      'Finalizado': 'success'
    };
    return estados[estado] || 'secondary';
  }

  obtenerIconoEstado(estado: string): string {
    const iconos: { [key: string]: string } = {
      'Emitida': '📄',
      'Contestada': '📧',
      'En Negociación': '🤝',
      'Aceptada': '✅',
      'Rechazada': '❌',
      'Contratada': '📋',
      'Pendiente de Firma': '✍️',
      'Firmado': '✅',
      'Finalizado': '🏁'
    };
    return iconos[estado] || '📋';
  }
}
