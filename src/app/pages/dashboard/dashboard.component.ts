import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { Subscription } from 'rxjs';
import { collection, addDoc } from 'firebase/firestore';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tendenciasChart', { static: false }) tendenciasChartRef!: ElementRef;
  @ViewChild('estadosChart', { static: false }) estadosChartRef!: ElementRef;
  @ViewChild('ventasChart', { static: false }) ventasChartRef!: ElementRef;

  // Datos del dashboard
  estadisticas = {
    totalCotizaciones: 0,
    cotizacionesMes: 0,
    valorTotal: 0,
    totalAceptadas: 0,
    totalContratos: 0,
    contratosPendientes: 0,
    tasaExito: 0
  };

  // Gráficos
  private tendenciasChart?: Chart;
  private estadosChart?: Chart;
  private ventasChart?: Chart;

  // Subscripciones
  private subscriptions: Subscription[] = [];

  // Datos para gráficos
  datosGraficos = {
    tendencias: {
      labels: [] as string[],
      datasets: [] as any[]
    },
    estados: {
      labels: [] as string[],
      datasets: [] as any[]
    },
    ventas: {
      labels: [] as string[],
      datasets: [] as any[]
    }
  };

  // Estado de carga
  cargando = true;

  constructor(private firebaseService: FirebaseService) {}

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
    if (this.tendenciasChart) {
      this.tendenciasChart.destroy();
    }
    if (this.estadosChart) {
      this.estadosChart.destroy();
    }
    if (this.ventasChart) {
      this.ventasChart.destroy();
    }
  }

  async cargarDatosDashboard(): Promise<void> {
    try {
      this.cargando = true;
      console.log('📊 Dashboard: Cargando datos...');

      // Cargar cotizaciones y contratos en paralelo
      const [cotizaciones, contratos] = await Promise.all([
        this.firebaseService.getCotizacionesAsync(),
        this.firebaseService.getContratosAsync()
      ]);

      console.log('✅ Dashboard: Datos cargados:', {
        cotizaciones: cotizaciones.length,
        contratos: contratos.length
      });

      // Si no hay datos, crear datos de prueba
      if (cotizaciones.length === 0 && contratos.length === 0) {
        console.log('📝 Dashboard: No hay datos, creando datos de prueba...');
        await this.crearDatosPrueba();
        
        // Recargar datos después de crear los de prueba
        const [cotizacionesPrueba, contratosPrueba] = await Promise.all([
          this.firebaseService.getCotizacionesAsync(),
          this.firebaseService.getContratosAsync()
        ]);
        
        this.procesarDatosParaGraficos(cotizacionesPrueba, contratosPrueba);
      } else {
        // Procesar datos existentes
        this.procesarDatosParaGraficos(cotizaciones, contratos);
      }
      
      this.cargando = false;
    } catch (error) {
      console.error('❌ Dashboard: Error al cargar datos:', error);
      this.cargando = false;
    }
  }

  async crearDatosPrueba(): Promise<void> {
    try {
      console.log('🧪 Dashboard: Creando datos de prueba...');
      
      // Crear múltiples cotizaciones de prueba con diferentes fechas y estados
      const cotizacionesPrueba = [
        {
          codigo: 'COT-2024-001',
          nombre: 'Juan Pérez',
          email: 'juan.perez@empresa.com',
          rut: '12345678-9',
          empresa: 'Tech Solutions SPA',
          moneda: 'CLP',
          servicios: [
            {
              nombre: 'Desarrollo Web',
              detalle: 'Sitio web corporativo responsive',
              modalidad: 'Online',
              alumnos: 1,
              tipoCobro: 'proyecto',
              subtotal: 1500000,
              detallesCobro: {
                valorProyecto: 1500000
              }
            }
          ],
          atendido: 'Rodrigo Carrillo',
          subtotal: 1500000,
          descuento: 10,
          descuentoValor: 150000,
          totalConDescuento: 1350000,
          total: 1350000,
          notas: 'Cliente interesado en SEO',
          estado: 'Aceptada',
          fechaTimestamp: new Date(2024, 0, 15), // Enero
          fecha: '15/01/2024'
        },
        {
          codigo: 'COT-2024-002',
          nombre: 'María González',
          email: 'maria.gonzalez@startup.cl',
          rut: '98765432-1',
          empresa: 'Startup Innovadora',
          moneda: 'CLP',
          servicios: [
            {
              nombre: 'Consultoría SEO',
              detalle: 'Optimización para motores de búsqueda',
              modalidad: 'Online',
              alumnos: 1,
              tipoCobro: 'sesion',
              subtotal: 800000,
              detallesCobro: {
                sesiones: 8,
                valorSesion: 100000
              }
            }
          ],
          atendido: 'Bruno Villalobos',
          subtotal: 800000,
          descuento: 0,
          descuentoValor: 0,
          totalConDescuento: 800000,
          total: 800000,
          notas: 'Proyecto de 2 meses',
          estado: 'En Negociación',
          fechaTimestamp: new Date(2024, 1, 20), // Febrero
          fecha: '20/02/2024'
        },
        {
          codigo: 'COT-2024-003',
          nombre: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@consultora.cl',
          rut: '45678912-3',
          empresa: 'Consultora Digital',
          moneda: 'CLP',
          servicios: [
            {
              nombre: 'Marketing Digital',
              detalle: 'Campaña completa de marketing',
              modalidad: 'Híbrido',
              alumnos: 3,
              tipoCobro: 'mes',
              subtotal: 1200000,
              detallesCobro: {
                meses: 3,
                valorMes: 400000
              }
            }
          ],
          atendido: 'Mario Muñoz',
          subtotal: 1200000,
          descuento: 15,
          descuentoValor: 180000,
          totalConDescuento: 1020000,
          total: 1020000,
          notas: 'Cliente recurrente',
          estado: 'Contestada',
          fechaTimestamp: new Date(2024, 2, 10), // Marzo
          fecha: '10/03/2024'
        },
        {
          codigo: 'COT-2024-004',
          nombre: 'Ana Silva',
          email: 'ana.silva@ecommerce.cl',
          rut: '78912345-6',
          empresa: 'E-commerce Plus',
          moneda: 'CLP',
          servicios: [
            {
              nombre: 'E-commerce',
              detalle: 'Tienda online completa',
              modalidad: 'Online',
              alumnos: 1,
              tipoCobro: 'proyecto',
              subtotal: 2500000,
              detallesCobro: {
                valorProyecto: 2500000
              }
            }
          ],
          atendido: 'Nicolás Valenzuela',
          subtotal: 2500000,
          descuento: 0,
          descuentoValor: 0,
          totalConDescuento: 2500000,
          total: 2500000,
          notas: 'Proyecto grande, requiere tiempo',
          estado: 'Rechazada',
          fechaTimestamp: new Date(2024, 3, 5), // Abril
          fecha: '05/04/2024'
        },
        {
          codigo: 'COT-2024-005',
          nombre: 'Luis Morales',
          email: 'luis.morales@restaurant.cl',
          rut: '32165498-7',
          empresa: 'Restaurante Gourmet',
          moneda: 'CLP',
          servicios: [
            {
              nombre: 'App Móvil',
              detalle: 'Aplicación para delivery',
              modalidad: 'Híbrido',
              alumnos: 2,
              tipoCobro: 'proyecto',
              subtotal: 1800000,
              detallesCobro: {
                valorProyecto: 1800000
              }
            }
          ],
          atendido: 'Ignacio Villarroel',
          subtotal: 1800000,
          descuento: 5,
          descuentoValor: 90000,
          totalConDescuento: 1710000,
          total: 1710000,
          notas: 'Cliente muy interesado',
          estado: 'Aceptada',
          fechaTimestamp: new Date(2024, 4, 12), // Mayo
          fecha: '12/05/2024'
        }
      ];

      // Crear contratos de prueba
      const contratosPrueba = [
        {
          codigo: 'CON-2024-001',
          titulo: 'Contrato Desarrollo Web - Tech Solutions',
          fechaCreacionContrato: new Date(2024, 0, 20),
          fechaInicio: new Date(2024, 1, 1),
          fechaFin: new Date(2024, 3, 1),
          valorTotal: 1350000,
          nombreCliente: 'Juan Pérez',
          emailCliente: 'juan.perez@empresa.com',
          rutCliente: '12345678-9',
          empresa: 'Tech Solutions SPA',
          servicios: 'Desarrollo Web',
          descripcionServicios: 'Sitio web corporativo responsive con SEO',
          terminosCondiciones: 'Términos estándar para desarrollo web',
          estado: 'Firmado',
          cotizacionOrigen: 'COT-2024-001',
          atendido: 'Rodrigo Carrillo',
          firmas: {
            cliente: true,
            representante: true
          },
          historialEstados: [
            {
              estado: 'Pendiente de Firma',
              fecha: new Date(2024, 0, 20),
              comentario: 'Contrato creado'
            },
            {
              estado: 'Firmado',
              fecha: new Date(2024, 0, 25),
              comentario: 'Contrato firmado por ambas partes'
            }
          ]
        },
        {
          codigo: 'CON-2024-002',
          titulo: 'Contrato App Móvil - Restaurante Gourmet',
          fechaCreacionContrato: new Date(2024, 4, 15),
          fechaInicio: new Date(2024, 5, 1),
          fechaFin: new Date(2024, 8, 1),
          valorTotal: 1710000,
          nombreCliente: 'Luis Morales',
          emailCliente: 'luis.morales@restaurant.cl',
          rutCliente: '32165498-7',
          empresa: 'Restaurante Gourmet',
          servicios: 'App Móvil',
          descripcionServicios: 'Aplicación móvil para delivery de comida',
          terminosCondiciones: 'Términos para desarrollo de aplicaciones móviles',
          estado: 'Pendiente de Firma',
          cotizacionOrigen: 'COT-2024-005',
          atendido: 'Ignacio Villarroel',
          firmas: {
            cliente: false,
            representante: true
          },
          historialEstados: [
            {
              estado: 'Pendiente de Firma',
              fecha: new Date(2024, 4, 15),
              comentario: 'Contrato creado, esperando firma del cliente'
            }
          ]
        }
      ];

      // Guardar cotizaciones
      for (const cotizacion of cotizacionesPrueba) {
        await this.firebaseService.createCotizacion(cotizacion);
      }

      // Guardar contratos
      for (const contrato of contratosPrueba) {
        const contratosCollection = collection(this.firebaseService['firestore'], 'contratos');
        await addDoc(contratosCollection, contrato);
      }

      console.log('✅ Dashboard: Datos de prueba creados exitosamente');
    } catch (error) {
      console.error('❌ Dashboard: Error al crear datos de prueba:', error);
    }
  }

  procesarDatosParaGraficos(cotizaciones: any[], contratos: any[]): void {
    console.log('🔄 Dashboard: Procesando datos para gráficos...');

    // Calcular estadísticas básicas
    this.calcularEstadisticas(cotizaciones, contratos);

    // Procesar datos para gráfico de tendencias (por mes)
    this.procesarTendenciasPorMes(cotizaciones);

    // Procesar datos para gráfico de estados
    this.procesarEstadosCotizaciones(cotizaciones);

    // Procesar datos para gráfico de ventas
    this.procesarVentasPorMes(cotizaciones, contratos);

    console.log('✅ Dashboard: Datos procesados correctamente');
  }

  calcularEstadisticas(cotizaciones: any[], contratos: any[]): void {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    // Total de cotizaciones
    this.estadisticas.totalCotizaciones = cotizaciones.length;

    // Cotizaciones del mes actual
    this.estadisticas.cotizacionesMes = cotizaciones.filter(cot => {
      const fecha = cot.fechaTimestamp?.toDate?.() || new Date(cot.fechaTimestamp || cot.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;

    // Valor total de cotizaciones
    this.estadisticas.valorTotal = cotizaciones.reduce((total, cot) => {
      return total + (cot.total || 0);
    }, 0);

    // Total aceptadas (cotizaciones que se convirtieron en contratos)
    this.estadisticas.totalAceptadas = cotizaciones.filter(cot => 
      cot.estado === 'Aceptada' || cot.estado === 'Contratada'
    ).reduce((total, cot) => total + (cot.total || 0), 0);

    // Total de contratos
    this.estadisticas.totalContratos = contratos.length;

    // Contratos pendientes
    this.estadisticas.contratosPendientes = contratos.filter(cont => 
      cont.estado === 'Pendiente de Firma' || cont.estado === 'Pendiente'
    ).length;

    // Tasa de éxito (cotizaciones aceptadas / total cotizaciones)
    const cotizacionesAceptadas = cotizaciones.filter(cot => 
      cot.estado === 'Aceptada' || cot.estado === 'Contratada'
    ).length;
    this.estadisticas.tasaExito = this.estadisticas.totalCotizaciones > 0 
      ? Math.round((cotizacionesAceptadas / this.estadisticas.totalCotizaciones) * 100)
      : 0;
  }

  procesarTendenciasPorMes(cotizaciones: any[]): void {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    // Agrupar cotizaciones por mes
    const datosPorMes = new Array(12).fill(0);
    const valoresPorMes = new Array(12).fill(0);

    cotizaciones.forEach(cot => {
      const fecha = cot.fechaTimestamp?.toDate?.() || new Date(cot.fechaTimestamp || cot.fecha);
      const mes = fecha.getMonth();
      datosPorMes[mes]++;
      valoresPorMes[mes] += cot.total || 0;
    });

    this.datosGraficos.tendencias = {
      labels: meses,
      datasets: [
        {
          label: 'Cantidad de Cotizaciones',
          data: datosPorMes,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Valor Total ($)',
          data: valoresPorMes,
          borderColor: '#ff0080',
          backgroundColor: 'rgba(255, 0, 128, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  }

  procesarEstadosCotizaciones(cotizaciones: any[]): void {
    const estados = ['Emitida', 'Contestada', 'En Negociación', 'Aceptada', 'Rechazada', 'Contratada'];
    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#00d4ff', '#ef4444', '#7c3aed'];

    const conteoEstados = estados.map(estado => 
      cotizaciones.filter(cot => cot.estado === estado).length
    );

    this.datosGraficos.estados = {
      labels: estados,
      datasets: [{
        data: conteoEstados,
        backgroundColor: colores,
        borderColor: colores.map(color => color + '80'),
        borderWidth: 2
      }]
    };
  }

  procesarVentasPorMes(cotizaciones: any[], contratos: any[]): void {
    const meses = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    // Agrupar ventas por mes (cotizaciones aceptadas + contratos)
    const ventasPorMes = new Array(12).fill(0);

    // Sumar cotizaciones aceptadas
    cotizaciones.filter(cot => 
      cot.estado === 'Aceptada' || cot.estado === 'Contratada'
    ).forEach(cot => {
      const fecha = cot.fechaTimestamp?.toDate?.() || new Date(cot.fechaTimestamp || cot.fecha);
      const mes = fecha.getMonth();
      ventasPorMes[mes] += cot.total || 0;
    });

    // Sumar contratos
    contratos.forEach(cont => {
      const fecha = cont.fechaCreacionContrato?.toDate?.() || new Date(cont.fechaCreacionContrato);
      const mes = fecha.getMonth();
      ventasPorMes[mes] += cont.valorTotal || 0;
    });

    this.datosGraficos.ventas = {
      labels: meses,
      datasets: [{
        label: 'Ventas Mensuales ($)',
        data: ventasPorMes,
        backgroundColor: 'rgba(124, 58, 237, 0.8)',
        borderColor: '#7c3aed',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  }

  crearGraficos(): void {
    console.log('📊 Dashboard: Creando gráficos...');

    // Crear gráfico de tendencias
    if (this.tendenciasChartRef) {
      this.crearGraficoTendencias();
    }

    // Crear gráfico de estados
    if (this.estadosChartRef) {
      this.crearGraficoEstados();
    }

    // Crear gráfico de ventas
    if (this.ventasChartRef) {
      this.crearGraficoVentas();
    }
  }

  crearGraficoTendencias(): void {
    const ctx = this.tendenciasChartRef.nativeElement.getContext('2d');
    
    this.tendenciasChart = new Chart(ctx, {
      type: 'line',
      data: this.datosGraficos.tendencias,
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
            text: 'Tendencias de Cotizaciones por Mes',
            color: '#1f2937',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Mes'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Cantidad'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Valor ($)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
  }

  crearGraficoEstados(): void {
    const ctx = this.estadosChartRef.nativeElement.getContext('2d');
    
    this.estadosChart = new Chart(ctx, {
      type: 'doughnut',
      data: this.datosGraficos.estados,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución por Estados',
            color: '#1f2937',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  crearGraficoVentas(): void {
    const ctx = this.ventasChartRef.nativeElement.getContext('2d');
    
    this.ventasChart = new Chart(ctx, {
      type: 'bar',
      data: this.datosGraficos.ventas,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Ventas Mensuales',
            color: '#1f2937',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Mes'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Valor ($)'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  onLogout() {
    console.log('Cerrar sesión desde dashboard');
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
