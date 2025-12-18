
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function getFirebaseInstances() {
    if (getApps().length === 0) {
        if (!firebaseConfig.apiKey) {
            throw new Error("Firebase API Key is missing. Make sure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file.");
        }
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        firestore = getFirestore(app);
    } else {
        app = getApp();
        auth = getAuth(app);
        firestore = getFirestore(app);
    }
    return { app, auth, firestore };
}

export { getFirebaseInstances };
