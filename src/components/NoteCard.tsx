
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2, Edit, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Note } from '@/lib/types';

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
      onDelete(); // Callback para atualizar a lista na página principal
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
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{note.title}</CardTitle>
             {note.createdAt && (
                <CardDescription className="text-sm">
                   Criado em {formatDate(note.createdAt)}
                </CardDescription>
             )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onEdit} className="text-base p-3">
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare} className="text-base p-3">
                <Share2 className="mr-2 h-4 w-4" />
                <span>Compartilhar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="text-destructive text-base p-3">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Apagar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="whitespace-pre-wrap">{note.content}</p>
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
