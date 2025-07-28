import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ContractCardComponent } from '../../shared/components/contract-card/contract-card.component';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    StatCardComponent,
    ContractCardComponent
  ],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  contratos$!: Observable<any[]>;
  contratosFiltrados$!: Observable<any[]>;
  
  // Estadísticas
  stats = [
    { title: 'Total Contratos', value: '0' },
    { title: 'Pendientes de Firma', value: '0' },
    { title: 'Firmados', value: '0' },
    { title: 'Valor Total', value: '$0' }
  ];

  // Filtros
  searchTerm = '';
  filtroEstado = 'todos';
  filtroMes = 'todos';
  filtroAno = 'todos';

  // Datos de prueba para desarrollo
  datosPrueba = [
    {
      id: '1',
      codigo: 'CON-001',
      titulo: 'Contrato - Desarrollo Web',
      fechaCreacionContrato: new Date('2024-01-15'),
      fechaInicio: new Date('2024-01-20'),
      fechaFin: new Date('2024-03-20'),
      valorTotal: '5000',
      nombreCliente: 'Juan Pérez',
      emailCliente: 'juan@techsolutions.com',
      rutCliente: '12.345.678-9',
      empresa: 'Tech Solutions',
      servicios: 'Desarrollo Web, SEO',
      descripcionServicios: 'Desarrollo de sitio web corporativo con optimización SEO',
      terminosCondiciones: 'Términos y condiciones estándar para desarrollo web',
      estado: 'Pendiente de Firma',
      cotizacionOrigen: 'COT-001',
      atendido: 'Rodrigo Carrillo',
      firmas: {
        cliente: false,
        representante: false
      }
    },
    {
      id: '2',
      codigo: 'CON-002',
      titulo: 'Contrato - Marketing Digital',
      fechaCreacionContrato: new Date('2024-01-20'),
      fechaInicio: new Date('2024-02-01'),
      fechaFin: new Date('2024-05-01'),
      valorTotal: '3500',
      nombreCliente: 'María García',
      emailCliente: 'maria@digitalmarketing.com',
      rutCliente: '98.765.432-1',
      empresa: 'Digital Marketing',
      servicios: 'Marketing Digital, Redes Sociales',
      descripcionServicios: 'Gestión de redes sociales y campañas publicitarias',
      terminosCondiciones: 'Términos y condiciones para servicios de marketing',
      estado: 'Firmado',
      cotizacionOrigen: 'COT-002',
      atendido: 'Bruno Villalobos',
      firmas: {
        cliente: true,
        representante: true
      }
    },
    {
      id: '3',
      codigo: 'CON-003',
      titulo: 'Contrato - E-commerce',
      fechaCreacionContrato: new Date('2024-01-25'),
      fechaInicio: new Date('2024-02-15'),
      fechaFin: new Date('2024-06-15'),
      valorTotal: '8000',
      nombreCliente: 'Carlos López',
      emailCliente: 'carlos@ecommerce.com',
      rutCliente: '11.222.333-4',
      empresa: 'E-commerce Store',
      servicios: 'Tienda Online, Pago Electrónico',
      descripcionServicios: 'Desarrollo de tienda online con sistema de pagos',
      terminosCondiciones: 'Términos y condiciones para desarrollo de e-commerce',
      estado: 'Enviado',
      cotizacionOrigen: 'COT-003',
      atendido: 'Mario Muñoz',
      firmas: {
        cliente: false,
        representante: true
      }
    }
  ];

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    // Usar datos de prueba en lugar de Firebase por ahora
    this.contratos$ = new Observable(observer => {
      observer.next(this.datosPrueba);
      observer.complete();
    });

    this.contratosFiltrados$ = this.contratos$;

    // Actualizar estadísticas
    this.actualizarEstadisticas();
  }

  actualizarEstadisticas() {
    this.contratos$.subscribe(contratos => {
      const total = contratos.length;
      const pendientes = contratos.filter(c => c.estado === 'Pendiente de Firma').length;
      const firmados = contratos.filter(c => c.estado === 'Firmado').length;
      const valorTotal = contratos.reduce((sum, c) => sum + parseFloat(c.valorTotal), 0);

      this.stats = [
        { title: 'Total Contratos', value: total.toString() },
        { title: 'Pendientes de Firma', value: pendientes.toString() },
        { title: 'Firmados', value: firmados.toString() },
        { title: 'Valor Total', value: this.formatearMoneda(valorTotal) }
      ];
    });
  }

  aplicarFiltros() {
    this.contratosFiltrados$ = this.contratos$.pipe(
      map(contratos => {
        let filtrados = contratos;

        // Filtro por búsqueda
        if (this.searchTerm) {
          const termino = this.searchTerm.toLowerCase();
          filtrados = filtrados.filter(contrato =>
            contrato.codigo.toLowerCase().includes(termino) ||
            contrato.nombreCliente.toLowerCase().includes(termino) ||
            contrato.empresa.toLowerCase().includes(termino) ||
            contrato.servicios.toLowerCase().includes(termino)
          );
        }

        // Filtro por estado
        if (this.filtroEstado !== 'todos') {
          filtrados = filtrados.filter(contrato => contrato.estado === this.filtroEstado);
        }

        // Filtro por mes
        if (this.filtroMes !== 'todos') {
          const mes = parseInt(this.filtroMes);
          filtrados = filtrados.filter(contrato => {
            const fecha = contrato.fechaCreacionContrato.toDate ? 
              contrato.fechaCreacionContrato.toDate() : 
              new Date(contrato.fechaCreacionContrato);
            return fecha.getMonth() + 1 === mes;
          });
        }

        // Filtro por año
        if (this.filtroAno !== 'todos') {
          const ano = parseInt(this.filtroAno);
          filtrados = filtrados.filter(contrato => {
            const fecha = contrato.fechaCreacionContrato.toDate ? 
              contrato.fechaCreacionContrato.toDate() : 
              new Date(contrato.fechaCreacionContrato);
            return fecha.getFullYear() === ano;
          });
        }

        return filtrados;
      })
    );
  }

  // Métodos para manejar eventos de las tarjetas
  onVerContrato(id: string) {
    console.log('Ver contrato:', id);
    // Aquí implementarías la lógica para mostrar detalles del contrato
  }

  onEditarContrato(id: string) {
    console.log('Editar contrato:', id);
    // Aquí implementarías la lógica para editar el contrato
  }

  onEliminarContrato(id: string) {
    console.log('Eliminar contrato:', id);
    if (confirm('¿Estás seguro de que quieres eliminar este contrato?')) {
      // Aquí implementarías la lógica para eliminar el contrato
      this.firebaseService.deleteContrato(id).then(() => {
        console.log('Contrato eliminado exitosamente');
        this.actualizarEstadisticas();
      }).catch(error => {
        console.error('Error al eliminar contrato:', error);
      });
    }
  }

  onCambiarEstado(data: {id: string, estado: string}) {
    console.log('Cambiar estado:', data);
    // Aquí implementarías la lógica para cambiar el estado del contrato
    this.firebaseService.updateContrato(data.id, { estado: data.estado }).then(() => {
      console.log('Estado actualizado exitosamente');
      this.actualizarEstadisticas();
    }).catch(error => {
      console.error('Error al actualizar estado:', error);
    });
  }

  onEnviarFirma(id: string) {
    console.log('Enviar para firma:', id);
    // Aquí implementarías la lógica para enviar el contrato para firma
  }

  onGenerarPDF(id: string) {
    console.log('Generar PDF:', id);
    // Aquí implementarías la lógica para generar el PDF del contrato
  }

  onLogout() {
    console.log('Cerrar sesión');
    // Aquí implementarías la lógica de logout
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(valor);
  }
}
