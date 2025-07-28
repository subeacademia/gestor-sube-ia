import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { QuoteCardComponent } from '../../shared/components/quote-card/quote-card.component';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    StatCardComponent,
    QuoteCardComponent
  ],
  templateUrl: './cotizaciones.component.html',
  styleUrls: ['./cotizaciones.component.scss']
})
export class CotizacionesComponent implements OnInit {
  cotizaciones$!: Observable<any[]>;
  
  // Estadísticas
  stats = [
    { title: 'Total Cotizaciones', value: '0' },
    { title: 'Este Mes', value: '0' },
    { title: 'Valor Total', value: '$0' },
    { title: 'Total Aceptado', value: '$0' }
  ];

  // Filtros
  searchTerm = '';
  filtroFecha = 'todos';
  filtroAtendedor = 'todos';
  filtroEstado = 'todos';
  filtroMes = 'todos';
  filtroAno = 'todos';

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    // Datos de prueba para mostrar el diseño
    const datosPrueba = [
      {
        id: '1',
        codigo: 'COT-001',
        fecha: new Date('2024-01-15'),
        nombreCliente: 'Juan Pérez',
        empresa: 'Tech Solutions',
        email: 'juan@techsolutions.com',
        atendido: 'Rodrigo Carrillo',
        servicios: 'Desarrollo Web, SEO',
        total: '5000',
        monto: '5000',
        estado: 'emitida'
      },
      {
        id: '2',
        codigo: 'COT-002',
        fecha: new Date('2024-01-20'),
        nombreCliente: 'María García',
        empresa: 'Digital Marketing',
        email: 'maria@digitalmarketing.com',
        atendido: 'Bruno Villalobos',
        servicios: 'Marketing Digital, Redes Sociales',
        total: '3500',
        monto: '3500',
        estado: 'aceptada'
      },
      {
        id: '3',
        codigo: 'COT-003',
        fecha: new Date('2024-01-25'),
        nombreCliente: 'Carlos López',
        empresa: 'E-commerce Store',
        email: 'carlos@ecommerce.com',
        atendido: 'Mario Muñoz',
        servicios: 'Tienda Online, Pago Electrónico',
        total: '8000',
        monto: '8000',
        estado: 'en-negociacion'
      }
    ];

    // Usar datos de prueba en lugar de Firebase por ahora
    this.cotizaciones$ = new Observable(observer => {
      observer.next(datosPrueba);
      observer.complete();
    });

    // Actualizar estadísticas
    this.stats = [
      { title: 'Total Cotizaciones', value: datosPrueba.length.toString() },
      { title: 'Este Mes', value: '3' },
      { title: 'Valor Total', value: '$16,500' },
      { title: 'Total Aceptado', value: '$3,500' }
    ];
  }

  // Métodos para manejar eventos de las tarjetas
  onVerDetalles(cotizacion: any) {
    console.log('Ver detalles:', cotizacion);
  }

  onEditar(cotizacion: any) {
    console.log('Editar:', cotizacion);
  }

  onCambiarEstado(cotizacion: any) {
    console.log('Cambiar estado:', cotizacion);
  }

  onGenerarContrato(cotizacion: any) {
    console.log('Generar contrato:', cotizacion);
    
    // Si el estado es "aceptada", crear el contrato automáticamente
    if (cotizacion.estado === 'aceptada') {
      this.crearContratoDesdeCotizacion(cotizacion);
    } else {
      // Si no está aceptada, cambiar el estado a aceptada y luego crear el contrato
      this.firebaseService.updateCotizacion(cotizacion.id, { estado: 'aceptada' })
        .then(() => {
          this.crearContratoDesdeCotizacion(cotizacion);
        })
        .catch(error => {
          console.error('Error al actualizar cotización:', error);
        });
    }
  }

  private crearContratoDesdeCotizacion(cotizacion: any) {
    this.firebaseService.createContratoFromCotizacion(cotizacion)
      .then((contrato) => {
        console.log('Contrato creado exitosamente:', contrato);
        // Aquí podrías mostrar una notificación de éxito
        alert(`Contrato ${contrato.codigo} creado exitosamente desde la cotización ${cotizacion.codigo}`);
      })
      .catch(error => {
        console.error('Error al crear contrato:', error);
        // Aquí podrías mostrar una notificación de error
        alert('Error al crear el contrato. Por favor, inténtalo de nuevo.');
      });
  }

  onEliminar(cotizacion: any) {
    console.log('Eliminar:', cotizacion);
  }

  onLogout() {
    console.log('Cerrar sesión');
  }

  aplicarFiltros() {
    console.log('Aplicando filtros...');
  }
}
