
'use client';

import Link from 'next/link';
import { ArrowLeft, Save, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [name, setName] = useState('Lucas');
  const [email, setEmail] = useState('lgngregorio@icloud.com');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving to a backend
    setTimeout(() => {
      console.log('Saved:', { name, email, theme });
      setIsSaving(false);
      toast({
        title: 'Sucesso!',
        description: 'Suas configurações foram salvas.',
      });
    }, 1000);
  };

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
                  defaultValue={theme}
                  onValueChange={setTheme}
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
              <div className="space-y-2">
                <Label htmlFor="language">IDIOMA</Label>
                <Select defaultValue="pt-br">
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                    <SelectItem value="en-us">English (United States)</SelectItem>
                    <SelectItem value="es-es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button size="lg" className="w-full text-lg uppercase" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </main>
  );
}
