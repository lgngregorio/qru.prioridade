
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

export function getFirebaseInstances() {
    if (typeof window !== 'undefined' && !app) {
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
        
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        firestore = getFirestore(app);
    }
    return { app, auth, firestore };
}
