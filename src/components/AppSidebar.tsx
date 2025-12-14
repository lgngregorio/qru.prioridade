
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
  Settings,
  ShieldCheck,
  LogOut,
  User,
  ListOrdered,
  Notebook
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/app/layout';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

export default function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  return (
    <>
      <SidebarHeader className="p-4 pt-6 flex justify-between items-center">
        <div className="flex items-center justify-center space-x-2">
           <h1 className="text-3xl font-bold text-sidebar-foreground flex items-center justify-center gap-2">
            QRU
            <div className="flex h-6 items-center gap-2">
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
      </SidebarHeader>
      <SidebarContent className="flex-1 pt-8">
        <SidebarMenu className="gap-y-10">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'} className="text-xl [&_svg]:size-7" onClick={handleLinkClick}>
              <Link href="/">
                <Home />
                Início
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/notas'} className="text-xl [&_svg]:size-7" onClick={handleLinkClick}>
              <Link href="/notas">
                <Notebook />
                Bloco de Notas
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/ocorrencias')} className="text-xl [&_svg]:size-7" onClick={handleLinkClick}>
              <Link href="/ocorrencias">
                <ListOrdered />
                Ocorrências
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/codigos'} className="text-xl [&_svg]:size-7" onClick={handleLinkClick}>
              <Link href="/codigos">
                <FileCode />
                Códigos
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/configuracoes'} className="text-xl [&_svg]:size-7" onClick={handleLinkClick}>
              <Link href="/configuracoes">
                <Settings />
                Configurações
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-y-4">
           <SidebarMenuItem>
             <SidebarMenuButton asChild isActive={pathname === '/politicas-sgi'} className="text-xl [&_svg]:size-7" onClick={handleLinkClick}>
               <Link href="/politicas-sgi">
                 <ShieldCheck />
                 Políticas do SGI
               </Link>
             </SidebarMenuButton>
           </SidebarMenuItem>
           <SidebarMenuItem>
             <SidebarMenuButton onClick={handleLogout} className="text-xl [&_svg]:size-7">
               <LogOut />
               Sair
             </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
