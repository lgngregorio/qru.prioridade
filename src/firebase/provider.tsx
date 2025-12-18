
'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
    app: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ 
    children, 
    app, 
    auth, 
    firestore 
}: { 
    children: ReactNode, 
    app: FirebaseApp | null, 
    auth: Auth | null, 
    firestore: Firestore | null 
}) {
    const value = useMemo(() => ({ app, auth, firestore }), [app, auth, firestore]);

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
    return useFirebase()?.app;
}

export function useAuth() {
    return useFirebase()?.auth;
}

export function useFirestore() {
    return useFirebase()?.firestore;
}
