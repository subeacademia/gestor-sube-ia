import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../core/services/firebase.service';
import { FormsModule } from '@angular/forms';

declare var emailjs: any;

@Component({
  selector: 'app-enviar-firma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enviar-firma.component.html',
  styleUrls: ['./enviar-firma.component.scss']
})
export class EnviarFirmaComponent implements OnInit {
  // Variables del componente
  contrato: any = null;
  loading = true;
  error = false;
  errorMessage = '';
  
  // Variables del formulario
  emailCliente = '';
  asuntoEmail = '';
  mensajeEmail = '';
  
  // Variables del link
  linkFirmaGenerado: string | null = null;
  linkGenerado = false;
  
  // Variables de estado
  emailEnviado = false;
  enviandoEmail = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    console.log('🚀 EnviarFirmaComponent: Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('🔧 EnviarFirmaComponent: ngOnInit ejecutado');
    this.inicializarEmailJS();
    this.cargarContrato();
  }

  async cargarContrato(): Promise<void> {
    try {
      this.loading = true;
      this.error = false;

      // Obtener ID del contrato desde los parámetros de la ruta
      const contratoId = this.route.snapshot.paramMap.get('id');
      
      if (!contratoId) {
        throw new Error('No se proporcionó ID de contrato');
      }

      console.log('📋 Cargando contrato para envío:', contratoId);

      // Obtener contrato específico
      this.contrato = await this.firebaseService.getContratoById(contratoId);

      // Llenar formulario con datos del cliente
      this.llenarFormularioCliente();

    } catch (error: any) {
      console.error('❌ Error al cargar contrato:', error);
      this.error = true;
      this.errorMessage = error.message || 'Error al cargar el contrato';
    } finally {
      this.loading = false;
    }
  }

  llenarFormularioCliente(): void {
    if (!this.contrato || !this.contrato.cliente) return;

    // Llenar email del cliente
    this.emailCliente = this.contrato.cliente.email || this.contrato.emailCliente || '';

    // Llenar asunto del email
    this.asuntoEmail = `Firma de Contrato - ${this.contrato.codigoCotizacion || this.contrato.codigo || 'SUBE IA'}`;

    // Llenar mensaje personalizado
    const mensajePersonalizado = `Estimado ${this.contrato.cliente.nombre || this.contrato.nombreCliente || 'cliente'},

Adjunto encontrará el link para firmar su contrato de manera digital y segura.

Por favor, haga clic en el enlace de abajo para acceder al sistema de firma:

[LINK DE FIRMA]

Una vez completada la firma, recibirá una copia del contrato firmado en su email.

Saludos cordiales,
Equipo SUBE IA`;

    this.mensajeEmail = mensajePersonalizado;
  }

  inicializarEmailJS(): void {
    try {
      console.log('🔧 Iniciando inicialización de EmailJS...');
      
      // Verificar si EmailJS está disponible
      if (typeof emailjs === 'undefined') {
        console.warn('⚠️ EmailJS no está cargado, cargando dinámicamente...');
        this.cargarEmailJS();
        return;
      }
      
      console.log('📧 EmailJS detectado, verificando versión...');
      console.log('📧 EmailJS version:', emailjs.version || 'No disponible');
      
      // Inicializar EmailJS con las credenciales proporcionadas
      console.log('🔑 Inicializando EmailJS con clave pública: jlnRLQBCJ1JiBM2bJ');
      emailjs.init('jlnRLQBCJ1JiBM2bJ');
      console.log('✅ EmailJS inicializado correctamente');
      
      // Verificar que la inicialización fue exitosa
      if (emailjs && typeof emailjs.send === 'function') {
        console.log('✅ EmailJS está inicializado y listo para enviar');
        console.log('✅ Función emailjs.send disponible');
      } else {
        console.warn('⚠️ EmailJS no se inicializó correctamente');
        console.warn('⚠️ emailjs.send no está disponible');
      }
      
    } catch (error: any) {
      console.error('❌ Error al inicializar EmailJS:', error);
      console.error('❌ Detalles del error:', error.message);
    }
  }

