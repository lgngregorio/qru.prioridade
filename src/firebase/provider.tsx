'use client';

import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Loader2 } from 'lucide-react';

// Combined Context
interface FirebaseUserContextType {
    app: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
    user: User | null;
    isLoading: boolean;
}

export const FirebaseUserContext = createContext<FirebaseUserContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
    const [app, setApp] = useState<FirebaseApp | null>(null);
    const [auth, setAuth] = useState<Auth | null>(null);
    const [firestore, setFirestore] = useState<Firestore | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
            setIsLoading(false);
            return;
        }

        const currentApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        const currentAuth = getAuth(currentApp);
        
        setApp(currentApp);
        setAuth(currentAuth);
        setFirestore(getFirestore(currentApp));

        const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
            setUser(user);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <FirebaseUserContext.Provider value={{ app, auth, firestore, user, isLoading }}>
            {children}
            <FirebaseErrorListener />
        </FirebaseUserContext.Provider>
    );
}

// Hooks to access context values
export function useAuth() {
    const context = useContext(FirebaseUserContext);
    if (context === undefined) throw new Error('useAuth must be used within a FirebaseProvider');
    return context.auth;
}

export function useFirestore() {
    const context = useContext(FirebaseUserContext);
    if (context === undefined) throw new Error('useFirestore must be used within a FirebaseProvider');
    return context.firestore;
}

export function useFirebaseApp() {
    const context = useContext(FirebaseUserContext);
    if (context === undefined) throw new Error('useFirebaseApp must be used within a FirebaseProvider');
    return context.app;
}

export function useUser() {
    const context = useContext(FirebaseUserContext);
    if (context === undefined) throw new Error('useUser must be used within a FirebaseProvider');
    return { user: context.user, isLoading: context.isLoading };
}

export function useFirebaseLoading() {
    const context = useContext(FirebaseUserContext);
    if (context === undefined) throw new Error('useFirebaseLoading must be used within a FirebaseProvider');
    return context.isLoading;
}
