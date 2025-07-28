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
  @ViewChild('rendimientoUsuariosChart', { static: false }) rendimientoUsuariosChartRef!: ElementRef;
  @ViewChild('embudoVentasChart', { static: false }) embudoVentasChartRef!: ElementRef;

  // KPIs del dashboard
  kpis = {
    totalCotizaciones: 0,
    valorTotalCotizaciones: 0,
    totalContratosCerrados: 0,
    tasaConversion: 0
  };

  // Gráficos
  private tendenciasVentasChart?: Chart;
  private rendimientoUsuariosChart?: Chart;
  private embudoVentasChart?: Chart;

  // Subscripciones
  private subscriptions: Subscription[] = [];

  // Datos para gráficos
  datosGraficos = {
    tendenciasVentas: {
      labels: [] as string[],
      datasets: [] as any[]
    },
    rendimientoUsuarios: {
      labels: [] as string[],
      datasets: [] as any[]
    },
    embudoVentas: {
      labels: [] as string[],
      datasets: [] as any[]
    }
  };

  // Estado de carga
  cargando = true;

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
      this.crearGraficos();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Limpiar subscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Destruir gráficos
    if (this.tendenciasVentasChart) {
      this.tendenciasVentasChart.destroy();
    }
    if (this.rendimientoUsuariosChart) {
      this.rendimientoUsuariosChart.destroy();
    }
    if (this.embudoVentasChart) {
      this.embudoVentasChart.destroy();
    }
  }

  async cargarDatosDashboard(): Promise<void> {
    try {
      this.cargando = true;
      console.log('📊 Dashboard: Cargando datos...');

      // Suscribirse a los observables de cotizaciones y contratos
      const cotizacionesSub = this.firebaseService.getCotizaciones().subscribe(cotizaciones => {
        console.log('✅ Dashboard: Cotizaciones cargadas:', cotizaciones.length);
        this.procesarDatosParaDashboard(cotizaciones, []);
      });

      const contratosSub = this.firebaseService.getContratos().subscribe(contratos => {
        console.log('✅ Dashboard: Contratos cargados:', contratos.length);
        // Obtener cotizaciones actuales para procesar junto con contratos
        this.firebaseService.getCotizaciones().subscribe(cotizaciones => {
          this.procesarDatosParaDashboard(cotizaciones, contratos);
        });
      });

      // Agregar subscripciones al array
      this.subscriptions.push(cotizacionesSub, contratosSub);
      
      this.cargando = false;
    } catch (error) {
      console.error('❌ Dashboard: Error al cargar datos:', error);
      this.cargando = false;
    }
  }

  procesarDatosParaDashboard(cotizaciones: any[], contratos: any[]): void {
    console.log('🔄 Dashboard: Procesando datos para dashboard...');

    // Calcular KPIs
    this.calcularKPIs(cotizaciones, contratos);

    // Procesar datos para gráficos
    this.procesarTendenciasVentas(cotizaciones, contratos);
    this.procesarRendimientoUsuarios(cotizaciones);
    this.procesarEmbudoVentas(cotizaciones);

    console.log('✅ Dashboard: Datos procesados correctamente');
  }

  calcularKPIs(cotizaciones: any[], contratos: any[]): void {
    // Total de cotizaciones
    this.kpis.totalCotizaciones = cotizaciones.length;

    // Valor total de cotizaciones (suma del totalConDescuento)
    this.kpis.valorTotalCotizaciones = cotizaciones.reduce((total, cot) => {
      return total + (cot.totalConDescuento || cot.total || 0);
    }, 0);

    // Total de contratos cerrados (estado "Firmado")
    this.kpis.totalContratosCerrados = contratos.filter(cont => 
      cont.estado === 'Firmado'
    ).length;

    // Tasa de conversión (cotizaciones aceptadas convertidas en contratos firmados)
    const cotizacionesAceptadas = cotizaciones.filter(cot => 
      cot.estado === 'Aceptada'
    ).length;
    
    this.kpis.tasaConversion = cotizacionesAceptadas > 0 
      ? Math.round((this.kpis.totalContratosCerrados / cotizacionesAceptadas) * 100)
      : 0;
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
      const fecha = cot.fechaTimestamp?.toDate?.() || new Date(cot.fechaTimestamp || cot.fecha);
      const mes = fecha.getMonth();
      cotizacionesAceptadasPorMes[mes]++;
    });

    // Procesar contratos firmados
    contratos.filter(cont => cont.estado === 'Firmado').forEach(cont => {
      const fecha = cont.fechaCreacionContrato?.toDate?.() || new Date(cont.fechaCreacionContrato);
      const mes = fecha.getMonth();
      contratosFirmadosPorMes[mes]++;
    });

    this.datosGraficos.tendenciasVentas = {
      labels: meses,
      datasets: [
        {
          label: 'Cotizaciones Aceptadas',
          data: cotizacionesAceptadasPorMes,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Contratos Firmados',
          data: contratosFirmadosPorMes,
          borderColor: '#ff0080',
          backgroundColor: 'rgba(255, 0, 128, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        }
      ]
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
          'rgba(0, 212, 255, 0.8)',
          'rgba(255, 0, 128, 0.8)',
          'rgba(124, 58, 237, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          '#00d4ff',
          '#ff0080',
          '#7c3aed',
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }

  procesarEmbudoVentas(cotizaciones: any[]): void {
    const estados = ['Borrador', 'Enviada', 'Aceptada', 'Rechazada'];
    const colores = ['#3b82f6', '#10b981', '#00d4ff', '#ef4444'];

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

  crearGraficos(): void {
    console.log('📊 Dashboard: Creando gráficos...');

    // Crear gráfico de tendencias de ventas
    if (this.tendenciasVentasChartRef) {
      this.crearGraficoTendenciasVentas();
    }

    // Crear gráfico de rendimiento por usuario
    if (this.rendimientoUsuariosChartRef) {
      this.crearGraficoRendimientoUsuarios();
    }

    // Crear gráfico de embudo de ventas
    if (this.embudoVentasChartRef) {
      this.crearGraficoEmbudoVentas();
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
            color: '#ffffff',
            font: {
              size: 18,
              weight: 'bold' as const,
              family: 'Poppins, sans-serif'
            }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              color: '#ffffff',
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              }
            }
          },
          datalabels: {
            display: function(context) {
              const value = context.dataset.data[context.dataIndex];
              return typeof value === 'number' && value > 0;
            },
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 11
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
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Cantidad',
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              },
              callback: function(value) {
                return value;
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
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
            color: '#ffffff',
            font: {
              size: 18,
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
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 12
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
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              },
              callback: function(value) {
                return value;
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Usuario',
              color: '#ffffff',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
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
            color: '#ffffff',
            font: {
              size: 18,
              weight: 'bold' as const,
              family: 'Poppins, sans-serif'
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              color: '#ffffff',
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              }
            }
          },
          datalabels: {
            display: function(context) {
              const value = context.dataset.data[context.dataIndex];
              return typeof value === 'number' && value > 0;
            },
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 14
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
}
