import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Auth,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, // <-- Asegúrate de que signOut esté importado
  onAuthStateChanged,
  updateProfile
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

export interface AppUser {
  uid: string;
  email: string | null;
  username?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AppUser | null>;
  public currentUser: Observable<AppUser | null>;

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.currentUserSubject = new BehaviorSubject<AppUser | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    onAuthStateChanged(this.auth, async (user: FirebaseUser | null) => {
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email,
          username: userProfile?.username || user.displayName || null
        };
        this.currentUserSubject.next(appUser);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  public get currentUserValue(): AppUser | null {
    return this.currentUserSubject.value;
  }

  private async saveUserProfile(uid: string, username: string, email: string): Promise<void> {
    const userDocRef = doc(this.firestore, 'users', uid);
    await setDoc(userDocRef, {
      username: username,
      email: email,
      createdAt: new Date()
    }, { merge: true });
  }

  private async getUserProfile(uid: string): Promise<AppUser | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppUser;
    }
    return null;
  }

  async register(email: string, password: string, username: string): Promise<boolean> {
    try {
      // 1. Crear el usuario en Firebase Authentication (esto lo inicia sesión automáticamente)
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      if (user) {
        // 2. Guardar el perfil del usuario en Cloud Firestore
        await this.saveUserProfile(user.uid, username, email);

        // Opcional: Establecer el displayName de Firebase Auth si lo deseas
        // await updateProfile(user, { displayName: username });

        // 3. ¡Cerrar la sesión del usuario inmediatamente después del registro!
        await signOut(this.auth); // <-- AÑADIDO ESTA LÍNEA

        console.log('Usuario registrado y sesión cerrada, UID:', user.uid);
      }
      return true;
    } catch (error: any) {
      console.error('Error al registrar usuario:', error.code, error.message);
      throw error;
    }
  }

  // ... (el resto de tu servicio, login y logout, queda igual)
  async login(email: string, password: string): Promise<boolean> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return true;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error.code, error.message);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error.message);
      throw error;
    }
  }
}
