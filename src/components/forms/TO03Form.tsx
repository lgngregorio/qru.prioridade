
'use client';

import { useRouter } from 'next/navigation';
import { Save, Share, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import React from 'react';

import { cn } from '@/lib/utils';
import { eventCategories } from '@/lib/events';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';


export default function TO03Form({ categorySlug }: { categorySlug: string }) {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  
  const handleSave = async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível conectar ao banco de dados.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // const reportData = prepareReportData();
      // await addDoc(collection(firestore, 'reports'), reportData);
      
      toast({
        title: "Em construção!",
        description: "Este formulário ainda não pode ser salvo.",
      });
      
      // router.push('/historico');

    } catch (error) {
      console.error("Error saving report: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o relatório. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    toast({
        title: "Em construção!",
        description: "Este formulário ainda não pode ser compartilhado.",
      });
  };

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-center items-center h-48">
            <p className="text-muted-foreground">Formulário para TO 03 em construção.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 uppercase text-base" onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Compartilhar WhatsApp
          </Button>
          <Button size="lg" className="w-32 bg-primary hover:bg-primary/90 uppercase text-base" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