  cargarEmailJS(): void {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      console.log('✅ EmailJS cargado dinámicamente');
      setTimeout(() => {
        this.inicializarEmailJS();
      }, 100);
    };
    script.onerror = () => {
      console.error('❌ Error al cargar EmailJS');
      this.mostrarNotificacion('Error al cargar EmailJS. El envío de emails no estará disponible.', 'error');
    };
    document.head.appendChild(script);
  }

  async generarLinkFirma(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    try {
      console.log('🔗 Generando link de firma...');

      // Generar token único para el link
      const tokenFirma = await this.firebaseService.generarTokenFirma(this.contrato.id);

      // Generar URL del link
      const baseUrl = window.location.origin;
      const linkCompleto = `${baseUrl}/firmar-cliente/${this.contrato.id}/${tokenFirma}`;

      this.linkFirmaGenerado = linkCompleto;
      this.linkGenerado = true;

      console.log('✅ Link de firma generado:', linkCompleto);
      this.mostrarNotificacion('Link de firma generado exitosamente', 'success');

    } catch (error: any) {
      console.error('❌ Error al generar link de firma:', error);
      this.mostrarNotificacion('Error al generar el link de firma: ' + error.message, 'error');
    }
  }

  async enviarEmailFirma(): Promise<void> {
    if (!this.contrato) {
      this.mostrarNotificacion('Error: No hay contrato cargado', 'error');
      return;
    }

    if (!this.linkFirmaGenerado) {
      this.mostrarNotificacion('Error: Debe generar el link de firma primero', 'error');
      return;
    }

    const email = this.emailCliente.trim();
    const asunto = this.asuntoEmail.trim();
    const mensaje = this.mensajeEmail.trim();

    if (!email) {
      this.mostrarNotificacion('Error: Debe ingresar el email del cliente', 'error');
      return;
    }

    if (!asunto) {
      this.mostrarNotificacion('Error: Debe ingresar el asunto del email', 'error');
      return;
    }

    if (!mensaje) {
      this.mostrarNotificacion('Error: Debe ingresar el mensaje del email', 'error');
      return;
    }

    try {
      this.enviandoEmail = true;
      console.log('📧 Enviando email con EmailJS...');

      // Verificar que EmailJS esté disponible
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS no está disponible');
      }

      // Verificar que EmailJS esté inicializado
      if (!emailjs || typeof emailjs.send !== 'function') {
        console.log('🔄 Reinicializando EmailJS...');
        emailjs.init('jlnRLQBCJ1JiBM2bJ');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('🔄 EmailJS reinicializado');
      }

      // Preparar parámetros del template
      const templateParams = {
        to_email: email,
        to_name: this.contrato.cliente?.nombre || this.contrato.nombreCliente || 'Cliente',
        subject: asunto,
        message: mensaje.replace('[LINK DE FIRMA]', this.linkFirmaGenerado),
        contract_code: this.contrato.codigoCotizacion || this.contrato.codigo || 'Sin código',
        contract_title: this.contrato.tituloContrato || this.contrato.titulo || 'Sin título',
        company_name: this.contrato.cliente?.empresa || this.contrato.empresa || 'Sin empresa',
        signature_link: this.linkFirmaGenerado
      };

      console.log('📋 Parámetros del email:', templateParams);
      console.log('🔑 Service ID: service_d0m6iqn');
      console.log('🔑 Template ID: template_im18rqj');

      // Enviar email usando EmailJS
      const response = await emailjs.send(
        'service_d0m6iqn',
        'template_im18rqj',
        templateParams
      );

      console.log('✅ Email enviado exitosamente:', response);

      // Guardar registro del envío
      await this.firebaseService.registrarEnvioEmail(
        this.contrato.id,
        email,
        asunto,
        mensaje,
        this.linkFirmaGenerado
      );

      // Mostrar notificación de éxito
      this.mostrarNotificacion('Email enviado exitosamente al cliente', 'success');
      this.emailEnviado = true;

    } catch (error: any) {
      console.error('❌ Error al enviar email con EmailJS:', error);
      
      // Mostrar error más específico
      let errorMessage = 'Error al enviar email';
      if (error.status === 404) {
        errorMessage = 'Error: Cuenta de EmailJS no encontrada. Verifica las credenciales.';
      } else if (error.status === 400) {
        errorMessage = 'Error: Parámetros incorrectos en el template de EmailJS.';
      } else if (error.text) {
        errorMessage = `Error: ${error.text}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      this.mostrarNotificacion(errorMessage, 'error');
      
      // Ofrecer método de fallback
      console.log('🔄 Ofreciendo método de fallback...');
      const usarFallback = confirm(`
        EmailJS no está funcionando. 
        
        ¿Deseas usar el método de envío manual?
        
        Esto abrirá tu cliente de email con el mensaje pre-rellenado.
      `);
      
      if (usarFallback) {
        await this.enviarEmailFallback(email, asunto, mensaje);
      }
    } finally {
      this.enviandoEmail = false;
    }
  }

  async enviarEmailFallback(email: string, asunto: string, mensaje: string): Promise<void> {
    try {
      console.log('📧 Usando método de fallback para envío de email...');

      // Crear un enlace mailto como fallback
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;

      // Mostrar instrucciones al usuario
      const instrucciones = `
        EmailJS no está funcionando. Para enviar el email manualmente:
        
        1. Se abrirá tu cliente de email predeterminado
        2. El email estará pre-rellenado con:
           - Para: ${email}
           - Asunto: ${asunto}
           - Mensaje: ${mensaje}
        
        3. Solo necesitas hacer clic en "Enviar"
        
        ¿Deseas continuar?
      `;

      if (confirm(instrucciones)) {
        // Abrir el cliente de email
        window.open(mailtoLink, '_blank');

        // Guardar registro del envío manual
        await this.firebaseService.registrarEnvioEmail(
          this.contrato.id,
          email,
          asunto,
          mensaje + ' (Enviado manualmente)',
          this.linkFirmaGenerado || ''
        );

        this.mostrarNotificacion('Cliente de email abierto. Por favor, envía el email manualmente.', 'success');
        this.emailEnviado = true;
      }

    } catch (error: any) {
      console.error('❌ Error en método de fallback:', error);
      this.mostrarNotificacion('Error en método de fallback: ' + error.message, 'error');
    }
  }

  copiarLink(): void {
    if (!this.linkFirmaGenerado) {
      this.mostrarNotificacion('Error: No hay link generado para copiar', 'error');
      return;
    }

    try {
      // Usar la API moderna de clipboard
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(this.linkFirmaGenerado).then(() => {
          this.mostrarNotificacion('Link copiado al portapapeles', 'success');
        });
      } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = this.linkFirmaGenerado;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          this.mostrarNotificacion('Link copiado al portapapeles', 'success');
        } catch (err) {
          console.error('Error al copiar:', err);
          this.mostrarNotificacion('Error al copiar el link', 'error');
        }

        document.body.removeChild(textArea);
      }
    } catch (error: any) {
      console.error('❌ Error al copiar link:', error);
      this.mostrarNotificacion('Error al copiar el link: ' + error.message, 'error');
    }
  }

  volverContratos(): void {
    this.router.navigate(['/contratos']);
  }

  // Función para mostrar notificaciones
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    console.log(`🔔 Notificación [${tipo}]:`, mensaje);
    
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
      <div class="notificacion-contenido">
        <span class="notificacion-icono">${tipo === 'success' ? '✅' : '❌'}</span>
        <span class="notificacion-mensaje">${mensaje}</span>
        <button class="notificacion-cerrar" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    // Agregar estilos
    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Animación de entrada
    setTimeout(() => {
      notificacion.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      notificacion.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notificacion.parentElement) {
          notificacion.remove();
        }
      }, 300);
    }, 5000);
  }

  // Función para formatear fechas
  formatearFecha(fecha: any): string {
    if (!fecha) return 'Fecha no disponible';
    
    let fechaObj: Date;
    
    // Si es un timestamp de Firestore
    if (fecha && typeof fecha === 'object' && fecha.toDate) {
      fechaObj = fecha.toDate();
    }
    // Si es una fecha válida
    else if (fecha instanceof Date) {
      fechaObj = fecha;
    }
    // Si es un string o número, intentar crear Date
    else {
      fechaObj = new Date(fecha);
    }
    
    // Verificar que la fecha sea válida
    if (isNaN(fechaObj.getTime())) {
      return 'Fecha no disponible';
    }
    
    return fechaObj.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 