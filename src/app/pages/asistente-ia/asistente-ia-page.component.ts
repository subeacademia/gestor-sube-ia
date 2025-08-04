import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AsistenteIaService } from '../../core/services/asistente-ia.service';
import { ChatHistoryService } from '../../core/services/chat-history.service';
import { FirebaseService } from '../../core/services/firebase.service';
import { ChatSession, ChatMessage } from '../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asistente-ia-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatgpt-layout">
      <!-- Sidebar izquierda -->
      <div class="sidebar" [class.sidebar-open]="sidebarOpen">
        <div class="sidebar-header">
          <button class="btn-new-chat" (click)="crearNuevaConversacion()">
            <span class="icon">➕</span>
            Nueva conversación
          </button>
        </div>

        <div class="sidebar-content">
          <div class="chat-history">
            <div *ngIf="cargando" class="loading">
              <div class="spinner"></div>
              <span>Cargando...</span>
            </div>

            <div *ngFor="let session of chatSessions" 
                 class="chat-item"
                 [class.active]="session.id === sessionActual?.id"
                 (click)="cargarConversacion(session)">
              <div class="chat-item-content">
                <span class="chat-title">{{ session.titulo }}</span>
                <span class="chat-date">{{ formatearFecha(session.fechaUltimaActividad) }}</span>
              </div>
              <button class="btn-delete" 
                      (click)="eliminarConversacion(session.id!, $event)"
                      title="Eliminar conversación">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="btn-back" (click)="volverAlSistema()">
            <span class="icon">🏠</span>
            Volver al Sistema
          </button>
          <div class="connection-status" [class.connected]="firebaseConnected">
            <span class="status-dot"></span>
            <span class="status-text">{{ firebaseConnected ? 'Conectado' : 'Desconectado' }}</span>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="main-content">
        <!-- Header fijo para PC y móvil -->
        <div class="main-header">
          <div class="header-content">
            <div class="header-left">
              <button class="btn-menu" (click)="toggleSidebar()">
                <span class="icon">☰</span>
              </button>
            </div>
            <div class="header-center">
              <h1>Asistente IA</h1>
            </div>
            <div class="header-right">
              <button class="btn-back-header" (click)="volverAlSistema()">
                <span class="icon">🏠</span>
                Volver al Sistema
              </button>
            </div>
          </div>
        </div>

        <!-- Área de chat -->
        <div class="chat-area">
          <div class="messages-container" #messagesContainer>
            <div *ngFor="let mensaje of mensajes" 
                 class="message"
                 [class.user-message]="mensaje.autor === 'usuario'"
                 [class.ai-message]="mensaje.autor === 'ia'">
              
              <div class="message-avatar">
                <span *ngIf="mensaje.autor === 'usuario'">👤</span>
                <span *ngIf="mensaje.autor === 'ia'">🤖</span>
              </div>
              
              <div class="message-content">
                <div class="message-text" [innerHTML]="mensaje.texto"></div>
                <div class="message-time">{{ mensaje.timestamp | date:'HH:mm' }}</div>
              </div>
            </div>

            <!-- Indicador de carga -->
            <div *ngIf="cargando" class="message ai-message">
              <div class="message-avatar">
                <span>🤖</span>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div class="input-area">
          <div class="input-container">
            <textarea 
              [(ngModel)]="mensajeUsuario"
              (keydown)="onKeyDown($event)"
              placeholder="Escribe tu mensaje..."
              rows="1"
              class="message-input"
              #messageInput>
            </textarea>
            <button 
              class="send-button"
              (click)="enviarMensaje()"
              [disabled]="!mensajeUsuario.trim() || cargando">
              <span class="icon">➤</span>
            </button>
          </div>
          <div class="input-footer">
            <span class="connection-info">
              {{ firebaseConnected ? '✅ Conectado a Firebase' : '❌ Desconectado de Firebase' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Overlay para móviles -->
      <div class="sidebar-overlay" 
           [class.active]="sidebarOpen" 
           (click)="toggleSidebar()"></div>
    </div>
  `,
  styles: [`
    .chatgpt-layout {
      display: flex;
      height: 100vh;
      background: #343541;
      color: #ececf1;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      background: #202123;
      border-right: 1px solid #4a4b53;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #4a4b53;
    }

    .btn-new-chat {
      width: 100%;
      padding: 12px 16px;
      background: #40414f;
      border: 1px solid #565869;
      border-radius: 6px;
      color: #ececf1;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .btn-new-chat:hover {
      background: #4a4b53;
      transform: translateY(-1px);
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .chat-history {
      padding: 0 8px;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      color: #8e8ea0;
      font-size: 14px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #4a4b53;
      border-top: 2px solid #ececf1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .chat-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      margin: 2px 0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .chat-item:hover {
      background: #40414f;
      transform: translateX(2px);
    }

    .chat-item.active {
      background: #40414f;
      border-left: 3px solid #7c3aed;
    }

    .chat-item-content {
      flex: 1;
      min-width: 0;
    }

    .chat-title {
      display: block;
      font-size: 14px;
      color: #ececf1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chat-date {
      display: block;
      font-size: 12px;
      color: #8e8ea0;
      margin-top: 2px;
    }

    .btn-delete {
      background: none;
      border: none;
      color: #8e8ea0;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      opacity: 0;
      transition: all 0.2s ease;
    }

    .chat-item:hover .btn-delete {
      opacity: 1;
    }

    .btn-delete:hover {
      background: #4a4b53;
      color: #ef4444;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #4a4b53;
    }

    .btn-back {
      width: 100%;
      padding: 12px 16px;
      background: #40414f;
      border: 1px solid #565869;
      border-radius: 6px;
      color: #ececf1;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      transition: all 0.2s ease;
      margin-bottom: 12px;
    }

    .btn-back:hover {
      background: #4a4b53;
      transform: translateY(-1px);
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #8e8ea0;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
      transition: background-color 0.2s;
    }

    .connection-status.connected .status-dot {
      background: #10b981;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #343541;
      position: relative;
    }

    /* Header Principal - Siempre visible */
    .main-header {
      background: linear-gradient(135deg, #202123 0%, #2d2d30 100%);
      border-bottom: 1px solid #4a4b53;
      padding: 12px 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      z-index: 100;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-center {
      flex: 1;
      text-align: center;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-menu, .btn-back-header {
      background: rgba(64, 65, 79, 0.5);
      border: 1px solid #565869;
      color: #ececf1;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 16px;
      transition: all 0.2s ease;
      backdrop-filter: blur(5px);
    }

    .btn-back-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }

    .btn-menu:hover, .btn-back-header:hover {
      background: rgba(64, 65, 79, 0.8);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .main-header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #ececf1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    /* Chat Area */
    .chat-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px 0;
      position: relative;
    }

    .messages-container {
      max-width: 768px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .message {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .user-message .message-avatar {
      background: linear-gradient(135deg, #10a37f 0%, #0d9488 100%);
    }

    .ai-message .message-avatar {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    }

    .message-content {
      flex: 1;
      min-width: 0;
    }

    .message-text {
      line-height: 1.6;
      margin-bottom: 8px;
      padding: 12px 16px;
      background: rgba(64, 65, 79, 0.3);
      border-radius: 8px;
      border: 1px solid rgba(86, 88, 105, 0.3);
    }

    .user-message .message-text {
      background: rgba(16, 163, 127, 0.1);
      border-color: rgba(16, 163, 127, 0.3);
    }

    .ai-message .message-text {
      background: rgba(124, 58, 237, 0.1);
      border-color: rgba(124, 58, 237, 0.3);
    }

    .message-time {
      font-size: 12px;
      color: #8e8ea0;
      margin-top: 4px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 12px 16px;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #8e8ea0;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Input Area */
    .input-area {
      border-top: 1px solid #4a4b53;
      background: linear-gradient(135deg, #343541 0%, #2d2d30 100%);
      padding: 20px;
      position: relative;
    }

    .input-container {
      max-width: 768px;
      margin: 0 auto;
      position: relative;
    }

    .message-input {
      width: 100%;
      padding: 16px 56px 16px 20px;
      background: rgba(64, 65, 79, 0.5);
      border: 2px solid #565869;
      border-radius: 12px;
      color: #ececf1;
      font-size: 16px;
      line-height: 1.5;
      resize: none;
      outline: none;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
    }

    .message-input:focus {
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
      transform: translateY(-1px);
    }

    .message-input::placeholder {
      color: #8e8ea0;
    }

    .send-button {
      position: absolute;
      right: 8px;
      bottom: 8px;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    }

    .send-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
    }

    .send-button:disabled {
      background: #4a4b53;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .input-footer {
      max-width: 768px;
      margin: 12px auto 0;
      text-align: center;
    }

    .connection-info {
      font-size: 12px;
      color: #8e8ea0;
      padding: 8px 16px;
      background: rgba(64, 65, 79, 0.3);
      border-radius: 6px;
      display: inline-block;
    }

    /* Overlay */
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(2px);
    }

    .sidebar-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 1000;
        transform: translateX(-100%);
      }

      .sidebar.sidebar-open {
        transform: translateX(0);
      }

      .main-header {
        padding: 10px 16px;
      }

      .main-header h1 {
        font-size: 18px;
      }

      .btn-back-header {
        display: none;
      }

      .chat-area {
        padding-top: 10px;
      }

      .messages-container {
        padding: 0 16px;
      }

      .input-area {
        padding: 16px;
      }

      .message-input {
        padding: 14px 52px 14px 16px;
        font-size: 16px;
      }

      .send-button {
        width: 36px;
        height: 36px;
        font-size: 14px;
      }
    }

    /* Scrollbar personalizado */
    .sidebar-content::-webkit-scrollbar,
    .chat-area::-webkit-scrollbar {
      width: 8px;
    }

    .sidebar-content::-webkit-scrollbar-track,
    .chat-area::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-content::-webkit-scrollbar-thumb,
    .chat-area::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #4a4b53 0%, #565869 100%);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }

    .sidebar-content::-webkit-scrollbar-thumb:hover,
    .chat-area::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #565869 0%, #6b7280 100%);
    }

    /* Animaciones adicionales */
    .icon {
      transition: transform 0.2s ease;
    }

    .btn-new-chat:hover .icon,
    .btn-back:hover .icon {
      transform: scale(1.1);
    }

    /* Efectos de hover mejorados */
    .chat-item:hover .chat-title {
      color: #ffffff;
    }

    .message:hover .message-text {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class AsistenteIaPageComponent implements OnInit, OnDestroy {
  mensajeUsuario = '';
  mensajes: ChatMessage[] = [];
  cargando = false;
  sessionActual: ChatSession | null = null;
  chatSessions: ChatSession[] = [];
  sidebarOpen = false;
  firebaseConnected = false;
  private subscription = new Subscription();

  constructor(
    private asistenteIaService: AsistenteIaService,
    private chatHistoryService: ChatHistoryService,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('🤖 Asistente IA Page Component inicializado');
    
    // Verificar conexión con Firebase
    this.verificarConexionFirebase();
    
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

    // Suscribirse a las sesiones de chat
    this.subscription.add(
      this.chatHistoryService.chatSessions$.subscribe(sessions => {
        this.chatSessions = sessions;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async verificarConexionFirebase() {
    try {
      await this.firebaseService.testConnection();
      this.firebaseConnected = true;
      console.log('✅ Conexión con Firebase exitosa');
    } catch (error) {
      this.firebaseConnected = false;
      console.error('❌ Error de conexión con Firebase:', error);
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  volverAlSistema() {
    this.router.navigate(['/dashboard']);
  }

  async crearNuevaConversacion() {
    try {
      const sessionId = await this.chatHistoryService.createNewChatSession();
      const nuevaSession = await this.chatHistoryService.loadChatSession(sessionId);
      if (nuevaSession) {
        this.chatHistoryService.setCurrentSession(nuevaSession);
        this.generarMensajeBienvenida();
      }
      this.toggleSidebar();
    } catch (error) {
      console.error('Error al crear nueva conversación:', error);
    }
  }

  async cargarConversacion(session: ChatSession) {
    try {
      await this.chatHistoryService.loadChatSession(session.id!);
      this.toggleSidebar();
    } catch (error) {
      console.error('Error al cargar conversación:', error);
    }
  }

  async eliminarConversacion(sessionId: string, event: Event) {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      try {
        await this.chatHistoryService.deleteChatSession(sessionId);
      } catch (error) {
        console.error('Error al eliminar conversación:', error);
      }
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
    try {
      // Verificar conexión con Firebase antes de procesar
      if (!this.firebaseConnected) {
        await this.verificarConexionFirebase();
      }

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
            texto: `
              <strong>❌ Error de Conexión</strong><br><br>
              No pude conectarme con la base de datos para obtener información actualizada.<br><br>
              <strong>Estado de conexión:</strong><br>
              • Firebase: ${this.firebaseConnected ? '✅ Conectado' : '❌ Desconectado'}<br><br>
              <strong>💡 Soluciones:</strong><br>
              • Verifica tu conexión a internet<br>
              • Intenta recargar la página<br>
              • Contacta al administrador del sistema<br><br>
              <strong>Mensaje original:</strong> "${mensaje}"
            `,
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
    } catch (error) {
      console.error('Error en procesarMensajeIA:', error);
      const mensajeError: ChatMessage = {
        autor: 'ia',
        texto: 'Lo siento, hubo un error interno. Por favor, intenta de nuevo.',
        timestamp: new Date()
      };
      
      this.mensajes.push(mensajeError);
      this.cargando = false;
    }
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

  onKeyDown(event: KeyboardEvent) {
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
        • Chat inteligente<br><br>
        <strong>🎯 ¡Escribe tu pregunta y te ayudaré!</strong>
      `,
      timestamp: new Date()
    };
    
    this.mensajes.push(mensajeBienvenida);
    
    // Guardar mensaje de bienvenida en Firebase si hay sesión actual
    if (this.sessionActual) {
      await this.chatHistoryService.addMessageToSession(this.sessionActual.id!, mensajeBienvenida);
    }
  }

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) {
      return 'Hoy';
    } else if (diffDias === 1) {
      return 'Ayer';
    } else if (diffDias < 7) {
      return `Hace ${diffDias} días`;
    } else {
      return fecha.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }
} 