
'use client';

// This file is intentionally left with minimal code as the app is configured to use localStorage for data persistence.
// The existing Firebase-related hooks and providers are not used in the current app configuration.

// Should you wish to integrate Firebase, you can uncomment and adjust the following code.
/*
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
*/

// Exporting dummy hooks and providers to prevent breaking imports.
// These can be replaced with actual Firebase implementations if needed.
export const useUser = () => ({ user: null, isUserLoading: true, userError: null });
export const useAuth = () => ({});
export const useFirestore = () => ({});
export const useFirebaseApp = () => ({});
export const useCollection = () => ({ data: [], isLoading: true, error: null });
export const useDoc = () => ({ data: null, isLoading: true, error: null });
export const useMemoFirebase = (factory: () => any, deps: any[]) => factory();
