import { Injectable } from '@angular/core';
import { collection, collectionData, Firestore, doc, updateDoc, deleteDoc, addDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  getCotizaciones(): Observable<any[]> {
    const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
    return collectionData(cotizacionesCollection, { idField: 'id' }) as Observable<any[]>;
  }

  // Métodos para contratos
  getContratos(): Observable<any[]> {
    const contratosCollection = collection(this.firestore, 'contratos');
    const q = query(contratosCollection, orderBy('fechaCreacionContrato', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  updateContrato(id: string, data: any): Promise<void> {
    const contratoRef = doc(this.firestore, 'contratos', id);
    return updateDoc(contratoRef, data);
  }

  deleteContrato(id: string): Promise<void> {
    const contratoRef = doc(this.firestore, 'contratos', id);
    return deleteDoc(contratoRef);
  }

  createContratoFromCotizacion(cotizacion: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Crear el objeto de contrato
        const contrato = {
          codigo: `CON-${Date.now()}`,
          titulo: `Contrato - ${cotizacion.servicios}`,
          fechaCreacionContrato: new Date(),
          fechaInicio: new Date(),
          fechaFin: null,
          valorTotal: cotizacion.total,
          nombreCliente: cotizacion.nombreCliente,
          emailCliente: cotizacion.email,
          rutCliente: cotizacion.rutCliente || '',
          empresa: cotizacion.empresa,
          servicios: cotizacion.servicios,
          descripcionServicios: cotizacion.descripcionServicios || cotizacion.servicios,
          terminosCondiciones: cotizacion.terminosCondiciones || 'Términos y condiciones estándar',
          estado: 'Pendiente de Firma',
          cotizacionOrigen: cotizacion.id,
          atendido: cotizacion.atendido,
          firmas: {
            cliente: false,
            representante: false
          },
          historialEstados: [
            {
              estado: 'Pendiente de Firma',
              fecha: new Date(),
              comentario: 'Contrato creado desde cotización'
            }
          ]
        };

        // Guardar el contrato
        const contratosCollection = collection(this.firestore, 'contratos');
        const docRef = await addDoc(contratosCollection, contrato);

        // Actualizar el estado de la cotización
        const cotizacionRef = doc(this.firestore, 'cotizaciones', cotizacion.id);
        await updateDoc(cotizacionRef, {
          estado: 'Contratada',
          contratoGenerado: docRef.id,
          fechaContratacion: new Date()
        });

        resolve({ id: docRef.id, ...contrato });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Método para actualizar cotización
  updateCotizacion(id: string, data: any): Promise<void> {
    const cotizacionRef = doc(this.firestore, 'cotizaciones', id);
    return updateDoc(cotizacionRef, data);
  }
}
