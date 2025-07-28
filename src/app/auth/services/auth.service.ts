import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Verificar si hay un token almacenado al inicializar el servicio
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken');
      this.isAuthenticatedSubject.next(!!token);
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  login(credentials: { email: string; password: string }): Observable<boolean> {
    // Aquí implementarías la lógica real de autenticación
    // Por ahora, simulamos un login exitoso
    return new Observable(observer => {
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('authToken', 'fake-token');
        }
        this.isAuthenticatedSubject.next(true);
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('authToken');
    }
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
} 