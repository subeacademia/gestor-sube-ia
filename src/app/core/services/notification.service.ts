import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  type?: 'success' | 'error' | 'warning' | 'info';
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
    this.showNotification(message, { ...options, type: 'success' });
  }

  showError(message: string, options: NotificationOptions = {}): void {
    this.showNotification(message, { ...options, type: 'error' });
  }

  showWarning(message: string, options: NotificationOptions = {}): void {
    this.showNotification(message, { ...options, type: 'warning' });
  }

  showInfo(message: string, options: NotificationOptions = {}): void {
    this.showNotification(message, { ...options, type: 'info' });
  }

  private showNotification(message: string, options: NotificationOptions = {}): void {
    const {
      duration = 5000,
      position = 'top-right',
      type = 'info'
    } = options;

    // Crear contenedor si no existe
    if (!this.notificationContainer) {
      this.createNotificationContainer(position);
    }

    // Crear notificación
    const notification = this.createNotificationElement(message, type);
    
    // Añadir al contenedor
    this.notificationContainer?.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      this.renderer.addClass(notification, 'show');
    }, 100);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
  }

  private createNotificationContainer(position: string): void {
    this.notificationContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.notificationContainer, 'notification-container');
    this.renderer.addClass(this.notificationContainer, `notification-${position}`);
    this.renderer.appendChild(document.body, this.notificationContainer);
  }

  private createNotificationElement(message: string, type: string): HTMLElement {
    const notification = this.renderer.createElement('div');
    this.renderer.addClass(notification, 'notification');
    this.renderer.addClass(notification, `notification-${type}`);

    // Icono según el tipo
    const icon = this.getIconForType(type);
    
    // Contenido
    const content = `
      <div class="notification-icon">
        <i class="${icon}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    this.renderer.setProperty(notification, 'innerHTML', content);

    // Añadir estilos inline para asegurar que se vean correctamente
    this.renderer.setStyle(notification, 'display', 'flex');
    this.renderer.setStyle(notification, 'align-items', 'center');
    this.renderer.setStyle(notification, 'padding', '16px 20px');
    this.renderer.setStyle(notification, 'margin-bottom', '12px');
    this.renderer.setStyle(notification, 'border-radius', '8px');
    this.renderer.setStyle(notification, 'box-shadow', '0 4px 12px rgba(0, 0, 0, 0.15)');
    this.renderer.setStyle(notification, 'background', 'white');
    this.renderer.setStyle(notification, 'border-left', '4px solid');
    this.renderer.setStyle(notification, 'min-width', '300px');
    this.renderer.setStyle(notification, 'max-width', '400px');
    this.renderer.setStyle(notification, 'transform', 'translateX(100%)');
    this.renderer.setStyle(notification, 'transition', 'transform 0.3s ease-in-out');
    this.renderer.setStyle(notification, 'z-index', '9999');

    // Colores según el tipo
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    this.renderer.setStyle(notification, 'border-left-color', colors[type as keyof typeof colors]);

    return notification;
  }

  private getIconForType(type: string): string {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type as keyof typeof icons] || 'fas fa-info-circle';
  }

  private removeNotification(notification: HTMLElement): void {
    this.renderer.removeClass(notification, 'show');
    this.renderer.setStyle(notification, 'transform', 'translateX(100%)');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // Método para limpiar todas las notificaciones
  clearAll(): void {
    if (this.notificationContainer) {
      this.renderer.removeChild(document.body, this.notificationContainer);
      this.notificationContainer = null;
    }
  }
} 