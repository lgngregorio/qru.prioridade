
'use client';

// This file is intentionally left with minimal code as the app is configured to use localStorage for data persistence.
// The FirebaseClientProvider is not used in the current app configuration.

import React, { type ReactNode } from 'react';

// A placeholder client provider.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
