import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { AuthService } from '../../core/services/auth.service';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';

// Registrar todos los elementos de Chart.js y el plugin de datalabels
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tendenciasVentasChart', { static: false }) tendenciasVentasChartRef!: ElementRef;
  @ViewChild('embudoVentasChart', { static: false }) embudoVentasChartRef!: ElementRef;
  @ViewChild('rendimientoUsuariosChart', { static: false }) rendimientoUsuariosChartRef!: ElementRef;

  // KPIs del dashboard
  kpis = {
    totalCotizaciones: 0,
    valorTotalCotizaciones: 0,
    totalContratosCerrados: 0,
    tasaConversion: 0,
    cotizacionesAceptadas: 0,
    cotizacionesPendientes: 0
  };

  // NUEVOS INDICADORES ESTRATÉGICOS
  indicadoresEstrategicos = {
    // Análisis de Rentabilidad
    margenPromedio: 0,
    rentabilidadPorServicio: '',
    costoAcquisicion: 0,
    
    // Eficiencia de Ventas
    tiempoPromedioCierre: 0,
    tasaRechazo: 0,
    eficienciaVendedor: '',
    
    // Tendencias de Crecimiento
    crecimientoMensual: 0,
    proyeccionTrimestral: 0,
    estacionalidad: '',
    
    // Velocidad Operacional
    tiempoRespuesta: 0,
    velocidadProcesamiento: 0,
    satisfaccionCliente: 0
  };

  // Métricas adicionales existentes
  metricasAdicionales = {
    // Análisis de Servicios
    servicioMasVendido: '',
    valorPromedio: 0,
    tiempoPromedio: '',
    
    // Análisis de Clientes
    clientesActivos: 0,
    clienteTop: '',
    tasaRetencion: 0,
    
    // Rendimiento Operacional
    eficiencia: 0,
    velocidadPromedio: '',
    tasaCrecimiento: 0
  };

  // Gráficos
  private tendenciasVentasChart?: Chart;
  private embudoVentasChart?: Chart;
  private rendimientoUsuariosChart?: Chart;

  // Subscripciones
  private subscriptions: Subscription[] = [];

  // Estado de carga
  cargando = true;
  error = false;

  // Datos para gráficos
  datosGraficos = {
    tendenciasVentas: {
      labels: [] as string[],
      datasets: [] as any[]
    },
    embudoVentas: {
      labels: [] as string[],
      datasets: [] as any[]
    },
    rendimientoUsuarios: {
      labels: [] as string[],
      datasets: [] as any[]
    }
  };

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán después de que los datos estén cargados
    setTimeout(() => {
      if (!this.cargando && !this.error) {
        this.crearGraficos();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    // Limpiar subscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Destruir gráficos
    if (this.tendenciasVentasChart) {
      this.tendenciasVentasChart.destroy();
    }
    if (this.embudoVentasChart) {
      this.embudoVentasChart.destroy();
    }
    if (this.rendimientoUsuariosChart) {
      this.rendimientoUsuariosChart.destroy();
    }
  }

  async cargarDatosDashboard(): Promise<void> {
    try {
      this.cargando = true;
      this.error = false;
      console.log('📊 Dashboard: Cargando datos...');

      // Suscribirse a los observables de cotizaciones y contratos
      const cotizacionesSub = this.firebaseService.getCotizaciones().subscribe({
        next: (cotizaciones) => {
          console.log('✅ Dashboard: Cotizaciones cargadas:', cotizaciones.length);
          this.procesarDatos(cotizaciones, []);
        },
        error: (error) => {
          console.error('❌ Dashboard: Error cargando cotizaciones:', error);
          this.error = true;
          this.cargando = false;
        }
      });

      const contratosSub = this.firebaseService.getContratos().subscribe({
        next: (contratos) => {
          console.log('✅ Dashboard: Contratos cargados:', contratos.length);
          // Obtener cotizaciones nuevamente para procesar con contratos
          this.firebaseService.getCotizaciones().subscribe(cotizaciones => {
            this.procesarDatos(cotizaciones, contratos);
          });
        },
        error: (error) => {
          console.error('❌ Dashboard: Error cargando contratos:', error);
          this.error = true;
          this.cargando = false;
        }
      });

      this.subscriptions.push(cotizacionesSub, contratosSub);

    } catch (error) {
      console.error('❌ Dashboard: Error general:', error);
      this.error = true;
      this.cargando = false;
    }
  }

  procesarDatos(cotizaciones: any[], contratos: any[]): void {
    console.log('📊 Dashboard: Procesando datos...');
    
    // Calcular KPIs
    this.calcularKPIs(cotizaciones, contratos);
    
    // Calcular métricas adicionales
    this.calcularMetricasAdicionales(cotizaciones, contratos);
    
    // Calcular nuevos indicadores estratégicos
    this.calcularIndicadoresEstrategicos(cotizaciones, contratos);
    
    // Procesar datos para gráficos
    this.procesarTendenciasVentas(cotizaciones, contratos);
    this.procesarEmbudoVentas(cotizaciones);
    this.procesarRendimientoUsuarios(cotizaciones);
    
    this.cargando = false;
    
    // Crear gráficos después de procesar los datos
    setTimeout(() => {
      this.crearGraficos();
    }, 500);
  }

  calcularKPIs(cotizaciones: any[], contratos: any[]): void {
    // Total de cotizaciones
    this.kpis.totalCotizaciones = cotizaciones.length;
    
    // Valor total de cotizaciones
    this.kpis.valorTotalCotizaciones = cotizaciones.reduce((total, cot) => {
      const valor = cot.total || cot.valorTotal || cot.valor || 0;
      return total + (typeof valor === 'number' ? valor : 0);
    }, 0);
    
    // Contratos cerrados (firmados)
    this.kpis.totalContratosCerrados = contratos.filter(cont => 
      cont.estado === 'Firmado' || cont.estado === 'Finalizado'
    ).length;
    
    // Cotizaciones aceptadas
    this.kpis.cotizacionesAceptadas = cotizaciones.filter(cot => 
      cot.estado === 'Aceptada'
    ).length;
    
    // Cotizaciones pendientes
    this.kpis.cotizacionesPendientes = cotizaciones.filter(cot => 
      cot.estado === 'Emitida' || cot.estado === 'Enviada' || cot.estado === 'Contestada'
    ).length;
    
    // Tasa de conversión (cotizaciones aceptadas a contratos firmados)
    this.kpis.tasaConversion = this.kpis.cotizacionesAceptadas > 0 
      ? Math.round((this.kpis.totalContratosCerrados / this.kpis.cotizacionesAceptadas) * 100)
      : 0;
    
    console.log('📈 KPIs calculados:', this.kpis);
  }

  calcularIndicadoresEstrategicos(cotizaciones: any[], contratos: any[]): void {
    console.log('📊 Dashboard: Calculando indicadores estratégicos...');

    // ANÁLISIS DE RENTABILIDAD
    this.calcularAnalisisRentabilidad(cotizaciones);
    
    // EFICIENCIA DE VENTAS
    this.calcularEficienciaVentas(cotizaciones, contratos);
    
    // TENDENCIAS DE CRECIMIENTO
    this.calcularTendenciasCrecimiento(cotizaciones);
    
    // VELOCIDAD OPERACIONAL
    this.calcularVelocidadOperacional(cotizaciones, contratos);
  }

  calcularAnalisisRentabilidad(cotizaciones: any[]): void {
    // Margen promedio (simulado basado en valor de cotizaciones)
    const cotizacionesConValor = cotizaciones.filter(cot => {
      const valor = cot.total || cot.valorTotal || cot.valor || 0;
      return typeof valor === 'number' && valor > 0;
    });

    if (cotizacionesConValor.length > 0) {
      const valorPromedio = cotizacionesConValor.reduce((sum, cot) => {
        const valor = cot.total || cot.valorTotal || cot.valor || 0;
        return sum + valor;
      }, 0) / cotizacionesConValor.length;

      // Simular margen basado en el valor promedio
      this.indicadoresEstrategicos.margenPromedio = Math.round(
        Math.min(85, Math.max(25, (valorPromedio / 100000) * 20 + 30))
      );
    } else {
      this.indicadoresEstrategicos.margenPromedio = 35;
    }

    // Rentabilidad por servicio
    const serviciosRentabilidad: { [key: string]: number } = {};
    cotizaciones.forEach(cot => {
      if (cot.servicios && Array.isArray(cot.servicios)) {
        cot.servicios.forEach((servicio: any) => {
          const nombre = servicio.nombre || 'Servicio sin nombre';
          const valor = servicio.subtotal || servicio.valor || 0;
          serviciosRentabilidad[nombre] = (serviciosRentabilidad[nombre] || 0) + valor;
        });
      }
    });

    const servicioMasRentable = Object.entries(serviciosRentabilidad)
      .sort(([,a], [,b]) => b - a)[0];
    
    this.indicadoresEstrategicos.rentabilidadPorServicio = servicioMasRentable 
      ? servicioMasRentable[0] 
      : 'N/A';

    // Costo de adquisición (simulado)
    this.indicadoresEstrategicos.costoAcquisicion = Math.round(
      this.kpis.valorTotalCotizaciones * 0.15 / Math.max(1, this.kpis.cotizacionesAceptadas)
    );
  }

  calcularEficienciaVentas(cotizaciones: any[], contratos: any[]): void {
    // Tiempo promedio de cierre (simulado basado en estados)
    const cotizacionesAceptadas = cotizaciones.filter(cot => cot.estado === 'Aceptada');
    const cotizacionesRechazadas = cotizaciones.filter(cot => cot.estado === 'Rechazada');
    
    // Simular tiempo basado en la complejidad de las cotizaciones
    let tiempoTotal = 0;
    cotizacionesAceptadas.forEach(cot => {
      const valor = cot.total || cot.valorTotal || cot.valor || 0;
      // Cotizaciones de mayor valor toman más tiempo
      tiempoTotal += Math.min(30, Math.max(5, Math.round(valor / 1000000) + 10));
    });

    this.indicadoresEstrategicos.tiempoPromedioCierre = cotizacionesAceptadas.length > 0 
      ? Math.round(tiempoTotal / cotizacionesAceptadas.length)
      : 15;

    // Tasa de rechazo
    this.indicadoresEstrategicos.tasaRechazo = cotizaciones.length > 0 
      ? Math.round((cotizacionesRechazadas.length / cotizaciones.length) * 100)
      : 0;

    // Eficiencia del vendedor (identificar el mejor vendedor)
    const vendedoresEficiencia: { [key: string]: { aceptadas: number, total: number } } = {};
    
    cotizaciones.forEach(cot => {
      const vendedor = cot.atendido || cot.atendidoPor || 'Sin asignar';
      if (!vendedoresEficiencia[vendedor]) {
        vendedoresEficiencia[vendedor] = { aceptadas: 0, total: 0 };
      }
      vendedoresEficiencia[vendedor].total++;
      if (cot.estado === 'Aceptada') {
        vendedoresEficiencia[vendedor].aceptadas++;
      }
    });

    const mejorVendedor = Object.entries(vendedoresEficiencia)
      .map(([vendedor, stats]) => ({
        vendedor,
        eficiencia: stats.total > 0 ? (stats.aceptadas / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.eficiencia - a.eficiencia)[0];

    this.indicadoresEstrategicos.eficienciaVendedor = mejorVendedor 
      ? `${mejorVendedor.vendedor} (${Math.round(mejorVendedor.eficiencia)}%)`
      : 'N/A';
  }

  calcularTendenciasCrecimiento(cotizaciones: any[]): void {
    // Crecimiento mensual (simulado basado en datos históricos)
    const cotizacionesPorMes = new Array(12).fill(0);
    
    cotizaciones.forEach(cot => {
      const fecha = this.obtenerFecha(cot.fechaTimestamp || cot.fecha);
      const mes = fecha.getMonth();
      cotizacionesPorMes[mes]++;
    });

    // Calcular crecimiento vs mes anterior
    const mesActual = new Date().getMonth();
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    
    const cotizacionesActual = cotizacionesPorMes[mesActual];
    const cotizacionesAnterior = cotizacionesPorMes[mesAnterior];
    
    this.indicadoresEstrategicos.crecimientoMensual = cotizacionesAnterior > 0 
      ? Math.round(((cotizacionesActual - cotizacionesAnterior) / cotizacionesAnterior) * 100)
      : cotizacionesActual > 0 ? 100 : 0;

    // Proyección trimestral (simulado)
    const promedioUltimos3Meses = (
      cotizacionesPorMes[Math.max(0, mesActual - 2)] +
      cotizacionesPorMes[Math.max(0, mesActual - 1)] +
      cotizacionesPorMes[mesActual]
    ) / 3;
    
    this.indicadoresEstrategicos.proyeccionTrimestral = Math.round(promedioUltimos3Meses * 3);

    // Estacionalidad (identificar meses con mayor actividad)
    const mesesConActividad = cotizacionesPorMes
      .map((cantidad, mes) => ({ mes, cantidad }))
      .filter(item => item.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad);

    if (mesesConActividad.length > 0) {
      const mesMasActivo = mesesConActividad[0];
      const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      this.indicadoresEstrategicos.estacionalidad = `${nombresMeses[mesMasActivo.mes]} (${mesMasActivo.cantidad})`;
    } else {
      this.indicadoresEstrategicos.estacionalidad = 'Sin datos';
    }
  }

  calcularVelocidadOperacional(cotizaciones: any[], contratos: any[]): void {
    // Tiempo de respuesta promedio (simulado)
    const cotizacionesConFecha = cotizaciones.filter(cot => 
      cot.fechaTimestamp || cot.fecha
    );

    if (cotizacionesConFecha.length > 0) {
      let tiempoTotalRespuesta = 0;
      cotizacionesConFecha.forEach(cot => {
        // Simular tiempo de respuesta basado en el valor
        const valor = cot.total || cot.valorTotal || cot.valor || 0;
        tiempoTotalRespuesta += Math.min(48, Math.max(2, Math.round(valor / 500000) + 4));
      });
      
      this.indicadoresEstrategicos.tiempoRespuesta = Math.round(
        tiempoTotalRespuesta / cotizacionesConFecha.length
      );
    } else {
      this.indicadoresEstrategicos.tiempoRespuesta = 8;
    }

    // Velocidad de procesamiento (cotizaciones por día)
    const cotizacionesUltimos30Dias = cotizaciones.filter(cot => {
      const fecha = this.obtenerFecha(cot.fechaTimestamp || cot.fecha);
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      return fecha >= hace30Dias;
    });

    this.indicadoresEstrategicos.velocidadProcesamiento = Math.round(
      cotizacionesUltimos30Dias.length / 30
    );

    // Satisfacción del cliente (simulado basado en tasa de aceptación)
    const cotizacionesAceptadas = cotizaciones.filter(cot => cot.estado === 'Aceptada').length;
    const cotizacionesRechazadas = cotizaciones.filter(cot => cot.estado === 'Rechazada').length;
    const totalEvaluadas = cotizacionesAceptadas + cotizacionesRechazadas;
    
    this.indicadoresEstrategicos.satisfaccionCliente = totalEvaluadas > 0 
      ? Math.round((cotizacionesAceptadas / totalEvaluadas) * 100)
      : 85; // Valor por defecto si no hay datos
  }

  calcularMetricasAdicionales(cotizaciones: any[], contratos: any[]): void {
    console.log('📊 Dashboard: Calculando métricas adicionales...');

    // ANÁLISIS DE SERVICIOS
    this.calcularAnalisisServicios(cotizaciones);
    
    // ANÁLISIS DE CLIENTES
    this.calcularAnalisisClientes(cotizaciones);
    
    // RENDIMIENTO OPERACIONAL
    this.calcularRendimientoOperacional(cotizaciones, contratos);
  }

  calcularAnalisisServicios(cotizaciones: any[]): void {
    // Servicio más vendido
    const serviciosCount: { [key: string]: number } = {};
    cotizaciones.forEach(cot => {
      if (cot.servicios && Array.isArray(cot.servicios)) {
        cot.servicios.forEach((servicio: any) => {
          const nombre = servicio.nombre || 'Servicio sin nombre';
          serviciosCount[nombre] = (serviciosCount[nombre] || 0) + 1;
        });
      }
    });

    const servicioMasVendido = Object.entries(serviciosCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    this.metricasAdicionales.servicioMasVendido = servicioMasVendido 
      ? servicioMasVendido[0] 
      : 'N/A';

    // Valor promedio
    this.metricasAdicionales.valorPromedio = cotizaciones.length > 0 
      ? Math.round(this.kpis.valorTotalCotizaciones / cotizaciones.length)
      : 0;

    // Tiempo promedio (simulado)
    this.metricasAdicionales.tiempoPromedio = '15 días';
  }

  calcularAnalisisClientes(cotizaciones: any[]): void {
    // Clientes activos (únicos)
    const clientesUnicos = new Set();
    const clientesValor: { [key: string]: number } = {};

    cotizaciones.forEach(cot => {
      const cliente = cot.nombre || cot.cliente || 'Cliente sin nombre';
      clientesUnicos.add(cliente);
      
      const valor = cot.total || cot.valorTotal || cot.valor || 0;
      clientesValor[cliente] = (clientesValor[cliente] || 0) + valor;
    });

    this.metricasAdicionales.clientesActivos = clientesUnicos.size;

    // Cliente top (mayor valor generado)
    const clienteTop = Object.entries(clientesValor)
      .sort(([,a], [,b]) => b - a)[0];
    
    this.metricasAdicionales.clienteTop = clienteTop 
      ? clienteTop[0] 
      : 'N/A';

    // Tasa de retención (simulada)
    this.metricasAdicionales.tasaRetencion = Math.round(Math.random() * 30) + 60; // 60-90%
  }

  calcularRendimientoOperacional(cotizaciones: any[], contratos: any[]): void {
    // Eficiencia (cotizaciones exitosas)
    const cotizacionesExitosas = cotizaciones.filter(cot => 
      cot.estado === 'Aceptada' || cot.estado === 'Firmado'
    ).length;
    
    this.metricasAdicionales.eficiencia = cotizaciones.length > 0 
      ? Math.round((cotizacionesExitosas / cotizaciones.length) * 100)
      : 0;

    // Velocidad promedio (simulada)
    this.metricasAdicionales.velocidadPromedio = '12 días';

    // Tasa de crecimiento (simulada)
    this.metricasAdicionales.tasaCrecimiento = Math.round(Math.random() * 40) + 10; // 10-50%
  }

  procesarTendenciasVentas(cotizaciones: any[], contratos: any[]): void {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Agrupar cotizaciones aceptadas por mes
    const cotizacionesAceptadasPorMes = new Array(12).fill(0);
    const contratosFirmadosPorMes = new Array(12).fill(0);

    // Procesar cotizaciones aceptadas
    cotizaciones.filter(cot => cot.estado === 'Aceptada').forEach(cot => {
      const fecha = this.obtenerFecha(cot.fechaTimestamp || cot.fecha);
      const mes = fecha.getMonth();
      cotizacionesAceptadasPorMes[mes]++;
    });

    // Procesar contratos firmados
    contratos.filter(cont => cont.estado === 'Firmado' || cont.estado === 'Finalizado').forEach(cont => {
      const fecha = this.obtenerFecha(cont.fechaCreacionContrato || cont.fecha);
      const mes = fecha.getMonth();
      contratosFirmadosPorMes[mes]++;
    });

    this.datosGraficos.tendenciasVentas = {
      labels: meses,
      datasets: [
        {
          label: 'Cotizaciones Aceptadas',
          data: cotizacionesAceptadasPorMes,
          borderColor: '#58A6FF',
          backgroundColor: 'rgba(88, 166, 255, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Contratos Firmados',
          data: contratosFirmadosPorMes,
          borderColor: '#F778BA',
          backgroundColor: 'rgba(247, 120, 186, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        }
      ]
    };
  }

  procesarEmbudoVentas(cotizaciones: any[]): void {
    const estados = ['Emitida', 'Enviada', 'Contestada', 'En Negociación', 'Aceptada', 'Rechazada'];
    const colores = ['#58A6FF', '#3FB950', '#F0883E', '#7c3aed', '#F778BA', '#F85149'];

    const conteoEstados = estados.map(estado => 
      cotizaciones.filter(cot => cot.estado === estado).length
    );

    this.datosGraficos.embudoVentas = {
      labels: estados,
      datasets: [{
        data: conteoEstados,
        backgroundColor: colores,
        borderColor: colores.map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  }

  procesarRendimientoUsuarios(cotizaciones: any[]): void {
    // Contar cotizaciones aceptadas por usuario
    const rendimientoPorUsuario = new Map<string, number>();

    cotizaciones.filter(cot => cot.estado === 'Aceptada').forEach(cot => {
      const usuario = cot.atendido || cot.atendidoPor || 'Sin asignar';
      rendimientoPorUsuario.set(usuario, (rendimientoPorUsuario.get(usuario) || 0) + 1);
    });

    // Convertir a arrays para Chart.js
    const usuarios = Array.from(rendimientoPorUsuario.keys());
    const cantidades = Array.from(rendimientoPorUsuario.values());

    this.datosGraficos.rendimientoUsuarios = {
      labels: usuarios,
      datasets: [{
        label: 'Cotizaciones Aceptadas',
        data: cantidades,
        backgroundColor: [
          'rgba(88, 166, 255, 0.8)',
          'rgba(247, 120, 186, 0.8)',
          'rgba(124, 58, 237, 0.8)',
          'rgba(63, 185, 80, 0.8)',
          'rgba(240, 136, 62, 0.8)',
          'rgba(248, 81, 73, 0.8)'
        ],
        borderColor: [
          '#58A6FF',
          '#F778BA',
          '#7c3aed',
          '#3FB950',
          '#F0883E',
          '#F85149'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }

  crearGraficos(): void {
    console.log('📊 Dashboard: Creando gráficos...');

    // Crear gráfico de tendencias de ventas
    if (this.tendenciasVentasChartRef && this.datosGraficos.tendenciasVentas.datasets.length > 0) {
      this.crearGraficoTendenciasVentas();
    }

    // Crear gráfico de embudo de ventas
    if (this.embudoVentasChartRef && this.datosGraficos.embudoVentas.datasets.length > 0) {
      this.crearGraficoEmbudoVentas();
    }

    // Crear gráfico de rendimiento por usuario
    if (this.rendimientoUsuariosChartRef && this.datosGraficos.rendimientoUsuarios.datasets.length > 0) {
      this.crearGraficoRendimientoUsuarios();
    }
  }

  crearGraficoTendenciasVentas(): void {
    const ctx = this.tendenciasVentasChartRef.nativeElement.getContext('2d');
    
    this.tendenciasVentasChart = new Chart(ctx, {
      type: 'line',
      data: this.datosGraficos.tendenciasVentas,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'Tendencia de Ventas por Mes',
            color: '#E6EDF3',
            font: {
              size: 16,
              weight: 'bold' as const,
              family: 'Poppins, sans-serif'
            }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              color: '#8B949E',
              font: {
                size: 11,
                family: 'Inter, sans-serif'
              }
            }
          },
          datalabels: {
            display: function(context) {
              const value = context.dataset.data[context.dataIndex];
              return typeof value === 'number' && value > 0;
            },
            color: '#E6EDF3',
            font: {
              weight: 'bold',
              size: 10
            },
            formatter: function(value) {
              return typeof value === 'number' && value > 0 ? value : '';
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Mes',
              color: '#8B949E',
              font: {
                size: 12,
                weight: 'bold' as const
              }
            },
            ticks: {
              color: '#8B949E',
              font: {
                size: 10
              }
            },
            grid: {
              color: '#30363D'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Cantidad',
              color: '#8B949E',
              font: {
                size: 12,
                weight: 'bold' as const
              }
            },
            ticks: {
              color: '#8B949E',
              font: {
                size: 10
              },
              callback: function(value) {
                return value;
              }
            },
            grid: {
              color: '#30363D'
            }
          }
        }
      }
    });
  }

  crearGraficoEmbudoVentas(): void {
    const ctx = this.embudoVentasChartRef.nativeElement.getContext('2d');
    
    this.embudoVentasChart = new Chart(ctx, {
      type: 'doughnut',
      data: this.datosGraficos.embudoVentas,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Embudo de Ventas',
            color: '#E6EDF3',
            font: {
              size: 16,
              weight: 'bold' as const,
              family: 'Poppins, sans-serif'
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              color: '#8B949E',
              font: {
                size: 11,
                family: 'Inter, sans-serif'
              }
            }
          },
          datalabels: {
            display: function(context) {
              const value = context.dataset.data[context.dataIndex];
              return typeof value === 'number' && value > 0;
            },
            color: '#E6EDF3',
            font: {
              weight: 'bold',
              size: 12
            },
            formatter: function(value, context) {
              if (typeof value !== 'number') return '';
              const data = context.dataset.data as number[];
              const total = data.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${value}\n(${percentage}%)`;
            }
          }
        }
      }
    });
  }

  crearGraficoRendimientoUsuarios(): void {
    const ctx = this.rendimientoUsuariosChartRef.nativeElement.getContext('2d');
    
    this.rendimientoUsuariosChart = new Chart(ctx, {
      type: 'bar',
      data: this.datosGraficos.rendimientoUsuarios,
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Rendimiento por Usuario',
            color: '#E6EDF3',
            font: {
              size: 16,
              weight: 'bold' as const,
              family: 'Poppins, sans-serif'
            }
          },
          legend: {
            display: false
          },
          datalabels: {
            display: function(context) {
              const value = context.dataset.data[context.dataIndex];
              return typeof value === 'number' && value > 0;
            },
            color: '#E6EDF3',
            font: {
              weight: 'bold',
              size: 11
            },
            anchor: 'end',
            align: 'right',
            offset: 4,
            formatter: function(value) {
              return typeof value === 'number' && value > 0 ? value : '';
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Cotizaciones Aceptadas',
              color: '#8B949E',
              font: {
                size: 12,
                weight: 'bold' as const
              }
            },
            ticks: {
              color: '#8B949E',
              font: {
                size: 10
              },
              callback: function(value) {
                return value;
              }
            },
            grid: {
              color: '#30363D'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Usuario',
              color: '#8B949E',
              font: {
                size: 12,
                weight: 'bold' as const
              }
            },
            ticks: {
              color: '#8B949E',
              font: {
                size: 10
              }
            },
            grid: {
              color: '#30363D'
            }
          }
        }
      }
    });
  }

  // Método auxiliar para obtener fecha
  private obtenerFecha(fecha: any): Date {
    if (fecha?.toDate) {
      return fecha.toDate();
    }
    if (fecha instanceof Date) {
      return fecha;
    }
    if (typeof fecha === 'string') {
      return new Date(fecha);
    }
    return new Date();
  }

  onLogout() {
    this.authService.logout();
  }

  // Método para formatear números como moneda
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor);
  }

  // Método para recargar datos
  recargarDatos(): void {
    this.cargando = true;
    this.error = false;
    this.cargarDatosDashboard();
  }
}
