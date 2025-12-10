
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Loader2, ArrowLeft, Trash2, Edit, Save, Plus, ChevronUp, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export default function NotepadPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<{ id: string | null; title: string; content: string }>({
    id: null,
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    async function fetchNotes() {
      if (!firestore) return;
      setLoading(true);
      try {
        const notesRef = collection(firestore, 'notes');
        const q = query(notesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedNotes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];
        setNotes(fetchedNotes);
      } catch (error) {
        console.error('Error fetching notes: ', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar notas.',
          description: 'Houve um problema ao carregar as anotações.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [firestore, toast]);
  
  const handleSave = async () => {
    if (!firestore || !currentNote.title || !currentNote.content) {
         toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha o título e o conteúdo da nota.",
        });
      return;
    }

    setIsSaving(true);
    try {
      if (currentNote.id) {
        // Update existing note
        const noteRef = doc(firestore, 'notes', currentNote.id);
        await updateDoc(noteRef, {
          title: currentNote.title,
          content: currentNote.content,
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Nota atualizada com sucesso!' });
        setNotes(notes.map(n => n.id === currentNote.id ? {...n, title: currentNote.title, content: currentNote.content, updatedAt: Timestamp.now()} : n));
      } else {
        // Create new note
        const docRef = await addDoc(collection(firestore, 'notes'), {
          title: currentNote.title,
          content: currentNote.content,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
         toast({ title: 'Nota salva com sucesso!' });
         // Optimistically add to UI
         const newNote = {
            id: docRef.id,
            title: currentNote.title,
            content: currentNote.content,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
         }
         setNotes([newNote, ...notes]);
      }
      handleNewNoteClick(); // Reset form
      setIsFormVisible(false);
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

  const handleDelete = async (noteId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'notes', noteId));
      setNotes(notes.filter((note) => note.id !== noteId));
      toast({ title: 'Nota apagada com sucesso!' });
      if (currentNote.id === noteId) {
        handleNewNoteClick();
        setIsFormVisible(false);
      }
    } catch (error) {
      console.error('Error deleting note: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao apagar nota.',
        description: 'Não foi possível apagar a anotação.',
      });
    }
  };

  const handleEditClick = (note: Note) => {
    setCurrentNote({ id: note.id, title: note.title, content: note.content });
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleNewNoteClick = () => {
    setCurrentNote({ id: null, title: '', content: '' });
    setIsFormVisible(true);
  }
  
  const handleCancelEdit = () => {
    setCurrentNote({ id: null, title: '', content: '' });
    setIsFormVisible(false);
  }

  const handleShareNote = (note: Note) => {
    const message = `*${note.title}*\n\n${note.content}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (timestamp: Timestamp | null | undefined, options: Intl.DateTimeFormatOptions) => {
    if (!timestamp) return 'Data indisponível';
    return timestamp.toDate().toLocaleString('pt-BR', options);
  };
  
  const groupedNotes = useMemo(() => {
    return notes.reduce((acc, note) => {
      const date = formatDate(note.createdAt, { day: '2-digit', month: '2-digit', year: 'numeric' });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(note);
      return acc;
    }, {} as Record<string, Note[]>);
  }, [notes]);


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
            <Button onClick={handleNewNoteClick} className="w-full bg-primary hover:bg-primary/90 text-lg uppercase">
                <Plus className="mr-2 h-4 w-4" />
                Nova Anotação
            </Button>
        </div>

        {isFormVisible && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{currentNote.id ? 'Editar Anotação' : 'Nova Anotação'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="note-title">TÍTULO</Label>
                  <Input
                    id="note-title"
                    placeholder="Título da nota"
                    value={currentNote.title}
                    onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                    className="text-2xl"
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="note-content">CONTEÚDO</Label>
                  <Textarea
                    id="note-content"
                    placeholder="Escreva sua anotação aqui..."
                    value={currentNote.content}
                    onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                    className="min-h-[150px] text-xl"
                  />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {currentNote.id && (
                  <Button variant="ghost" onClick={handleCancelEdit}>
                      Cancelar Edição
                  </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {currentNote.id ? 'Salvar Alterações' : 'Salvar Nota'}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        <div className="pt-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Anotações Salvas</h2>
             </div>
             {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
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
                                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(note)}>
                                              <Edit className="h-5 w-5 text-primary" />
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

