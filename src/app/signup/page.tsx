
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/app/layout';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useUser();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Erro de Senha',
        description: 'As senhas não coincidem. Por favor, tente novamente.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('qru-priority-users') || '[]');
      const userExists = users.some((u: any) => u.email === email);

      if (userExists) {
        throw new Error('Este e-mail já está em uso.');
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('qru-priority-users', JSON.stringify(users));

      login({ name, email });
      
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você será redirecionado para a página principal.',
      });
      
      router.push('/');

    } catch (error: any) {
      console.error(error);
       toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description: error.message || 'Por favor, tente novamente.',
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
            <div className="flex h-10 items-center gap-1">
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
            Crie sua conta para começar
          </p>
        </header>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">Nome</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
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
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 text-lg"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Criar Conta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
