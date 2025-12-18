
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth, useFirebaseLoading } from '@/firebase/client-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const isFirebaseLoading = useFirebaseLoading();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Serviço de autenticação não disponível.' });
        return;
    }
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if(userCredential.user) {
        await updateProfile(userCredential.user, {
            displayName: name
        });
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você será redirecionado para a página principal.',
      });
      
      router.push('/');

    } catch (error: any) {
      console.error(error);
      let description = 'Por favor, tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/weak-password') {
        description = 'A senha deve ter no mínimo 6 caracteres.';
      }
       toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFirebaseLoading) {
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Crie uma senha forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-lg pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-lg pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </Button>
            </div>
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
