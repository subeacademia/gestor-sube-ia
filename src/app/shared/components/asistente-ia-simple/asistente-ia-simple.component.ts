import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenteIaService } from '../../../core/services/asistente-ia.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asistente-ia-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `


    <!-- Botón flotante del asistente original -->
    <div class="asistente-boton" (click)="toggleChat()" [class.activo]="chatAbierto" style="position: fixed; bottom: 30px; right: 30px; z-index: 99999; background: red; color: white; padding: 20px; border-radius: 10px; cursor: pointer;">
      <div class="boton-icono">
        <span *ngIf="!chatAbierto">🤖</span>
        <span *ngIf="chatAbierto">✕</span>
      </div>
      <div class="boton-texto" *ngIf="!chatAbierto">
        <span>Asistente IA</span>
        <small>Consultor de Negocio</small>
      </div>
    </div>

    <!-- Ventana del asistente -->
    <div class="asistente-ventana" [class.abierta]="chatAbierto">
      <!-- Header del asistente -->
      <div class="asistente-header">
        <div class="header-info">
          <div class="avatar">
            <span>🤖</span>
          </div>
          <div class="info">
            <h3>Asistente IA SUBE TECH</h3>
            <p>Consultor de Negocio Inteligente</p>
          </div>
        </div>
        <div class="header-acciones">
          <button class="btn-accion" (click)="limpiarChat()" title="Limpiar chat">
            🗑️
          </button>
          <button class="btn-accion" (click)="toggleChat()" title="Cerrar">
            ✕
          </button>
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
                <div class="mensaje-texto-contenido">{{ mensaje.texto }}</div>
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
        <div class="input-container">
          <textarea #inputMensaje
                    [(ngModel)]="mensajeUsuario"
                    (keypress)="onKeyPress($event)"
                    placeholder="Escribe tu pregunta o solicita un análisis..."
                    rows="1"
                    class="input-mensaje"></textarea>
          <button class="btn-enviar" 
                  (click)="enviarMensaje()" 
                  [disabled]="!mensajeUsuario.trim()">
            ➤
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
    /* Botón flotante del asistente */
    .asistente-boton {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: white;
      font-weight: 600;
      min-width: 200px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .asistente-boton:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    .asistente-boton {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      50% {
        box-shadow: 0 20px 40px rgba(99, 102, 241, 0.5);
      }
      100% {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
    }

    .asistente-boton.activo {
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
      width: 450px;
      height: 600px;
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

    /* Header */
    .asistente-header {
      padding: 20px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
      background: #6366f1;
      color: white;
    }

    .mensaje-ia .mensaje-avatar {
      background: #8b5cf6;
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
      background: #6366f1;
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
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .input-mensaje::placeholder {
      color: #9ca3af;
    }

    .btn-enviar {
      width: 36px;
      height: 36px;
      border: none;
      background: #6366f1;
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
      background: #8b5cf6;
      transform: scale(1.1);
    }

    .btn-enviar:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

      .asistente-boton {
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
export class AsistenteIaSimpleComponent implements OnInit, OnDestroy {
  chatAbierto = false;
  mensajeUsuario = '';
  mensajes: { autor: 'usuario' | 'ia', texto: string, timestamp: Date }[] = [];
  private subscription = new Subscription();

  constructor(private asistenteIaService: AsistenteIaService) {}

  ngOnInit() {
    console.log('🤖 Asistente IA Simple Component inicializado');
    console.log('🤖 Componente montado en el DOM');
    console.log('🤖 Z-index del botón: 99999');
    console.log('🤖 Posición: bottom: 30px, right: 30px');
    this.generarMensajeBienvenida();
    
    // Suscribirse al servicio de asistente IA
    this.subscription.add(
      this.asistenteIaService.asistenteAbierto$.subscribe(abierto => {
        console.log('🤖 Estado del asistente desde servicio:', abierto);
        this.chatAbierto = abierto;
      })
    );
    
    // Verificar que el botón esté en el DOM
    setTimeout(() => {
      const boton = document.querySelector('.asistente-boton');
      if (boton) {
        console.log('🤖 ✅ Botón encontrado en el DOM');
        console.log('🤖 Estilos del botón:', window.getComputedStyle(boton));
      } else {
        console.log('🤖 ❌ Botón NO encontrado en el DOM');
      }
    }, 1000);
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
      alert('🤖 ¡Botón del asistente IA clickeado! Chat abierto.');
    }
  }

  enviarMensaje() {
    if (!this.mensajeUsuario.trim()) return;

    const mensaje = this.mensajeUsuario;
    this.mensajes.push({
      autor: 'usuario',
      texto: mensaje,
      timestamp: new Date()
    });

    this.mensajeUsuario = '';

    // Simular respuesta de IA
    setTimeout(() => {
      this.mensajes.push({
        autor: 'ia',
        texto: `¡Hola! Soy tu asistente de IA para SUBE IA TECH. Recibí tu mensaje: "${mensaje}". 

Actualmente estoy en modo de prueba. Pronto tendré acceso completo a todos los datos del sistema para proporcionarte análisis detallados de tu negocio, recomendaciones estratégicas y optimizaciones.

¿En qué puedo ayudarte hoy?`,
        timestamp: new Date()
      });
    }, 1000);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  limpiarChat() {
    this.mensajes = [];
    this.generarMensajeBienvenida();
  }

  private generarMensajeBienvenida() {
    this.mensajes.push({
      autor: 'ia',
      texto: `¡Hola! Soy tu asistente de IA para SUBE IA TECH 🤖

Soy tu consultor de negocios personalizado y pronto tendré acceso completo a todos los datos de tu sistema. Podré ayudarte con:

📊 **Análisis de Negocio**: Ventas, productividad, costos
📈 **Estrategias de Crecimiento**: Oportunidades y recomendaciones
🎯 **Optimización**: Mejoras en procesos y eficiencia
💰 **Análisis Financiero**: Rentabilidad y costos

¿En qué área te gustaría que te ayude hoy?`,
      timestamp: new Date()
    });
  }
} 