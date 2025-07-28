import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from './firebase.config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    console.log('AuthService initialized');
    onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      this.currentUserSubject.next(user);
    });
  }

  async login(email: string, password: string): Promise<User> {
    console.log('Attempting login with Firebase...');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase user created:', userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error('Firebase user creation error:', error);
      throw error;
    }
  }

  async logout() {
    console.log('Logging out...');
    await signOut(auth);
    this.router.navigate(['/login']);
  }
} 