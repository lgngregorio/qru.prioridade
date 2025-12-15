
'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Loader2 } from 'lucide-react';
import { FirebaseProvider, useAuth } from '@/firebase';
import { logActivity } from '@/lib/activity-logger';

// --- User Context for Firebase Auth ---
interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user && !isLoading && pathname) {
      // Avoid logging auth pages
      if (!['/login', '/signup', '/forgot-password'].includes(pathname)) {
        logActivity(user.email, {
          type: 'navigation',
          description: `Navegou para: ${pathname}`,
          url: pathname,
        });
      }
    }
  }, [pathname, user, isLoading]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
// --- End User Context ---

const publicRoutes = ['/login', '/signup', '/forgot-password'];

function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);

      if (user) {
        if (isPublicRoute) {
          router.replace('/');
        }
      } else {
        if (!isPublicRoute) {
          router.replace('/login');
        }
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || (!user && !publicRoutes.includes(pathname))) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();
  const isAuthPage = publicRoutes.includes(pathname);

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Oswald:wght@200..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'font-body antialiased min-h-screen bg-background'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <FirebaseProvider>
            <UserProvider>
              {isAuthPage ? (
                  children
                ) : (
                  <AuthGuard>
                    <SidebarProvider>
                      <Sidebar>
                        <AppSidebar />
                      </Sidebar>
                      <SidebarInset>{children}</SidebarInset>
                    </SidebarProvider>
                  </AuthGuard>
                )
              }
              <Toaster />
            </UserProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
