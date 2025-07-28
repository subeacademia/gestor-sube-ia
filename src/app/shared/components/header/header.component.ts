import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  constructor(private authService: AuthService) {}

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
}
