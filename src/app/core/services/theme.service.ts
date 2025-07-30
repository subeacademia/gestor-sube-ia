import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>('dark');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Solo ejecutar en el navegador, no en SSR
    if (isPlatformBrowser(this.platformId)) {
      // Cargar tema guardado en localStorage
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // Tema por defecto
        this.setTheme('dark');
      }
    } else {
      // En SSR, usar tema por defecto
      this.setTheme('dark');
    }
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    
    // Solo guardar en localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
    }
    
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentThemeSubject.value === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    // Solo aplicar tema si estamos en el navegador
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const root = document.documentElement;
    
    if (theme === 'dark') {
      // Variables para dark mode (como contratos)
      root.style.setProperty('--bg-principal', '#0D1117');
      root.style.setProperty('--bg-secundario', '#161B22');
      root.style.setProperty('--bg-terciario', '#21262D');
      root.style.setProperty('--borde-color', '#30363D');
      root.style.setProperty('--texto-principal', '#E6EDF3');
      root.style.setProperty('--texto-secundario', '#8B949E');
      root.style.setProperty('--texto-muted', '#6E7681');
      root.style.setProperty('--color-text-dark', '#1f2937');
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');
    } else {
      // Variables para light mode (como clientes)
      root.style.setProperty('--bg-principal', '#f8fafc');
      root.style.setProperty('--bg-secundario', '#ffffff');
      root.style.setProperty('--bg-terciario', '#f1f5f9');
      root.style.setProperty('--borde-color', '#e2e8f0');
      root.style.setProperty('--texto-principal', '#1e293b');
      root.style.setProperty('--texto-secundario', '#64748b');
      root.style.setProperty('--texto-muted', '#94a3b8');
      root.style.setProperty('--color-text-dark', '#1f2937');
      root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--shadow-md', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
      root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--shadow-xl', '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');
    }
  }
} 