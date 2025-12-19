
'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';
import { Home, FileCode, ListOrdered, Notebook, Settings } from 'lucide-react';
import Link from 'next/link';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Loader2 } from 'lucide-react';
import { logActivity } from '@/lib/activity-logger';
import { FirebaseProvider, useUser, useFirebaseLoading } from '@/firebase/provider';

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
  const isFirebaseLoading = useFirebaseLoading();
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    if (isLoading || isFirebaseLoading) return;
    
    const isPublicRoute = publicRoutes.includes(pathname);

    if (user && isPublicRoute) {
        router.replace('/');
    }
    
    if (!user && !isPublicRoute) {
        router.replace('/login');
    }
    
  }, [user, isLoading, isFirebaseLoading, router, pathname]);

  if (isLoading || isFirebaseLoading || (!user && !publicRoutes.includes(pathname))) {
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
          <FirebaseProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
            <Toaster />
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
