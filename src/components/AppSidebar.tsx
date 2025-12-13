
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
  LayoutGrid,
  Settings,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Você saiu.' });
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao sair.' });
    }
  };

  return (
    <>
      <SidebarHeader className="p-4 flex justify-center">
        <div className="flex items-center justify-center space-x-2">
           <h1 className="text-3xl font-bold text-sidebar-foreground flex items-center justify-center gap-1">
            QRU
            <div className="flex h-6 items-center gap-1">
              <div className="w-[1.5px] h-full bg-white"></div>
              <div
                className="w-[1.5px] h-full animate-move-dashes"
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, white 50%, transparent 50%)',
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
            <SidebarMenuButton asChild isActive={pathname === '/meu-perfil'} className="text-base [&_svg]:size-5" onClick={handleLinkClick}>
              <Link href="/meu-perfil">
                <User />
                Meu Perfil
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
            <SidebarMenuButton asChild isActive={pathname === '/historico'} className="text-base [&_svg]:size-5" onClick={handleLinkClick}>
              <Link href="/historico">
                <History />
                Histórico de Ocorrências
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-base [&_svg]:size-5" onClick={handleLinkClick}>
              <Link href="#">
                <LayoutGrid />
                Atividades
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
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-lg [&_svg]:size-6" onClick={handleLogout}>
              <button>
                <LogOut />
                Sair
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
