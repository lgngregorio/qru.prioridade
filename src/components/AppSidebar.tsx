
'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Home,
  FileCode,
  Notebook,
  History,
  LayoutGrid,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4 flex justify-center">
        <div className="flex items-center justify-center space-x-2">
           <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            QRU
            <div className="flex h-6 items-center gap-1">
              <div className="w-0.5 h-full bg-white"></div>
              <div className="w-0.5 h-full bg-repeat-y bg-[length:3px_18px] bg-center animate-move-dashes" style={{ backgroundImage: "linear-gradient(to bottom, white 50%, transparent 50%)"}}></div>
            </div>
            PRIORIDADE
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1 pt-8">
        <SidebarMenu className="gap-y-8">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'} className="text-base [&_svg]:size-5">
              <Link href="/">
                <Home />
                Início
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-base [&_svg]:size-5">
              <Link href="#">
                <FileCode />
                Códigos
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-base [&_svg]:size-5">
              <Link href="#">
                <Notebook />
                Bloco de Nota
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/historico'} className="text-base [&_svg]:size-5">
              <Link href="/historico">
                <History />
                Histórico de Ocorrências
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-base [&_svg]:size-5">
              <Link href="#">
                <LayoutGrid />
                Atividades
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-base [&_svg]:size-5">
              <Link href="#">
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
            <SidebarMenuButton asChild className="text-lg [&_svg]:size-6">
              <Link href="#">
                <ShieldCheck />
                Políticas do SGI
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-lg [&_svg]:size-6">
              <Link href="#">
                <LogOut />
                Sair
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
