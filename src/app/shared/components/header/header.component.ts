import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() logoutEvent = new EventEmitter<void>();
  
  userInfo: any = {
    email: 'admin@subeia.com'
  };

  cerrarSesion() {
    this.logoutEvent.emit();
  }
}
