
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useMemo as useMemoReact } from 'react';
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';

let firebaseApp: FirebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export function getFirebaseInstances() {
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
