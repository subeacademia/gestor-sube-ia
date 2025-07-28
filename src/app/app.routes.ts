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
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cotizaciones',
    loadComponent: () => import('./components/cotizaciones/cotizaciones.component').then(m => m.CotizacionesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/cotizaciones/cotizaciones.component').then(m => m.CotizacionesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'test-admin',
    loadComponent: () => import('./components/cotizaciones/cotizaciones.component').then(m => m.CotizacionesComponent)
  },
  {
    path: 'admin-test',
    loadComponent: () => import('./components/cotizaciones/cotizaciones.component').then(m => m.CotizacionesComponent)
  },
  {
    path: 'cotizaciones/crear',
    loadComponent: () => import('./components/crear-cotizacion/crear-cotizacion.component').then(m => m.CrearCotizacionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'contratos',
    loadComponent: () => import('./pages/contratos/contratos.component').then(m => m.ContratosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'firmar-contrato/:id',
    loadComponent: () => import('./pages/firmar-contrato/firmar-contrato.component').then(m => m.FirmarContratoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'enviar-firma/:id',
    loadComponent: () => import('./pages/enviar-firma/enviar-firma.component').then(m => m.EnviarFirmaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'firmar-cliente/:idContrato/:token',
    loadComponent: () => import('./pages/firmar-contrato-cliente/firmar-contrato-cliente.component').then(m => m.FirmarContratoClienteComponent)
  }
];
