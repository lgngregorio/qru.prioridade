
'use client';

import Link from 'next/link';
import { ArrowLeft, Save, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile, updateEmail } from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setName(profile.name || user.displayName || '');
            setEmail(profile.email || user.email || '');
            setSelectedTheme(profile.theme || theme || 'light');
          } else {
            // Pre-fill from auth if no Firestore doc exists
            setName(user.displayName || '');
            setEmail(user.email || '');
            setSelectedTheme(theme || 'light');
          }
        } catch (serverError) {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
        } finally {
          setIsLoaded(true);
        }
      } else if (!user) {
          // If there is no user, stop loading and maybe show a message or redirect
          setIsLoaded(true);
      }
    }
    loadUserProfile();
  }, [user, firestore, theme]);

  const handleSave = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Usuário não autenticado.',
      });
      return;
    }

    setIsSaving(true);
    
    // 1. Update Auth Profile first (if necessary)
    try {
        if (user.displayName !== name) {
            await updateProfile(user, { displayName: name });
        }
        if (user.email !== email) {
            await updateEmail(user, email);
        }
    } catch (authError: any) {
        console.error("Auth profile update failed:", authError);
        toast({
            variant: "destructive",
            title: "Erro ao atualizar perfil",
            description: authError.code === 'auth/requires-recent-login'
              ? "Para sua segurança, esta operação requer uma autenticação recente. Por favor, faça logout e login novamente para alterar o email."
              : "Não foi possível atualizar seu perfil de autenticação.",
        });
        setIsSaving(false);
        return; // Stop execution if auth update fails
    }


    // 2. Update Firestore Profile
    const userDocRef = doc(firestore, 'users', user.uid);
    const profileData = {
      name: name,
      email: email,
      theme: selectedTheme,
    };

    setDoc(userDocRef, profileData, { merge: true })
      .then(() => {
        // 3. Apply Theme
        setTheme(selectedTheme);
        
        toast({
          title: "Sucesso!",
          description: "Suas configurações foram salvas.",
        });
        router.push('/');
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'write',
          requestResourceData: profileData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Erro no Banco de Dados",
            description: "Não foi possível salvar suas configurações no banco de dados.",
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  if (!isLoaded) {
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
                         <div className="h-7 w-24 bg-muted rounded-md" />
                         <div className="space-y-2"><div className="h-5 w-16 bg-muted rounded-md" /><div className="h-12 w-full bg-muted rounded-md" /></div>
                         <div className="space-y-2"><div className="h-5 w-16 bg-muted rounded-md" /><div className="h-12 w-full bg-muted rounded-md" /></div>
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
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Início
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
            CONFIGURAÇÕES
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Gerencie suas informações de perfil e preferências.
          </p>
        </div>

        <div className="space-y-8">
          {/* Perfil Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">NOME</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">EMAIL</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Preferências Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Preferências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>TEMA</Label>
                <RadioGroup
                    value={selectedTheme}
                    onValueChange={setSelectedTheme}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="light" id="theme-claro" />
                      <Label
                        htmlFor="theme-claro"
                        className="font-normal text-xl flex items-center gap-2"
                      >
                        <Sun className="h-5 w-5" /> Claro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="dark" id="theme-escuro" />
                      <Label
                        htmlFor="theme-escuro"
                        className="font-normal text-xl flex items-center gap-2"
                      >
                        <Moon className="h-5 w-5" /> Escuro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="system" id="theme-sistema" />
                      <Label
                        htmlFor="theme-sistema"
                        className="font-normal text-xl flex items-center gap-2"
                      >
                        <Monitor className="h-5 w-5" /> Sistema
                      </Label>
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
      </div>
    </main>
  );
}
