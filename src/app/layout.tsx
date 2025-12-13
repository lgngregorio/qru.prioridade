
'use client';

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
import { usePathname, useRouter } from 'next/navigation';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const PUBLIC_PAGES = ['/login', '/signup', '/forgot-password'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicPage = PUBLIC_PAGES.includes(pathname);

  useEffect(() => {
    // Se não estiver carregando e não houver usuário logado...
    if (!isUserLoading && !user) {
      // E a página não for pública, redireciona para o login.
      if (!isPublicPage) {
        router.replace('/login');
      }
    }
  }, [user, isUserLoading, router, pathname, isPublicPage]);

  // Se estiver em uma página pública ou se o usuário estiver logado,
  // ou se ainda estiver carregando, mostra o conteúdo.
  // O carregamento é mostrado para evitar piscar a tela de login.
  if (isUserLoading || isPublicPage || user) {
     return <>{children}</>;
  }

  // Se não estiver carregando, não for uma página pública e não tiver usuário,
  // mostra o loader principal enquanto redireciona.
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
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
            <AuthGuard>
              <SidebarProvider>
                <Sidebar>
                  <AppSidebar />
                </Sidebar>
                <SidebarInset>{children}</SidebarInset>
              </SidebarProvider>
            </AuthGuard>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
