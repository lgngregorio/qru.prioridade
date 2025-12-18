
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
    
    // This should ideally not happen in client components
    // but as a fallback, we handle server-side where window is not defined.
    // In this case, getApps() should be used on the server if needed.
    if (getApps().length) {
        firebaseApp = getApp();
        return firebaseApp;
    }

    // This will throw if run on server without a previous initialization.
    // Which is the correct behavior.
    firebaseApp = initializeApp(firebaseConfig);
    return firebaseApp;
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
