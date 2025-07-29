import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userInfo: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.userInfo = user;
    });
  }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Métodos de depuración para verificar navegación
  navegarACotizaciones() {
    console.log('🔗 Header: Navegando a cotizaciones...');
    this.router.navigate(['/cotizaciones']).then(() => {
      console.log('✅ Header: Navegación a cotizaciones exitosa');
    }).catch((error) => {
      console.error('❌ Header: Error al navegar a cotizaciones:', error);
    });
  }

  navegarACrearCotizacion() {
    console.log('🔗 Header: Navegando a crear cotización...');
    this.router.navigate(['/cotizaciones/crear']).then(() => {
      console.log('✅ Header: Navegación a crear cotización exitosa');
    }).catch((error) => {
      console.error('❌ Header: Error al navegar a crear cotización:', error);
    });
  }

  navegarAContratos() {
    console.log('🔗 Header: Navegando a contratos...');
    this.router.navigate(['/contratos']).then(() => {
      console.log('✅ Header: Navegación a contratos exitosa');
    }).catch((error) => {
      console.error('❌ Header: Error al navegar a contratos:', error);
    });
  }

  navegarADashboard() {
    console.log('🔗 Header: Navegando a dashboard...');
    this.router.navigate(['/dashboard']).then(() => {
      console.log('✅ Header: Navegación a dashboard exitosa');
    }).catch((error) => {
      console.error('❌ Header: Error al navegar a dashboard:', error);
    });
  }
}
