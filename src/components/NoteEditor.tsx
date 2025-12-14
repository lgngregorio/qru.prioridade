
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Note } from '@/lib/types';
import { useUser } from '@/app/layout';

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

function getNotesKey(userEmail: string | null): string | null {
  if (!userEmail) return null;
  return `notas-historico-${userEmail}`;
}

export function NoteEditor({ isOpen, onClose, note }: NoteEditorProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note, isOpen]);

  const handleSave = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Usuário não autenticado',
            description: 'Por favor, faça login para salvar uma nota.',
        });
        return;
    }

    if (!title || !content) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o título e o conteúdo da nota.',
      });
      return;
    }

    setIsSaving(true);
    
    const notesKey = getNotesKey(user.email);
    if (!notesKey) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível identificar o usuário." });
        setIsSaving(false);
        return;
    }

    try {
        const savedNotesRaw = localStorage.getItem(notesKey);
        const savedNotes = savedNotesRaw ? JSON.parse(savedNotesRaw) : [];

        const now = new Date().toISOString();
        let isEditing = false;
        
        const noteToSave: Partial<Note> = {
            title,
            content,
            uid: user.uid,
            updatedAt: now,
        };

        let newNotes = [];

        if (note && note.id) { // Editing existing note
            isEditing = true;
            noteToSave.id = note.id;
            noteToSave.createdAt = note.createdAt; 
            newNotes = savedNotes.map((n: Note) => n.id === note.id ? noteToSave : n);
        } else { // Creating new note
            noteToSave.id = `note-${Date.now()}`;
            noteToSave.createdAt = now;
            newNotes = [noteToSave, ...savedNotes];
        }

        localStorage.setItem(notesKey, JSON.stringify(newNotes));

        toast({
          title: isEditing ? 'Nota atualizada!' : 'Nota criada!',
          description: `Suas alterações foram salvas.`,
        });

      onClose();
    } catch (error) {
      console.error("Error saving note to localStorage: ", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a nota. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{note ? 'Editar Nota' : 'Adicionar Nova Nota'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="title" className="text-left text-lg">
              Título
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3 text-lg"
              placeholder="Título da sua nota"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="content" className="text-left text-lg">
              Conteúdo
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3 min-h-[200px] text-lg"
              placeholder="Escreva sua anotação aqui..."
            />
          </div>
        </div>
        <DialogFooter className="flex-row justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
