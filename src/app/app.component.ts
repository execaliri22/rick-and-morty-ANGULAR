// Propósito: define la lógica del componente raíz de Angular, llamado AppComponent.
//Actúa como el controlador de app.component.html

import { Component, OnInit } from '@angular/core';
import { AuthService, AppUser } from './auth/auth.service'; // Servicio de autenticación
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], // Importaciones necesarias para plantillas y rutas
  templateUrl: './app.component.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  title = 'Rick & Morty App'; 
  currentUser$: Observable<AppUser | null>; // Observable que mantiene el usuario actual, permite actualizar la UI automáticamente

  constructor(
    public authService: AuthService, // Inyección del servicio de autenticación
    public router: Router             // Inyección del Router para redirecciones
  ) {
    this.currentUser$ = this.authService.currentUser; // Suscribirse al observable del usuario actual
  }

  ngOnInit(): void {
    // Lógica de inicialización del componente raíz (si es necesaria)
  }

  // Método para cerrar sesión
  async logout() {
    try {
      await this.authService.logout(); // Llama al método de logout del servicio
    } catch (error) {
      console.error('Error al cerrar sesión desde AppComponent:', error);
      // Aquí podrías mostrar un mensaje de error al usuario en la UI
    }
  }
}
