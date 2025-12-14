
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteEditor } from '@/components/NoteEditor';
import { NoteCard } from '@/components/NoteCard';
import type { Note } from '@/lib/types';
import { useUser } from '@/app/layout';
import { useToast } from '@/hooks/use-toast';

const LoadingSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
    </div>
);

function getNotesKey(userEmail: string | null): string | null {
  if (!userEmail) return null;
  return `notas-historico-${userEmail}`;
}

export default function NotasPage() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const { user, isLoading: isUserLoading } = useUser();
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotes = () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        
        const notesKey = getNotesKey(user.email);
        if (notesKey) {
            try {
                const savedNotes = localStorage.getItem(notesKey);
                if (savedNotes) {
                    const parsedNotes: Note[] = JSON.parse(savedNotes);
                    parsedNotes.sort((a, b) => {
                        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                        return dateB - dateA;
                    });
                    setNotes(parsedNotes);
                }
            } catch (error) {
                console.error("Failed to load or parse notes from localStorage", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao carregar notas",
                    description: "Não foi possível ler suas notas salvas."
                });
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!isUserLoading) {
            if (user) {
                loadNotes();
            } else {
                setIsLoading(false);
            }
        }
    }, [user, isUserLoading]);
    

    const handleEdit = (note: Note) => {
        setEditingNote(note);
        setIsEditorOpen(true);
    };

    const handleAddNew = () => {
        setEditingNote(null);
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditingNote(null);
        loadNotes(); // Recarrega as notas após fechar o editor
    };
    
    const handleDelete = (noteId: string) => {
        if (!user) return;
        const notesKey = getNotesKey(user.email);
        if (notesKey) {
            const updatedNotes = notes.filter(n => n.id !== noteId);
            localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
            setNotes(updatedNotes);
            toast({
                title: 'Nota apagada!',
                description: 'Sua nota foi removida com sucesso.',
            });
        }
    }


    return (
        <main className="flex flex-col p-4 md:p-6">
            <div className="w-full mb-6 pt-4 flex items-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o início
                </Link>
              </Button>
            </div>

            <div className="w-full mb-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
                        Bloco de Notas
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base">
                        Crie, edite e gerencie suas anotações.
                    </p>
                </div>
                <Button onClick={handleAddNew} className="text-lg w-full" size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Adicionar Nova Nota
                </Button>
            </div>

            {(isLoading || isUserLoading) && <LoadingSkeleton />}
            
            {!isLoading && !isUserLoading && notes.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg mt-8">
                    <p className="text-muted-foreground text-lg">Nenhuma nota encontrada.</p>
                    <p className="text-muted-foreground">Clique em "Adicionar Nova Nota" para começar.</p>
                </div>
            )}

            {!isLoading && !isUserLoading && notes.length > 0 && (
                <div className="space-y-4">
                    {notes.map((note) => (
                        <NoteCard 
                            key={note.id} 
                            note={note}
                            onEdit={() => handleEdit(note)}
                            onDelete={() => handleDelete(note.id)}
                        />
                    ))}
                </div>
            )}

            <NoteEditor
                isOpen={isEditorOpen}
                onClose={handleCloseEditor}
                note={editingNote}
            />
        </main>
    );
}
