import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ThemeService, Theme } from '../../core/services/theme.service';

@Component({
  selector: 'app-test-theme',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <div class="test-container">
      <!-- Header -->
      <app-header></app-header>
      
      <!-- Contenido de prueba -->
      <main class="test-main">
        <div class="test-content">
          <h1>🧪 Página de Prueba del Sistema de Temas</h1>
          
          <div class="theme-info">
            <h2>Tema Actual: {{ currentTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode' }}</h2>
            <p>Esta página te permite verificar que el sistema de temas funcione correctamente.</p>
          </div>
          
          <div class="test-cards">
            <div class="test-card">
              <h3>📋 Tarjeta de Prueba 1</h3>
              <p>Esta es una tarjeta que cambia de tema automáticamente.</p>
              <button class="btn btn-primary">Botón Primario</button>
            </div>
            
            <div class="test-card">
              <h3>📊 Tarjeta de Prueba 2</h3>
              <p>Otra tarjeta para verificar la consistencia visual.</p>
              <button class="btn btn-secondary">Botón Secundario</button>
            </div>
            
            <div class="test-card">
              <h3>✅ Tarjeta de Prueba 3</h3>
              <p>Una tercera tarjeta para completar la prueba.</p>
              <button class="btn btn-success">Botón de Éxito</button>
            </div>
          </div>
          
          <div class="test-form">
            <h3>📝 Formulario de Prueba</h3>
            <div class="form-group">
              <label>Campo de texto:</label>
              <input type="text" placeholder="Escribe algo aquí..." class="search-input">
            </div>
            <div class="form-group">
              <label>Selector:</label>
              <select class="search-input">
                <option>Opción 1</option>
                <option>Opción 2</option>
                <option>Opción 3</option>
              </select>
            </div>
          </div>
          
          <div class="test-alerts">
            <div class="alert alert-success">
              <span class="alert-icon">✅</span>
              <span class="alert-message">Este es un mensaje de éxito que cambia de tema.</span>
            </div>
            <div class="alert alert-error">
              <span class="alert-icon">❌</span>
              <span class="alert-message">Este es un mensaje de error que cambia de tema.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .test-container {
      min-height: 100vh;
      background: var(--bg-principal);
      color: var(--texto-principal);
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    .test-main {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .test-content {
      margin-top: 2rem;
    }
    
    .test-content h1 {
      text-align: center;
      margin-bottom: 2rem;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .theme-info {
      background: var(--bg-secundario);
      border: 1px solid var(--borde-color);
      border-radius: var(--border-radius-xl);
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }
    
    .theme-info h2 {
      margin-bottom: 1rem;
      color: var(--texto-principal);
    }
    
    .theme-info p {
      color: var(--texto-secundario);
      font-size: 1.1rem;
    }
    
    .test-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .test-card {
      background: var(--bg-secundario);
      border: 1px solid var(--borde-color);
      border-radius: var(--border-radius-xl);
      padding: 2rem;
      transition: all 0.3s ease;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }
    
    .test-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: rgba(88, 166, 255, 0.3);
    }
    
    .test-card h3 {
      color: var(--texto-principal);
      margin-bottom: 1rem;
    }
    
    .test-card p {
      color: var(--texto-secundario);
      margin-bottom: 1.5rem;
    }
    
    .test-form {
      background: var(--bg-secundario);
      border: 1px solid var(--borde-color);
      border-radius: var(--border-radius-xl);
      padding: 2rem;
      margin-bottom: 2rem;
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }
    
    .test-form h3 {
      color: var(--texto-principal);
      margin-bottom: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group label {
      display: block;
      color: var(--texto-principal);
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    
    .test-alerts {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    @media (max-width: 768px) {
      .test-main {
        padding: 1rem;
      }
      
      .test-cards {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .test-card,
      .test-form,
      .theme-info {
        padding: 1.5rem;
      }
    }
  `]
})
export class TestThemeComponent implements OnInit {
  currentTheme: Theme = 'dark';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.currentTheme$.subscribe((theme: Theme) => {
      this.currentTheme = theme;
    });
  }
} 