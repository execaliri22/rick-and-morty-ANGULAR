//Propósito: Servicio central de autenticación y gestión de usuarios.


import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Auth,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, // Método para cerrar sesión
  onAuthStateChanged,
  updateProfile
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

// Interfaz que define cómo luce un usuario dentro de la app
export interface AppUser {
  uid: string;             // ID único del usuario en Firebase
  email: string | null;    // Email del usuario
  username?: string | null; // Nombre de usuario (opcional)
}

@Injectable({ //define un servicio
  providedIn: 'root' // Hace que este servicio esté disponible en toda la app
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AppUser | null>; // Mantiene el estado del usuario actual
  public currentUser: Observable<AppUser | null>; // Observable al que se pueden suscribir los componentes

  constructor(
    private router: Router,
    private auth: Auth, // Servicio de Firebase Authentication
    private firestore: Firestore // Servicio de Firestore
  ) {
    // Inicializamos el estado del usuario como nulo
    this.currentUserSubject = new BehaviorSubject<AppUser | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    // Listener de Firebase: se dispara cada vez que cambia el estado de sesión (login, logout, registro)
    onAuthStateChanged(this.auth, async (user: FirebaseUser | null) => {
      if (user) {
        // Si hay usuario, obtenemos el perfil guardado en Firestore
        const userProfile = await this.getUserProfile(user.uid);

        // Construimos nuestro objeto AppUser
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email,
          username: userProfile?.username || user.displayName || null
        };

        // Actualizamos el estado global del usuario
        this.currentUserSubject.next(appUser);
      } else {
        // Si no hay usuario autenticado, reseteamos el estado
        this.currentUserSubject.next(null);
      }
    });
  }

  // Getter para acceder al usuario actual de manera síncrona
  public get currentUserValue(): AppUser | null {
    return this.currentUserSubject.value;
  }

  // Guardar el perfil del usuario en Firestore
  private async saveUserProfile(uid: string, username: string, email: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    await setDoc(userDocRef, {
      username: username,
      email: email,
      createdAt: new Date() // Fecha de creación del perfil
    }, { merge: true }); // merge:true evita sobrescribir datos ya existentes
  }

  // Obtener el perfil del usuario desde Firestore
  private async getUserProfile(uid: string): Promise<AppUser | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppUser;
    }
    return null;
  }

  // Registro de un nuevo usuario
  async register(email: string, password: string, username: string): Promise<boolean> {
    try {
      // 1. Crear el usuario en Firebase Authentication (esto inicia sesión automáticamente)
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (user) {
        // 2. Guardar perfil del usuario en Firestore
        await this.saveUserProfile(user.uid, username, email);

        // (Opcional) Actualizar el displayName en Firebase Auth
        // await updateProfile(user, { displayName: username });

        // 3. Importante: cerramos la sesión inmediatamente después del registro
        await signOut(this.auth);

        console.log('Usuario registrado y sesión cerrada, UID:', user.uid);
      }
      return true;
    } catch (error: any) {
      console.error('Error al registrar usuario:', error.code, error.message);
      throw error;
    }
  }

  // Inicio de sesión
  async login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return true;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error.code, error.message);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']); // Redirigimos al login después del logout
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error.message);
      throw error;
    }
  }
}
