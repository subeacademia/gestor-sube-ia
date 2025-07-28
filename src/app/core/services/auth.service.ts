import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private auth: Auth) {
    console.log('AuthService initialized');
    onAuthStateChanged(this.auth, (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'No user');
      this.currentUserSubject.next(user);
    });
  }

  async login(email: string, password: string): Promise<User> {
    console.log('Attempting login with Firebase...');
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Firebase login successful:', userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error('Firebase login error:', error);
      throw error;
    }
  }

  async createUser(email: string, password: string): Promise<User> {
    console.log('Creating user with Firebase...');
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('Firebase user created:', userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error('Firebase user creation error:', error);
      throw error;
    }
  }

  async logout() {
    console.log('Logging out...');
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
} 