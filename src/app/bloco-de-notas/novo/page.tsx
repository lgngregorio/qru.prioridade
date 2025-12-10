
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from 'react-i18next';

export default function NovaNotaPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!firestore || !title || !content) {
      toast({
        variant: 'destructive',
        title: t('common.required_fields_title'),
        description: t('notepad.new.required_fields_description'),
      });
      return;
    }

    setIsSaving(true);
    
    const notesCollection = collection(firestore, 'notes');
    const newNote = {
      title: title,
      content: content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    addDoc(notesCollection, newNote)
      .then(() => {
        toast({ title: t('notepad.new.save_success') });
        router.push('/bloco-de-notas');
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: notesCollection.path,
            operation: 'create',
            requestResourceData: newNote,
        });

        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/bloco-de-notas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('notepad.new.back_button')}
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('notepad.new.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">{t('notepad.common.title_label')}</Label>
              <Input
                id="note-title"
                placeholder={t('notepad.common.title_placeholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">{t('notepad.common.content_label')}</Label>
              <Textarea
                id="note-content"
                placeholder={t('notepad.common.content_placeholder')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] text-xl"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? t('common.saving') : t('notepad.new.save_button')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
