
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, ArrowLeft, Trash2, Edit, Save, Plus } from 'lucide-react';
import Link from 'next/link';

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
  const [isEditing, setIsEditing] = useState(false);

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
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleNewNoteClick = () => {
    setCurrentNote({ id: null, title: '', content: '' });
    setIsEditing(false);
  }

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'Data indisponível';
    return timestamp.toDate().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <main className="flex flex-col items-center p-4 pt-8 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline tracking-wide">
              Bloco de Notas
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Crie, edite e organize suas anotações.
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{currentNote.id ? 'Editar Anotação' : 'Nova Anotação'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título da nota"
              value={currentNote.title}
              onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
              className="text-2xl"
            />
            <Textarea
              placeholder="Escreva sua anotação aqui..."
              value={currentNote.content}
              onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
              className="min-h-[150px] text-xl"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {currentNote.id && (
                 <Button variant="ghost" onClick={handleNewNoteClick}>
                    Cancelar Edição
                </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {currentNote.id ? 'Salvar Alterações' : 'Salvar Nota'}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="border-t border-border pt-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Anotações Salvas</h2>
                {!isEditing && (
                    <Button variant="outline" onClick={handleNewNoteClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Nota
                    </Button>
                )}
             </div>
             {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Nenhuma anotação encontrada.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <Card key={note.id}>
                            <CardHeader>
                                <CardTitle className="truncate">{note.title}</CardTitle>
                                <CardDescription>
                                    Criado em: {formatDate(note.createdAt)} <br/>
                                    {note.updatedAt && note.createdAt.seconds !== note.updatedAt.seconds ? `Atualizado em: ${formatDate(note.updatedAt)}` : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                            </CardContent>
                             <CardFooter className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(note)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
                                        <Trash2 className="h-4 w-4" />
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
                                      <AlertDialogAction onClick={() => handleDelete(note.id)}>
                                        Apagar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>

      </div>
    </main>
  );
}
