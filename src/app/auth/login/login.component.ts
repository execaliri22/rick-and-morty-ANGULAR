import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service'; // Servicio personalizado de autenticación
import { CommonModule } from '@angular/common'; // Necesario para directivas estructurales (*ngIf, *ngFor, etc.)

@Component({
  selector: 'app-login',
  standalone: true, // Este componente no depende de un módulo, es standalone
  imports: [
    CommonModule, // Permite usar directivas comunes en la plantilla
    ReactiveFormsModule, // Necesario para usar formularios reactivos con formGroup
    RouterModule // Permite usar routerLink y navegación
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Formulario de login con email y password
  loginForm: FormGroup;

  // Mensaje de error a mostrar en la vista si ocurre un fallo
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder, // Para construir el formulario reactivo
    private authService: AuthService, // Servicio de autenticación con Firebase
    private router: Router // Para redirigir al usuario
  ) {
    // Si ya existe un usuario logueado, redirige automáticamente al inicio
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    // Inicialización del formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Campo requerido y con formato email válido
      password: ['', Validators.required] // Campo requerido
    });
  }

  ngOnInit(): void {}

  // Método ejecutado al enviar el formulario de login
  async onSubmit() {
    this.errorMessage = null; // Limpiar mensaje de error anterior

    // Validar que el formulario no esté vacío o incorrecto
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor ingresa un email y contraseña válidos.';
      return; // No continúa si el formulario es inválido
    }

    // Obtener valores de email y password desde el formulario
    const { email, password } = this.loginForm.value;

    try {
      // Intentar login con el AuthService (Firebase Auth)
      await this.authService.login(email, password);

      // Si el login es exitoso, el servicio ya actualiza el estado del usuario
      this.router.navigate(['/']); // Redirige al inicio o página principal
    } catch (error: any) {
      // Manejo de errores específicos de Firebase Authentication
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this.errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'El formato del email es incorrecto.';
          break;
        case 'auth/user-disabled':
          this.errorMessage = 'Tu cuenta ha sido deshabilitada.';
          break;
        default:
          this.errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';
          console.error('Error de Firebase en login:', error); // Log para debug
      }
    }
  }

  // Getters para acceder fácilmente a los controles del formulario en la plantilla
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
