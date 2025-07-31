import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
import { FirebaseService } from './firebase.service';

export interface MensajeHistorial {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  metadata?: any;
}

export interface AnalisisNegocio {
  tipo: 'ventas' | 'productividad' | 'costos' | 'clientes' | 'proyectos';
  titulo: string;
  descripcion: string;
  datos: any[];
  grafico?: any;
  recomendaciones: string[];
  impacto: 'alto' | 'medio' | 'bajo';
}

export interface DocumentoAnalisis {
  id: string;
  nombre: string;
  tipo: 'pdf' | 'excel' | 'imagen';
  contenido: string;
  fechaCarga: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AsistenteIaService {
  private apiUrl = 'https://apisube-smoky.vercel.app/api/azure/generate';
  
  private asistenteAbiertoSubject = new BehaviorSubject<boolean>(false);
  public asistenteAbierto$ = this.asistenteAbiertoSubject.asObservable();

  private historialMensajesSubject = new BehaviorSubject<MensajeHistorial[]>([]);
  public historialMensajes$ = this.historialMensajesSubject.asObservable();

  private documentosSubject = new BehaviorSubject<DocumentoAnalisis[]>([]);
  public documentos$ = this.documentosSubject.asObservable();

  private analisisNegocioSubject = new BehaviorSubject<AnalisisNegocio[]>([]);
  public analisisNegocio$ = this.analisisNegocioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private firebaseService: FirebaseService
  ) {}

  setAsistenteAbierto(abierto: boolean) {
    this.asistenteAbiertoSubject.next(abierto);
  }

  generarTextoAzure(prompt: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(this.apiUrl, prompt, { headers });
  }

  // Obtener todos los datos del sistema para análisis
  obtenerDatosSistema(): Observable<any> {
    return combineLatest({
      cotizaciones: this.firebaseService.getCotizacionesSimple(),
      contratos: this.firebaseService.getContratos(),
      clientes: this.firebaseService.getClientes(),
      proyectos: this.firebaseService.getProyectos()
    }).pipe(
      map(data => {
        return {
          cotizaciones: data.cotizaciones || [],
          contratos: data.contratos || [],
          clientes: data.clientes || [],
          proyectos: data.proyectos || [],
          resumen: this.generarResumenDatos(data)
        };
      })
    );
  }

  private generarResumenDatos(data: any): any {
    const cotizaciones = data.cotizaciones || [];
    const contratos = data.contratos || [];
    const clientes = data.clientes || [];
    const proyectos = data.proyectos || [];

    // Análisis de cotizaciones
    const totalCotizaciones = cotizaciones.length;
    const cotizacionesAceptadas = cotizaciones.filter((c: any) => 
      c.estado === 'Aceptada' || c.estado === 'aprobada'
    ).length;
    const tasaConversion = totalCotizaciones > 0 ? (cotizacionesAceptadas / totalCotizaciones) * 100 : 0;
    const valorTotalCotizaciones = cotizaciones.reduce((sum: number, c: any) => 
      sum + (c.valorTotal || c.total || c.valor || 0), 0
    );

    // Análisis de contratos
    const totalContratos = contratos.length;
    const contratosActivos = contratos.filter((c: any) => 
      c.estado !== 'cancelado' && c.estado !== 'finalizado'
    ).length;
    const valorTotalContratos = contratos.reduce((sum: number, c: any) => 
      sum + (c.valorTotal || c.valor || 0), 0
    );

    // Análisis de clientes
    const totalClientes = clientes.length;
    const clientesActivos = clientes.filter((c: any) => 
      c.estado === 'activo' || !c.estado
    ).length;

    // Análisis de proyectos
    const totalProyectos = proyectos.length;
    const proyectosCompletados = proyectos.filter((p: any) => 
      p.estado === 'completado' || p.estado === 'finalizado'
    ).length;
    const proyectosEnCurso = proyectos.filter((p: any) => 
      p.estado === 'en_curso' || p.estado === 'activo'
    ).length;

    return {
      metricas: {
        cotizaciones: {
          total: totalCotizaciones,
          aceptadas: cotizacionesAceptadas,
          tasaConversion: tasaConversion.toFixed(2),
          valorTotal: valorTotalCotizaciones
        },
        contratos: {
          total: totalContratos,
          activos: contratosActivos,
          valorTotal: valorTotalContratos
        },
        clientes: {
          total: totalClientes,
          activos: clientesActivos
        },
        proyectos: {
          total: totalProyectos,
          completados: proyectosCompletados,
          enCurso: proyectosEnCurso
        }
      },
      tendencias: this.calcularTendencias(cotizaciones, contratos),
      oportunidades: this.identificarOportunidades(cotizaciones, contratos, clientes)
    };
  }

