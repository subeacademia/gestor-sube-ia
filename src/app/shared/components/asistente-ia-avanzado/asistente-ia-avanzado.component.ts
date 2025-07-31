import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenteIaService } from '../../../core/services/asistente-ia.service';
import { ChatHistoryService } from '../../../core/services/chat-history.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { ChatSidebarComponent } from '../chat-sidebar/chat-sidebar.component';
import { ChatSession, ChatMessage } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asistente-ia-avanzado',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatSidebarComponent],
  template: `
    <!-- Barra lateral de historial -->
    <app-chat-sidebar></app-chat-sidebar>

    <!-- Botón flotante principal -->
    <div class="asistente-boton-principal" (click)="toggleChat()" [class.activo]="chatAbierto">
      <div class="boton-icono">
        <span *ngIf="!chatAbierto">🤖</span>
        <span *ngIf="chatAbierto">✕</span>
      </div>
      <div class="boton-texto" *ngIf="!chatAbierto">
        <span>Asistente IA</span>
        <small>Análisis Inteligente</small>
      </div>
    </div>

    <!-- Ventana principal del asistente -->
    <div class="asistente-ventana" 
         [class.abierta]="chatAbierto"
         [class.sidebar-abierta]="sidebarService.getSidebarAbierta()">
      <!-- Header -->
      <div class="asistente-header">
        <div class="header-info">
          <div class="avatar">🤖</div>
          <div class="info">
            <h3>Asistente IA SUBE TECH</h3>
            <p>Análisis Inteligente de Negocio</p>
          </div>
        </div>
        <div class="header-acciones">
          <button class="btn-accion" (click)="toggleSidebar()" title="Historial de chats">📚</button>
          <button class="btn-accion" (click)="limpiarChat()" title="Limpiar chat">🗑️</button>
          <button class="btn-accion" (click)="toggleChat()" title="Cerrar">✕</button>
        </div>
      </div>

      <!-- Panel de análisis rápido -->
      <div class="panel-analisis" *ngIf="!chatAbierto">
        <h4>Análisis Rápido</h4>
        <div class="botones-analisis">
          <button class="btn-analisis" (click)="analizarVentas()">💰 Ventas</button>
          <button class="btn-analisis" (click)="analizarProductividad()">⚡ Productividad</button>
          <button class="btn-analisis" (click)="analizarCostos()">💸 Costos</button>
          <button class="btn-analisis" (click)="analizarClientes()">👥 Clientes</button>
          <button class="btn-analisis" (click)="analizarProyectos()">📦 Proyectos</button>
        </div>
      </div>

      <!-- Cuerpo del chat -->
      <div class="asistente-cuerpo">
        <div class="mensajes-container">
          <div *ngFor="let mensaje of mensajes" 
               class="mensaje" 
               [class.mensaje-usuario]="mensaje.autor === 'usuario'"
               [class.mensaje-ia]="mensaje.autor === 'ia'">
            
            <div class="mensaje-texto">
              <div class="mensaje-avatar">
                <span *ngIf="mensaje.autor === 'usuario'">👤</span>
                <span *ngIf="mensaje.autor === 'ia'">🤖</span>
              </div>
              <div class="mensaje-contenido">
                <div class="mensaje-texto-contenido" [innerHTML]="mensaje.texto"></div>
                <div class="mensaje-timestamp">
                  {{ mensaje.timestamp | date:'HH:mm' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con controles -->
      <div class="asistente-footer">
        <div class="controles-archivos">
          <button class="btn-control" (click)="cargarArchivo()" title="Cargar archivo">📎</button>
          <button class="btn-control" (click)="generarReporte()" title="Generar reporte">📊</button>
          <button class="btn-control" (click)="exportarDatos()" title="Exportar datos">📤</button>
        </div>
        
        <div class="input-container">
          <textarea #inputMensaje
                    [(ngModel)]="mensajeUsuario"
                    (keypress)="onKeyPress($event)"
                    placeholder="Escribe tu pregunta o solicita un análisis..."
                    rows="1"
                    class="input-mensaje"></textarea>
          <button class="btn-enviar" 
                  (click)="enviarMensaje()" 
                  [disabled]="!mensajeUsuario.trim() || cargando">
            <span *ngIf="!cargando">➤</span>
            <span *ngIf="cargando" class="loading-spinner">⏳</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay de fondo -->
    <div class="asistente-overlay" 
         [class.activo]="chatAbierto" 
         (click)="toggleChat()"></div>
  `,
  styles: [`
    /* Botón flotante principal */
    .asistente-boton-principal {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #ff0000, #ff6600);
      border-radius: 50px;
      box-shadow: 0 20px 40px rgba(255, 0, 0, 0.3);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: white;
      font-weight: 600;
      min-width: 200px;
      border: 3px solid #ffff00;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 20px 40px rgba(255, 0, 0, 0.3); }
      50% { box-shadow: 0 20px 40px rgba(255, 0, 0, 0.6); }
      100% { box-shadow: 0 20px 40px rgba(255, 0, 0, 0.3); }
    }

    .asistente-boton-principal:hover {
      transform: translateY(-2px);
      box-shadow: 0 25px 50px rgba(255, 0, 0, 0.4);
    }

    .asistente-boton-principal.activo {
      transform: scale(0.9);
      opacity: 0.8;
    }

    .boton-icono {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      backdrop-filter: blur(10px);
    }

    .boton-texto {
      display: flex;
      flex-direction: column;
    }

    .boton-texto span {
      font-size: 14px;
      font-weight: 600;
    }

    .boton-texto small {
      font-size: 11px;
      opacity: 0.8;
      font-weight: 400;
    }

    /* Overlay de fondo */
    .asistente-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .asistente-overlay.activo {
      opacity: 1;
      visibility: visible;
    }

    /* Ventana principal del asistente */
    .asistente-ventana {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 500px;
      height: 700px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      transform: translateY(100px) scale(0.8);
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .asistente-ventana.abierta {
      transform: translateY(0) scale(1);
      opacity: 1;
      visibility: visible;
    }

    .asistente-ventana.sidebar-abierta {
      right: 380px;
    }

    /* Header */
    .asistente-header {
      padding: 20px;
      background: linear-gradient(135deg, #ff0000, #ff6600);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      backdrop-filter: blur(10px);
    }

    .info h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .info p {
      margin: 4px 0 0 0;
      font-size: 12px;
      opacity: 0.8;
    }

    .header-acciones {
      display: flex;
      gap: 8px;
    }

    .btn-accion {
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }

    .btn-accion:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    /* Panel de análisis */
    .panel-analisis {
      padding: 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .panel-analisis h4 {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #495057;
    }

    .botones-analisis {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .btn-analisis {
      padding: 8px 12px;
      border: none;
      background: white;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e9ecef;
    }

    .btn-analisis:hover {
      background: #ff0000;
      color: white;
      transform: translateY(-1px);
    }

    /* Cuerpo del chat */
    .asistente-cuerpo {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: white;
    }

    .mensajes-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mensaje {
      display: flex;
      gap: 12px;
    }

    .mensaje-usuario {
      flex-direction: row-reverse;
    }

    .mensaje-usuario .mensaje-texto {
      flex-direction: row-reverse;
    }

    .mensaje-usuario .mensaje-contenido {
      align-items: flex-end;
    }

    .mensaje-texto {
      display: flex;
      gap: 12px;
      width: 100%;
    }

    .mensaje-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
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
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .mensaje-texto-contenido {
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      max-width: 80%;
    }

    .mensaje-usuario .mensaje-texto-contenido {
      background: #ff0000;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .mensaje-ia .mensaje-texto-contenido {
      background: #f3f4f6;
      color: #1f2937;
      border-bottom-left-radius: 4px;
    }

    .mensaje-timestamp {
      font-size: 11px;
      color: #9ca3af;
      padding: 0 4px;
    }

    /* Footer */
    .asistente-footer {
      padding: 16px 20px;
      background: white;
      border-top: 1px solid #e5e7eb;
      z-index: 1002;
      position: relative;
    }

    .controles-archivos {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .btn-control {
      width: 32px;
      height: 32px;
      border: none;
      background: #f3f4f6;
      border-radius: 50%;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .btn-control:hover {
      background: #ff0000;
      color: white;
      transform: scale(1.1);
    }

    .input-container {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .input-mensaje {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 10px 16px;
      font-size: 14px;
      resize: none;
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .input-mensaje:focus {
      border-color: #ff0000;
      box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
    }

    .input-mensaje::placeholder {
      color: #9ca3af;
    }

    .btn-enviar {
      width: 36px;
      height: 36px;
      border: none;
      background: #ff0000;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: all 0.2s ease;
    }

    .btn-enviar:hover:not(:disabled) {
      background: #ff6600;
      transform: scale(1.1);
    }

    .btn-enviar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .asistente-ventana {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
        bottom: 20px;
        right: 20px;
        left: 20px;
      }

      .asistente-boton-principal {
        bottom: 20px;
        right: 20px;
        min-width: auto;
        padding: 12px 16px;
      }

      .boton-texto {
        display: none;
      }
    }
  `]
})
export class AsistenteIaAvanzadoComponent implements OnInit, OnDestroy {
  chatAbierto = false;
  mensajeUsuario = '';
  mensajes: ChatMessage[] = [];
  cargando = false;
  sessionActual: ChatSession | null = null;
  private subscription = new Subscription();

