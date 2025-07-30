import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'gestor-sube-ia';
  
  constructor(
    public authService: AuthService,
    private themeService: ThemeService
  ) {}
  
  ngOnInit() {
    // El servicio de tema se inicializa automáticamente en su constructor
    // Esto asegura que el tema se aplique desde el inicio
  }
}
