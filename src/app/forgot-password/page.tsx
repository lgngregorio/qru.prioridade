
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de autenticação não disponível.' });
        return;
    }
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'E-mail de redefinição enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      router.push('/login');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar e-mail',
        description: 'Por favor, verifique o e-mail digitado e tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!auth) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-background p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
    )
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <header className="text-center w-full mb-8">
          <h1 className="text-4xl font-bold text-foreground font-headline tracking-wider flex items-center justify-center gap-4">
            QRU
            <div className="flex h-10 items-center gap-px">
              <div className="w-[2px] h-full bg-foreground"></div>
              <div
                className="w-[2px] h-full animate-move-dashes"
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, hsl(var(--foreground)) 50%, transparent 50%)',
                  backgroundSize: '2px 20px',
                  backgroundRepeat: 'repeat-y',
                }}
              ></div>
            </div>
            PRIORIDADE
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Recuperar Senha
          </p>
        </header>

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Enviar e-mail de redefinição
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}
