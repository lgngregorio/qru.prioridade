
'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Home, FileCode, ListOrdered, Notebook, Settings } from 'lucide-react';
import Link from 'next/link';


import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Loader2 } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useAuth } from '@/firebase/provider';
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
    if (!auth) {
        setIsLoading(false); // Firebase not ready yet
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (user && !isLoading && pathname) {
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

const navItems = [
    { href: '/', icon: Home, label: 'Início' },
    { href: '/codigos', icon: FileCode, label: 'Códigos' },
    { href: '/ocorrencias', icon: ListOrdered, label: 'Ocorrências' },
    { href: '/notas', icon: Notebook, label: 'Notas' },
    { href: '/configuracoes', icon: Settings, label: 'Ajustes' },
];

function BottomNavBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-t-lg z-50 h-24">
            <div className="flex justify-around items-center h-full">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors",
                            pathname === item.href ? "text-primary" : "hover:text-foreground"
                        )}
                    >
                        <item.icon className="h-6 w-6 mb-1" />
                        <span className="text-base font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}

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

  const showNavBar = !publicRoutes.includes(pathname) && user;


  return (
    <>
      <div className={cn(showNavBar && "pb-24")}>{children}</div>
      {showNavBar && <BottomNavBar />}
    </>
  );
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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
          <FirebaseClientProvider>
            <UserProvider>
              {isAuthPage ? (
                  children
                ) : (
                  <AuthGuard>
                    {children}
                  </AuthGuard>
                )
              }
              <Toaster />
            </UserProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
