import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { firebaseConfig } from './config';

import {
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';

// Initializes Firebase services if not already initialized.
function initializeFirebase() {
  const isConfigured = getApps().length > 0;
  if (isConfigured) {
    const app = getApps()[0];
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  } else {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  }
}

export {
  initializeFirebase,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
