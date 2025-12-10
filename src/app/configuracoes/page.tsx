
'use client';

import Link from 'next/link';
import { ArrowLeft, Save, Moon, Sun, Monitor, Loader2 } from 'lucide-react';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';

// This is a mock database. In a real app, you would fetch this from your backend.
let userProfileDB = {
  name: 'Lucas',
  email: 'lgngregorio@icloud.com',
  language: 'pt',
  theme: 'dark',
};

// This function simulates fetching the user profile from a database.
const getUserProfile = () => {
    console.log("DATABASE READ:", { ...userProfileDB });
    return { ...userProfileDB };
};


// This function simulates updating the user profile in a database.
const updateUserProfile = (profile: Partial<typeof userProfileDB>) => {
  userProfileDB = { ...userProfileDB, ...profile };
  console.log("DATABASE WRITE:", { ...userProfileDB });
  return { ...userProfileDB };
};


export default function ConfiguracoesPage() {
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const { changeLanguage } = useI18n();
  const { t, i18n } = useTranslation();

  // Temporary state for form edits
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial data into the form state when the component mounts
  useEffect(() => {
    const profile = getUserProfile();
    setName(profile.name);
    setEmail(profile.email);
    setSelectedTheme(profile.theme);
    setSelectedLanguage(profile.language);
    
    // Ensure i18next language is in sync with the saved profile
    if (i18n.language !== profile.language) {
      changeLanguage(profile.language);
    }
    // Ensure next-themes is in sync
    setTheme(profile.theme);

    setIsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving to a backend
    setTimeout(() => {
      // 1. Save Profile Info
      updateUserProfile({ name, email, language: selectedLanguage, theme: selectedTheme });
      
      // 2. Apply Theme
      setTheme(selectedTheme);
      
      // 3. Apply Language
      changeLanguage(selectedLanguage);

      setIsSaving(false);
      toast({
        title: t('settings.success_title'),
        description: t('settings.success_description'),
      });
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
                         <div className="space-y-2"><div className="h-5 w-20 bg-muted rounded-md" /><div className="h-12 w-full bg-muted rounded-md" /></div>
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
              {t('settings.back_button')}
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
            {t('settings.title')}
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            {t('settings.description')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Perfil Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('settings.profile')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('settings.name')}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('settings.email')}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Preferências Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('settings.preferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{t('settings.theme')}</Label>
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
                        <Sun className="h-5 w-5" /> {t('settings.light')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="dark" id="theme-escuro" />
                      <Label
                        htmlFor="theme-escuro"
                        className="font-normal text-xl flex items-center gap-2"
                      >
                        <Moon className="h-5 w-5" /> {t('settings.dark')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="system" id="theme-sistema" />
                      <Label
                        htmlFor="theme-sistema"
                        className="font-normal text-xl flex items-center gap-2"
                      >
                        <Monitor className="h-5 w-5" /> {t('settings.system')}
                      </Label>
                    </div>
                  </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">{t('languages.pt')}</SelectItem>
                    <SelectItem value="en">{t('languages.en')}</SelectItem>
                    <SelectItem value="es">{t('languages.es')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button size="lg" className="w-full text-lg uppercase" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isSaving ? t('settings.saving_button') : t('settings.save_changes')}
          </Button>
        </div>
      </div>
    </main>
  );
}
