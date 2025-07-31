import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatHistoryService } from '../../../core/services/chat-history.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { ChatSession } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-sidebar" [class.abierta]="sidebarAbierta">
      <!-- Header de la sidebar -->
      <div class="sidebar-header">
        <h3>💬 Historial de Chats</h3>
        <button class="btn-cerrar" (click)="toggleSidebar()" title="Cerrar sidebar">
          ✕
        </button>
      </div>

      <!-- Botón para nueva conversación -->
      <div class="nueva-conversacion">
        <button class="btn-nueva-chat" (click)="crearNuevaConversacion()">
          <span class="icon">➕</span>
          Nueva conversación
        </button>
      </div>

      <!-- Lista de conversaciones -->
      <div class="conversaciones-lista">
        <div *ngIf="cargando" class="cargando">
          <div class="spinner">⏳</div>
          <p>Cargando conversaciones...</p>
        </div>

        <div *ngIf="!cargando && chatSessions.length === 0" class="sin-conversaciones">
          <div class="icon">💬</div>
          <p>No hay conversaciones</p>
          <small>Crea tu primera conversación</small>
        </div>

        <div *ngFor="let session of chatSessions" 
             class="conversacion-item"
             [class.activa]="session.id === sessionActual?.id"
             (click)="cargarConversacion(session)">
          
          <div class="conversacion-info">
            <div class="conversacion-titulo">
              <span class="icon">🤖</span>
              <span class="titulo">{{ session.titulo }}</span>
            </div>
            <div class="conversacion-meta">
              <span class="fecha">{{ formatearFecha(session.fechaUltimaActividad) }}</span>
              <span class="mensajes">{{ session.mensajes?.length || 0 }} mensajes</span>
            </div>
          </div>

          <div class="conversacion-acciones">
            <button class="btn-accion" 
                    (click)="editarTitulo(session, $event)" 
                    title="Editar título">
              ✏️
            </button>
            <button class="btn-accion" 
                    (click)="eliminarConversacion(session.id!, $event)" 
                    title="Eliminar conversación">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Footer de la sidebar -->
      <div class="sidebar-footer">
        <div class="usuario-info">
          <span class="icon">👤</span>
          <span class="email">{{ usuarioEmail }}</span>
        </div>
        <button class="btn-limpiar" (click)="limpiarHistorial()" title="Limpiar historial">
          🧹 Limpiar
        </button>
      </div>
    </div>

    <!-- Overlay para cerrar sidebar en móviles -->
    <div class="sidebar-overlay" 
         [class.activo]="sidebarAbierta" 
         (click)="toggleSidebar()"></div>
  `,
  styles: [`
    .chat-sidebar {
      position: fixed;
      top: 0;
      left: -350px;
      width: 350px;
      height: 100vh;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      z-index: 1000;
      transition: left 0.3s ease;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    }

    .chat-sidebar.abierta {
      left: 0;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-primary);
    }

    .sidebar-header h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: 18px;
      font-weight: 600;
    }

    .btn-cerrar {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 18px;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .btn-cerrar:hover {
      background: var(--bg-hover);
    }

    .nueva-conversacion {
      padding: 15px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .btn-nueva-chat {
      width: 100%;
      padding: 12px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }

    .btn-nueva-chat:hover {
      background: var(--primary-hover);
    }

    .conversaciones-lista {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;
    }

    .cargando, .sin-conversaciones {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: var(--text-secondary);
      text-align: center;
    }

    .spinner {
      font-size: 24px;
      margin-bottom: 10px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .conversacion-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid var(--border-color);
    }

    .conversacion-item:hover {
      background: var(--bg-hover);
    }

    .conversacion-item.activa {
      background: var(--primary-color);
      color: white;
    }

    .conversacion-item.activa .conversacion-meta {
      color: rgba(255,255,255,0.8);
    }

    .conversacion-info {
      flex: 1;
      min-width: 0;
    }

    .conversacion-titulo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .conversacion-titulo .titulo {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .conversacion-meta {
      display: flex;
      gap: 10px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .conversacion-acciones {
      display: flex;
      gap: 5px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .conversacion-item:hover .conversacion-acciones,
    .conversacion-item.activa .conversacion-acciones {
      opacity: 1;
    }

    .btn-accion {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 14px;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .btn-accion:hover {
      background: var(--bg-hover);
    }

    .conversacion-item.activa .btn-accion {
      color: rgba(255,255,255,0.8);
    }

    .sidebar-footer {
      padding: 15px 20px;
      border-top: 1px solid var(--border-color);
      background: var(--bg-primary);
    }

    .usuario-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .usuario-info .email {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-limpiar {
      width: 100%;
      padding: 8px 12px;
      background: var(--danger-color);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s;
    }

    .btn-limpiar:hover {
      background: var(--danger-hover);
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .sidebar-overlay.activo {
      opacity: 1;
      visibility: visible;
    }

    @media (max-width: 768px) {
      .chat-sidebar {
        width: 100vw;
        left: -100vw;
      }
    }
  `]
})
export class ChatSidebarComponent implements OnInit, OnDestroy {
  sidebarAbierta = false;
  chatSessions: ChatSession[] = [];
  sessionActual: ChatSession | null = null;
  cargando = true;
  usuarioEmail = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private chatHistoryService: ChatHistoryService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.chatHistoryService.chatSessions$.subscribe(sessions => {
        this.chatSessions = sessions;
        this.cargando = false;
      }),
      this.chatHistoryService.currentSession$.subscribe(session => {
        this.sessionActual = session;
      }),
      this.sidebarService.sidebarAbierta$.subscribe(abierta => {
        this.sidebarAbierta = abierta;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  async crearNuevaConversacion() {
    try {
      const sessionId = await this.chatHistoryService.createNewChatSession();
      const nuevaSession = await this.chatHistoryService.loadChatSession(sessionId);
      if (nuevaSession) {
        this.chatHistoryService.setCurrentSession(nuevaSession);
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

  async editarTitulo(session: ChatSession, event: Event) {
    event.stopPropagation();
    const nuevoTitulo = prompt('Nuevo título para la conversación:', session.titulo);
    if (nuevoTitulo && nuevoTitulo.trim() !== session.titulo) {
      try {
        await this.chatHistoryService.updateSessionTitle(session.id!, nuevoTitulo.trim());
      } catch (error) {
        console.error('Error al actualizar título:', error);
      }
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

  async limpiarHistorial() {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial de conversaciones?')) {
      try {
        for (const session of this.chatSessions) {
          await this.chatHistoryService.deleteChatSession(session.id!);
        }
      } catch (error) {
        console.error('Error al limpiar historial:', error);
      }
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