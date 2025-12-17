
'use client';

import Link from 'next/link';
import { ArrowLeft, Save, Moon, Sun, Monitor, Loader2, User, History, ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/layout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { updateProfile, updateEmail, signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function ConfiguracoesPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const auth = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    setSelectedTheme(currentTheme || 'light');
    if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
    }
    setIsLoaded(true);
  }, [theme, systemTheme, user]);
  
  const handleSave = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Usuário não autenticado.",
        });
        return;
    }
    
    setIsSaving(true);
    
    // Theme saving
    setTheme(selectedTheme);

    // User data saving
    try {
        if (name !== user.displayName) {
            await updateProfile(user, { displayName: name });
        }
        if (email !== user.email) {
            await updateEmail(user, email);
        }
        
        toast({
            title: "Sucesso!",
            description: "Suas configurações foram salvas.",
        });
        router.push('/');

    } catch (error: any) {
        console.error("Failed to save user data", error);
        toast({
            variant: "destructive",
            title: "Erro ao salvar perfil",
            description: error.message || "Não foi possível salvar os dados do perfil.",
        });
    }

    setIsSaving(false);
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!isLoaded || isUserLoading) {
      return (
         <main className="flex flex-col items-center p-4 md:p-6">
            <div className="w-full max-w-2xl animate-pulse">
                 <div className="w-full mb-6 pt-4 flex items-center">
                    <div className="h-10 w-48 bg-muted rounded-full" />
                </div>
                 <div className="text-center mb-8 space-y-2">
                    <div className="h-8 w-64 bg-muted rounded-md mx-auto" />
                    <div className="h-6 w-96 bg-muted rounded-md mx-auto" />
                </div>
                 <div className="space-y-8">
                    <div className="bg-card p-6 rounded-lg space-y-6 border">
                         <div className="h-7 w-32 bg-muted rounded-md" />
                         <div className="space-y-3"><div className="h-5 w-16 bg-muted rounded-md" /><div className="h-20 w-full bg-muted rounded-md" /></div>
                    </div>
                     <div className="bg-card p-6 rounded-lg space-y-6 border">
                         <div className="h-7 w-32 bg-muted rounded-md" />
                         <div className="space-y-3"><div className="h-5 w-16 bg-muted rounded-md" /><div className="h-20 w-full bg-muted rounded-md" /></div>
                    </div>
                 </div>
                 <div className="mt-8 h-12 w-full bg-primary rounded-md" />
            </div>
         </main>
      )
  }

  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-2xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
            AJUSTES
          </h1>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <User /> Perfil do Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base">Nome</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 text-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-base">E-mail</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 text-lg"
                        />
                    </div>
                </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Preferências de Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <RadioGroup
                    value={selectedTheme}
                    onValueChange={setSelectedTheme}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="light" id="theme-claro" />
                      <label
                        htmlFor="theme-claro"
                        className="font-normal text-xl flex items-center gap-2"
                      >
                        <Sun className="h-5 w-5" /> Claro
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="dark" id="theme-escuro" />
                      <label
                        htmlFor="theme-escuro"
                        className="font-normal text-xl flex items-center gap-2"
                      >
                        <Moon className="h-5 w-5" /> Escuro
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="system" id="theme-sistema" />
                      <label
                        htmlFor="theme-sistema"
                        className="font-normal text-xl flex items-center gap-2"
                      >
                        <Monitor className="h-5 w-5" /> Sistema
                      </label>
                    </div>
                  </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button size="lg" className="w-full text-lg uppercase" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        <div className="mt-12 space-y-4">
             <Button asChild variant="outline" className="w-full justify-start text-lg h-14">
               <Link href="/atividades">
                 <History className="mr-3 h-5 w-5" />
                 Histórico de Atividades
               </Link>
             </Button>
              <Button asChild variant="outline" className="w-full justify-start text-lg h-14">
               <Link href="/politicas-sgi">
                 <ShieldCheck className="mr-3 h-5 w-5" />
                 Políticas do SGI
               </Link>
             </Button>
             <Button variant="destructive" className="w-full text-lg h-14" onClick={handleLogout}>
               <LogOut className="mr-3 h-5 w-5" />
               Sair
             </Button>
        </div>
      </div>
    </main>
  );
}
