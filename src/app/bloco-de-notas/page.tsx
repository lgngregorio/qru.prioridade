
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
  where,
} from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
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
import { useCollection } from '@/firebase/firestore/use-collection';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
  uid: string;
}

export default function NotepadPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const notesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) {
      return null;
    }
    return query(
      collection(firestore, 'notes'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user?.uid]);

  const { data: notes, isLoading: loadingNotes } = useCollection<Note>(notesQuery);
  const isLoading = isUserLoading || loadingNotes;
  
  const handleDelete = (noteId: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, 'notes', noteId)).then(() => {
        toast({ title: 'Nota apagada com sucesso!' });
    }).catch ((error) => {
      console.error('Error deleting note: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao apagar nota.',
        description: 'Não foi possível apagar a anotação.',
      });
    });
  };

  const handleShareNote = (note: Note) => {
    const message = `*${note.title}*\n\n${note.content}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (timestamp: Timestamp | null | undefined, options: Intl.DateTimeFormatOptions) => {
    if (!timestamp) return 'Carregando...';
    return timestamp.toDate().toLocaleString('pt-BR', options);
  };
  
  const groupedNotes = useMemo(() => {
     if (isLoading || !notes) return {};
    return notes.reduce((acc, note) => {
      if(!note.createdAt) return acc;
      const date = formatDate(note.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(note);
      return acc;
    }, {} as Record<string, Note[]>);
  }, [notes, isLoading]);


  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>
        </div>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
              BLOCO DE NOTAS
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Crie, edite e organize suas anotações.
            </p>
        </div>

        <div className="mb-6">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-lg uppercase">
                <Link href="/bloco-de-notas/novo">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Anotação
                </Link>
            </Button>
        </div>
        
        <div className="pt-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Anotações Salvas</h2>
             </div>
             {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notes && notes.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Nenhuma anotação encontrada.</p>
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
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Essa ação não pode ser desfeita. Isso irá apagar permanentemente a nota.
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(note.id)} className="bg-destructive hover:bg-destructive/80">
                                                  Apagar
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
                                      Compartilhar Novamente
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
