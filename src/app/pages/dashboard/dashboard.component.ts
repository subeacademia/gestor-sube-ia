import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  // KPIs principales
  totalCotizaciones: number = 0;
  valorTotalCotizaciones: number = 0;
  totalContratosCerrados: number = 0;
  tasaConversion: number = 0;
  
  // Métricas Detalladas
  servicioMasVendido: string = 'Consultoría IT';
  valorPromedio: number = 423272;
  tiempoPromedio: string = '5 días';
  clientesActivos: number = 45;
  clienteTop: string = 'Empresa ABC';
  tasaRetencion: number = 78;
  eficiencia: number = 13;
  velocidadPromedio: string = '3.2 días promedio';
  tasaCrecimiento: number = 15;
  
  // Datos para gráficos
  rendimientoUsuarios: any[] = [];
  tendenciaVentas: any[] = [];
  embudoVentas: any[] = [];
  
  // Subscripciones
  private subscriptions: any[] = [];
  
  constructor(
    private firebaseService: FirebaseService,
    private notificationService: NotificationService
  ) {
    console.log('🚀 DashboardComponent: Inicializando dashboard');
  }
  
  ngOnInit(): void {
    console.log('📊 DashboardComponent: Cargando datos del dashboard');
    this.cargarDatosDashboard();
  }
  
  ngOnDestroy(): void {
    console.log('🧹 DashboardComponent: Limpiando recursos');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Carga los datos de Firebase y procesa las métricas
   */
  private cargarDatosDashboard(): void {
    console.log('📈 DashboardComponent: Suscribiéndose a datos de Firebase');
    
    // Suscribirse a cotizaciones
    const cotizacionesSub = this.firebaseService.getCotizaciones().subscribe({
      next: (cotizaciones) => {
        console.log('📋 DashboardComponent: Cotizaciones cargadas:', cotizaciones.length);
        this.procesarCotizaciones(cotizaciones);
        this.procesarRendimientoUsuarios(cotizaciones);
        this.procesarTendenciaVentas(cotizaciones);
        this.procesarEmbudoVentas(cotizaciones);
      },
      error: (error) => {
        console.error('❌ DashboardComponent: Error al cargar cotizaciones:', error);
        this.notificationService.showError('Error al cargar datos de cotizaciones');
      }
    });
    
    // Suscribirse a contratos
    const contratosSub = this.firebaseService.getContratos().subscribe({
      next: (contratos) => {
        console.log('📄 DashboardComponent: Contratos cargados:', contratos.length);
        this.procesarContratos(contratos);
      },
      error: (error) => {
        console.error('❌ DashboardComponent: Error al cargar contratos:', error);
        this.notificationService.showError('Error al cargar datos de contratos');
      }
    });
    
    this.subscriptions.push(cotizacionesSub, contratosSub);
  }
  
  /**
   * Procesa los datos de cotizaciones para calcular KPIs
   */
  private procesarCotizaciones(cotizaciones: any[]): void {
    if (!cotizaciones || cotizaciones.length === 0) {
      console.log('📊 DashboardComponent: No hay cotizaciones para procesar');
      return;
    }
    
    // Calcular KPIs básicos
    this.totalCotizaciones = cotizaciones.length;
    this.valorTotalCotizaciones = cotizaciones.reduce((total, cotizacion) => {
      return total + (cotizacion.valorTotal || 0);
    }, 0);
    
    // Calcular valor promedio
    this.valorPromedio = this.totalCotizaciones > 0 ? 
      this.valorTotalCotizaciones / this.totalCotizaciones : 0;
    
    // Calcular clientes activos (únicos)
    const clientesUnicos = new Set(cotizaciones.map(c => c.nombre || c.email));
    this.clientesActivos = clientesUnicos.size;
    
    // Calcular cliente top (que genera más valor)
    const clientesPorValor = cotizaciones.reduce((acc, cotizacion) => {
      const cliente = cotizacion.nombre || cotizacion.email || 'Cliente';
      acc[cliente] = (acc[cliente] || 0) + (cotizacion.valorTotal || 0);
      return acc;
    }, {} as any);
    
    const clienteTop = Object.entries(clientesPorValor)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    this.clienteTop = clienteTop ? clienteTop[0] as string : 'N/A';
    
    console.log('📊 DashboardComponent: KPIs de cotizaciones calculados:', {
      total: this.totalCotizaciones,
      valorTotal: this.valorTotalCotizaciones,
      valorPromedio: this.valorPromedio,
      clientesActivos: this.clientesActivos,
      clienteTop: this.clienteTop
    });
  }
  
  /**
   * Procesa los datos de contratos para calcular métricas adicionales
   */
  private procesarContratos(contratos: any[]): void {
    if (!contratos || contratos.length === 0) {
      console.log('📄 DashboardComponent: No hay contratos para procesar');
      return;
    }
    
    // Contratos cerrados (firmados)
    this.totalContratosCerrados = contratos.filter(contrato => 
      contrato.estado === 'firmado' || contrato.estado === 'completado'
    ).length;
    
    // Calcular tasa de conversión
    this.tasaConversion = this.totalCotizaciones > 0 ? 
      Math.round((this.totalContratosCerrados / this.totalCotizaciones) * 100) : 0;
    
    console.log('📄 DashboardComponent: Métricas de contratos calculadas:', {
      totalContratos: contratos.length,
      contratosCerrados: this.totalContratosCerrados,
      tasaConversion: this.tasaConversion
    });
  }
  
  /**
   * Procesa datos para el gráfico de rendimiento por usuario
   */
  private procesarRendimientoUsuarios(cotizaciones: any[]): void {
    if (!cotizaciones || cotizaciones.length === 0) {
      this.rendimientoUsuarios = [];
      return;
    }
    
    // Agrupar cotizaciones por atendedor
    const usuariosPorCotizaciones = cotizaciones.reduce((acc, cotizacion) => {
      const atendedor = cotizacion.atendido || 'Sin asignar';
      acc[atendedor] = (acc[atendedor] || 0) + 1;
      return acc;
    }, {} as any);
    
    // Convertir a array y ordenar por cantidad
    this.rendimientoUsuarios = Object.entries(usuariosPorCotizaciones)
      .map(([usuario, cantidad]) => ({
        usuario,
        cantidad: cantidad as number,
        porcentaje: Math.round(((cantidad as number) / cotizaciones.length) * 100)
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5); // Top 5 usuarios
    
    console.log('👥 DashboardComponent: Rendimiento por usuario calculado:', this.rendimientoUsuarios);
  }
  
  /**
   * Procesa datos para el gráfico de tendencia de ventas
   */
  private procesarTendenciaVentas(cotizaciones: any[]): void {
    if (!cotizaciones || cotizaciones.length === 0) {
      this.tendenciaVentas = [];
      return;
    }
    
    // Obtener últimos 6 meses
    const meses = [];
    const fechaActual = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      meses.push({ mes, fecha });
    }
    
    // Contar cotizaciones por mes
    this.tendenciaVentas = meses.map(({ mes, fecha }) => {
      const cotizacionesMes = cotizaciones.filter(cotizacion => {
        const fechaCotizacion = cotizacion.fecha ? new Date(cotizacion.fecha) : new Date();
        return fechaCotizacion.getMonth() === fecha.getMonth() && 
               fechaCotizacion.getFullYear() === fecha.getFullYear();
      });
      
      return {
        mes,
        cotizaciones: cotizacionesMes.length,
        valor: cotizacionesMes.reduce((total, c) => total + (c.valorTotal || 0), 0)
      };
    });
    
    console.log('📈 DashboardComponent: Tendencia de ventas calculada:', this.tendenciaVentas);
  }
  
  /**
   * Procesa datos para el gráfico de embudo de ventas
   */
  private procesarEmbudoVentas(cotizaciones: any[]): void {
    if (!cotizaciones || cotizaciones.length === 0) {
      this.embudoVentas = [];
      return;
    }
    
    // Contar por estado
    const estados = cotizaciones.reduce((acc, cotizacion) => {
      const estado = cotizacion.estado || 'pendiente';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as any);
    
    this.embudoVentas = Object.entries(estados).map(([estado, cantidad]) => ({
      estado: estado.charAt(0).toUpperCase() + estado.slice(1),
      cantidad: cantidad as number,
      porcentaje: Math.round(((cantidad as number) / cotizaciones.length) * 100)
    }));
    
    console.log('🎯 DashboardComponent: Embudo de ventas calculado:', this.embudoVentas);
  }
  
  /**
   * Formatea un valor numérico como moneda
   */
  formatearMoneda(valor: number): string {
    if (!valor || isNaN(valor)) return '$0';
    
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }
  
  /**
   * Obtiene la altura del gráfico de barras basada en el valor máximo
   */
  getBarHeight(cantidad: number): string {
    if (!this.rendimientoUsuarios || this.rendimientoUsuarios.length === 0) return '0%';
    
    const maxCantidad = Math.max(...this.rendimientoUsuarios.map(u => u.cantidad));
    const porcentaje = maxCantidad > 0 ? (cantidad / maxCantidad) * 100 : 0;
    return `${Math.max(porcentaje, 10)}%`; // Mínimo 10% para visibilidad
  }
  
  /**
   * Obtiene los valores para el eje Y del gráfico
   */
  getYAxisValues(): number[] {
    if (!this.rendimientoUsuarios || this.rendimientoUsuarios.length === 0) {
      return [0, 1, 2, 3, 4, 5];
    }
    
    const maxCantidad = Math.max(...this.rendimientoUsuarios.map(u => u.cantidad));
    const step = Math.ceil(maxCantidad / 5);
    const values = [];
    
    for (let i = 5; i >= 0; i--) {
      values.push(i * step);
    }
    
    return values;
  }
}
