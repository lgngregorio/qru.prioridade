
'use client';

import { initializeApp, getApps, getApp, FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';

export { useCollection, useMemoFirebase } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase(firebaseConfig: FirebaseOptions) {
    if (typeof window !== 'undefined') {
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
    }
    // @ts-ignore
    return { app, auth, firestore };
}

export type { FirebaseApp };
