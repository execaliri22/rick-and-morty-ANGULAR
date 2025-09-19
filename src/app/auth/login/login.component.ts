import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service'; // Asegúrate de la ruta correcta
import { CommonModule } from '@angular/common'; // Necesario para *ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, // Necesario para *ngIf, *ngFor, etc.
    ReactiveFormsModule, // ¡Necesario para 'formGroup'!
    RouterModule // Necesario para routerLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null; // Para mostrar errores de Firebase

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Si el usuario ya está logueado, redirigir
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']); // Redirige a la página principal o donde quieras
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    this.errorMessage = null; // Limpiar mensaje de error anterior
    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor ingresa un email y contraseña válidos.';
      return; // No intentar enviar si el formulario es inválido
    }

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      // Si el login es exitoso, el onAuthStateChanged en AuthService ya actualizó el estado
      this.router.navigate(['/']); // Redirige a la página principal tras el login exitoso
    } catch (error: any) {
      // Manejo de errores de Firebase
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
          console.error('Error de Firebase en login:', error);
      }
    }
  }

  // Métodos helpers para acceder a los controles del formulario
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
