import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { AuthService } from '../../core/services/auth.service';
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
  contratosFiltrados: any[] = [];
  cargando = true;
  
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

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {
    console.log('🔧 ContratosComponent: Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('🚀 ContratosComponent: ngOnInit ejecutado');
    this.verificarAutenticacion();
    this.testFirebaseConnection();
    this.cargarContratos();
  }

  async testFirebaseConnection(): Promise<void> {
    try {
      console.log('🧪 ContratosComponent: Probando conexión a Firebase...');
      await this.firebaseService.testConnection();
      console.log('✅ ContratosComponent: Conexión a Firebase exitosa');
      
      // Verificar colección de contratos
      await this.firebaseService.verificarColeccionContratos();
    } catch (error) {
      console.error('❌ ContratosComponent: Error de conexión a Firebase:', error);
    }
  }

  verificarAutenticacion(): void {
    console.log('🔐 ContratosComponent: Verificando autenticación...');
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          console.log('✅ ContratosComponent: Usuario autenticado:', user.email);
        } else {
          console.log('❌ ContratosComponent: Usuario no autenticado');
        }
      },
      error: (error) => {
        console.error('❌ ContratosComponent: Error de autenticación:', error);
      }
    });
  }

  async cargarContratos(): Promise<void> {
    console.log('🚀 ContratosComponent: Iniciando carga de contratos...');
    this.cargando = true;
    try {
      // Usar el método async en lugar del Observable
      const contratos = await this.firebaseService.getContratosAsync();
      console.log('✅ ContratosComponent: Contratos recibidos:', contratos);
      this.contratosFiltrados = contratos || [];
      this.cargando = false;
      this.actualizarEstadisticas();
      console.log('📊 ContratosComponent: Total de contratos:', this.contratosFiltrados.length);
    } catch (error) {
      console.error('❌ ContratosComponent: Error al cargar contratos:', error);
      this.contratosFiltrados = [];
      this.cargando = false;
    }
  }

  async crearContratoPrueba(): Promise<void> {
    try {
      console.log('🧪 ContratosComponent: Creando contrato de prueba...');
      const contratoPrueba = {
        codigo: `CON-${Date.now()}`,
        titulo: 'Contrato de Prueba - Desarrollo Web',
        fechaCreacionContrato: new Date(),
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
        valorTotal: 16500,
        nombreCliente: 'Cliente de Prueba',
        emailCliente: 'prueba@test.com',
        rutCliente: '12345678-9',
        empresa: 'Empresa de Prueba',
        servicios: 'Desarrollo Web, SEO',
        descripcionServicios: 'Desarrollo de sitio web corporativo con optimización SEO',
        terminosCondiciones: 'Términos y condiciones estándar para desarrollo web',
        estado: 'Pendiente de Firma',
        cotizacionOrigen: 'COT-PRUEBA',
        atendido: 'Rodrigo Carrillo',
        firmas: {
          cliente: false,
          representante: false
        },
        historialEstados: [
          {
            estado: 'Pendiente de Firma',
            fecha: new Date(),
            comentario: 'Contrato creado como prueba'
          }
        ]
      };

      await this.firebaseService.createContratoFromCotizacion(contratoPrueba);
      console.log('✅ ContratosComponent: Contrato de prueba creado exitosamente');
      alert('✅ Contrato de prueba creado exitosamente!');
      
      // Recargar contratos
      this.cargarContratos();
    } catch (error) {
      console.error('❌ ContratosComponent: Error al crear contrato de prueba:', error);
      alert('❌ Error al crear contrato de prueba: ' + error);
    }
  }

  actualizarEstadisticas() {
    if (!this.contratosFiltrados) {
      this.stats = [
        { title: 'Total Contratos', value: '0' },
        { title: 'Pendientes de Firma', value: '0' },
        { title: 'Firmados', value: '0' },
        { title: 'Valor Total', value: '$0' }
      ];
      return;
    }

    const total = this.contratosFiltrados.length;
    const pendientes = this.contratosFiltrados.filter(c => 
      c.estadoContrato === 'Pendiente de Firma' || c.estadoContrato === 'Pendiente'
    ).length;
    const firmados = this.contratosFiltrados.filter(c => 
      c.estadoContrato === 'Firmado' || c.estadoContrato === 'Completado'
    ).length;
    
    const valorTotal = this.contratosFiltrados.reduce((sum, contrato) => {
      const valor = parseFloat(contrato.total) || parseFloat(contrato.valorTotal) || 0;
      return sum + valor;
    }, 0);

    this.stats = [
      { title: 'Total Contratos', value: total.toString() },
      { title: 'Pendientes de Firma', value: pendientes.toString() },
      { title: 'Firmados', value: firmados.toString() },
      { title: 'Valor Total', value: this.formatearMoneda(valorTotal) }
    ];
  }

  aplicarFiltros() {
    if (!this.contratosFiltrados) return;
    
    let filtrados = this.contratosFiltrados;
    
    // Filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(contrato => 
        contrato.codigo?.toLowerCase().includes(term) ||
        contrato.cliente?.toLowerCase().includes(term) ||
        contrato.empresa?.toLowerCase().includes(term)
      );
    }
    
    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      filtrados = filtrados.filter(contrato => 
        contrato.estadoContrato === this.filtroEstado
      );
    }
    
    // Filtro por mes
    if (this.filtroMes !== 'todos') {
      filtrados = filtrados.filter(contrato => {
        const fecha = new Date(contrato.fechaInicio);
        return fecha.getMonth() === parseInt(this.filtroMes);
      });
    }
    
    // Filtro por año
    if (this.filtroAno !== 'todos') {
      filtrados = filtrados.filter(contrato => {
        const fecha = new Date(contrato.fechaInicio);
        return fecha.getFullYear() === parseInt(this.filtroAno);
      });
    }
    
    this.contratosFiltrados = filtrados;
    this.actualizarEstadisticas();
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

  async verificarCargaContratos(): Promise<void> {
    try {
      console.log('🔍 ContratosComponent: Verificando carga de contratos...');
      console.log('📊 ContratosComponent: contratosFiltrados:', this.contratosFiltrados);
      console.log('📊 ContratosComponent: Total de contratos:', this.contratosFiltrados?.length || 0);
      console.log('📊 ContratosComponent: Estado de carga:', this.cargando);
      
      if (this.contratosFiltrados && this.contratosFiltrados.length > 0) {
        console.log('✅ ContratosComponent: Contratos cargados correctamente');
        console.log('📄 ContratosComponent: Primer contrato:', this.contratosFiltrados[0]);
        alert('✅ Contratos cargados correctamente! Total: ' + this.contratosFiltrados.length);
      } else {
        console.log('❌ ContratosComponent: No hay contratos cargados');
        alert('❌ No hay contratos cargados. Verifica la conexión a Firebase.');
      }
    } catch (error) {
      console.error('❌ ContratosComponent: Error al verificar carga:', error);
      alert('❌ Error al verificar carga: ' + error);
    }
  }
}
