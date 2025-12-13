'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const publicRoutes = ['/login', '/signup', '/recuperar-senha'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push('/login');
    }

    if (user && isPublicRoute) {
      router.push('/');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  // Se o usuário não estiver logado e estiver em uma rota pública, ou se estiver logado e não em rota pública
  const isPublicAndNotLoggedIn = !user && publicRoutes.includes(pathname);
  const isLoggedInAndNotPublic = user && !publicRoutes.includes(pathname);

  if (isPublicAndNotLoggedIn || isLoggedInAndNotPublic) {
    return <>{children}</>;
  }
  
  if(user && publicRoutes.includes(pathname)){
      return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  // Caso contrário, não renderize nada para evitar flashes de conteúdo
  return null;
}
