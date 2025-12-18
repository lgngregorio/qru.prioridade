
'use client';

import React, {
  ReactNode,
  useState,
  useEffect,
  createContext,
  useContext
} from 'react';
import { initializeApp, getApps, getApp, FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import { FirebaseProvider } from '@/firebase/provider';

export { useCollection, useMemoFirebase } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

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
      const firebaseConfig: FirebaseOptions = {
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
      
      let firebaseApp: FirebaseApp;
      if (getApps().length === 0) {
          firebaseApp = initializeApp(firebaseConfig);
      } else {
          firebaseApp = getApp();
      }

      setApp(firebaseApp);
      setAuth(getAuth(firebaseApp));
      setFirestore(getFirestore(firebaseApp));
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

export type { FirebaseApp };
