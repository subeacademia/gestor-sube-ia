import { Injectable } from '@angular/core';
import { collection, doc, updateDoc, deleteDoc, addDoc, query, where, orderBy, setDoc, getDocs, onSnapshot, collectionData, DocumentReference } from '@angular/fire/firestore';
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

      // Crear clientes de prueba
      await this.crearClientesPrueba();

      console.log('✅ FirebaseService: Datos de prueba creados exitosamente');
    } catch (error) {
      console.error('❌ FirebaseService: Error al crear datos de prueba:', error);
      throw error;
    }
  }

  // Método para crear una sola cotización de prueba completa
  async crearCotizacionPrueba(): Promise<void> {
    console.log('🧪 FirebaseService: Creando 1 cotización de prueba completa...');
    try {
      const cotizacionesCollection = collection(this.firestore, 'cotizaciones');
      
      // Crear una cotización de prueba completa con todos los campos
      const cotizacionPrueba = {
        codigo: `SUBEIA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
        nombre: 'Cliente de Prueba Completo',
        email: 'cliente.prueba@empresa.com',
        rut: '12345678-9',
        empresa: 'Empresa de Prueba SPA',
        moneda: 'CLP',
        servicios: [
          {
            nombre: 'Desarrollo Web Corporativo',
            detalle: 'Sitio web completo con diseño responsive, SEO optimizado y panel de administración',
            modalidad: 'Online',
            alumnos: 1,
            tipoCobro: 'proyecto',
            subtotal: 1500000,
            detallesCobro: {
              proyecto: 'Desarrollo completo',
              valorProyecto: 1500000
            }
          },
          {
            nombre: 'Capacitación en Marketing Digital',
            detalle: 'Curso completo de marketing digital para el equipo de la empresa',
            modalidad: 'Presencial',
            alumnos: 10,
            tipoCobro: 'sesion',
            subtotal: 500000,
            detallesCobro: {
              sesiones: 5,
              valorSesion: 100000
            }
          },
          {
            nombre: 'Consultoría SEO',
            detalle: 'Optimización de motores de búsqueda y estrategia de posicionamiento',
            modalidad: 'Online',
            alumnos: 1,
            tipoCobro: 'mensual',
            subtotal: 300000,
            detallesCobro: {
              meses: 3,
              valorMensual: 100000
            }
          }
        ],
        atendido: 'Rodrigo Carrillo',
        subtotal: 2300000,
        descuento: 10,
        descuentoValor: 230000,
        totalConDescuento: 2070000,
        total: 2070000,
        valor: 2070000,
        valorTotal: 2070000,
        notas: 'Cotización de prueba completa creada automáticamente con todos los campos y servicios múltiples',
        estado: 'Emitida',
        fechaTimestamp: new Date(),
        fecha: new Date().toLocaleDateString('es-CL'),
        fechaCreacion: new Date()
      };

      await addDoc(cotizacionesCollection, cotizacionPrueba);
      console.log(`✅ FirebaseService: Cotización de prueba completa creada con código: ${cotizacionPrueba.codigo}`);
      console.log('✅ FirebaseService: Cotización de prueba creada exitosamente');
    } catch (error) {
      console.error('❌ FirebaseService: Error al crear cotización de prueba:', error);
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
      
      if (snapshot.empty) {
        console.log('📭 FirebaseService: No hay documentos en la colección');
        return [];
      }
      
      const cotizaciones = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 FirebaseService: Documento ID:', doc.id);
        console.log('📄 FirebaseService: Datos del documento:', JSON.stringify(data, null, 2));
        
        const cotizacionProcesada = {
          id: doc.id,
          ...data,
          // Normalizar campos para compatibilidad
          nombreCliente: data['nombreCliente'] || data['nombre'],
          emailCliente: data['emailCliente'] || data['email'],
          valorTotal: data['valorTotal'] || data['total'],
          fechaCreacion: data['fechaCreacion'] || data['fechaTimestamp'] || data['fecha']
        } as any;
        
        console.log('📄 FirebaseService: Cotización procesada:', JSON.stringify(cotizacionProcesada, null, 2));
        return cotizacionProcesada;
      });
      
      console.log('✅ FirebaseService: Cotizaciones procesadas:', cotizaciones.length);
      console.log('📋 FirebaseService: Estados encontrados:', [...new Set(cotizaciones.map(c => c['estado']))]);
      
      // Debug: mostrar las primeras 2 cotizaciones completas
      if (cotizaciones.length > 0) {
        console.log('🔍 FirebaseService: Primera cotización completa:', cotizaciones[0]);
        if (cotizaciones.length > 1) {
          console.log('🔍 FirebaseService: Segunda cotización completa:', cotizaciones[1]);
        }
      }
      
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

  // Método para crear contrato directo (no desde cotización)
  async createContrato(data: any): Promise<DocumentReference> {
    console.log('🔧 FirebaseService: Creando contrato directo:', data);
    try {
      const contratosCollection = collection(this.firestore, 'contratos');
      const docRef = await addDoc(contratosCollection, data);
      console.log('✅ FirebaseService: Contrato creado con ID:', docRef.id);
      
      // Gestionar cliente automáticamente después de crear el contrato
      try {
        await this.gestionarClienteDesdeContrato({ id: docRef.id, ...data });
      } catch (error) {
        console.warn('⚠️ FirebaseService: Error al gestionar cliente automáticamente:', error);
      }
      
      return docRef;
    } catch (error) {
      console.error('❌ FirebaseService: Error al crear contrato:', error);
      throw error;
    }
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

        // Gestionar cliente automáticamente después de crear el contrato
        try {
          await this.gestionarClienteDesdeContrato({ id: docRef.id, ...contrato });
        } catch (error) {
          console.warn('⚠️ FirebaseService: Error al gestionar cliente automáticamente:', error);
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
      // Verificar si ya tiene firma del cliente
      const contrato = await this.getContratoById(contratoId);
      const tieneFirmaCliente = contrato.firmaClienteBase64;

      // Determinar el estado final
      let estadoFinal = 'Pendiente Firma Cliente';
      if (tieneFirmaCliente) {
        estadoFinal = 'Completamente Firmado'; // Ambas firmas completadas
      }

      await this.updateContrato(contratoId, {
        firmaInternaBase64: firmaBase64,
        firmaRepresentanteBase64: firmaBase64, // Mantener compatibilidad
        representanteLegal: representanteLegal,
        fechaFirmaRepresentante: new Date(),
        estadoContrato: estadoFinal,
        ambasFirmasCompletadas: tieneFirmaCliente ? true : false
      });
      
      console.log('✅ FirebaseService: Firma del representante actualizada');
      console.log(`📋 Estado actualizado a: ${estadoFinal}`);

      // Si ambas firmas están completas, crear cliente automáticamente
      if (tieneFirmaCliente) {
        await this.crearClienteDesdeContrato(contrato);
      }
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
      const tieneFirmaRepresentante = contrato.firmaInternaBase64 || contrato.firmaRepresentanteBase64;

      // Determinar el estado final
      let estadoFinal = 'Firmado';
      if (tieneFirmaRepresentante) {
        estadoFinal = 'Completamente Firmado'; // Ambas firmas completadas
      }

      await this.updateContrato(contratoId, {
        firmaClienteBase64: firmaBase64,
        fechaFirmaCliente: new Date(),
        estadoContrato: estadoFinal,
        fechaFirmaFinal: new Date(),
        contratoValido: true,
        ambasFirmasCompletadas: tieneFirmaRepresentante ? true : false
      });
      
      console.log('✅ FirebaseService: Firma del cliente actualizada');
      console.log(`📋 Estado actualizado a: ${estadoFinal}`);

      // Si ambas firmas están completas, crear cliente automáticamente
      if (tieneFirmaRepresentante) {
        await this.crearClienteDesdeContrato(contrato);
      }
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

  // Método para eliminar firma del representante
  async eliminarFirmaRepresentante(contratoId: string): Promise<void> {
    console.log('🗑️ FirebaseService: Eliminando firma del representante...');
    try {
      await this.updateContrato(contratoId, {
        firmaInternaBase64: null,
        firmaRepresentanteBase64: null,
        representanteLegal: null,
        fechaFirmaRepresentante: null,
        estadoContrato: 'Pendiente de Firma'
      });
      
      console.log('✅ FirebaseService: Firma del representante eliminada');
    } catch (error) {
      console.error('❌ FirebaseService: Error al eliminar firma del representante:', error);
      throw error;
    }
  }

  // Método para eliminar firma del cliente
  async eliminarFirmaCliente(contratoId: string): Promise<void> {
    console.log('🗑️ FirebaseService: Eliminando firma del cliente...');
    try {
      await this.updateContrato(contratoId, {
        firmaClienteBase64: null,
        fechaFirmaCliente: null,
        estadoContrato: 'Pendiente Firma Cliente',
        fechaFirmaFinal: null,
        contratoValido: false,
        ambasFirmasCompletadas: false
      });
      
      console.log('✅ FirebaseService: Firma del cliente eliminada');
    } catch (error) {
      console.error('❌ FirebaseService: Error al eliminar firma del cliente:', error);
      throw error;
    }
  }

  // Método para eliminar todas las firmas de un contrato
  async eliminarTodasLasFirmas(contratoId: string): Promise<void> {
    console.log('🗑️ FirebaseService: Eliminando todas las firmas...');
    try {
      await this.updateContrato(contratoId, {
        firmaInternaBase64: null,
        firmaRepresentanteBase64: null,
        firmaClienteBase64: null,
        representanteLegal: null,
        fechaFirmaRepresentante: null,
        fechaFirmaCliente: null,
        fechaFirmaFinal: null,
        estadoContrato: 'Pendiente de Firma',
        contratoValido: false,
        ambasFirmasCompletadas: false
      });
      
      console.log('✅ FirebaseService: Todas las firmas eliminadas');
    } catch (error) {
      console.error('❌ FirebaseService: Error al eliminar todas las firmas:', error);
      throw error;
    }
  }

  // Método auxiliar para generar token único
  private generarTokenUnico(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  // ===== MÉTODOS PARA MANEJO DE CLIENTES =====

  // Método para obtener clientes como Observable
  getClientes(): Observable<any[]> {
    console.log('👥 FirebaseService: Obteniendo clientes...');
    try {
      const clientesCollection = collection(this.firestore, 'clientes');
      const q = query(clientesCollection, orderBy('fechaCreacion', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    } catch (error) {
      console.error('❌ FirebaseService: Error al obtener clientes:', error);
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
  }

  // Método para crear nuevo cliente
  async createCliente(data: any): Promise<DocumentReference> {
    console.log('➕ FirebaseService: Creando nuevo cliente:', data);
    try {
      const clientesCollection = collection(this.firestore, 'clientes');
      const docRef = await addDoc(clientesCollection, data);
      console.log('✅ FirebaseService: Cliente creado con ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('❌ FirebaseService: Error al crear cliente:', error);
      throw error;
    }
  }

  // Método para actualizar cliente
  async updateCliente(id: string, data: any): Promise<void> {
    console.log('🔄 FirebaseService: Actualizando cliente:', id);
    try {
      const clienteRef = doc(this.firestore, 'clientes', id);
      await updateDoc(clienteRef, data);
      console.log('✅ FirebaseService: Cliente actualizado exitosamente');
    } catch (error) {
      console.error('❌ FirebaseService: Error al actualizar cliente:', error);
      throw error;
    }
  }

  // Método para eliminar cliente
  async deleteCliente(id: string): Promise<void> {
    console.log('🗑️ FirebaseService: Eliminando cliente:', id);
    try {
      const clienteRef = doc(this.firestore, 'clientes', id);
      await deleteDoc(clienteRef);
      console.log('✅ FirebaseService: Cliente eliminado exitosamente');
    } catch (error) {
      console.error('❌ FirebaseService: Error al eliminar cliente:', error);
      throw error;
    }
  }

  // Método para obtener cliente por ID
  async getClienteById(clienteId: string): Promise<any> {
    console.log('🔍 FirebaseService: Obteniendo cliente por ID:', clienteId);
    try {
      const clientes = await this.getClientesAsync();
      const cliente = clientes.find(c => c.id === clienteId);
      
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }
      
      console.log('✅ FirebaseService: Cliente encontrado:', cliente);
      return cliente;
    } catch (error) {
      console.error('❌ FirebaseService: Error al obtener cliente por ID:', error);
      throw error;
    }
  }

  // Método simple para obtener clientes sin Observable
  async getClientesAsync(): Promise<any[]> {
    console.log('👥 FirebaseService: Obteniendo clientes (método async)...');
    try {
      const clientesCollection = collection(this.firestore, 'clientes');
      const q = query(clientesCollection, orderBy('fechaCreacion', 'desc'));
      const snapshot = await getDocs(q);
      
      const clientes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ FirebaseService: Clientes obtenidos:', clientes.length);
      return clientes;
    } catch (error) {
      console.error('❌ FirebaseService: Error en getClientesAsync:', error);
      throw error;
    }
  }

  // Método para crear cliente automáticamente desde un contrato firmado
  async crearClienteDesdeContrato(contrato: any): Promise<void> {
    console.log('👥 FirebaseService: Creando cliente automáticamente desde contrato...');
    try {
      // Verificar si ya existe un cliente con el mismo RUT
      const clientesExistentes = await this.getClientesAsync();
      const clienteExistente = clientesExistentes.find(cliente => 
        cliente.rut === contrato.rutCliente || 
        cliente.empresa === contrato.empresa
      );

      if (clienteExistente) {
        console.log('ℹ️ FirebaseService: Cliente ya existe, actualizando valor facturado...');
        // Actualizar el valor total facturado del cliente existente
        const nuevoValorTotal = (clienteExistente.valorTotalFacturado || 0) + (contrato.valorTotal || 0);
        await this.updateCliente(clienteExistente.id, {
          valorTotalFacturado: nuevoValorTotal,
          fechaActualizacion: new Date(),
          contratosRelacionados: [...(clienteExistente.contratosRelacionados || []), contrato.id]
        });
        console.log('✅ FirebaseService: Cliente existente actualizado');
        return;
      }

      // Crear nuevo cliente con los datos del contrato
      const datosCliente = {
        empresa: contrato.empresa || 'Empresa no especificada',
        rut: contrato.rutCliente || 'RUT no especificado',
        nombre: contrato.nombreCliente || 'Cliente no especificado',
        email: contrato.emailCliente || '',
        telefono: contrato.telefonoCliente || '',
        direccion: contrato.direccionCliente || '',
        ciudad: contrato.ciudadCliente || '',
        cargo: contrato.cargoCliente || '',
        notas: `Cliente creado automáticamente desde contrato ${contrato.codigo || contrato.id}`,
        valorTotalFacturado: contrato.valorTotal || 0,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        contratosRelacionados: [contrato.id],
        origen: 'contrato_automatico',
        contratoOrigen: contrato.id
      };

      const nuevoCliente = await this.createCliente(datosCliente);
      console.log('✅ FirebaseService: Cliente creado automáticamente con ID:', nuevoCliente.id);
      console.log('📋 Datos del cliente creado:', datosCliente);
    } catch (error) {
      console.error('❌ FirebaseService: Error al crear cliente desde contrato:', error);
      // No lanzar el error para no interrumpir el proceso de firma
      console.log('⚠️ FirebaseService: Continuando con el proceso de firma...');
    }
  }

  // Método para gestionar cliente automáticamente desde datos de contrato
  async gestionarClienteDesdeContrato(contratoData: any): Promise<string> {
    console.log('🔧 FirebaseService: Gestionando cliente desde contrato:', contratoData);
    try {
      // Extraer datos del cliente del contrato
      const datosCliente = {
        empresa: contratoData.empresa || contratoData.nombreCliente || 'Empresa no especificada',
        rut: contratoData.rutCliente || contratoData.rut || 'RUT no especificado',
        nombre: contratoData.nombreCliente || contratoData.nombre || 'Cliente no especificado',
        email: contratoData.emailCliente || contratoData.email || '',
        telefono: contratoData.telefonoCliente || contratoData.telefono || '',
        direccion: contratoData.direccionCliente || contratoData.direccion || '',
        ciudad: contratoData.ciudadCliente || contratoData.ciudad || '',
        cargo: contratoData.cargoCliente || contratoData.cargo || '',
        valorTotalFacturado: contratoData.valorTotal || 0
      };

      // Verificar si ya existe un cliente con el mismo email o RUT
      const clientesExistentes = await this.getClientesAsync();
      const clienteExistente = clientesExistentes.find(cliente => 
        cliente.email === datosCliente.email || 
        cliente.rut === datosCliente.rut ||
        cliente.empresa === datosCliente.empresa
      );

      if (clienteExistente) {
        console.log('ℹ️ FirebaseService: Cliente ya existe, actualizando datos...');
        // Actualizar el valor total facturado y agregar el contrato a la lista
        const nuevoValorTotal = (clienteExistente.valorTotalFacturado || 0) + datosCliente.valorTotalFacturado;
        const contratosRelacionados = [...(clienteExistente.contratosRelacionados || []), contratoData.id];
        
        await this.updateCliente(clienteExistente.id, {
          valorTotalFacturado: nuevoValorTotal,
          fechaActualizacion: new Date(),
          contratosRelacionados: contratosRelacionados
        });
        
        console.log('✅ FirebaseService: Cliente existente actualizado con ID:', clienteExistente.id);
        return clienteExistente.id;
      }

      // Crear nuevo cliente
      const nuevoClienteData = {
        ...datosCliente,
        notas: `Cliente creado automáticamente desde contrato ${contratoData.codigo || contratoData.id}`,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        contratosRelacionados: [contratoData.id],
        origen: 'contrato_automatico',
        contratoOrigen: contratoData.id
      };

      const nuevoCliente = await this.createCliente(nuevoClienteData);
      console.log('✅ FirebaseService: Nuevo cliente creado con ID:', nuevoCliente.id);
      return nuevoCliente.id;
    } catch (error) {
      console.error('❌ FirebaseService: Error al gestionar cliente desde contrato:', error);
      throw error;
    }
  }

  // Método para procesar contratos existentes y crear clientes automáticamente
  async procesarContratosExistentesParaClientes(): Promise<void> {
    console.log('🔄 FirebaseService: Procesando contratos existentes para crear clientes...');
    try {
      const contratos = await this.getContratosAsync();
      const contratosCompletamenteFirmados = contratos.filter(contrato => 
        contrato.ambasFirmasCompletadas === true || 
        (contrato.firmaInternaBase64 && contrato.firmaClienteBase64) ||
        (contrato.firmaRepresentanteBase64 && contrato.firmaClienteBase64)
      );

      console.log(`📋 FirebaseService: Encontrados ${contratosCompletamenteFirmados.length} contratos completamente firmados`);

      for (const contrato of contratosCompletamenteFirmados) {
        try {
          await this.crearClienteDesdeContrato(contrato);
        } catch (error) {
          console.error(`❌ FirebaseService: Error procesando contrato ${contrato.id}:`, error);
        }
      }

      console.log('✅ FirebaseService: Procesamiento de contratos existentes completado');
    } catch (error) {
      console.error('❌ FirebaseService: Error al procesar contratos existentes:', error);
      throw error;
    }
  }

  // Método para crear clientes de prueba
  async crearClientesPrueba(): Promise<void> {
    console.log('🧪 FirebaseService: Creando clientes de prueba...');
    try {
      const clientesCollection = collection(this.firestore, 'clientes');
      
      const clientesPrueba = [
        {
          empresa: 'TechCorp Solutions SPA',
          rut: '76.123.456-7',
          nombre: 'María González',
          cargo: 'Gerente de Tecnología',
          email: 'maria.gonzalez@techcorp.cl',
          telefono: '+56 9 1234 5678',
          direccion: 'Av. Providencia 1234, Providencia',
          ciudad: 'Santiago',
          notas: 'Cliente premium, interesado en desarrollo web y apps móviles',
          valorTotalFacturado: 2500000,
          fechaCreacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
          fechaActualizacion: new Date()
        },
        {
          empresa: 'Innovación Digital Ltda.',
          rut: '89.456.789-0',
          nombre: 'Carlos Mendoza',
          cargo: 'Director de Marketing',
          email: 'carlos.mendoza@innovacion.cl',
          telefono: '+56 9 9876 5432',
          direccion: 'Las Condes 567, Las Condes',
          ciudad: 'Santiago',
          notas: 'Empresa en crecimiento, necesita estrategia digital completa',
          valorTotalFacturado: 1800000,
          fechaCreacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 días atrás
          fechaActualizacion: new Date()
        },
        {
          empresa: 'Startup Chile Ventures',
          rut: '12.345.678-9',
          nombre: 'Ana Silva',
          cargo: 'CEO',
          email: 'ana.silva@startupchile.cl',
          telefono: '+56 9 5555 1234',
          direccion: 'Bellavista 890, Providencia',
          ciudad: 'Santiago',
          notas: 'Startup en fase de expansión, buscando inversión',
          valorTotalFacturado: 3200000,
          fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
          fechaActualizacion: new Date()
        },
        {
          empresa: 'Consultoría Empresarial SPA',
          rut: '45.678.901-2',
          nombre: 'Roberto Fuentes',
          cargo: 'Socio Director',
          email: 'roberto.fuentes@consultoria.cl',
          telefono: '+56 9 7777 8888',
          direccion: 'Vitacura 2345, Vitacura',
          ciudad: 'Santiago',
          notas: 'Consultora establecida, necesita modernización de sistemas',
          valorTotalFacturado: 4100000,
          fechaCreacion: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 días atrás
          fechaActualizacion: new Date()
        },
        {
          empresa: 'E-commerce Express',
          rut: '67.890.123-4',
          nombre: 'Patricia López',
          cargo: 'Gerente Comercial',
          email: 'patricia.lopez@ecommerce.cl',
          telefono: '+56 9 9999 0000',
          direccion: 'Ñuñoa 456, Ñuñoa',
          ciudad: 'Santiago',
          notas: 'Empresa de comercio electrónico, necesita optimización de plataforma',
          valorTotalFacturado: 1500000,
          fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
          fechaActualizacion: new Date()
        }
      ];

      for (const cliente of clientesPrueba) {
        await addDoc(clientesCollection, cliente);
        console.log(`✅ FirebaseService: Cliente de prueba creado: ${cliente.empresa}`);
      }

      console.log('✅ FirebaseService: Clientes de prueba creados exitosamente');
    } catch (error) {
      console.error('❌ FirebaseService: Error al crear clientes de prueba:', error);
      throw error;
    }
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