  constructor(
    private asistenteIaService: AsistenteIaService,
    private chatHistoryService: ChatHistoryService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit() {
    console.log('🤖 Asistente IA Avanzado Component inicializado');
    
    // Suscribirse al servicio de asistente IA
    this.subscription.add(
      this.asistenteIaService.asistenteAbierto$.subscribe(abierto => {
        console.log('🤖 Estado del asistente desde servicio:', abierto);
        this.chatAbierto = abierto;
        if (abierto && !this.sessionActual) {
          this.generarMensajeBienvenida();
        }
      })
    );

    // Suscribirse a la sesión actual
    this.subscription.add(
      this.chatHistoryService.currentSession$.subscribe(session => {
        this.sessionActual = session;
        if (session) {
          this.mensajes = session.mensajes;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleChat() {
    console.log('🤖 Toggle chat llamado, estado actual:', this.chatAbierto);
    const nuevoEstado = !this.chatAbierto;
    this.chatAbierto = nuevoEstado;
    console.log('🤖 Nuevo estado del chat:', this.chatAbierto);
    
    // Notificar al servicio
    this.asistenteIaService.setAsistenteAbierto(nuevoEstado);
    
    if (this.chatAbierto) {
      alert('🤖 ¡Asistente IA Avanzado abierto!');
    }
  }

  toggleSidebar() {
    console.log('🤖 Toggle sidebar llamado');
    this.sidebarService.toggleSidebar();
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
    // Obtener datos del sistema
    this.asistenteIaService.obtenerDatosSistema().subscribe({
      next: async (datos) => {
        // Generar respuesta inteligente
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
    
    // Análisis de ventas
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
    
    // Análisis de clientes
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
    
    // Análisis de proyectos
    if (mensajeLower.includes('proyecto')) {
      const totalProyectos = datos.proyectos?.length || 0;
      const proyectosCompletados = datos.proyectos?.filter((p: any) => 
        p.estado === 'completado' || p.estado === 'finalizado'
      ).length || 0;
      
      return `
        <strong>📦 Análisis de Proyectos</strong><br><br>
        <strong>Total de Proyectos:</strong> ${totalProyectos}<br>
        <strong>Proyectos Completados:</strong> ${proyectosCompletados}<br>
        <strong>Tasa de Finalización:</strong> ${totalProyectos > 0 ? ((proyectosCompletados / totalProyectos) * 100).toFixed(1) : 0}%<br><br>
        <strong>💡 Recomendaciones:</strong><br>
        • Optimiza la gestión de recursos<br>
        • Implementa metodologías ágiles<br>
        • Mejora la comunicación con clientes
      `;
    }
    
    // Respuesta general
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
        <strong>🤖 ¡Hola! Soy tu Asistente IA de SUBE TECH</strong><br><br>
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