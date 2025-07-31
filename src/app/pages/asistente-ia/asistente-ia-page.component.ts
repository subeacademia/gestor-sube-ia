import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenteIaService } from '../../core/services/asistente-ia.service';
import { ChatHistoryService } from '../../core/services/chat-history.service';
import { ChatSidebarComponent } from '../../shared/components/chat-sidebar/chat-sidebar.component';
import { ChatSession, ChatMessage } from '../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asistente-ia-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatSidebarComponent],
  template: `
    <!-- Barra lateral de historial -->
    <app-chat-sidebar></app-chat-sidebar>
    
    <div class="asistente-page">
      <!-- Header de la página -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1>🤖 Asistente de IA - SUBE TECH</h1>
            <p>Análisis Inteligente de Negocio y Consultoría Estratégica</p>
          </div>
          <div class="header-actions">
            <button class="btn-historial" (click)="toggleSidebar()">
              📚 Historial de Chats
            </button>
            <button class="btn-nueva-conversacion" (click)="crearNuevaConversacion()">
              ➕ Nueva Conversación
            </button>
          </div>
        </div>
      </div>

      <!-- Panel de análisis rápido -->
      <div class="analisis-panel">
        <h2>Análisis Rápido</h2>
        <div class="botones-analisis">
          <button class="btn-analisis" (click)="analizarVentas()">
            <span class="icon">💰</span>
            <span class="text">Ventas</span>
          </button>
          <button class="btn-analisis" (click)="analizarProductividad()">
            <span class="icon">⚡</span>
            <span class="text">Productividad</span>
          </button>
          <button class="btn-analisis" (click)="analizarCostos()">
            <span class="icon">💸</span>
            <span class="text">Costos</span>
          </button>
          <button class="btn-analisis" (click)="analizarClientes()">
            <span class="icon">👥</span>
            <span class="text">Clientes</span>
          </button>
          <button class="btn-analisis" (click)="analizarProyectos()">
            <span class="icon">📦</span>
            <span class="text">Proyectos</span>
          </button>
        </div>
      </div>

      <!-- Chat principal -->
      <div class="chat-container">
        <div class="chat-header">
          <h3>Chat con IA</h3>
          <button class="btn-limpiar" (click)="limpiarChat()">🗑️ Limpiar</button>
        </div>
        
        <div class="mensajes-container">
          <div *ngFor="let mensaje of mensajes" 
               class="mensaje" 
               [class.mensaje-usuario]="mensaje.autor === 'usuario'"
               [class.mensaje-ia]="mensaje.autor === 'ia'">
            
            <div class="mensaje-avatar">
              <span *ngIf="mensaje.autor === 'usuario'">👤</span>
              <span *ngIf="mensaje.autor === 'ia'">🤖</span>
            </div>
            
            <div class="mensaje-contenido">
              <div class="mensaje-texto" [innerHTML]="mensaje.texto"></div>
              <div class="mensaje-timestamp">
                {{ mensaje.timestamp | date:'HH:mm' }}
              </div>
            </div>
          </div>
        </div>

        <div class="input-container">
          <textarea 
            [(ngModel)]="mensajeUsuario"
            (keypress)="onKeyPress($event)"
            placeholder="Escribe tu pregunta o solicita un análisis..."
            rows="3"
            class="input-mensaje">
          </textarea>
          <button 
            class="btn-enviar" 
            (click)="enviarMensaje()" 
            [disabled]="!mensajeUsuario.trim() || cargando">
            <span *ngIf="!cargando">➤ Enviar</span>
            <span *ngIf="cargando">⏳ Procesando...</span>
          </button>
        </div>
      </div>

      <!-- Panel de funcionalidades -->
      <div class="funcionalidades-panel">
        <h2>Funcionalidades Avanzadas</h2>
        <div class="funcionalidades-grid">
          <button class="btn-funcionalidad" (click)="cargarArchivo()">
            <span class="icon">📎</span>
            <span class="text">Cargar Archivo</span>
          </button>
          <button class="btn-funcionalidad" (click)="generarReporte()">
            <span class="icon">📊</span>
            <span class="text">Generar Reporte</span>
          </button>
          <button class="btn-funcionalidad" (click)="exportarDatos()">
            <span class="icon">📤</span>
            <span class="text">Exportar Datos</span>
          </button>
          <button class="btn-funcionalidad" (click)="analizarArchivo()">
            <span class="icon">🔍</span>
            <span class="text">Analizar Archivo</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .asistente-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 40px;
      padding: 40px;
      background: linear-gradient(135deg, #ff0000, #ff6600);
      border-radius: 20px;
      color: white;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-info {
      flex: 1;
      text-align: left;
    }

    .header-actions {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .btn-historial, .btn-nueva-conversacion {
      padding: 12px 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .btn-historial:hover, .btn-nueva-conversacion:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }

    .page-header h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      color: white;
    }

    .page-header p {
      font-size: 1.2rem;
      margin: 0;
      opacity: 0.9;
    }

    .analisis-panel {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .analisis-panel h2 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .botones-analisis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .btn-analisis {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border: none;
      background: #f8f9fa;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .btn-analisis:hover {
      background: #ff0000;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255,0,0,0.3);
    }

    .btn-analisis .icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .btn-analisis .text {
      font-weight: 600;
    }

    .chat-container {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .chat-header h3 {
      margin: 0;
      color: #333;
    }

    .btn-limpiar {
      padding: 8px 16px;
      border: none;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-limpiar:hover {
      background: #ff0000;
      color: white;
    }

    .mensajes-container {
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .mensaje {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    .mensaje-usuario {
      flex-direction: row-reverse;
    }

    .mensaje-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .mensaje-usuario .mensaje-avatar {
      background: #ff0000;
      color: white;
    }

    .mensaje-ia .mensaje-avatar {
      background: #ff6600;
      color: white;
    }

    .mensaje-contenido {
      flex: 1;
    }

    .mensaje-texto {
      padding: 15px;
      border-radius: 15px;
      margin-bottom: 5px;
      line-height: 1.5;
    }

    .mensaje-usuario .mensaje-texto {
      background: #ff0000;
      color: white;
      border-bottom-right-radius: 5px;
    }

    .mensaje-ia .mensaje-texto {
      background: white;
      color: #333;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 5px;
    }

    .mensaje-timestamp {
      font-size: 0.8rem;
      color: #6c757d;
      padding: 0 5px;
    }

    .input-container {
      display: flex;
      gap: 15px;
      align-items: flex-end;
    }

    .input-mensaje {
      flex: 1;
      padding: 15px;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      resize: none;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .input-mensaje:focus {
      outline: none;
      border-color: #ff0000;
      box-shadow: 0 0 0 3px rgba(255,0,0,0.1);
    }

    .btn-enviar {
      padding: 15px 30px;
      border: none;
      background: #ff0000;
      color: white;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-enviar:hover:not(:disabled) {
      background: #ff6600;
      transform: translateY(-2px);
    }

    .btn-enviar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .funcionalidades-panel {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .funcionalidades-panel h2 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .funcionalidades-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .btn-funcionalidad {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      border: none;
      background: #f8f9fa;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .btn-funcionalidad:hover {
      background: #ff0000;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255,0,0,0.3);
    }

    .btn-funcionalidad .icon {
      font-size: 1.5rem;
    }

    .btn-funcionalidad .text {
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .asistente-page {
        padding: 10px;
      }

      .page-header {
        padding: 20px;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .botones-analisis {
        grid-template-columns: 1fr;
      }

      .funcionalidades-grid {
        grid-template-columns: 1fr;
      }

      .input-container {
        flex-direction: column;
      }
    }
  `]
})
export class AsistenteIaPageComponent implements OnInit, OnDestroy {
  mensajeUsuario = '';
  mensajes: ChatMessage[] = [];
  cargando = false;
  sessionActual: ChatSession | null = null;
  private subscription = new Subscription();

