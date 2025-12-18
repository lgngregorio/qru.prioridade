
'use client';

import React, { createContext, ReactNode } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';


interface FirebaseContextType {
    app: FirebaseApp | undefined;
    auth: Auth | undefined;
    firestore: Firestore | undefined;
    isLoading: boolean;
}

export const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  value: FirebaseContextType;
}

export function FirebaseProvider({ children, value }: FirebaseProviderProps) {
    return (
        <FirebaseContext.Provider value={value}>
            {children}
            <FirebaseErrorListener />
        </FirebaseContext.Provider>
    );
}