  private calcularTendencias(cotizaciones: any[], contratos: any[]): any {
    // Agrupar por mes
    const ahora = new Date();
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      meses.push({
        mes: fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        fecha: fecha
      });
    }

    const tendenciasCotizaciones = meses.map(mes => {
      const cotizacionesMes = cotizaciones.filter((c: any) => {
        const fechaCotizacion = c.fechaCreacion ? new Date(c.fechaCreacion) : new Date();
        return fechaCotizacion.getMonth() === mes.fecha.getMonth() && 
               fechaCotizacion.getFullYear() === mes.fecha.getFullYear();
      });
      
      return {
        mes: mes.mes,
        cantidad: cotizacionesMes.length,
        valor: cotizacionesMes.reduce((sum: number, c: any) => 
          sum + (c.valorTotal || c.total || c.valor || 0), 0
        )
      };
    });

    return {
      cotizaciones: tendenciasCotizaciones,
      crecimiento: this.calcularCrecimiento(tendenciasCotizaciones)
    };
  }

  private calcularCrecimiento(tendencias: any[]): number {
    if (tendencias.length < 2) return 0;
    
    const ultimoMes = tendencias[tendencias.length - 1];
    const penultimoMes = tendencias[tendencias.length - 2];
    
    if (penultimoMes.valor === 0) return 100;
    
    return ((ultimoMes.valor - penultimoMes.valor) / penultimoMes.valor) * 100;
  }

  private identificarOportunidades(cotizaciones: any[], contratos: any[], clientes: any[]): any[] {
    const oportunidades = [];

    // Oportunidad 1: Cotizaciones rechazadas que podrían recuperarse
    const cotizacionesRechazadas = cotizaciones.filter((c: any) => 
      c.estado === 'Rechazada' || c.estado === 'rechazada'
    );
    if (cotizacionesRechazadas.length > 0) {
      oportunidades.push({
        tipo: 'recuperacion',
        titulo: 'Recuperar Cotizaciones Rechazadas',
        descripcion: `${cotizacionesRechazadas.length} cotizaciones rechazadas que podrían recuperarse`,
        valorPotencial: cotizacionesRechazadas.reduce((sum: number, c: any) => 
          sum + (c.valorTotal || c.total || c.valor || 0), 0
        ),
        prioridad: 'alta'
      });
    }

    // Oportunidad 2: Clientes inactivos
    const clientesInactivos = clientes.filter((c: any) => 
      c.estado === 'inactivo' || c.ultimaActividad < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );
    if (clientesInactivos.length > 0) {
      oportunidades.push({
        tipo: 'reactivacion',
        titulo: 'Reactivar Clientes Inactivos',
        descripcion: `${clientesInactivos.length} clientes inactivos que podrían generar nuevos proyectos`,
        valorPotencial: 0, // Se calcularía basado en el valor promedio por cliente
        prioridad: 'media'
      });
    }

    // Oportunidad 3: Mejorar tasa de conversión
    const tasaActual = cotizaciones.length > 0 ? 
      (cotizaciones.filter((c: any) => c.estado === 'Aceptada').length / cotizaciones.length) * 100 : 0;
    if (tasaActual < 30) {
      oportunidades.push({
        tipo: 'conversion',
        titulo: 'Mejorar Tasa de Conversión',
        descripcion: `Tasa actual: ${tasaActual.toFixed(1)}%. Objetivo: 30%`,
        valorPotencial: 0,
        prioridad: 'alta'
      });
    }

    return oportunidades;
  }

  // Generar análisis de negocio específico
  generarAnalisisNegocio(tipo: string, datos: any): Observable<AnalisisNegocio> {
    const prompt = this.crearPromptAnalisis(tipo, datos);
    
    return this.generarTextoAzure(prompt).pipe(
      map((respuesta: any) => {
        return this.procesarRespuestaAnalisis(respuesta, tipo, datos);
      })
    );
  }

  private crearPromptAnalisis(tipo: string, datos: any): any {
    const promptBase = `Eres un consultor de negocios experto en análisis de datos. 
    Analiza los siguientes datos de la empresa SUBE IA TECH y proporciona:
    1. Un análisis detallado del área ${tipo}
    2. 3-5 recomendaciones específicas y accionables
    3. Identificación de oportunidades de mejora
    4. Estimación del impacto potencial de las recomendaciones
    
    Datos del negocio:
    ${JSON.stringify(datos, null, 2)}
    
    Responde en formato JSON con esta estructura:
    {
      "titulo": "Análisis de ${tipo}",
      "descripcion": "Descripción del análisis",
      "recomendaciones": ["rec1", "rec2", "rec3"],
      "impacto": "alto|medio|bajo",
      "datos_grafico": {...}
    }`;

    return {
      messages: [
        { role: 'system', content: promptBase }
      ],
      maxTokens: 1500,
      temperature: 0.7
    };
  }

  private procesarRespuestaAnalisis(respuesta: any, tipo: string, datos: any): AnalisisNegocio {
    let contenido = '';
    if (respuesta && respuesta.choices && respuesta.choices[0]?.message?.content) {
      contenido = respuesta.choices[0].message.content;
    } else if (respuesta && respuesta.text) {
      contenido = respuesta.text;
    } else if (typeof respuesta === 'string') {
      contenido = respuesta;
    }

    try {
      const analisis = JSON.parse(contenido);
      return {
        tipo: tipo as any,
        titulo: analisis.titulo || `Análisis de ${tipo}`,
        descripcion: analisis.descripcion || '',
        datos: datos,
        grafico: analisis.datos_grafico || null,
        recomendaciones: analisis.recomendaciones || [],
        impacto: analisis.impacto || 'medio'
      };
    } catch (error) {
      // Fallback si no se puede parsear JSON
      return {
        tipo: tipo as any,
        titulo: `Análisis de ${tipo}`,
        descripcion: contenido || 'Análisis generado por IA',
        datos: datos,
        recomendaciones: ['Revisar datos del sistema', 'Contactar al equipo de ventas', 'Analizar tendencias'],
        impacto: 'medio'
      };
    }
  }

  // Agregar mensaje al historial
  agregarMensaje(role: 'user' | 'assistant' | 'system', content: string, metadata?: any) {
    const mensaje: MensajeHistorial = {
      role,
      content,
      timestamp: new Date(),
      metadata
    };
    
    const historialActual = this.historialMensajesSubject.value;
    const nuevoHistorial = [...historialActual, mensaje];
    
    // Limitar a los últimos 50 mensajes
    if (nuevoHistorial.length > 50) {
      nuevoHistorial.splice(0, nuevoHistorial.length - 50);
    }
    
    this.historialMensajesSubject.next(nuevoHistorial);
  }

  // Limpiar historial
  limpiarHistorial() {
    this.historialMensajesSubject.next([]);
  }

  // Agregar documento para análisis
  agregarDocumento(documento: DocumentoAnalisis) {
    const documentosActuales = this.documentosSubject.value;
    this.documentosSubject.next([...documentosActuales, documento]);
  }

  // Remover documento
  removerDocumento(id: string) {
    const documentosActuales = this.documentosSubject.value;
    this.documentosSubject.next(documentosActuales.filter(d => d.id !== id));
  }

  // Guardar análisis de negocio
  guardarAnalisis(analisis: AnalisisNegocio) {
    const analisisActuales = this.analisisNegocioSubject.value;
    this.analisisNegocioSubject.next([...analisisActuales, analisis]);
  }
} 