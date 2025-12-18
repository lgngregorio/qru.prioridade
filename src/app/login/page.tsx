
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase/client-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de autenticação não disponível.' });
        return;
    }
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let description = 'Ocorreu um erro durante o login.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'Credenciais inválidas. Por favor, tente novamente.';
      }
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            Faça login para continuar
          </p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
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
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Crie uma agora
            </Link>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <Link href="/forgot-password" passHref className="text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
