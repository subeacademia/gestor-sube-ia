import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.scss'
})
export class CotizacionesComponent implements OnInit {
  cotizaciones$!: Observable<any[]>;
  cotizacionesFiltradas: any[] = [];
  cargando = true;
  filtroBusqueda = '';
  filtroEstado = 'todos';
  filtroAtendedor = 'todos';
  estados = ['Pendiente', 'Emitida', 'Contestada', 'En Negociación', 'Aceptada', 'Rechazada', 'Contratada'];
  atendedores = ['Rodrigo Carrillo', 'Bruno Villalobos', 'Mario Muñoz', 'Nicolás Valenzuela', 'Ignacio Villarroel'];

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 CotizacionesComponent: ngOnInit ejecutado');
    this.verificarAutenticacion();
    this.testFirebaseConnection();
    this.cargarCotizaciones();
  }

  verificarAutenticacion(): void {
    console.log('🔐 CotizacionesComponent: Verificando autenticación...');
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          console.log('✅ CotizacionesComponent: Usuario autenticado:', user.email);
        } else {
          console.log('❌ CotizacionesComponent: Usuario no autenticado');
          this.loginAutomatico();
        }
      },
      error: (error) => {
        console.error('❌ CotizacionesComponent: Error de autenticación:', error);
      }
    });
  }

  async loginAutomatico(): Promise<void> {
    try {
      console.log('🔐 CotizacionesComponent: Intentando login automático...');
      // Credenciales de prueba - ajusta según tu configuración
      await this.authService.login('admin@subeia.com', 'admin123');
      console.log('✅ CotizacionesComponent: Login automático exitoso');
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error en login automático:', error);
      this.router.navigate(['/login']);
    }
  }

  async testFirebaseConnection(): Promise<void> {
    try {
      console.log('🧪 CotizacionesComponent: Probando conexión a Firebase...');
      await this.firebaseService.verificarConfiguracionFirebase();
      console.log('✅ CotizacionesComponent: Configuración de Firebase correcta');
      
      // Verificar colección de cotizaciones
      await this.firebaseService.verificarColeccionCotizaciones();
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error de conexión a Firebase:', error);
      alert('❌ Error de conexión a Firebase: ' + error);
    }
  }



  async cargarCotizaciones(): Promise<void> {
    console.log('🚀 CotizacionesComponent: Iniciando carga de cotizaciones...');
    this.cargando = true;
    try {
      // Usar el método async en lugar del Observable
      const cotizaciones = await this.firebaseService.getCotizacionesAsync();
      console.log('✅ CotizacionesComponent: Cotizaciones recibidas:', cotizaciones);
      this.cotizacionesFiltradas = cotizaciones || [];
      this.cargando = false;
      console.log('📊 CotizacionesComponent: Total de cotizaciones:', this.cotizacionesFiltradas.length);
    } catch (error) {
      console.error('❌ CotizacionesComponent: Error al cargar cotizaciones:', error);
      this.cotizacionesFiltradas = [];
      this.cargando = false;
    }
  }

  aplicarFiltros(): void {
    // Implementar lógica de filtros si es necesario
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown');
    const dropdownContent = dropdown?.querySelector('.dropdown-content');
    
    // Cerrar todos los dropdowns
    document.querySelectorAll('.dropdown-content').forEach(content => {
      content.classList.remove('show');
    });
    
    // Abrir el dropdown actual
    dropdownContent?.classList.toggle('show');
  }

  crearNuevaCotizacion(): void {
    this.router.navigate(['/cotizaciones/crear']);
  }

  verDetalle(cotizacion: any): void {
    console.log('Ver detalle de cotización:', cotizacion);
    // Implementar vista de detalle
  }

  editarCotizacion(cotizacion: any): void {
    console.log('Editar cotización:', cotizacion);
    // Implementar edición
  }

  eliminarCotizacion(cotizacion: any): void {
    if (confirm(`¿Estás seguro de que quieres eliminar la cotización ${cotizacion.codigo}?`)) {
      console.log('Eliminar cotización:', cotizacion);
      // Implementar eliminación
    }
  }

  crearContrato(cotizacion: any): void {
    console.log('Crear contrato desde cotización:', cotizacion);
    // Implementar creación de contrato
  }

  getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'Pendiente': 'estado-pendiente',
      'Emitida': 'estado-emitida',
      'Contestada': 'estado-contestada',
      'En Negociación': 'estado-en-negociación',
      'Aceptada': 'estado-aceptada',
      'Rechazada': 'estado-rechazada',
      'Contratada': 'estado-contratada'
    };
    return estadoMap[estado] || 'estado-pendiente';
  }

  formatearMoneda(valor: number, moneda: string = 'CLP'): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: moneda
    }).format(valor);
  }

  getTotalCotizaciones(): number {
    return this.cotizacionesFiltradas?.length || 0;
  }

  getCotizacionesPendientes(): number {
    return this.cotizacionesFiltradas?.filter((c: any) => c.estado === 'Pendiente').length || 0;
  }

  getCotizacionesAceptadas(): number {
    return this.cotizacionesFiltradas?.filter((c: any) => c.estado === 'Aceptada').length || 0;
  }

  getCotizacionesContratadas(): number {
    return this.cotizacionesFiltradas?.filter((c: any) => c.estado === 'Contratada').length || 0;
  }

  // Método para obtener cotizaciones por estado (para el tablero Kanban)
  getCotizacionesPorEstado(estado: string): any[] {
    if (!this.cotizacionesFiltradas) return [];
    return this.cotizacionesFiltradas.filter(cotizacion => cotizacion.estado === estado);
  }


}
