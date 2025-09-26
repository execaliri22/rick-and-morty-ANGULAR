import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service'; // Servicio personalizado de autenticación
import { CommonModule } from '@angular/common'; // Necesario para directivas estructurales como *ngIf

@Component({
  selector: 'app-register',
  standalone: true, // Componente independiente, no depende de un módulo
  imports: [
    CommonModule, // Permite usar directivas comunes como *ngIf en la plantilla
    ReactiveFormsModule, // Habilita el uso de formularios reactivos (formGroup, formControlName)
    RouterModule // Permite la navegación con routerLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Formulario de registro
  registerForm: FormGroup;

  // Mensaje de error a mostrar si ocurre un fallo en el registro
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder, // Para construir el formulario reactivo
    private authService: AuthService, // Servicio de autenticación con Firebase
    private router: Router // Para redirigir al usuario
  ) {
    // Inicialización del formulario con validaciones
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]], // Campo obligatorio, mínimo 3 caracteres
      email: ['', [Validators.required, Validators.email]], // Campo obligatorio con formato email válido
      password: ['', [Validators.required, Validators.minLength(6)]] // Firebase Auth requiere al menos 6 caracteres
    });
  }

  // Método que se ejecuta al enviar el formulario
  async onSubmit() {
    this.errorMessage = null; // Limpiar errores previos

    // Validar que todos los campos estén completos y correctos
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente.';
      return; // No continúa si el formulario es inválido
    }

    // Extraemos los valores del formulario
    const { username, email, password } = this.registerForm.value;

    try {
      // Llamada al servicio de autenticación para registrar el usuario
      const registered = await this.authService.register(email, password, username);

      if (registered) {
        // Si el registro fue exitoso, redirigir al login (o a la página principal si se desea)
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      // Manejo de errores específicos de Firebase Authentication
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'El email ya está registrado. Intenta iniciar sesión.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'El formato del email es incorrecto.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
          break;
        default:
          this.errorMessage = 'Error al registrar usuario: ' + error.message;
          console.error('Error de Firebase en registro:', error); // Log para depuración
      }
    }
  }

  // Getters para acceder fácilmente a los controles del formulario en la plantilla
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
}
