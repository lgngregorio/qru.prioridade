'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MeuPerfilPage() {
  // O hook useUser gerencia o estado de autenticação de forma assíncrona.
  const { user, isUserLoading } = useUser();

  // 1. Exibe um estado de carregamento enquanto o Firebase verifica o usuário.
  if (isUserLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
      </main>
    );
  }

  // 2. Se não houver usuário após o carregamento, você pode redirecionar
  // (embora o AuthProvider já faça isso para proteger a rota).
  if (!user) {
     return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-muted-foreground mb-8">
          Você precisa estar logado para ver esta página.
        </p>
        <Button asChild>
          <Link href="/login">Ir para o Login</Link>
        </Button>
      </main>
    );
  }

  // 3. Se o usuário estiver disponível, exiba as informações dele.
  return (
    <main className="flex flex-col items-center p-4 md:p-6">
       <div className="w-full max-w-2xl">
         <div className="w-full mb-6 pt-4 flex items-center">
           <Button asChild variant="outline" className="rounded-full">
             <Link href="/">
               <ArrowLeft className="mr-2 h-4 w-4" />
               Voltar para o Início
             </Link>
           </Button>
         </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg">
            <div className="flex flex-col">
                <span className="font-bold text-muted-foreground">Nome:</span>
                <span>{user.displayName || 'Não informado'}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-muted-foreground">Email:</span>
                <span>{user.email || 'Não informado'}</span>
            </div>
             <div className="flex flex-col">
                <span className="font-bold text-muted-foreground">UID:</span>
                <span className="text-sm break-all">{user.uid}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
