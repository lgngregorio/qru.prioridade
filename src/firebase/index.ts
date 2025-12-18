
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { useMemo as useMemoReact } from 'react';
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';

let firebaseApp: FirebaseApp | undefined;

function getFirebaseApp(): FirebaseApp {
    if (firebaseApp) {
        return firebaseApp;
    }

    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            firebaseApp = initializeApp(firebaseConfig);
        } else {
            firebaseApp = getApp();
        }
        return firebaseApp;
    }
    
    // This will only happen on the server, where we should not initialize.
    // Throw an error to make it clear that this should not be called server-side.
    throw new Error("Firebase cannot be initialized on the server. Make sure this is only called in a client component.");
}


export function getFirebaseInstances() {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    
    return { app, auth, firestore };
}

export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemoReact(factory, deps);
  if(memoized && typeof memoized === 'object') {
    try {
      Object.defineProperty(memoized, '__memo', {
        value: true,
        enumerable: false
      });
    } catch(e) {
      // ignore, this is a best effort
    }
  }
  return memoized;
}

export { initializeApp, getApps, getApp };
export type { FirebaseApp };

