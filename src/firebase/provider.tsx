'use client';

import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { getFirebaseInstances } from '@/firebase';
import { Loader2 } from 'lucide-react';


interface FirebaseContextType {
    app: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
    isLoading: boolean;
}

export const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
    const [firebaseInstances, setFirebaseInstances] = useState<Omit<FirebaseContextType, 'isLoading'>>({ app: null, auth: null, firestore: null });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { app, auth, firestore } = getFirebaseInstances();
        setFirebaseInstances({ app, auth, firestore });
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <FirebaseContext.Provider value={{ ...firebaseInstances, isLoading }}>
            {children}
            <FirebaseErrorListener />
        </FirebaseContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a FirebaseProvider');
    }
    return context.auth;
}

export function useFirestore() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirestore must be used within a FirebaseProvider');
    }
    return context.firestore;
}

export function useFirebaseApp() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebaseApp must be used within a FirebaseProvider');
    }
    return context.app;
}

export function useFirebaseLoading() {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebaseLoading must be used within a FirebaseProvider');
    }
    return context.isLoading;
}
