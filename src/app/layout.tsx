
'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth'; // Import onAuthStateChanged
import { useAuth } from '@/firebase'; // Assuming useAuth gives you the auth instance

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
import { FirebaseClientProvider } from '@/firebase';
import { Loader2 } from 'lucide-react';

const publicRoutes = ['/login', '/signup', '/forgot-password'];

function AuthGuard({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router, pathname]);

  if (isLoading) {
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
          <FirebaseClientProvider>
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
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
