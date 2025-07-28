import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoading$ = new BehaviorSubject<boolean>(true);

  constructor(private auth: Auth, private router: Router) {
    console.log('🔧 AuthService: Inicializando servicio de autenticación...');
    
    onAuthStateChanged(this.auth, (user) => {
      console.log('👤 AuthService: Estado de autenticación cambiado:', user ? 'Usuario autenticado' : 'Usuario no autenticado');
      this.currentUserSubject.next(user);
      this.isLoading$.next(false);
    });
  }

  async login(email: string, password: string): Promise<User> {
    console.log('🔐 AuthService: Intentando login con email:', email);
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('✅ AuthService: Login exitoso para usuario:', userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error('❌ AuthService: Error en login:', error);
      throw error;
    }
  }

  async logout() {
    console.log('🚪 AuthService: Cerrando sesión...');
    try {
      await signOut(this.auth);
      console.log('✅ AuthService: Sesión cerrada exitosamente');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('❌ AuthService: Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Método para obtener el usuario actual de forma síncrona
  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
} 