
'use client';

// This file is intentionally left with minimal code as the app is configured to use localStorage for data persistence.
// The FirebaseProvider is not used in the current app configuration.
// If you decide to use Firebase, you would implement the provider logic here.

import React, { ReactNode } from 'react';

// A placeholder provider.
export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
