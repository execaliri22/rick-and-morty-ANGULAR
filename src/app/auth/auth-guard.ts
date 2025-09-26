
//Propósito: Protege rutas para que solo usuarios autenticados puedan acceder.


import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root' // Hace que el guard esté disponible en toda la app
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, // Servicio de autenticación para verificar el usuario actual
    private router: Router // Router para redirigir si no está autenticado
  ) {}

  // Método que se ejecuta antes de cargar una ruta protegida
  canActivate(
    next: ActivatedRouteSnapshot, // Información sobre la ruta que se intenta activar
    state: RouterStateSnapshot // Estado actual del router, incluye la URL
  ): boolean {
    // Si existe un usuario autenticado, se permite el acceso a la ruta
    if (this.authService.currentUserValue) {
      return true;
    }
    
    // Si no está autenticado, redirigir al login
    // Se pasa como queryParam la URL original para volver después del login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false; // Bloquear el acceso a la ruta
  }
}
