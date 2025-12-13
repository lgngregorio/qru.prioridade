
'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  FileCode,
  History,
  Settings,
  ShieldCheck,
  LogOut,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast({
        title: 'Logout realizado com sucesso!',
      });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: 'Não foi possível fazer logout. Tente novamente.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <SidebarHeader className="p-4 flex justify-center">
        <div className="flex items-center justify-center space-x-2">
           <h1 className="text-3xl font-bold text-sidebar-foreground flex items-center justify-center gap-1">
            QRU
            <div className="flex h-6 items-center gap-1">
              <div className="w-[2px] h-full bg-sidebar-foreground"></div>
              <div
                className="w-[2px] h-full animate-move-dashes"
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, hsl(var(--sidebar-foreground)) 50%, transparent 50%)',
                  backgroundSize: '1.5px 20px',
                  backgroundRepeat: 'repeat-y',
                }}
              ></div>
            </div>
            PRIORIDADE
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 pt-8">
        <SidebarMenu className="gap-y-8">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'} className="text-base [&_svg]:size-5" onClick={handleLinkClick}>
              <Link href="/">
                <Home />
                Início
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/ocorrencias'} className="text-base [&_svg]:size-5" onClick={handleLinkClick}>
              <Link href="/ocorrencias">
                <History />
                Ocorrências
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/codigos'} className="text-base [&_svg]:size-5" onClick={handleLinkClick}>
              <Link href="/codigos">
                <FileCode />
                Códigos
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/configuracoes'} className="text-base [&_svg]:size-5" onClick={handleLinkClick}>
              <Link href="/configuracoes">
                <Settings />
                Configurações
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-y-8">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/politicas-sgi'} className="text-lg [&_svg]:size-6" onClick={handleLinkClick}>
              <Link href="/politicas-sgi">
                <ShieldCheck />
                Políticas do SGI
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-base [&_svg]:size-5"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <LogOut />
                )}
                Sair
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
