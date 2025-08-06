import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async login(email: string, password: string): Promise<any> {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async register(email: string, password: string): Promise<any> {
    return await this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  async logout(): Promise<void> {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): any {
    return this.afAuth.currentUser;
  }
}