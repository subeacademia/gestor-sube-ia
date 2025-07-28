import { Injectable } from '@angular/core';
import { collection, doc, updateDoc, deleteDoc, addDoc, query, where, orderBy, setDoc, getDocs, onSnapshot, collectionData } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private firestore: Firestore) {
    console.log('🔧 FirebaseService: Constructor ejecutado');
    console.log('📊 Firestore instance:', this.firestore);
  }

  // Método de prueba para verificar conexión
  async testConnection(): Promise<void> {
    console.log('🧪 FirebaseService: Probando conexión...');
    try {
      const testCollection = collection(this.firestore, 'test');
      console.log('✅ FirebaseService: Conexión exitosa, collection creada');
    } catch (error) {
      console.error('❌ FirebaseService: Error de conexión:', error);
      throw error;
    }
  }

  // Método para verificar si la colección de cotizaciones existe
  async verificarColeccionCotizaciones(): Promise<void> {
    console.log('🔍 FirebaseService: Verificando colección de cotizaciones...');
    try {
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      const q = query(cotizacionesCollection);
      const snapshot = await getDocs(q);
      console.log('✅ FirebaseService: Colección encontrada, documentos:', snapshot.size);
      
      if (snapshot.size > 0) {
        snapshot.forEach(doc => {
          console.log('📄 Documento:', doc.id, doc.data());
        });
      } else {
        console.log('📭 FirebaseService: La colección está vacía');
      }
    } catch (error) {
      console.error('❌ FirebaseService: Error al verificar colección:', error);
      throw error;
    }
  }

  // Método para verificar si la colección de contratos existe
  async verificarColeccionContratos(): Promise<void> {
    console.log('🔍 FirebaseService: Verificando colección de contratos...');
    try {
      const contratosCollection = collection(this.firestore, 'contratos');
      const q = query(contratosCollection);
      const snapshot = await getDocs(q);
      console.log('✅ FirebaseService: Colección de contratos encontrada, documentos:', snapshot.size);
      
      if (snapshot.size > 0) {
        snapshot.forEach(doc => {
          console.log('📄 Contrato:', doc.id, doc.data());
        });
      } else {
        console.log('📭 FirebaseService: La colección de contratos está vacía');
      }
    } catch (error) {
      console.error('❌ FirebaseService: Error al verificar colección de contratos:', error);
      throw error;
    }
  }

  // Método para crear datos de prueba directamente
  async crearDatosPrueba(): Promise<void> {
    console.log('🧪 FirebaseService: Creando datos de prueba...');
    try {
      // Crear múltiples cotizaciones de prueba con diferentes estados
      const estados = ['Emitida', 'Contestada', 'En Negociación', 'Aceptada', 'Rechazada'];
      const atendidos = ['Rodrigo Carrillo', 'Bruno Villalobos', 'Mario Muñoz', 'Nicolás Valenzuela', 'Ignacio Villarroel'];
      const empresas = ['Empresa Test SPA', 'Corporación Demo', 'Startup Innovación', 'Consultora Avanzada', 'Tech Solutions'];
      
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      
      // Crear 21 cotizaciones de prueba
      for (let i = 0; i < 21; i++) {
        const cotizacionPrueba = {
          codigo: `SUBEIA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(i).padStart(4, '0')}`,
          nombre: `Cliente Test ${i + 1}`,
          email: `cliente${i + 1}@test.com`,
          rut: `${12345678 + i}-${9 + (i % 10)}`,
          empresa: empresas[i % empresas.length],
          moneda: 'CLP',
          servicios: [
            {
              nombre: `Servicio ${i + 1}`,
              detalle: `Descripción del servicio ${i + 1}`,
              modalidad: i % 2 === 0 ? 'Online' : 'Presencial',
              alumnos: 5 + (i % 10),
              tipoCobro: 'sesion',
              subtotal: 50000 + (i * 5000),
              detallesCobro: {
                sesiones: 2 + (i % 3),
                valorSesion: 25000 + (i * 1000)
              }
            }
          ],
          atendido: atendidos[i % atendidos.length],
          subtotal: 50000 + (i * 5000),
          descuento: 0,
          descuentoValor: 0,
          totalConDescuento: 50000 + (i * 5000),
          total: 50000 + (i * 5000),
          valor: 50000 + (i * 5000), // Campo adicional para compatibilidad
          valorTotal: 50000 + (i * 5000), // Campo adicional para compatibilidad
          notas: `Cotización de prueba ${i + 1} creada automáticamente`,
          estado: estados[i % estados.length],
          fechaTimestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Fechas diferentes
          fecha: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toLocaleDateString('es-CL'),
          fechaCreacion: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // Campo adicional para compatibilidad
        };

        await addDoc(cotizacionesCollection, cotizacionPrueba);
        console.log(`✅ FirebaseService: Cotización ${i + 1} creada con código: ${cotizacionPrueba.codigo}`);
      }

      // Crear contrato de prueba
      const contratoPrueba = {
        codigo: `CON-${Date.now()}`,
        titulo: 'Contrato de Prueba - Desarrollo Web',
        fechaCreacionContrato: new Date(),
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días
        valorTotal: 16500,
        nombreCliente: 'Cliente de Prueba',
        emailCliente: 'prueba@test.com',
        rutCliente: '12345678-9',
        empresa: 'Empresa de Prueba',
        servicios: 'Desarrollo Web, SEO',
        descripcionServicios: 'Desarrollo de sitio web corporativo con optimización SEO',
        terminosCondiciones: 'Términos y condiciones estándar para desarrollo web',
        estado: 'Pendiente de Firma',
        cotizacionOrigen: 'COT-PRUEBA',
        atendido: 'Rodrigo Carrillo',
        firmas: {
          cliente: false,
          representante: false
        },
        historialEstados: [
          {
            estado: 'Pendiente de Firma',
            fecha: new Date(),
            comentario: 'Contrato creado como prueba'
          }
        ]
      };

      // Guardar contrato
      const contratosCollection = collection(this.firestore, 'contratos');
      const contratoRef = await addDoc(contratosCollection, contratoPrueba);
      console.log('✅ FirebaseService: Contrato de prueba creado con ID:', contratoRef.id);

      console.log('✅ FirebaseService: Datos de prueba creados exitosamente');
    } catch (error) {
      console.error('❌ FirebaseService: Error al crear datos de prueba:', error);
      throw error;
    }
  }

  getCotizaciones(): Observable<any[]> {
    console.log('🔍 FirebaseService: Obteniendo cotizaciones...');
    try {
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      // Primero intentar sin ordenamiento para ver si hay datos
      const q = query(cotizacionesCollection);
      const observable = collectionData(q, { idField: 'id' }) as Observable<any[]>;
      
      // Añadir logging para debug
      observable.subscribe({
        next: (cotizaciones) => {
          console.log('✅ FirebaseService: Cotizaciones obtenidas:', cotizaciones);
          console.log('📊 Número de cotizaciones:', cotizaciones?.length || 0);
        },
        error: (error) => {
          console.error('❌ FirebaseService: Error al obtener cotizaciones:', error);
        }
      });
      
      return observable;
    } catch (error) {
      console.error('❌ FirebaseService: Error en getCotizaciones:', error);
      throw error;
    }
  }

  // Método alternativo sin ordenamiento
  getCotizacionesSimple(): Observable<any[]> {
    console.log('🔍 FirebaseService: Obteniendo cotizaciones (método simple)...');
    try {
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      const q = query(cotizacionesCollection);
      return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    } catch (error) {
      console.error('❌ FirebaseService: Error en getCotizacionesSimple:', error);
      throw error;
    }
  }

  // Método simple para obtener cotizaciones sin Observable
  async getCotizacionesAsync(): Promise<any[]> {
    console.log('🔍 FirebaseService: Obteniendo cotizaciones (método async)...');
    try {
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      
      // Crear query sin límites para obtener todas las cotizaciones
      const q = query(cotizacionesCollection);
      const snapshot = await getDocs(q);
      
      console.log('📊 FirebaseService: Snapshot obtenido, documentos:', snapshot.size);
      
      const cotizaciones = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 FirebaseService: Documento ID:', doc.id, 'Data:', data);
        return {
          id: doc.id,
          ...data,
          // Normalizar campos para compatibilidad
          nombreCliente: data['nombreCliente'] || data['nombre'],
          emailCliente: data['emailCliente'] || data['email'],
          valorTotal: data['valorTotal'] || data['total'],
          fechaCreacion: data['fechaCreacion'] || data['fechaTimestamp'] || data['fecha']
        } as any;
      });
      
      console.log('✅ FirebaseService: Cotizaciones procesadas:', cotizaciones.length);
      console.log('📋 FirebaseService: Estados encontrados:', [...new Set(cotizaciones.map(c => c['estado']))]);
      
      return cotizaciones;
    } catch (error) {
      console.error('❌ FirebaseService: Error en getCotizacionesAsync:', error);
      throw error;
    }
  }

  // Método para crear nueva cotización
  async createCotizacion(data: any): Promise<void> {
    try {
      // Añadir timestamp automático
      const cotizacionData = {
        ...data,
        fechaTimestamp: new Date(),
        fecha: new Date().toLocaleDateString('es-CL'),
        estado: 'Pendiente'
      };
      
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      await addDoc(cotizacionesCollection, cotizacionData);
    } catch (error) {
      console.error('Error al crear cotización:', error);
      throw new Error(`Error al guardar en la base de datos: ${error}`);
    }
  }

  // Métodos para contratos
  // getContratos(): Observable<any[]> {
  //   const contratosCollection = collection(this.firestore, 'contratos');
  //   const q = query(contratosCollection, orderBy('fechaCreacionContrato', 'desc'));
  //   return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  // }

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
        console.log('🔧 FirebaseService: Creando contrato desde cotización:', cotizacion);
        
        // Crear el objeto de contrato
        const contrato = {
          codigo: cotizacion.codigo || `CON-${Date.now()}`,
          titulo: cotizacion.titulo || `Contrato - ${cotizacion.servicios}`,
          fechaCreacionContrato: cotizacion.fechaCreacionContrato || new Date(),
          fechaInicio: cotizacion.fechaInicio || new Date(),
          fechaFin: cotizacion.fechaFin || null,
          valorTotal: cotizacion.valorTotal || 0,
          nombreCliente: cotizacion.nombreCliente || cotizacion.nombre,
          emailCliente: cotizacion.emailCliente || cotizacion.email,
          rutCliente: cotizacion.rutCliente || cotizacion.rut || '',
          empresa: cotizacion.empresa,
          servicios: cotizacion.servicios,
          descripcionServicios: cotizacion.descripcionServicios || cotizacion.servicios,
          terminosCondiciones: cotizacion.terminosCondiciones || 'Términos y condiciones estándar',
          estado: cotizacion.estado || 'Pendiente de Firma',
          cotizacionOrigen: cotizacion.cotizacionOrigen || cotizacion.id,
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

        console.log('📄 FirebaseService: Objeto de contrato preparado:', contrato);

        // Guardar el contrato
        const contratosCollection = collection(this.firestore, 'contratos');
        const docRef = await addDoc(contratosCollection, contrato);

        console.log('✅ FirebaseService: Contrato guardado con ID:', docRef.id);

        // Si hay una cotización de origen, actualizar su estado
        if (cotizacion.id) {
          try {
            const cotizacionRef = doc(this.firestore, 'cotizaciones', cotizacion.id);
            await updateDoc(cotizacionRef, {
              estado: 'Contratada',
              contratoGenerado: docRef.id,
              fechaContratacion: new Date()
            });
            console.log('✅ FirebaseService: Cotización actualizada');
          } catch (error) {
            console.warn('⚠️ FirebaseService: No se pudo actualizar la cotización:', error);
          }
        }

        resolve({ id: docRef.id, ...contrato });
      } catch (error) {
        console.error('❌ FirebaseService: Error al crear contrato:', error);
        reject(error);
      }
    });
  }

  // Método para actualizar cotización
  updateCotizacion(id: string, data: any): Promise<void> {
    const cotizacionRef = doc(this.firestore, 'cotizaciones', id);
    return updateDoc(cotizacionRef, data);
  }

  // Método para verificar las reglas de Firestore
  async verificarReglasFirestore(): Promise<void> {
    console.log('🔍 FirebaseService: Verificando reglas de Firestore...');
    try {
      // Intentar leer sin autenticación
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      const q = query(cotizacionesCollection);
      const snapshot = await getDocs(q);
      console.log('✅ FirebaseService: Reglas permiten lectura, documentos encontrados:', snapshot.size);
    } catch (error: any) {
      console.error('❌ FirebaseService: Error de reglas de Firestore:', error);
      if (error.code === 'permission-denied') {
        console.error('🚨 FirebaseService: Las reglas de Firestore están bloqueando el acceso');
        console.error('🚨 FirebaseService: Necesitas configurar las reglas para permitir lectura/escritura');
        alert('🚨 ERROR: Las reglas de Firestore están bloqueando el acceso. Verifica la configuración en Firebase Console.');
      } else {
        console.error('❌ FirebaseService: Otro error:', error.message);
      }
      throw error;
    }
  }

  // Método para verificar la configuración de Firebase
  async verificarConfiguracionFirebase(): Promise<void> {
    console.log('🔍 FirebaseService: Verificando configuración de Firebase...');
    try {
      // Verificar que Firestore esté inicializado
      if (!this.firestore) {
        throw new Error('Firestore no está inicializado');
      }
      console.log('✅ FirebaseService: Firestore está inicializado');

      // Verificar que podemos crear una colección
      const testCollection = collection(this.firestore, 'test');
      console.log('✅ FirebaseService: Podemos crear colecciones');

      // Verificar estado del proyecto
      await this.verificarEstadoProyecto();
      
      // Verificar reglas
      await this.verificarReglasFirestore();
      
      console.log('✅ FirebaseService: Configuración de Firebase completamente verificada');
      
    } catch (error) {
      console.error('❌ FirebaseService: Error en configuración de Firebase:', error);
      throw error;
    }
  }

  // Método para verificar el estado del proyecto de Firebase
  async verificarEstadoProyecto(): Promise<void> {
    console.log('🔍 FirebaseService: Verificando estado del proyecto Firebase...');
    try {
      // Verificar que el proyecto esté activo intentando una operación básica
      const testCollection = collection(this.firestore, 'test');
      const testDoc = doc(testCollection, 'test');
      
      // Intentar escribir un documento de prueba
      await setDoc(testDoc, {
        timestamp: new Date(),
        test: true
      });
      console.log('✅ FirebaseService: Proyecto activo - escritura exitosa');
      
      // Intentar leer el documento
      const docSnap = await getDocs(testCollection);
      console.log('✅ FirebaseService: Proyecto activo - lectura exitosa');
      
      // Limpiar el documento de prueba
      await deleteDoc(testDoc);
      console.log('✅ FirebaseService: Proyecto activo - eliminación exitosa');
      
    } catch (error: any) {
      console.error('❌ FirebaseService: Error en estado del proyecto:', error);
      if (error.code === 'permission-denied') {
        console.error('🚨 FirebaseService: Proyecto activo pero reglas bloquean acceso');
      } else if (error.code === 'not-found') {
        console.error('🚨 FirebaseService: Proyecto no encontrado o inactivo');
      } else {
        console.error('🚨 FirebaseService: Error desconocido:', error.message);
      }
      throw error;
    }
  }

  // Método de prueba directa para verificar conexión
  async pruebaConexionDirecta(): Promise<void> {
    console.log('🧪 FirebaseService: Prueba de conexión directa...');
    try {
      // Verificar que Firestore esté disponible
      if (!this.firestore) {
        throw new Error('Firestore no está inicializado');
      }
      console.log('✅ FirebaseService: Firestore está disponible');

      // Intentar crear una colección de prueba
      const testCollection = collection(this.firestore, 'test');
      console.log('✅ FirebaseService: Colección de prueba creada');

      // Intentar crear un documento de prueba
      const testDoc = doc(testCollection, 'test-doc');
      await setDoc(testDoc, {
        timestamp: new Date(),
        test: true,
        message: 'Prueba de conexión exitosa'
      });
      console.log('✅ FirebaseService: Documento de prueba creado');

      // Intentar leer el documento
      const docSnap = await getDocs(testCollection);
      console.log('✅ FirebaseService: Documento leído correctamente');

      // Limpiar el documento de prueba
      await deleteDoc(testDoc);
      console.log('✅ FirebaseService: Documento de prueba eliminado');

      console.log('🎉 FirebaseService: Prueba de conexión completada exitosamente');
    } catch (error) {
      console.error('❌ FirebaseService: Error en prueba de conexión directa:', error);
      throw error;
    }
  }

  // Método para verificar reglas de Firestore específicamente
  async verificarReglasEspecificas(): Promise<void> {
    console.log('🔍 FirebaseService: Verificando reglas de Firestore específicamente...');
    try {
      // Intentar acceder a la colección de cotizaciones
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      const q = query(cotizacionesCollection);
      const snapshot = await getDocs(q);
      console.log('✅ FirebaseService: Reglas permiten lectura de cotizaciones, documentos:', snapshot.size);
      
      // Intentar crear un documento de prueba en cotizaciones
      const testDoc = doc(cotizacionesCollection, 'test-' + Date.now());
      await setDoc(testDoc, {
        test: true,
        timestamp: new Date(),
        message: 'Prueba de escritura'
      });
      console.log('✅ FirebaseService: Reglas permiten escritura en cotizaciones');
      
      // Limpiar el documento de prueba
      await deleteDoc(testDoc);
      console.log('✅ FirebaseService: Reglas permiten eliminación en cotizaciones');
      
    } catch (error: any) {
      console.error('❌ FirebaseService: Error de reglas específicas:', error);
      if (error.code === 'permission-denied') {
        console.error('🚨 FirebaseService: Las reglas están bloqueando el acceso');
        console.error('🚨 FirebaseService: Código de error:', error.code);
        console.error('🚨 FirebaseService: Mensaje:', error.message);
        alert('🚨 ERROR: Las reglas de Firestore están bloqueando el acceso. Verifica la configuración en Firebase Console.');
      } else {
        console.error('❌ FirebaseService: Otro error:', error.message);
        alert('❌ Error de Firebase: ' + error.message);
      }
      throw error;
    }
  }

  // Método simple para obtener contratos sin Observable
  async getContratosAsync(): Promise<any[]> {
    console.log('🔍 FirebaseService: Obteniendo contratos (método async)...');
    try {
      const contratosCollection = collection(this.firestore, 'contratos');
      const q = query(contratosCollection);
      const snapshot = await getDocs(q);
      
      const contratos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ FirebaseService: Contratos obtenidos:', contratos.length);
      return contratos;
    } catch (error) {
      console.error('❌ FirebaseService: Error en getContratosAsync:', error);
      throw error;
    }
  }

  // Método para obtener contratos como Observable
  getContratos(): Observable<any[]> {
    console.log('📋 FirebaseService: Obteniendo contratos como Observable...');
    try {
      const contratosCollection = collection(this.firestore, 'contratos');
      const q = query(contratosCollection, orderBy('fechaCreacionContrato', 'desc'));
      return collectionData(q, { idField: 'id' });
    } catch (error) {
      console.error('❌ FirebaseService: Error al obtener contratos Observable:', error);
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
  }

  // ===== MÉTODOS PARA MANEJO DE FIRMAS =====

  // Método para obtener un contrato específico por ID
  async getContratoById(contratoId: string): Promise<any> {
    console.log('🔍 FirebaseService: Obteniendo contrato por ID:', contratoId);
    try {
      const contratos = await this.getContratosAsync();
      const contrato = contratos.find(c => c.id === contratoId);
      
      if (!contrato) {
        throw new Error('Contrato no encontrado');
      }
      
      console.log('✅ FirebaseService: Contrato encontrado:', contrato);
      return contrato;
    } catch (error) {
      console.error('❌ FirebaseService: Error al obtener contrato por ID:', error);
      throw error;
    }
  }

  // Método para actualizar firma del representante
  async actualizarFirmaRepresentante(contratoId: string, firmaBase64: string, representanteLegal: string): Promise<void> {
    console.log('✍️ FirebaseService: Actualizando firma del representante...');
    try {
      await this.updateContrato(contratoId, {
        firmaRepresentanteBase64: firmaBase64,
        representanteLegal: representanteLegal,
        fechaFirmaRepresentante: new Date(),
        estadoContrato: 'Firma Representante Completada'
      });
      console.log('✅ FirebaseService: Firma del representante actualizada');
    } catch (error) {
      console.error('❌ FirebaseService: Error al actualizar firma del representante:', error);
      throw error;
    }
  }

  // Método para actualizar firma del cliente
  async actualizarFirmaCliente(contratoId: string, firmaBase64: string): Promise<void> {
    console.log('✍️ FirebaseService: Actualizando firma del cliente...');
    try {
      // Verificar si ya tiene firma del representante
      const contrato = await this.getContratoById(contratoId);
      const tieneFirmaRepresentante = contrato.firmaRepresentanteBase64;

      // Determinar el estado final
      let estadoFinal = 'Firmado';
      if (tieneFirmaRepresentante) {
        estadoFinal = 'Finalizado'; // Ambas firmas completadas
      }

      await this.updateContrato(contratoId, {
        firmaClienteBase64: firmaBase64,
        fechaFirmaCliente: new Date(),
        estadoContrato: estadoFinal,
        fechaFirmaFinal: new Date(),
        contratoValido: true,
        esPreContrato: false,
        fechaCompletado: new Date(),
        ambasFirmasCompletadas: tieneFirmaRepresentante ? true : false
      });
      
      console.log('✅ FirebaseService: Firma del cliente actualizada');
      console.log(`📋 Estado actualizado a: ${estadoFinal}`);
    } catch (error) {
      console.error('❌ FirebaseService: Error al actualizar firma del cliente:', error);
      throw error;
    }
  }

  // Método para finalizar contrato
  async finalizarContrato(contratoId: string): Promise<void> {
    console.log('🎯 FirebaseService: Finalizando contrato...');
    try {
      await this.updateContrato(contratoId, {
        estadoContrato: 'Firmado',
        fechaFirmaFinal: new Date(),
        contratoValido: true,
        esPreContrato: false,
        fechaCompletado: new Date()
      });
      
      console.log('✅ FirebaseService: Contrato finalizado exitosamente');
    } catch (error) {
      console.error('❌ FirebaseService: Error al finalizar contrato:', error);
      throw error;
    }
  }

  // Método para generar token de firma
  async generarTokenFirma(contratoId: string): Promise<string> {
    console.log('🔗 FirebaseService: Generando token de firma...');
    try {
      const token = this.generarTokenUnico();
      
      await this.updateContrato(contratoId, {
        tokenFirma: token,
        fechaGeneracionToken: new Date(),
        linkFirmaActivo: true,
        estadoContrato: 'Enviado'
      });
      
      console.log('✅ FirebaseService: Token de firma generado:', token);
      return token;
    } catch (error) {
      console.error('❌ FirebaseService: Error al generar token de firma:', error);
      throw error;
    }
  }

  // Método para validar token de firma
  async validarTokenFirma(contratoId: string, token: string): Promise<boolean> {
    console.log('🔍 FirebaseService: Validando token de firma...');
    try {
      const contrato = await this.getContratoById(contratoId);
      
      if (contrato.tokenFirma !== token) {
        console.log('❌ FirebaseService: Token inválido');
        return false;
      }
      
      // Verificar que el contrato esté en estado válido para firma
      if (contrato.estadoContrato !== 'Enviado' && contrato.estadoContrato !== 'Pendiente de Firma') {
        console.log('❌ FirebaseService: Contrato no disponible para firma');
        return false;
      }
      
      // Verificar que no haya sido firmado ya
      if (contrato.firmaClienteBase64) {
        console.log('❌ FirebaseService: Contrato ya ha sido firmado');
        return false;
      }
      
      console.log('✅ FirebaseService: Token válido');
      return true;
    } catch (error) {
      console.error('❌ FirebaseService: Error al validar token de firma:', error);
      return false;
    }
  }

  // Método para registrar envío de email
  async registrarEnvioEmail(contratoId: string, email: string, asunto: string, mensaje: string, linkFirma: string): Promise<void> {
    console.log('📧 FirebaseService: Registrando envío de email...');
    try {
      await this.updateContrato(contratoId, {
        emailEnviado: true,
        fechaEnvioEmail: new Date(),
        emailDestinatario: email,
        asuntoEmail: asunto,
        mensajeEmail: mensaje,
        linkEnviado: linkFirma
      });
      
      console.log('✅ FirebaseService: Envío de email registrado');
    } catch (error) {
      console.error('❌ FirebaseService: Error al registrar envío de email:', error);
      throw error;
    }
  }

  // Método auxiliar para generar token único
  private generarTokenUnico(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  // Método para generar código de cotización automático y correlativo
  async generarCodigoCotizacion(): Promise<string> {
    try {
      console.log('🔧 FirebaseService: Generando código de cotización...');
      
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      const q = query(cotizacionesCollection, orderBy('codigo', 'desc'));
      const snapshot = await getDocs(q);
      
      let ultimoCodigo = 'COT-202400000';
      let numeroSecuencial = 1;
      
      if (!snapshot.empty) {
        const ultimaCotizacion = snapshot.docs[0];
        const codigoAnterior = ultimaCotizacion.data()['codigo'];
        
        if (codigoAnterior && codigoAnterior.startsWith('COT-')) {
          // Extraer el número secuencial del código anterior
          const match = codigoAnterior.match(/COT-(\d{4})(\d{6})/);
          if (match) {
            const añoAnterior = match[1];
            const numeroAnterior = parseInt(match[2]);
            const añoActual = new Date().getFullYear().toString();
            
            if (añoAnterior === añoActual) {
              numeroSecuencial = numeroAnterior + 1;
            } else {
              numeroSecuencial = 1; // Nuevo año, empezar desde 1
            }
          }
        }
      }
      
      const añoActual = new Date().getFullYear();
      const codigoNuevo = `COT-${añoActual}${String(numeroSecuencial).padStart(6, '0')}`;
      
      console.log('✅ FirebaseService: Código generado:', codigoNuevo);
      return codigoNuevo;
      
    } catch (error) {
      console.error('❌ FirebaseService: Error al generar código:', error);
      // Fallback: generar código con timestamp
      const timestamp = Date.now();
      return `COT-${new Date().getFullYear()}${String(timestamp % 1000000).padStart(6, '0')}`;
    }
  }
}
