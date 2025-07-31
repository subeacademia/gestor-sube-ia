import { Component, ChangeDetectorRef, ElementRef, ViewChild, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenteIaService, MensajeHistorial, AnalisisNegocio, DocumentoAnalisis } from '../../../core/services/asistente-ia.service';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { Nl2brPipe } from '../../pipes/nl2br.pipe';

interface MensajeChat {
  autor: 'usuario' | 'ia';
  texto: string;
  timestamp: Date;
  tipo?: 'texto' | 'grafico' | 'analisis' | 'audio';
  datos?: any;
}

@Component({
  selector: 'app-asistente-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, Nl2brPipe],
  templateUrl: './asistente-ia.component.html',
  styleUrls: ['./asistente-ia.component.scss']
})
export class AsistenteIaComponent implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('cuerpoChat') cuerpoChat!: ElementRef;
  @ViewChild('inputMensaje') inputMensaje!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  chatAbierto = false;
  mensajeUsuario = '';
  mensajes: MensajeChat[] = [];
  cargando = false;
  modoAnalisis = false;
  analisisActual: AnalisisNegocio | null = null;
  documentos: DocumentoAnalisis[] = [];
  datosSistema: any = null;
  
  // Configuración de gráficos
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Tendencias de Negocio'
      }
    }
  };
  public lineChartType: ChartType = 'line';

  // Pool de mensajes de carga
  private mensajesCarga = [
    '🤖 Analizando datos del sistema...',
    '📊 Procesando métricas de negocio...',
    '🔍 Identificando oportunidades...',
    '💡 Generando recomendaciones...',
    '📈 Calculando tendencias...',
    '🎯 Optimizando estrategias...',
    '⚡ Procesando información...',
    '🧠 Aplicando inteligencia artificial...',
    '📋 Recopilando insights...',
    '🚀 Preparando análisis avanzado...'
  ];

  // Funcionalidad de audio
  private recognition: any;
  private synthesis: any;
  audioDisponible = false;
  grabando = false;

  constructor(
    private asistenteIaService: AsistenteIaService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.inicializarAudio();
  }

  ngOnInit() {
    console.log('🤖 Asistente IA Component inicializado');
    this.generarMensajeBienvenida();
    this.cargarDatosSistema();
    this.suscribirseAServicios();
    
    // Suscribirse al estado del asistente
    this.asistenteIaService.asistenteAbierto$.subscribe(abierto => {
      console.log('🤖 Estado del asistente cambiado:', abierto);
      this.chatAbierto = abierto;
    });
  }

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  private inicializarAudio() {
    // Verificar si el navegador soporta reconocimiento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES';
      
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.mensajeUsuario = transcript;
        this.enviarMensaje();
      };
      
      this.audioDisponible = true;
    }

    // Verificar síntesis de voz
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  private suscribirseAServicios() {
    this.asistenteIaService.historialMensajes$.subscribe(historial => {
      // Actualizar mensajes del chat
    });

    this.asistenteIaService.documentos$.subscribe(documentos => {
      this.documentos = documentos;
    });

    this.asistenteIaService.analisisNegocio$.subscribe(analisis => {
      // Actualizar análisis guardados
    });
  }

  private cargarDatosSistema() {
    this.asistenteIaService.obtenerDatosSistema().subscribe({
      next: (datos) => {
        this.datosSistema = datos;
        console.log('📊 Datos del sistema cargados:', datos);
      },
      error: (error) => {
        console.error('❌ Error al cargar datos del sistema:', error);
      }
    });
  }

  private generarMensajeBienvenida() {
    const mensajeBienvenida: MensajeChat = {
      autor: 'ia',
      texto: `¡Hola! Soy tu asistente de IA para SUBE IA TECH 🤖

Soy tu consultor de negocios personalizado y tengo acceso completo a todos los datos de tu sistema. Puedo ayudarte con:

📊 **Análisis de Negocio**: Ventas, productividad, costos
📈 **Estrategias de Crecimiento**: Oportunidades y recomendaciones
🎯 **Optimización**: Mejoras en procesos y eficiencia
💰 **Análisis Financiero**: Rentabilidad y costos

¿En qué área te gustaría que te ayude hoy?`,
      timestamp: new Date(),
      tipo: 'texto'
    };

    this.mensajes.push(mensajeBienvenida);
  }

  toggleChat() {
    console.log('🤖 Toggle chat llamado, estado actual:', this.chatAbierto);
    this.chatAbierto = !this.chatAbierto;
    this.asistenteIaService.setAsistenteAbierto(this.chatAbierto);
    console.log('🤖 Nuevo estado del chat:', this.chatAbierto);
    
    if (this.chatAbierto) {
      setTimeout(() => {
        if (this.inputMensaje) {
          this.inputMensaje.nativeElement.focus();
        }
      }, 100);
    }
  }

  enviarMensaje() {
    if (!this.mensajeUsuario.trim()) return;

    const mensaje = this.mensajeUsuario;
    const mensajeUsuario: MensajeChat = {
      autor: 'usuario',
      texto: mensaje,
      timestamp: new Date(),
      tipo: 'texto'
    };

    this.mensajes.push(mensajeUsuario);
    this.mensajeUsuario = '';
    this.cargando = true;

    // Mostrar mensaje de carga
    const mensajeCarga = this.obtenerMensajeAleatorio(this.mensajesCarga);
    const mensajeCargaObj: MensajeChat = {
      autor: 'ia',
      texto: mensajeCarga,
      timestamp: new Date(),
      tipo: 'texto'
    };
    this.mensajes.push(mensajeCargaObj);

    // Procesar mensaje con contexto del sistema
    this.procesarMensajeConContexto(mensaje);
  }

  private procesarMensajeConContexto(mensaje: string) {
    const promptSistema = this.crearPromptSistema(mensaje);
    
    this.asistenteIaService.generarTextoAzure(promptSistema).subscribe({
      next: (res) => {
        let texto = '';
        if (res && res.choices && res.choices[0]?.message?.content) {
          texto = res.choices[0].message.content;
        } else if (res && res.text) {
          texto = res.text;
        } else if (typeof res === 'string') {
          texto = res;
        } else {
          texto = 'No se pudo obtener respuesta de la IA.';
        }

        // Reemplazar mensaje de carga con respuesta real
        if (this.mensajes.length > 0) {
          this.mensajes[this.mensajes.length - 1] = {
            autor: 'ia',
            texto: texto,
            timestamp: new Date(),
            tipo: 'texto'
          };
        }

        this.asistenteIaService.agregarMensaje('user', mensaje);
        this.asistenteIaService.agregarMensaje('assistant', texto);
        
        this.cargando = false;
        this.changeDetectorRef.detectChanges();

        // Reproducir audio si está disponible
        if (this.synthesis) {
          this.reproducirAudio(texto);
        }
      },
      error: (err) => {
        console.error('Error al procesar mensaje:', err);
        if (this.mensajes.length > 0) {
          this.mensajes[this.mensajes.length - 1] = {
            autor: 'ia',
            texto: 'Ocurrió un error al conectar con la IA. Por favor, intenta de nuevo.',
            timestamp: new Date(),
            tipo: 'texto'
          };
        }
        this.cargando = false;
      }
    });
  }

  private crearPromptSistema(mensaje: string): any {
    const contextoDatos = this.datosSistema ? 
      `\n\nDATOS ACTUALES DEL SISTEMA:\n${JSON.stringify(this.datosSistema, null, 2)}` : '';

    const promptBase = `Eres un consultor de negocios experto y asistente de IA para SUBE IA TECH. 
    Tienes acceso completo a todos los datos del sistema y debes proporcionar análisis detallados, 
    recomendaciones específicas y estrategias accionables.

    CONTEXTO DE LA EMPRESA:
    - SUBE IA TECH es una empresa de desarrollo de software y consultoría tecnológica
    - Maneja cotizaciones, contratos, clientes y proyectos
    - Busca optimizar ventas, productividad y rentabilidad

    INSTRUCCIONES:
    1. Analiza los datos del sistema proporcionados
    2. Da recomendaciones específicas y accionables
    3. Identifica oportunidades de mejora
    4. Proporciona métricas y análisis cuantitativos
    5. Sugiere estrategias para aumentar ventas y eficiencia
    6. Responde de manera profesional pero cercana

    PREGUNTA DEL USUARIO: ${mensaje}${contextoDatos}

    Responde de manera estructurada, incluyendo:
    - Análisis de la situación actual
    - Recomendaciones específicas
    - Métricas relevantes
    - Próximos pasos sugeridos`;

    return {
      messages: [
        { role: 'system', content: promptBase }
      ],
      maxTokens: 2000,
      temperature: 0.7
    };
  }

  // Funcionalidades de análisis de negocio
  generarAnalisisRapido(tipo: 'ventas' | 'productividad' | 'costos' | 'clientes' | 'proyectos') {
    if (!this.datosSistema) {
      this.mensajes.push({
        autor: 'ia',
        texto: 'Cargando datos del sistema para el análisis...',
        timestamp: new Date(),
        tipo: 'texto'
      });
      return;
    }

    this.cargando = true;
    this.asistenteIaService.generarAnalisisNegocio(tipo, this.datosSistema).subscribe({
      next: (analisis) => {
        this.analisisActual = analisis;
        this.mostrarAnalisis(analisis);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al generar análisis:', error);
        this.cargando = false;
      }
    });
  }

  private mostrarAnalisis(analisis: AnalisisNegocio) {
    const mensajeAnalisis: MensajeChat = {
      autor: 'ia',
      texto: `📊 **${analisis.titulo}**

${analisis.descripcion}

**Recomendaciones:**
${analisis.recomendaciones.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

**Impacto Estimado:** ${this.getImpactoIcon(analisis.impacto)} ${analisis.impacto.toUpperCase()}`,
      timestamp: new Date(),
      tipo: 'analisis',
      datos: analisis
    };

    this.mensajes.push(mensajeAnalisis);
    this.asistenteIaService.guardarAnalisis(analisis);
  }

  private getImpactoIcon(impacto: string): string {
    switch (impacto) {
      case 'alto': return '🚀';
      case 'medio': return '📈';
      case 'bajo': return '📊';
      default: return '📊';
    }
  }

  // Funcionalidades de audio
  iniciarGrabacion() {
    if (this.recognition && !this.grabando) {
      this.grabando = true;
      this.recognition.start();
      
      this.mensajes.push({
        autor: 'ia',
        texto: '🎤 Escuchando... Habla ahora',
        timestamp: new Date(),
        tipo: 'audio'
      });
    }
  }

  detenerGrabacion() {
    if (this.recognition && this.grabando) {
      this.grabando = false;
      this.recognition.stop();
    }
  }

  private reproducirAudio(texto: string) {
    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      this.synthesis.speak(utterance);
    }
  }

  // Funcionalidades de archivos
  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }

  private procesarArchivo(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const documento: DocumentoAnalisis = {
        id: Date.now().toString(),
        nombre: file.name,
        tipo: this.obtenerTipoArchivo(file.name),
        contenido: e.target.result,
        fechaCarga: new Date()
      };

      this.asistenteIaService.agregarDocumento(documento);
      
      this.mensajes.push({
        autor: 'ia',
        texto: `📎 Archivo "${file.name}" cargado exitosamente. Puedo analizar su contenido para mejorar mis recomendaciones.`,
        timestamp: new Date(),
        tipo: 'texto'
      });
    };
    reader.readAsText(file);
  }

  private obtenerTipoArchivo(nombre: string): 'pdf' | 'excel' | 'imagen' {
    const extension = nombre.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension || '')) return 'pdf';
    if (['xlsx', 'xls', 'csv'].includes(extension || '')) return 'excel';
    return 'imagen';
  }

  // Utilidades
  private obtenerMensajeAleatorio(mensajes: string[]): string {
    return mensajes[Math.floor(Math.random() * mensajes.length)];
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      if (this.cuerpoChat && this.cuerpoChat.nativeElement) {
        this.cuerpoChat.nativeElement.scrollTop = this.cuerpoChat.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  // Navegación por teclado
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  // Limpiar chat
  limpiarChat() {
    this.mensajes = [];
    this.analisisActual = null;
    this.asistenteIaService.limpiarHistorial();
    this.generarMensajeBienvenida();
  }

  // Remover documento
  removerDocumento(id: string) {
    this.asistenteIaService.removerDocumento(id);
  }
} 