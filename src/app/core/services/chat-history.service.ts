import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, getDocs, onSnapshot, DocumentData } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { ChatSession, ChatMessage, ChatHistory } from '../models';
import { Observable, BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {
  private chatSessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  public chatSessions$ = this.chatSessionsSubject.asObservable();
  
  private currentSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.initializeChatHistory();
  }

  private async initializeChatHistory() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadChatSessions(user.uid);
      } else {
        this.chatSessionsSubject.next([]);
        this.currentSessionSubject.next(null);
      }
    });
  }

  private async loadChatSessions(userId: string) {
    try {
      const chatSessionsRef = collection(this.firestore, 'chatSessions');
      const q = query(
        chatSessionsRef,
        where('usuarioId', '==', userId),
        orderBy('fechaUltimaActividad', 'desc')
      );

      onSnapshot(q, (snapshot) => {
        const sessions: ChatSession[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          sessions.push({
            id: doc.id,
            titulo: data['titulo'],
            usuarioId: data['usuarioId'],
            estado: data['estado'],
            fechaCreacion: data['fechaCreacion']?.toDate(),
            fechaUltimaActividad: data['fechaUltimaActividad']?.toDate(),
            mensajes: data['mensajes']?.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp?.toDate()
            })) || [],
            etiquetas: data['etiquetas'] || [],
            metadata: data['metadata'] || {}
          } as ChatSession);
        });
        this.chatSessionsSubject.next(sessions);
      });
    } catch (error) {
      console.error('Error al cargar sesiones de chat:', error);
    }
  }

  async createNewChatSession(titulo: string = 'Nueva conversación'): Promise<string> {
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      const newSession: Omit<ChatSession, 'id'> = {
        titulo,
        mensajes: [],
        fechaCreacion: new Date(),
        fechaUltimaActividad: new Date(),
        usuarioId: user.uid,
        estado: 'activo',
        metadata: {
          totalMensajes: 0
        }
      };

      const docRef = await addDoc(collection(this.firestore, 'chatSessions'), newSession);
      console.log('✅ Nueva sesión de chat creada:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error al crear sesión de chat:', error);
      throw error;
    }
  }

  async loadChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessionDoc = doc(this.firestore, 'chatSessions', sessionId);
      const sessionSnapshot = await getDocs(query(collection(this.firestore, 'chatSessions'), where('__name__', '==', sessionId)));
      
      if (!sessionSnapshot.empty) {
        const sessionData = sessionSnapshot.docs[0].data();
        const session: ChatSession = {
          id: sessionSnapshot.docs[0].id,
          titulo: sessionData['titulo'],
          usuarioId: sessionData['usuarioId'],
          estado: sessionData['estado'],
          fechaCreacion: sessionData['fechaCreacion']?.toDate(),
          fechaUltimaActividad: sessionData['fechaUltimaActividad']?.toDate(),
          mensajes: sessionData['mensajes']?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate()
          })) || [],
          etiquetas: sessionData['etiquetas'] || [],
          metadata: sessionData['metadata'] || {}
        };
        
        this.currentSessionSubject.next(session);
        return session;
      }
      return null;
    } catch (error) {
      console.error('❌ Error al cargar sesión de chat:', error);
      return null;
    }
  }

  async addMessageToSession(sessionId: string, message: Omit<ChatMessage, 'id'>): Promise<void> {
    try {
      const sessionDoc = doc(this.firestore, 'chatSessions', sessionId);
      const sessionSnapshot = await getDocs(query(collection(this.firestore, 'chatSessions'), where('__name__', '==', sessionId)));
      
      if (!sessionSnapshot.empty) {
        const sessionData = sessionSnapshot.docs[0].data();
        const mensajes = sessionData['mensajes'] || [];
        
        // Agregar el nuevo mensaje
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          ...message,
          timestamp: new Date()
        };
        
        mensajes.push(newMessage);
        
        // Actualizar la sesión
        await updateDoc(sessionDoc, {
          mensajes,
          fechaUltimaActividad: new Date(),
          'metadata.totalMensajes': mensajes.length
        });
        
        console.log('✅ Mensaje agregado a la sesión:', sessionId);
      }
    } catch (error) {
      console.error('❌ Error al agregar mensaje a la sesión:', error);
      throw error;
    }
  }

  async updateSessionTitle(sessionId: string, newTitle: string): Promise<void> {
    try {
      const sessionDoc = doc(this.firestore, 'chatSessions', sessionId);
      await updateDoc(sessionDoc, {
        titulo: newTitle,
        fechaUltimaActividad: new Date()
      });
      console.log('✅ Título de sesión actualizado:', newTitle);
    } catch (error) {
      console.error('❌ Error al actualizar título de sesión:', error);
      throw error;
    }
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'chatSessions', sessionId));
      console.log('✅ Sesión de chat eliminada:', sessionId);
      
      // Si la sesión eliminada era la actual, limpiar la sesión actual
      const currentSession = this.currentSessionSubject.value;
      if (currentSession?.id === sessionId) {
        this.currentSessionSubject.next(null);
      }
    } catch (error) {
      console.error('❌ Error al eliminar sesión de chat:', error);
      throw error;
    }
  }

  async archiveChatSession(sessionId: string): Promise<void> {
    try {
      const sessionDoc = doc(this.firestore, 'chatSessions', sessionId);
      await updateDoc(sessionDoc, {
        estado: 'archivado',
        fechaUltimaActividad: new Date()
      });
      console.log('✅ Sesión de chat archivada:', sessionId);
    } catch (error) {
      console.error('❌ Error al archivar sesión de chat:', error);
      throw error;
    }
  }

  setCurrentSession(session: ChatSession | null): void {
    this.currentSessionSubject.next(session);
  }

  getCurrentSession(): ChatSession | null {
    return this.currentSessionSubject.value;
  }

  generateSessionTitle(firstMessage: string): string {
    // Generar un título basado en el primer mensaje del usuario
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (words.length >= 5 ? '...' : '');
  }
} 