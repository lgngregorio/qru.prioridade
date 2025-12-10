
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Trash2, Edit, Plus, ChevronUp, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';


interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export default function NotepadPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const notesRef = collection(firestore, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const fetchedNotes = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Firestore Timestamps can be null on the client briefly after creation.
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
          } as Note;
        });
        setNotes(fetchedNotes);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notes: ', error);
        toast({
          variant: 'destructive',
          title: t('notepad.list.fetch_error_title'),
          description: t('notepad.list.fetch_error_description'),
        });
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestore, toast, t]);
  
  const handleDelete = (noteId: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, 'notes', noteId)).then(() => {
        toast({ title: t('notepad.list.delete_success_title') });
    }).catch ((error) => {
      console.error('Error deleting note: ', error);
      toast({
        variant: 'destructive',
        title: t('notepad.list.delete_error_title'),
        description: t('notepad.list.delete_error_description'),
      });
    });
  };

  const handleShareNote = (note: Note) => {
    const message = `*${note.title}*\n\n${note.content}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (timestamp: Timestamp | null | undefined, options: Intl.DateTimeFormatOptions) => {
    if (!timestamp) return t('notepad.list.loading_date');
    return timestamp.toDate().toLocaleString('pt-BR', options);
  };
  
  const groupedNotes = useMemo(() => {
     if (loading) return {};
    return notes.reduce((acc, note) => {
      if(!note.createdAt) return acc;
      const date = formatDate(note.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(note);
      return acc;
    }, {} as Record<string, Note[]>);
  }, [notes, loading]);


  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back_to_home')}
            </Link>
          </Button>
        </div>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
              {t('notepad.list.title')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('notepad.list.description')}
            </p>
        </div>

        <div className="mb-6">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-lg uppercase">
                <Link href="/bloco-de-notas/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('notepad.list.new_note_button')}
                </Link>
            </Button>
        </div>
        
        <div className="pt-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('notepad.list.saved_notes_title')}</h2>
             </div>
             {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">{t('notepad.list.no_notes')}</p>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedNotes).map(([date, notesOnDate]) => (
                      <div key={date}>
                        <h3 className="text-xl font-bold mb-4">{date}</h3>
                        <div className="space-y-4">
                        {notesOnDate.map((note) => (
                           <Card key={note.id} className="bg-card/50">
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-2">
                                        <CardTitle className="text-2xl">{note.title}</CardTitle>
                                        <span className="text-sm text-muted-foreground">
                                          {formatDate(note.createdAt, { hour: '2-digit', minute: '2-digit'})}
                                        </span>
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div className="flex items-center gap-0">
                                          <Button asChild variant="ghost" size="icon">
                                            <Link href={`/bloco-de-notas/editar/${note.id}`}>
                                              <Edit className="h-5 w-5 text-primary" />
                                            </Link>
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button variant="ghost" size="icon">
                                                  <Trash2 className="h-5 w-5 text-destructive" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>{t('common.are_you_sure')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  {t('notepad.list.delete_warning')}
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(note.id)} className="bg-destructive hover:bg-destructive/80">
                                                  {t('common.delete')}
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                      </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0 pb-4">
                                    <p className="whitespace-pre-wrap text-lg">{note.content}</p>
                                </CardContent>
                                 <CardFooter>
                                    <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleShareNote(note)}>
                                      <Share2 className="mr-2 h-4 w-4" />
                                      {t('notepad.list.share_button')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                        </div>
                      </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </main>
  );
}
