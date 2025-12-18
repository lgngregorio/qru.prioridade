
'use client';

import React, { useState, useEffect, ReactNode, useContext } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseProvider, FirebaseContext } from './provider';

const firebaseConfig = {
  projectId: "studio-2284671180-4b3bb",
  appId: "1:1092911829966:web:dfcf6e3720a1a77bddd19f",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "studio-2284671180-4b3bb.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1092911829966"
};

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [app, setApp] = useState<FirebaseApp | undefined>(undefined);
    const [auth, setAuth] = useState<Auth | undefined>(undefined);
    const [firestore, setFirestore] = useState<Firestore | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            setApp(currentApp);
            setAuth(getAuth(currentApp));
            setFirestore(getFirestore(currentApp));
            setIsLoading(false);
        }
    }, []);

    return (
        <FirebaseProvider value={{ app, auth, firestore, isLoading }}>
            {children}
        </FirebaseProvider>
    );
}

export function useFirebase() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
}

export function useFirebaseApp() {
    return useFirebase()?.app;
}

export function useAuth() {
    return useFirebase()?.auth;
}

export function useFirestore() {
    return useFirebase()?.firestore;
}

export function useFirebaseLoading() {
    return useFirebase()?.isLoading;
}
