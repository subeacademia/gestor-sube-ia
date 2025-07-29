import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showCloseButton?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private renderer: Renderer2;
  private notificationContainer: HTMLElement | null = null;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  showSuccess(message: string, options: NotificationOptions = {}): void {
    this.showNotification(message, 'success', options);
  }

  showError(message: string, options: NotificationOptions = {}): void {
    this.showNotification(message, 'error', options);
  }

  showWarning(message: string, options: NotificationOptions = {}): void {
    this.showNotification(message, 'warning', options);
  }

  showInfo(message: string, options: NotificationOptions = {}): void {
    this.showNotification(message, 'info', options);
  }

  private showNotification(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info', 
    options: NotificationOptions = {}
  ): void {
    const {
      duration = 5000,
      position = 'top-right',
      showCloseButton = true
    } = options;

    // Crear contenedor si no existe
    this.createNotificationContainer(position);

    // Crear notificación
    const notification = this.createNotificationElement(message, type, showCloseButton);
    
    // Añadir al contenedor
    this.notificationContainer!.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
  }

  private createNotificationContainer(position: string): void {
    if (!this.notificationContainer) {
      this.notificationContainer = this.renderer.createElement('div');
      this.renderer.addClass(this.notificationContainer, 'notification-container');
      this.renderer.addClass(this.notificationContainer, `notification-${position.replace('-', '-')}`);
      this.renderer.appendChild(document.body, this.notificationContainer);
    }
  }

  private createNotificationElement(
    message: string, 
    type: string, 
    showCloseButton: boolean
  ): HTMLElement {
    const notification = this.renderer.createElement('div');
    this.renderer.addClass(notification, 'notification');
    this.renderer.addClass(notification, `notification-${type}`);

    // Icono según el tipo
    const icon = this.getIconForType(type);
    
    // Contenido de la notificación
    const content = `
      <div class="notification-content">
        <div class="notification-icon">${icon}</div>
        <div class="notification-message">${message}</div>
        ${showCloseButton ? '<button class="notification-close">&times;</button>' : ''}
      </div>
    `;

    notification.innerHTML = content;

    // Evento para cerrar manualmente
    if (showCloseButton) {
      const closeButton = notification.querySelector('.notification-close');
      if (closeButton) {
        this.renderer.listen(closeButton, 'click', () => {
          this.removeNotification(notification);
        });
      }
    }

    return notification;
  }

  private getIconForType(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }

  private removeNotification(notification: HTMLElement): void {
    notification.classList.remove('show');
    notification.classList.add('hiding');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // Método para limpiar todas las notificaciones
  clearAll(): void {
    if (this.notificationContainer) {
      this.notificationContainer.innerHTML = '';
    }
  }
} 