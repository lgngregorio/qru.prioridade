
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

// This is a mock database. In a real app, you would fetch this from your backend.
let userProfileDB = {
  name: 'Lucas',
  email: 'lgngregorio@icloud.com',
  theme: 'dark',
};

// This function simulates fetching the user profile from a database.
const getUserProfile = () => {
    return { ...userProfileDB };
};

// This function simulates updating the user profile in a database.
const updateUserProfile = (profile: Partial<typeof userProfileDB>) => {
  userProfileDB = { ...userProfileDB, ...profile };
  return { ...userProfileDB };
};


export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  // State for the form's current values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial data into the form state when the component mounts
  useEffect(() => {
    const profile = getUserProfile();
    setName(profile.name);
    setEmail(profile.email);
    // Use the theme from next-themes as the source of truth for the radio button
    setSelectedTheme(theme || profile.theme); 
    setIsLoaded(true);
  }, [theme]); // Rerun when theme changes externally

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving to a backend
    setTimeout(() => {
      // 1. Save Profile Info
      updateUserProfile({ name, email, theme: selectedTheme });
      
      // 2. Apply Theme
      setTheme(selectedTheme);
      
      setIsSaving(false);
      toast({
        title: "Sucesso!",
        description: "Suas configurações foram salvas.",
      });
      router.push('/');
    }, 1000);
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
