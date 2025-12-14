
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteEditor } from '@/components/NoteEditor';
import { NoteCard } from '@/components/NoteCard';
import type { Note } from '@/lib/types';
import { useUser } from '@/app/layout';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';

const LoadingSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
    </div>
);


export default function NotasPage() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const { user, isLoading: isUserLoading } = useUser();
    const firestore = useFirestore();

    const notesQuery = useMemoFirebase(() => 
        user ? query(collection(firestore, 'notes'), where('uid', '==', user.uid), orderBy('createdAt', 'desc')) : null
    , [firestore, user]);

    const { data: notes, isLoading: areNotesLoading, error } = useCollection<Note>(notesQuery);

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
    };
    
    const handleDelete = async (noteId: string) => {
        if(!firestore) return;
        await deleteDoc(doc(firestore, 'notes', noteId));
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

            {(isUserLoading || areNotesLoading) && <LoadingSkeleton />}
            
            {error && (
                <div className="text-center py-10 border-2 border-dashed border-destructive rounded-lg mt-8">
                    <p className="text-destructive text-lg">Erro ao carregar notas.</p>
                     <p className="text-muted-foreground text-sm max-w-md mx-auto">{error.message}</p>
                </div>
            )}

            {!isUserLoading && !areNotesLoading && !error && (!notes || notes.length === 0) && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg mt-8">
                    <p className="text-muted-foreground text-lg">Nenhuma nota encontrada.</p>
                    <p className="text-muted-foreground">Clique em "Adicionar Nova Nota" para começar.</p>
                </div>
            )}

            {!isUserLoading && !areNotesLoading && !error && notes && notes.length > 0 && (
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
