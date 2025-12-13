
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Edit, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

const formatDate = (isoDate: string) => {
    if (!isoDate) return 'Carregando...';
    try {
        const date = new Date(isoDate);
        return date.toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return 'Data inválida';
    }
};

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    try {
      const allNotes = JSON.parse(localStorage.getItem('qru-priority-notes') || '[]');
      const updatedNotes = allNotes.filter((n: Note) => n.id !== note.id);
      localStorage.setItem('qru-priority-notes', JSON.stringify(updatedNotes));
      
      toast({
        title: 'Nota apagada!',
        description: 'Sua nota foi removida com sucesso.',
      });
      onDelete(); 
    } catch (error) {
      console.error("Error deleting note: ", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao apagar',
        description: 'Não foi possível apagar a nota. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleShare = () => {
    const message = `*${note.title}*\n\n${note.content}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 overflow-hidden">
                <h3 className="text-xl font-bold truncate">{note.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{note.content}</p>
                 <p className="text-xs text-muted-foreground mt-1">{formatDate(note.createdAt)}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={onEdit} className="h-12 w-12 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                    <Edit className="h-6 w-6" />
                    <span className="sr-only">Editar</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare} className="h-12 w-12 border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                    <Share2 className="h-6 w-6" />
                    <span className="sr-only">Compartilhar</span>
                </Button>
                 <Button variant="destructive" size="icon" onClick={() => setShowDeleteConfirm(true)} className="h-12 w-12">
                    <Trash2 className="h-6 w-6" />
                    <span className="sr-only">Apagar</span>
                </Button>
            </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente a sua nota.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeleting ? 'Apagando...' : 'Apagar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
