import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, skipWhile, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard: Verificando acceso a:', state.url);
  console.log('🛡️ AuthGuard: Ruta completa:', route.url);
  console.log('🛡️ AuthGuard: Parámetros:', route.params);

  return authService.isLoading$.pipe(
    skipWhile(isLoading => {
      console.log('⏳ AuthGuard: Esperando carga inicial...', isLoading);
      return isLoading;
    }), // Espera a que termine la carga inicial
    take(1), // Toma el primer valor después de la carga
    map(() => {
      const user = authService.getCurrentUser();
      console.log('👤 AuthGuard: Usuario actual:', user ? user.email : 'No autenticado');
      console.log('👤 AuthGuard: Usuario completo:', user);
      
      if (user) {
        console.log('✅ AuthGuard: Acceso permitido para:', state.url);
        return true;
      } else {
        console.log('❌ AuthGuard: Acceso denegado, redirigiendo a login desde:', state.url);
        router.navigate(['/login']);
        return false;
      }
    })
  );
}; 