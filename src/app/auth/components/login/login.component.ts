import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    console.log('Login component initialized');
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;
    console.log('Login attempt:', { email, password });

    try {
      await this.authService.login(email, password);
      console.log('Login successful, navigating to dashboard');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorMessage = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  async createUser() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;
    console.log('Creating user:', { email, password });

    try {
      await this.authService.createUser(email, password);
      console.log('User created successfully');
      this.errorMessage = 'Usuario creado exitosamente. Ahora puedes hacer login.';
    } catch (error: any) {
      console.error('User creation error:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'El usuario ya existe. Intenta hacer login.';
      } else {
        this.errorMessage = 'Error al crear usuario: ' + error.message;
      }
    } finally {
      this.isLoading = false;
    }
  }
}
