import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      console.log('AuthGuard - User state:', user);
      if (user) {
        console.log('AuthGuard - User authenticated, allowing access');
        return true;
      } else {
        console.log('AuthGuard - No user, redirecting to login');
        router.navigate(['/login']);
        return false;
      }
    })
  );
}; 