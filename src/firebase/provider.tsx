
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
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
        // getFirebaseInstances will initialize on the client because it's in a useEffect.
        // It's safe to call here because this provider is a client component.
        const instances = getFirebaseInstances();
        setFirebaseInstances(instances);
    }, []);


    if (!firebaseInstances) {
        // Render nothing or a loader while Firebase is initializing on the client.
        return null;
    }

    return (
        <FirebaseContext.Provider value={firebaseInstances}>
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

