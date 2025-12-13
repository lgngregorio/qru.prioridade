'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Sucesso!',
        description: 'Login realizado com sucesso.',
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-foreground font-headline tracking-wider flex items-center justify-center gap-4">
            QRU
            <div className="flex h-10 items-center gap-1">
              <div className="w-[1.5px] h-full bg-foreground"></div>
              <div
                className="w-[1.5px] h-full animate-move-dashes"
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, hsl(var(--foreground)) 50%, transparent 50%)',
                  backgroundSize: '1.5px 20px',
                  backgroundRepeat: 'repeat-y',
                }}
              ></div>
            </div>
            PRIORIDADE
          </CardTitle>
          <CardDescription>Acesse sua conta para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
          </Button>
          <div className="flex justify-between w-full text-sm">
            <Button variant="link" asChild>
              <Link href="/recuperar-senha">Esqueceu a senha?</Link>
            </Button>
            <Button variant="link" asChild>
               <Link href="/signup">Criar conta</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
