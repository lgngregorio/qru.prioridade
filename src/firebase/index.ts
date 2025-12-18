
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';

export { useCollection, useMemoFirebase } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase() {
    if (typeof window !== 'undefined') {
        if (getApps().length === 0) {
            const firebaseConfig = {
                projectId: "studio-2284671180-4b3bb",
                appId: "1:1092911829966:web:dfcf6e3720a1a77bddd19f",
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: "studio-2284671180-4b3bb.firebaseapp.com",
                measurementId: "",
                messagingSenderId: "1092911829966"
            };

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
    }
    // @ts-ignore
    return { app, auth, firestore };
}

export type { FirebaseApp };
