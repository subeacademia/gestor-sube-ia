import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cotizaciones',
    loadComponent: () => import('./components/cotizaciones/cotizaciones.component').then(m => m.CotizacionesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cotizaciones/crear',
    loadComponent: () => import('./components/crear-cotizacion/crear-cotizacion.component').then(m => m.CrearCotizacionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'contratos',
    loadComponent: () => import('./components/contratos/contratos.component').then(m => m.ContratosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'contratos/firmar/:id',
    loadComponent: () => import('./components/firmar-contrato/firmar-contrato.component').then(m => m.FirmarContratoComponent),
    canActivate: [authGuard]
  }
];
