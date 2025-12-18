
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { getFirebaseInstances } from '@/firebase';

interface FirebaseContextType {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
    const [firebaseInstances, setFirebaseInstances] = useState<FirebaseContextType | null>(null);

    useEffect(() => {
        // getFirebaseInstances will initialize on the client if it hasn't already.
        setFirebaseInstances(getFirebaseInstances());
    }, []);

    const value = useMemo(() => firebaseInstances, [firebaseInstances]);

    if (!value) {
        // You can return a loader here if you want
        return null; 
    }

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
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
    return useFirebase().app;
}

export function useAuth() {
    return useFirebase().auth;
}

export function useFirestore() {
    return useFirebase().firestore;
}
