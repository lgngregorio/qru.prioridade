
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function NovaNotaPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!firestore || !title || !content) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o título e o conteúdo da nota.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(firestore, 'notes'), {
        title: title,
        content: content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Nota salva com sucesso!' });
      router.push('/bloco-de-notas');
    } catch (error) {
      console.error('Error saving note: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar nota.',
        description: 'Não foi possível salvar a anotação.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/bloco-de-notas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Bloco de Notas
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nova Anotação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">TÍTULO</Label>
              <Input
                id="note-title"
                placeholder="Título da nota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">CONTEÚDO</Label>
              <Textarea
                id="note-content"
                placeholder="Escreva sua anotação aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] text-xl"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Nota
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

