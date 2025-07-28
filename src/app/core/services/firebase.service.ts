import { Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
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

  // Aquí añadiremos los métodos para actualizar, eliminar, etc. en el futuro
}
