import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { User } from '@angular/fire/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  userInfo: User | null = null;
  currentRoute: string = '';
  currentTheme: Theme = 'dark';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.userInfo = user;
    });

    // Suscribirse a cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });

    // Suscribirse a cambios de tema
    this.themeService.currentTheme$.subscribe((theme: Theme) => {
      this.currentTheme = theme;
    });
  }

  async logout() {
    try {
      await this.authService.logout();
      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navegarACrearCotizacion(): void {
    this.router.navigate(['/crear-cotizacion']);
  }

  navegarAGestionContratos(): void {
    this.router.navigate(['/contratos']);
  }
}
