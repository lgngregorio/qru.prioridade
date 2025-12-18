
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

interface FirebaseContextType {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
    const [firebaseInstances, setFirebaseInstances] = useState<FirebaseContextType | null>(null);

    useEffect(() => {
        let app;
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }

        const auth = getAuth(app);
        const firestore = getFirestore(app);
        
        setFirebaseInstances({ app, auth, firestore });
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
