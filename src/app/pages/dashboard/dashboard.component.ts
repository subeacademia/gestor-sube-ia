import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { FirebaseService } from '../../core/services/firebase.service';
import { NotificationService } from '../../core/services/notification.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

// Registrar todos los elementos de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  
  // KPIs principales
  totalCotizaciones: number = 0;
  valorTotalCotizaciones: number = 0;
  totalContratosCerrados: number = 0;
  tasaConversion: number = 0;
  cotizacionesAceptadas: number = 0;
  cotizacionesPendientes: number = 0;
  
  // Indicadores Estratégicos
  margenPromedio: number = 0;
  servicioMasRentable: string = '';
  costoAcquisicion: number = 0;
  tiempoPromedioCierre: number = 0;
  tasaRechazo: number = 0;
  mejorVendedor: string = '';
  crecimientoMensual: number = 0;
  proyeccionTrimestral: number = 0;
  estacionalidad: string = '';
  tiempoRespuesta: number = 0;
  velocidadProcesamiento: number = 0;
  satisfaccionCliente: number = 0;
  
  // Métricas Detalladas
  servicioMasVendido: string = '';
  valorPromedio: number = 0;
  tiempoPromedio: string = '';
  clientesActivos: number = 0;
  clienteTop: string = '';
  tasaRetencion: number = 0;
  eficiencia: number = 0;
  velocidadPromedio: string = '';
  tasaCrecimiento: number = 0;
  
  // Datos para gráficos
  datosTendencias: any = { labels: [], datasets: [] };
  datosRendimiento: any = { labels: [], datasets: [] };
  datosEmbudo: any = { labels: [], datasets: [] };
  
  // Instancias de gráficos
  private graficoTendencias: Chart | null = null;
  private graficoRendimiento: Chart | null = null;
  private graficoEmbudo: Chart | null = null;
  
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
  
  ngAfterViewInit(): void {
    console.log('🎨 DashboardComponent: Inicializando gráficos');
    // Pequeño delay para asegurar que los canvas estén renderizados
    setTimeout(() => {
      this.inicializarGraficos();
    }, 100);
  }
  
  ngOnDestroy(): void {
    console.log('🧹 DashboardComponent: Limpiando recursos');
    this.destruirGraficos();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Carga los datos de Firebase y procesa las métricas
   */
  private cargarDatosDashboard(): void {
    console.log('📈 DashboardComponent: Suscribiéndose a datos de Firebase');
    
    // Suscribirse a cotizaciones
    const subCotizaciones = this.firebaseService.getCotizaciones().subscribe({
      next: (cotizaciones) => {
        console.log('✅ DashboardComponent: Cotizaciones cargadas:', cotizaciones.length);
        
        // Suscribirse a contratos
        const subContratos = this.firebaseService.getContratos().subscribe({
          next: (contratos) => {
            console.log('✅ DashboardComponent: Contratos cargados:', contratos.length);
            this.procesarDatosParaDashboard(cotizaciones, contratos);
          },
          error: (error) => {
            console.error('❌ DashboardComponent: Error al cargar contratos:', error);
          }
        });
        
        this.subscriptions.push(subContratos);
      },
      error: (error) => {
        console.error('❌ DashboardComponent: Error al cargar cotizaciones:', error);
      }
    });
    
    this.subscriptions.push(subCotizaciones);
  }
  
  /**
   * Procesa los datos para calcular KPIs y preparar gráficos
   */
  private procesarDatosParaDashboard(cotizaciones: any[], contratos: any[]): void {
    console.log('🔄 DashboardComponent: Procesando datos para dashboard');
    
    // Calcular KPIs
    this.calcularKPIs(cotizaciones, contratos);
    
    // Calcular Indicadores Estratégicos
    this.calcularIndicadoresEstrategicos(cotizaciones, contratos);
    
    // Calcular Métricas Detalladas
    this.calcularMetricasDetalladas(cotizaciones, contratos);
    
    // Preparar datos para gráficos
    this.prepararDatosTendencias(cotizaciones, contratos);
    this.prepararDatosRendimiento(cotizaciones);
    this.prepararDatosEmbudo(cotizaciones);
    
    // Actualizar gráficos si ya están inicializados
    this.actualizarGraficos();
  }
  
  /**
   * Calcula los KPIs principales
   */
  private calcularKPIs(cotizaciones: any[], contratos: any[]): void {
    // Total de cotizaciones
    this.totalCotizaciones = cotizaciones.length;
    
    // Valor total de cotizaciones
    this.valorTotalCotizaciones = cotizaciones.reduce((total, cotizacion) => {
      return total + (cotizacion.totalConDescuento || 0);
    }, 0);
    
    // Contratos firmados
    this.totalContratosCerrados = contratos.filter(contrato => 
      contrato.estado === 'Firmado' || contrato.estadoContrato === 'Firmado'
    ).length;
    
    // Cotizaciones aceptadas
    this.cotizacionesAceptadas = cotizaciones.filter(cotizacion => 
      cotizacion.estado === 'Aceptada'
    ).length;
    
    // Cotizaciones pendientes
    this.cotizacionesPendientes = cotizaciones.filter(cotizacion => 
      cotizacion.estado === 'Pendiente'
    ).length;
    
    // Tasa de conversión
    this.tasaConversion = this.cotizacionesAceptadas > 0 
      ? Math.round((this.totalContratosCerrados / this.cotizacionesAceptadas) * 100)
      : 0;
    
    console.log('📊 DashboardComponent: KPIs calculados:', {
      totalCotizaciones: this.totalCotizaciones,
      valorTotalCotizaciones: this.valorTotalCotizaciones,
      totalContratosCerrados: this.totalContratosCerrados,
      cotizacionesAceptadas: this.cotizacionesAceptadas,
      cotizacionesPendientes: this.cotizacionesPendientes,
      tasaConversion: this.tasaConversion
    });
  }
  
  /**
   * Calcula los indicadores estratégicos
   */
  private calcularIndicadoresEstrategicos(cotizaciones: any[], contratos: any[]): void {
    // Margen promedio (simulado)
    this.margenPromedio = 25;
    
    // Servicio más rentable (simulado)
    this.servicioMasRentable = 'Desarrollo Web';
    
    // Costo de adquisición (simulado)
    this.costoAcquisicion = 150000;
    
    // Tiempo promedio de cierre (simulado)
    this.tiempoPromedioCierre = 7;
    
    // Tasa de rechazo
    const cotizacionesRechazadas = cotizaciones.filter(cotizacion => 
      cotizacion.estado === 'Rechazada'
    ).length;
    this.tasaRechazo = this.totalCotizaciones > 0 
      ? Math.round((cotizacionesRechazadas / this.totalCotizaciones) * 100)
      : 0;
    
    // Mejor vendedor (simulado)
    this.mejorVendedor = 'Juan Pérez';
    
    // Crecimiento mensual (simulado)
    this.crecimientoMensual = 12;
    
    // Proyección trimestral (simulado)
    this.proyeccionTrimestral = 150;
    
    // Estacionalidad (simulado)
    this.estacionalidad = 'Diciembre';
    
    // Tiempo de respuesta (simulado)
    this.tiempoRespuesta = 4;
    
    // Velocidad de procesamiento (simulado)
    this.velocidadProcesamiento = 8;
    
    // Satisfacción del cliente (simulado)
    this.satisfaccionCliente = 92;
  }
  
  /**
   * Calcula las métricas detalladas
   */
  private calcularMetricasDetalladas(cotizaciones: any[], contratos: any[]): void {
    // Servicio más vendido (simulado)
    this.servicioMasVendido = 'Consultoría IT';
    
    // Valor promedio
    this.valorPromedio = this.totalCotizaciones > 0 
      ? this.valorTotalCotizaciones / this.totalCotizaciones
      : 0;
    
    // Tiempo promedio (simulado)
    this.tiempoPromedio = '5 días';
    
    // Clientes activos (simulado)
    this.clientesActivos = 45;
    
    // Cliente top (simulado)
    this.clienteTop = 'Empresa ABC';
    
    // Tasa de retención (simulado)
    this.tasaRetencion = 78;
    
    // Eficiencia
    this.eficiencia = this.totalCotizaciones > 0 
      ? Math.round((this.cotizacionesAceptadas / this.totalCotizaciones) * 100)
      : 0;
    
    // Velocidad promedio (simulado)
    this.velocidadPromedio = '3.2 días';
    
    // Tasa de crecimiento (simulado)
    this.tasaCrecimiento = 15;
  }
  
  /**
   * Prepara datos para el gráfico de tendencias de ventas
   */
  private prepararDatosTendencias(cotizaciones: any[], contratos: any[]): void {
    const meses = this.obtenerUltimos6Meses();
    const datosCotizaciones = new Array(6).fill(0);
    const datosContratos = new Array(6).fill(0);
    
    // Procesar cotizaciones aceptadas por mes
    cotizaciones.forEach(cotizacion => {
      if (cotizacion.estado === 'Aceptada' && cotizacion.fechaCreacion) {
        const fecha = new Date(cotizacion.fechaCreacion.seconds * 1000);
        const mesIndex = this.obtenerIndiceMes(fecha, meses);
        if (mesIndex >= 0) {
          datosCotizaciones[mesIndex]++;
        }
      }
    });
    
    // Procesar contratos firmados por mes
    contratos.forEach(contrato => {
      if ((contrato.estado === 'Firmado' || contrato.estadoContrato === 'Firmado') && contrato.fechaCreacionContrato) {
        const fecha = new Date(contrato.fechaCreacionContrato.seconds * 1000);
        const mesIndex = this.obtenerIndiceMes(fecha, meses);
        if (mesIndex >= 0) {
          datosContratos[mesIndex]++;
        }
      }
    });
    
    this.datosTendencias = {
      labels: meses.map(mes => this.formatearMes(mes)),
      datasets: [
        {
          label: 'Cotizaciones Aceptadas',
          data: datosCotizaciones,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Contratos Firmados',
          data: datosContratos,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }
  
  /**
   * Prepara datos para el gráfico de rendimiento por usuario
   */
  private prepararDatosRendimiento(cotizaciones: any[]): void {
    const rendimientoPorUsuario: { [key: string]: number } = {};
    
    // Contar cotizaciones aceptadas por atendedor
    cotizaciones.forEach(cotizacion => {
      if (cotizacion.estado === 'Aceptada' && cotizacion.atendedor) {
        rendimientoPorUsuario[cotizacion.atendedor] = 
          (rendimientoPorUsuario[cotizacion.atendedor] || 0) + 1;
      }
    });
    
    const usuarios = Object.keys(rendimientoPorUsuario);
    const valores = Object.values(rendimientoPorUsuario);
    
    this.datosRendimiento = {
      labels: usuarios,
      datasets: [{
        label: 'Cotizaciones Aceptadas',
        data: valores,
        backgroundColor: [
          'rgba(0, 212, 255, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(0, 212, 255, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    };
  }
  
  /**
   * Prepara datos para el gráfico de embudo de ventas
   */
  private prepararDatosEmbudo(cotizaciones: any[]): void {
    const estados = ['Pendiente', 'Enviada', 'Aceptada', 'Rechazada'];
    const datos = estados.map(estado => {
      return cotizaciones.filter(cotizacion => cotizacion.estado === estado).length;
    });
    
    this.datosEmbudo = {
      labels: estados,
      datasets: [{
        data: datos,
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    };
  }
  
  /**
   * Inicializa todos los gráficos
   */
  private inicializarGraficos(): void {
    console.log('🎨 DashboardComponent: Creando gráficos');
    this.crearGraficoTendencias();
    this.crearGraficoRendimiento();
    this.crearGraficoEmbudo();
  }
  
  /**
   * Crea el gráfico de tendencias de ventas
   */
  private crearGraficoTendencias(): void {
    const canvas = document.getElementById('tendenciasVentasChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ DashboardComponent: Canvas de tendencias no encontrado');
      return;
    }
    
    this.graficoTendencias = new Chart(canvas, {
      type: 'line',
      data: this.datosTendencias,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Tendencia de Ventas (Últimos 6 Meses)',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            labels: { color: '#ffffff' }
          }
        },
        scales: {
          x: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  }
  
  /**
   * Crea el gráfico de rendimiento por usuario
   */
  private crearGraficoRendimiento(): void {
    const canvas = document.getElementById('rendimientoUsuariosChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ DashboardComponent: Canvas de rendimiento no encontrado');
      return;
    }
    
    this.graficoRendimiento = new Chart(canvas, {
      type: 'bar',
      data: this.datosRendimiento,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Rendimiento por Usuario',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: '#ffffff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  }
  
  /**
   * Crea el gráfico de embudo de ventas
   */
  private crearGraficoEmbudo(): void {
    const canvas = document.getElementById('embudoVentasChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ DashboardComponent: Canvas de embudo no encontrado');
      return;
    }
    
    this.graficoEmbudo = new Chart(canvas, {
      type: 'doughnut',
      data: this.datosEmbudo,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Embudo de Ventas',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom',
            labels: { color: '#ffffff' }
          }
        }
      }
    });
  }
  
  /**
   * Actualiza los gráficos con nuevos datos
   */
  private actualizarGraficos(): void {
    if (this.graficoTendencias) {
      this.graficoTendencias.data = this.datosTendencias;
      this.graficoTendencias.update();
    }
    
    if (this.graficoRendimiento) {
      this.graficoRendimiento.data = this.datosRendimiento;
      this.graficoRendimiento.update();
    }
    
    if (this.graficoEmbudo) {
      this.graficoEmbudo.data = this.datosEmbudo;
      this.graficoEmbudo.update();
    }
  }
  
  /**
   * Destruye los gráficos para liberar memoria
   */
  private destruirGraficos(): void {
    if (this.graficoTendencias) {
      this.graficoTendencias.destroy();
      this.graficoTendencias = null;
    }
    if (this.graficoRendimiento) {
      this.graficoRendimiento.destroy();
      this.graficoRendimiento = null;
    }
    if (this.graficoEmbudo) {
      this.graficoEmbudo.destroy();
      this.graficoEmbudo = null;
    }
  }
  
  /**
   * Obtiene los últimos 6 meses
   */
  private obtenerUltimos6Meses(): Date[] {
    const meses: Date[] = [];
    const hoy = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      meses.push(mes);
    }
    
    return meses;
  }
  
  /**
   * Obtiene el índice del mes en el array de meses
   */
  private obtenerIndiceMes(fecha: Date, meses: Date[]): number {
    return meses.findIndex(mes => 
      mes.getFullYear() === fecha.getFullYear() && 
      mes.getMonth() === fecha.getMonth()
    );
  }
  
  /**
   * Formatea el mes para mostrar en el gráfico
   */
  private formatearMes(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      year: '2-digit' 
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  }
  
  /**
   * Formatea el valor monetario
   */
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor);
  }
}
