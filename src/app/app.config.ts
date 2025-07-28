import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuR2-zHQAkjbLABtIuBcSo9MgIlCGWusg",
  authDomain: "cotizador-bba5a.firebaseapp.com",
  projectId: "cotizador-bba5a",
  storageBucket: "cotizador-bba5a.firebasestorage.app",
  messagingSenderId: "372617480143",
  appId: "1:372617480143:web:67bda8c05dbeebb6e6b4ba"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    importProvidersFrom(ReactiveFormsModule),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
};
