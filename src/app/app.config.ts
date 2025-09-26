// Propósito: Configuración global de la app Angular.
//Proporciona servicios globales de Angular (Router, HttpClient, hidratación, detección de cambios zoneless).
//Inicializa Firebase y sus módulos (Auth, Firestore, Analytics).
//

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';  // Permite usar HttpClient en toda la app

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

// Configuración global de la aplicación Angular
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Escucha errores globales del navegador
    provideZonelessChangeDetection(),     // Optimiza detección de cambios sin zona.js
    provideRouter(routes),                // Proporciona el enrutador con las rutas definidas
    provideClientHydration(withEventReplay()), // Habilita hidratación de cliente para SSR
    provideHttpClient(),                  // Habilita HttpClient a nivel global

    // Configuración de Firebase
    provideFirebaseApp(() => initializeApp({ 
      projectId: "parcial-api",
      appId: "1:516540601521:web:126679533fd00c9da8fe90",
      storageBucket: "parcial-api.firebasestorage.app",
      apiKey: "AIzaSyDIqbPNTMBSHm-KminDqmyPn9f5oyotHm8",
      authDomain: "parcial-api.firebaseapp.com",
      messagingSenderId: "516540601521"
    })),

    provideAuth(() => getAuth()),           // Proveedor de autenticación de Firebase
    provideAnalytics(() => getAnalytics()), // Proveedor de Firebase Analytics
    ScreenTrackingService,                  // Servicio para rastrear pantallas
    UserTrackingService,                    // Servicio para rastrear usuarios
    provideFirestore(() => getFirestore())  // Proveedor de Firestore para toda la app
  ]
};
