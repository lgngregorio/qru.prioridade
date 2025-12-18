
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { useMemo as useMemoReact } from 'react';
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

function initializeFirebase() {
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            firebaseApp = initializeApp(firebaseConfig);
        } else {
            firebaseApp = getApp();
        }
        auth = getAuth(firebaseApp);
        firestore = getFirestore(firebaseApp);
    }
}

// Call initialization
initializeFirebase();

export function getFirebaseInstances() {
    if (!firebaseApp || !auth || !firestore) {
       // This can happen in a server-side context or if initialization fails.
       // The provider will re-attempt initialization on the client.
       initializeFirebase();
       if (!firebaseApp || !auth || !firestore) {
         throw new Error("Firebase has not been initialized. Make sure you are running in a client environment.");
       }
    }
    return { app: firebaseApp, auth, firestore };
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
