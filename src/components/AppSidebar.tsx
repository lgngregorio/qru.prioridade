
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
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';

export default function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Força o redirecionamento para a página de login e recarrega para limpar o estado.
      window.location.href = '/login';
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);
  if (isAuthPage) {
    return null; // Não renderiza a sidebar em páginas de autenticação
  }


  return (
    <>
      <SidebarHeader className="p-4 flex justify-between items-center">
        <div className="flex items-center justify-center space-x-2">
           <h1 className="text-2xl font-bold text-sidebar-foreground flex items-center justify-center gap-1">
            QRU
            <div className="flex h-6 items-center gap-1">
              <div className="w-[1.5px] h-full bg-sidebar-foreground"></div>
              <div
                className="w-[1.5px] h-full animate-move-dashes"
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
         {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
