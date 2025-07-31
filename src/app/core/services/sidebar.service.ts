import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarAbiertaSubject = new BehaviorSubject<boolean>(false);
  public sidebarAbierta$ = this.sidebarAbiertaSubject.asObservable();

  constructor() {}

  toggleSidebar() {
    const estadoActual = this.sidebarAbiertaSubject.value;
    this.sidebarAbiertaSubject.next(!estadoActual);
  }

  abrirSidebar() {
    this.sidebarAbiertaSubject.next(true);
  }

  cerrarSidebar() {
    this.sidebarAbiertaSubject.next(false);
  }

  getSidebarAbierta(): boolean {
    return this.sidebarAbiertaSubject.value;
  }
} 