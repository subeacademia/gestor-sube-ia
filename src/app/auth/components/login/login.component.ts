import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.notificationService.showError('Por favor, completa todos los campos correctamente.');
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email, password);
      this.notificationService.showSuccess('¡Inicio de sesión exitoso!');
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
      this.notificationService.showError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
