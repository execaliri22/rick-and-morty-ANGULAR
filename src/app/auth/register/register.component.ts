import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service'; // Asegúrate de la ruta correcta a tu auth.service.ts
import { CommonModule } from '@angular/common'; // Necesario para *ngIf

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, // Necesario para directivas como *ngIf
    ReactiveFormsModule, // Necesario para formularios reactivos (formGroup, formControlName)
    RouterModule // Necesario para routerLink
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null; // Usamos null para que *ngIf funcione correctamente

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]], // Campo username
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]] // Firebase Auth requiere mínimo 6 caracteres
    });
  }

  async onSubmit() {
    this.errorMessage = null; // Limpiar cualquier mensaje de error anterior

    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos correctamente.';
      return;
    }

    const { username, email, password } = this.registerForm.value; // Obtenemos el username, email y password

    try {
      // Llamamos al servicio de autenticación con email, password y username
      const registered = await this.authService.register(email, password, username);

      if (registered) {
        this.router.navigate(['/login']); // Redirigir al login o a la página principal tras un registro exitoso
      }
    } catch (error: any) {
      // Capturamos y mostramos los errores específicos de Firebase Authentication
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
          console.error('Error de Firebase en registro:', error);
      }
    }
  }

  // Métodos helpers para acceder a los controles del formulario (útiles para validación en la plantilla)
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
}
