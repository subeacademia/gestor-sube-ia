export interface ContractData {
  tituloContrato?: string;
  codigoCotizacion?: string;
  estadoContrato?: string;
  fechaCreacionContrato?: any;
  atendido?: string;
  fechaInicio?: any;
  fechaFin?: any;
  cliente?: {
    nombre?: string;
    email?: string;
    rut?: string;
    empresa?: string;
  };
  totalConDescuento?: number;
  total?: number;
  descuento?: number;
  descripcionServicios?: string;
  terminosCondiciones?: string;
  firmaInternaBase64?: string;
  firmaRepresentanteBase64?: string;
  firmaClienteBase64?: string;
  representanteLegal?: string;
  fechaFirmaRepresentante?: any;
  fechaFirmaCliente?: any;
  partesInvolucradas?: string;
  objetoContrato?: string;
  clausulas?: string;
  [key: string]: any;
}

export interface InvoiceData {
  nombre?: string;
  email?: string;
  rut?: string;
  empresa?: string;
  moneda?: string;
  codigo?: string;
  fecha?: any;
  serviciosData?: any[];
  total?: number;
  atendedor?: string;
  notasAdicionales?: string;
  descuento?: number;
  [key: string]: any;
}

export function renderContract(contratoData: ContractData): string;
export function renderInvoice(invoiceData: InvoiceData): string;

declare module '*/contract-template.js' {
  export function renderContract(data: any): string;
}

export {}; 