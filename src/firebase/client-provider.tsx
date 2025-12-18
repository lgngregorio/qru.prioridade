'use client';

import React, {
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { FirebaseProvider } from '@/firebase/provider';

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
    // Check if running on the client
    if (typeof window !== 'undefined') {
      
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
      
      let firebaseApp;
      if (getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        firebaseApp = getApp();
      }

      setApp(firebaseApp);
      setAuth(getAuth(firebaseApp));
      setFirestore(getFirestore(firebaseApp));
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FirebaseProvider app={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
}