  constructor(
    private asistenteIaService: AsistenteIaService,
    private chatHistoryService: ChatHistoryService
  ) {}

  ngOnInit() {
    console.log('🤖 Asistente IA Page Component inicializado');
    
    // Suscribirse a la sesión actual
    this.subscription.add(
      this.chatHistoryService.currentSession$.subscribe(session => {
        this.sessionActual = session;
        if (session) {
          this.mensajes = session.mensajes;
        } else {
          this.generarMensajeBienvenida();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleSidebar() {
    // Este método se implementará para comunicarse con el componente sidebar
    console.log('🤖 Toggle sidebar llamado desde página');
  }

  async crearNuevaConversacion() {
    try {
      const sessionId = await this.chatHistoryService.createNewChatSession();
      const nuevaSession = await this.chatHistoryService.loadChatSession(sessionId);
      if (nuevaSession) {
        this.chatHistoryService.setCurrentSession(nuevaSession);
        this.generarMensajeBienvenida();
      }
    } catch (error) {
      console.error('Error al crear nueva conversación:', error);
    }
  }

  async enviarMensaje() {
    if (!this.mensajeUsuario.trim() || this.cargando) return;

    // Crear nueva sesión si no existe
    if (!this.sessionActual) {
      await this.crearNuevaConversacion();
    }

    if (!this.sessionActual) return;

    const mensaje = this.mensajeUsuario;
    const mensajeUsuario: ChatMessage = {
      autor: 'usuario',
      texto: mensaje,
      timestamp: new Date()
    };

    // Agregar mensaje del usuario
    this.mensajes.push(mensajeUsuario);
    
    // Guardar en Firebase
    await this.chatHistoryService.addMessageToSession(this.sessionActual.id!, mensajeUsuario);

    this.mensajeUsuario = '';
    this.cargando = true;

    // Procesar mensaje con IA
    this.procesarMensajeIA(mensaje);
  }

  private async procesarMensajeIA(mensaje: string) {
    this.asistenteIaService.obtenerDatosSistema().subscribe({
      next: async (datos) => {
        const respuesta = this.generarRespuestaInteligente(mensaje, datos);
        
        setTimeout(async () => {
          const mensajeIA: ChatMessage = {
            autor: 'ia',
            texto: respuesta,
            timestamp: new Date()
          };
          
          this.mensajes.push(mensajeIA);
          
          // Guardar respuesta de la IA en Firebase
          if (this.sessionActual) {
            await this.chatHistoryService.addMessageToSession(this.sessionActual.id!, mensajeIA);
          }
          
          this.cargando = false;
        }, 1000);
      },
      error: async (error) => {
        console.error('Error al obtener datos:', error);
        const mensajeError: ChatMessage = {
          autor: 'ia',
          texto: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.',
          timestamp: new Date()
        };
        
        this.mensajes.push(mensajeError);
        
        // Guardar mensaje de error en Firebase
        if (this.sessionActual) {
          await this.chatHistoryService.addMessageToSession(this.sessionActual.id!, mensajeError);
        }
        
        this.cargando = false;
      }
    });
  }

  private generarRespuestaInteligente(mensaje: string, datos: any): string {
    const mensajeLower = mensaje.toLowerCase();
    
    // Preguntas sobre la empresa
    if (mensajeLower.includes('empresa') || mensajeLower.includes('nombre') || mensajeLower.includes('llama')) {
      return `
        <strong>🏢 Información de la Empresa</strong><br><br>
        <strong>Nombre de la Empresa:</strong> SUBE IA TECH<br>
        <strong>Especialidad:</strong> Consultoría en Inteligencia Artificial y Tecnología<br>
        <strong>Servicios Principales:</strong><br>
        • Desarrollo de soluciones IA<br>
        • Consultoría tecnológica<br>
        • Análisis de datos empresariales<br>
        • Optimización de procesos<br>
        • Estrategias digitales<br><br>
        <strong>💡 Sobre SUBE IA TECH:</strong><br>
        Somos una empresa especializada en transformación digital e inteligencia artificial, 
        ayudando a otras empresas a optimizar sus procesos y aprovechar las tecnologías emergentes 
        para mejorar su competitividad en el mercado.
      `;
    }
    
    if (mensajeLower.includes('venta') || mensajeLower.includes('cotización')) {
      const totalCotizaciones = datos.cotizaciones?.length || 0;
      const cotizacionesAceptadas = datos.cotizaciones?.filter((c: any) => 
        c.estado === 'Aceptada' || c.estado === 'aprobada'
      ).length || 0;
      const tasaConversion = totalCotizaciones > 0 ? (cotizacionesAceptadas / totalCotizaciones) * 100 : 0;
      
      return `
        <strong>📊 Análisis de Ventas</strong><br><br>
        <strong>Total de Cotizaciones:</strong> ${totalCotizaciones}<br>
        <strong>Cotizaciones Aceptadas:</strong> ${cotizacionesAceptadas}<br>
        <strong>Tasa de Conversión:</strong> ${tasaConversion.toFixed(1)}%<br><br>
        <strong>💡 Recomendaciones:</strong><br>
        • ${tasaConversion < 30 ? 'Considera revisar tu estrategia de precios' : 'Excelente tasa de conversión'}<br>
        • Analiza las cotizaciones rechazadas para identificar patrones<br>
        • Implementa seguimiento más agresivo de leads calientes
      `;
    }
    
    if (mensajeLower.includes('cliente')) {
      const totalClientes = datos.clientes?.length || 0;
      const clientesActivos = datos.clientes?.filter((c: any) => 
        c.estado === 'activo' || !c.estado
      ).length || 0;
      
      return `
        <strong>👥 Análisis de Clientes</strong><br><br>
        <strong>Total de Clientes:</strong> ${totalClientes}<br>
        <strong>Clientes Activos:</strong> ${clientesActivos}<br>
        <strong>Tasa de Retención:</strong> ${totalClientes > 0 ? ((clientesActivos / totalClientes) * 100).toFixed(1) : 0}%<br><br>
        <strong>💡 Recomendaciones:</strong><br>
        • Implementa programa de fidelización<br>
        • Contacta clientes inactivos para reactivarlos<br>
        • Desarrolla estrategias de upselling
      `;
    }
    
    return `
      <strong>🤖 Asistente IA SUBE TECH</strong><br><br>
      He analizado tu mensaje: "${mensaje}"<br><br>
      <strong>📊 Datos del Sistema:</strong><br>
      • Cotizaciones: ${datos.cotizaciones?.length || 0}<br>
      • Contratos: ${datos.contratos?.length || 0}<br>
      • Clientes: ${datos.clientes?.length || 0}<br>
      • Proyectos: ${datos.proyectos?.length || 0}<br><br>
      <strong>💡 Puedo ayudarte con:</strong><br>
      • Análisis de ventas y conversiones<br>
      • Optimización de procesos<br>
      • Estrategias de crecimiento<br>
      • Análisis de clientes<br>
      • Gestión de proyectos<br><br>
      ¿En qué área específica te gustaría que profundice?
    `;
  }

  analizarVentas() {
    this.mensajeUsuario = 'Analiza las ventas y cotizaciones del sistema';
    this.enviarMensaje();
  }

  analizarProductividad() {
    this.mensajeUsuario = 'Analiza la productividad del equipo';
    this.enviarMensaje();
  }

  analizarCostos() {
    this.mensajeUsuario = 'Analiza los costos y optimización';
    this.enviarMensaje();
  }

  analizarClientes() {
    this.mensajeUsuario = 'Analiza los clientes y retención';
    this.enviarMensaje();
  }

  analizarProyectos() {
    this.mensajeUsuario = 'Analiza los proyectos y eficiencia';
    this.enviarMensaje();
  }

  cargarArchivo() {
    alert('📎 Función de carga de archivos en desarrollo');
  }

  generarReporte() {
    alert('📊 Función de generación de reportes en desarrollo');
  }

  exportarDatos() {
    alert('📤 Función de exportación de datos en desarrollo');
  }

  analizarArchivo() {
    alert('🔍 Función de análisis de archivos en desarrollo');
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  async limpiarChat() {
    this.mensajes = [];
    await this.crearNuevaConversacion();
  }

  private async generarMensajeBienvenida() {
    const mensajeBienvenida: ChatMessage = {
      autor: 'ia',
      texto: `
        <strong>🤖 ¡Bienvenido al Asistente de IA de SUBE TECH!</strong><br><br>
        Soy tu consultor de negocios inteligente y puedo ayudarte con:<br><br>
        <strong>📊 Análisis de Datos:</strong><br>
        • Ventas y conversiones<br>
        • Productividad del equipo<br>
        • Análisis de costos<br>
        • Gestión de clientes<br>
        • Eficiencia de proyectos<br><br>
        <strong>💡 Funcionalidades:</strong><br>
        • Análisis en tiempo real<br>
        • Recomendaciones estratégicas<br>
        • Generación de reportes<br>
        • Carga y análisis de archivos<br>
        • Chat inteligente<br><br>
        <strong>🎯 Usa los botones de análisis rápido o escribe tu pregunta!</strong>
      `,
      timestamp: new Date()
    };
    
    this.mensajes.push(mensajeBienvenida);
    
    // Guardar mensaje de bienvenida en Firebase si hay sesión actual
    if (this.sessionActual) {
      await this.chatHistoryService.addMessageToSession(this.sessionActual.id!, mensajeBienvenida);
    }
  }
} 