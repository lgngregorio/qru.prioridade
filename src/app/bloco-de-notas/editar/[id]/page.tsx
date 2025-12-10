
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  doc,
  getDoc,
  updateDoc,
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
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTranslation } from 'react-i18next';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export default function EditarNotaPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchNote() {
      if (!firestore || !noteId) return;
      setLoading(true);
      try {
        const noteRef = doc(firestore, 'notes', noteId);
        const docSnap = await getDoc(noteRef);

        if (docSnap.exists()) {
          const fetchedNote = { id: docSnap.id, ...docSnap.data() } as Note;
          setNote(fetchedNote);
          setTitle(fetchedNote.title);
          setContent(fetchedNote.content);
        } else {
          toast({
            variant: 'destructive',
            title: t('notepad.edit.not_found_error'),
          });
          router.push('/bloco-de-notas');
        }
      } catch (error) {
        console.error('Error fetching note: ', error);
        toast({
          variant: 'destructive',
          title: t('notepad.edit.load_error'),
        });
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [firestore, noteId, router, toast, t]);

  const handleSave = () => {
    if (!firestore || !title || !content) {
      toast({
        variant: 'destructive',
        title: t('common.required_fields_title'),
        description: t('notepad.edit.required_fields_description'),
      });
      return;
    }

    setIsSaving(true);
    const noteRef = doc(firestore, 'notes', noteId);
    const updatedData = {
        title: title,
        content: content,
        updatedAt: serverTimestamp(),
      };
    
    updateDoc(noteRef, updatedData)
        .then(() => {
            toast({ title: t('notepad.edit.save_success') });
            router.push('/bloco-de-notas');
        })
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: noteRef.path,
              operation: 'update',
              requestResourceData: updatedData,
          });
    
          errorEmitter.emit('permission-error', permissionError);
          
        }).finally(() => {
            setIsSaving(false);
        });
  };

  if (loading) {
    return (
        <main className="flex flex-col items-center p-4 md:p-6">
            <div className="w-full max-w-4xl">
                 <div className="w-full mb-6 pt-4 flex items-center">
                    <Skeleton className="h-10 w-64 rounded-full" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                           <Skeleton className="h-6 w-24" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                         <div className="space-y-2">
                           <Skeleton className="h-6 w-24" />
                           <Skeleton className="h-40 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
         <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/bloco-de-notas">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('notepad.edit.back_button')}
            </Link>
          </Button>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('notepad.edit.title')}</CardTitle>
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
              {isSaving ? t('common.saving') : t('notepad.edit.save_button')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
