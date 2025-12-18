
'use client';

import React, { useState, useEffect, ReactNode, useContext, createContext } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseProvider, FirebaseContext } from './provider';

// --- User Context for Firebase Auth ---
interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseClientProvider');
  }
  return context;
}
// --- End User Context ---

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [app, setApp] = useState<FirebaseApp | undefined>(undefined);
    const [auth, setAuth] = useState<Auth | undefined>(undefined);
    const [firestore, setFirestore] = useState<Firestore | undefined>(undefined);
    const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
    
    // User state
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const firebaseConfig = {
              projectId: "studio-2284671180-4b3bb",
              appId: "1:1092911829966:web:dfcf6e3720a1a77bddd19f",
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
              authDomain: "studio-2284671180-4b3bb.firebaseapp.com",
              measurementId: "",
              messagingSenderId: "1092911829966"
            };

            if (!firebaseConfig.apiKey) {
              console.error("Firebase API Key is missing. Make sure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env.local file.");
              setIsFirebaseLoading(false);
              setIsUserLoading(false);
              return;
            }

            const currentApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            const currentAuth = getAuth(currentApp);

            setApp(currentApp);
            setAuth(currentAuth);
            setFirestore(getFirestore(currentApp));
            setIsFirebaseLoading(false);

            const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
              setUser(user);
              setIsUserLoading(false);
            });

            return () => unsubscribe();
        }
    }, []);

    return (
        <FirebaseProvider value={{ app, auth, firestore, isLoading: isFirebaseLoading }}>
            <UserContext.Provider value={{ user, isLoading: isUserLoading || isUserLoading }}>
                {children}
            </UserContext.Provider>
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
