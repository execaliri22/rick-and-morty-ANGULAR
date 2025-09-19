import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';  // <--- agregar esta importación

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(), provideFirebaseApp(() => initializeApp({ projectId: "parcial-api", appId: "1:516540601521:web:126679533fd00c9da8fe90", storageBucket: "parcial-api.firebasestorage.app", apiKey: "AIzaSyDIqbPNTMBSHm-KminDqmyPn9f5oyotHm8", authDomain: "parcial-api.firebaseapp.com", messagingSenderId: "516540601521" })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideFirestore(() => getFirestore())  // <--- agregar el provider aquí
  ]
};
