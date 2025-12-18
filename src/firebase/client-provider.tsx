
'use client';

import React, {
  ReactNode,
  useState,
  useEffect,
  createContext,
  useContext
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

const FirebaseLoadingContext = createContext<boolean>(true);

export const useFirebaseLoading = () => useContext(FirebaseLoadingContext);

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { app, auth, firestore } = initializeFirebase();
    setApp(app);
    setAuth(auth);
    setFirestore(firestore);
    setIsLoading(false);
  }, []);

  return (
    <FirebaseLoadingContext.Provider value={isLoading}>
        <FirebaseProvider app={app} auth={auth} firestore={firestore}>
            {children}
        </FirebaseProvider>
    </FirebaseLoadingContext.Provider>
  );
}
