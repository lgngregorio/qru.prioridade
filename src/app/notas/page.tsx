
'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NoteEditor } from '@/components/NoteEditor';
import { NoteCard } from '@/components/NoteCard';
import type { Note } from '@/lib/types';
import { useUser } from '@/app/layout';

const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
    </div>
);


export default function NotasPage() {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { user, isLoading: isUserLoading } = useUser();

    const loadNotes = () => {
        if (user) {
            try {
                const allNotes = JSON.parse(localStorage.getItem('qru-priority-notes') || '[]');
                const userNotes = allNotes.filter((note: Note) => note.userEmail === user.email);
                setNotes(userNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (error) {
                console.error("Failed to load notes from localStorage", error);
                setNotes([]);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        setIsLoading(true);
        loadNotes();
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
        loadNotes(); // Recarregar notas após fechar o editor
    };

    return (
        <main className="flex flex-col p-4 md:p-6">
            <div className="flex items-center justify-between mb-8 pt-4">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
                        Bloco de Notas
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base">
                        Crie, edite e gerencie suas anotações.
                    </p>
                </div>
                <Button onClick={handleAddNew} className="text-lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Adicionar Nota
                </Button>
            </div>

            {(isLoading || isUserLoading) && <LoadingSkeleton />}

            {!isLoading && !isUserLoading && notes.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-lg">Nenhuma nota encontrada.</p>
                    <p className="text-muted-foreground">Clique em "Adicionar Nota" para começar.</p>
                </div>
            )}

            {!isLoading && notes && notes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <NoteCard 
                            key={note.id} 
                            note={note}
                            onEdit={() => handleEdit(note)}
                            onDelete={loadNotes} // Passar função para recarregar
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
