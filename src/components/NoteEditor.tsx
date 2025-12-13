
'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Note } from '@/lib/types';


interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
}

export function NoteEditor({ isOpen, onClose, note }: NoteEditorProps) {
  const firestore = useFirestore();
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
    
    try {
      if (note) {
        // Edit existing note
        const noteRef = doc(firestore, 'notes', note.id);
        await setDoc(noteRef, { title, content, updatedAt: serverTimestamp() }, { merge: true });
        toast({
          title: 'Nota atualizada!',
          description: 'Suas alterações foram salvas.',
        });
      } else {
        // Create new note
        await addDoc(collection(firestore, 'notes'), {
          title,
          content,
          createdAt: serverTimestamp(),
          uid: user.uid, // Associate note with user
        });
        toast({
          title: 'Nota criada!',
          description: 'Sua nova nota foi salva.',
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving note: ", error);
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
        <DialogFooter>
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
