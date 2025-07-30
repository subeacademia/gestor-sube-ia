// ===== MODELOS PRINCIPALES =====

export interface Cotizacion {
  id?: string;
  codigo: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  valor: number;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'enviada' | 'firmada';
  atendido: boolean;
  fecha: Date;
  servicios: Servicio[];
  notas?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface Contrato {
  id?: string;
  codigo: string;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  valor: number;
  estado: 'pendiente_firma_interna' | 'pendiente_firma_cliente' | 'firmado_cliente' | 'finalizado' | 'cancelado';
  fechaCreacionContrato: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  servicios: Servicio[];
  notas?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  historialEstados?: HistorialEstado[];
  fechaFirmaRepresentante?: Date;
  fechaFirmaCliente?: Date;
  firmadoPorRepresentante?: boolean;
  firmadoPorCliente?: boolean;
  [key: string]: unknown;
}

export interface Cliente {
  id?: string;
  empresa: string;
  rut: string;
  nombre: string;
  cargo?: string;
  email: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  notas?: string;
  valorTotalFacturado?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface Servicio {
  id?: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  [key: string]: unknown;
}

export interface HistorialEstado {
  estado: string;
  fecha: Date;
  comentario?: string;
  usuario?: string;
}

export interface Proyecto {
  id?: string;
  nombre: string;
  descripcion?: string;
  clienteId: string;
  clienteNombre: string;
  estado: 'planificacion' | 'en_progreso' | 'completado' | 'cancelado';
  fechaInicio?: Date;
  fechaFin?: Date;
  presupuesto?: number;
  notas?: string;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface Tarea {
  id?: string;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  fechaCreacion: Date;
  fechaCompletada?: Date;
  prioridad: 'baja' | 'media' | 'alta';
  asignado?: string;
}

// ===== MODELOS DE DASHBOARD =====

export interface EstadisticaDashboard {
  totalCotizaciones: number;
  cotizacionesPendientes: number;
  cotizacionesAprobadas: number;
  cotizacionesRechazadas: number;
  totalContratos: number;
  contratosPendientes: number;
  contratosFirmados: number;
  contratosFinalizados: number;
  valorTotalCotizaciones: number;
  valorTotalContratos: number;
  tasaConversion: number;
}

export interface RendimientoUsuario {
  usuario: string;
  cotizacionesCreadas: number;
  contratosGenerados: number;
  valorGenerado: number;
  tasaConversion: number;
}

export interface TendenciaVenta {
  mes: string;
  cotizaciones: number;
  contratos: number;
  valor: number;
}

export interface EmbudoVenta {
  etapa: string;
  cantidad: number;
  porcentaje: number;
}

// ===== MODELOS DE EMAIL =====

export interface EmailParams {
  to_email: string;
  to_name: string;
  from_name: string;
  message: string;
  subject: string;
  [key: string]: unknown;
}

export interface EmailResponse {
  status: number;
  text: string;
  [key: string]: unknown;
}

// ===== MODELOS DE FIRMA =====

export interface FirmaData {
  contratoId: string;
  firmante: 'representante' | 'cliente';
  fecha: Date;
  coordenadas?: {
    x: number;
    y: number;
  };
}

// ===== MODELOS DE NOTIFICACIONES =====

export interface Notificacion {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  mensaje: string;
  duracion?: number;
  fecha: Date;
}

// ===== MODELOS DE CONFIGURACION =====

export interface ConfiguracionApp {
  tema: 'dark' | 'light';
  idioma: string;
  zonaHoraria: string;
  [key: string]: unknown;
}

// ===== TIPOS UTILITARIOS =====

export type EstadoCotizacion = Cotizacion['estado'];
export type EstadoContrato = Contrato['estado'];
export type EstadoProyecto = Proyecto['estado'];
export type PrioridadTarea = Tarea['prioridad'];
export type TipoFirmante = FirmaData['firmante'];
export type TipoNotificacion = Notificacion['tipo'];
export type TemaApp = ConfiguracionApp['tema'];

// ===== INTERFACES PARA SERVICIOS EXTERNOS =====

export interface SignaturePad {
  clear(): void;
  isEmpty(): boolean;
  toDataURL(): string;
  fromDataURL(dataURL: string): void;
  onBegin(): void;
  onEnd(): void;
}

export interface Html2Pdf {
  from(element: HTMLElement): Html2PdfInstance;
  set(options: Html2PdfOptions): Html2PdfInstance;
  save(): Promise<void>;
}

export interface Html2PdfInstance {
  set(options: Html2PdfOptions): Html2PdfInstance;
  save(): Promise<void>;
}

export interface Html2PdfOptions {
  margin?: number | [number, number, number, number];
  filename?: string;
  image?: { type?: string; quality?: number };
  html2canvas?: { scale?: number; useCORS?: boolean };
  jsPDF?: { unit?: string; format?: string; orientation?: string };
}

export interface EmailJS {
  init(publicKey: string): void;
  send(serviceId: string, templateId: string, templateParams: EmailParams): Promise<EmailResponse>;
  version?: string;
}

// ===== DECLARACIONES GLOBALES =====

declare global {
  interface Window {
    SignaturePad: any;
    html2pdf: Html2Pdf;
    emailjs: EmailJS;
  }
} 