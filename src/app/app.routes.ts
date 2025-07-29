import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cotizaciones',
    loadComponent: () => import('./pages/cotizaciones/cotizaciones.component').then(c => c.CotizacionesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cotizaciones/crear',
    loadComponent: () => import('./pages/crear-cotizacion/crear-cotizacion.component').then(c => c.CrearCotizacionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'contratos',
    loadComponent: () => import('./pages/contratos/contratos.component').then(c => c.ContratosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'firmar-contrato/:id',
    loadComponent: () => import('./pages/firmar-contrato/firmar-contrato.component').then(c => c.FirmarContratoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'enviar-firma/:id',
    loadComponent: () => import('./pages/enviar-firma/enviar-firma.component').then(c => c.EnviarFirmaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'firmar-cliente/:idContrato/:token',
    loadComponent: () => import('./pages/firmar-contrato-cliente/firmar-contrato-cliente.component').then(c => c.FirmarContratoClienteComponent)
  },
  {
    path: 'firmar-cliente/:idContrato',
    loadComponent: () => import('./pages/firmar-contrato-cliente/firmar-contrato-cliente.component').then(c => c.FirmarContratoClienteComponent)
  },
  {
    path: 'preview-contrato/:id',
    loadComponent: () => import('./pages/preview-contrato/preview-contrato.component').then(c => c.PreviewContratoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.component').then(c => c.ClientesComponent),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];