
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { Loader2 } from 'lucide-react';

interface FirebaseContextType {
    app: FirebaseApp | null;
    auth: Auth | null;
    firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
    const [firebaseInstances, setFirebaseInstances] = useState<FirebaseContextType>({
      app: null,
      auth: null,
      firestore: null
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
            let app;
            if (!getApps().length) {
                app = initializeApp(firebaseConfig);
            } else {
                app = getApp();
            }

            const auth = getAuth(app);
            const firestore = getFirestore(app);
            
            setFirebaseInstances({ app, auth, firestore });
        }
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
    return useFirebase()?.app;
}

export function useAuth() {
    return useFirebase()?.auth;
}

export function useFirestore() {
    return useFirebase()?.firestore;
}
