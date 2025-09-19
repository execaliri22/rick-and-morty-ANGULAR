import { Component, OnInit } from '@angular/core';
import { AuthService, AppUser } from './auth/auth.service'; // Asegúrate de la ruta correcta
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  title = 'Rick & Morty App';
  currentUser$: Observable<AppUser | null>; // Observable para el usuario actual

  constructor(
    public authService: AuthService,
    public router: Router
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    // Si necesitas alguna lógica de inicialización para el componente raíz
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión desde AppComponent:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }
}
