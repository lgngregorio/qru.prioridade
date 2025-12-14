
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Edit, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Note } from '@/lib/types';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void; // A função de apagar agora é mais simples
}

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data indisponível';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return 'Data inválida';
    }
};

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    onDelete();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `*${note.title}*\n\n${note.content}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowDeleteConfirm(true);
  }
  
  const displayDate = note.updatedAt || note.createdAt;

  return (
    <>
      <Card className="relative">
        <Button variant="destructive" size="icon" onClick={handleDeleteClick} className="absolute top-2 right-2 h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Apagar</span>
        </Button>
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <CardTitle className="truncate pr-10">{note.title}</CardTitle>
          <CardDescription className="text-base font-bold text-muted-foreground">
            {formatDate(displayDate)} {note.updatedAt && note.createdAt !== note.updatedAt ? '(Editado)' : ''}
          </CardDescription>
        </CardHeader>
        
        {isExpanded && (
          <CardContent>
             <div className="mt-4 pt-4 border-t whitespace-pre-wrap">
                <p className="text-muted-foreground">{note.content}</p>
             </div>
          </CardContent>
        )}
        <CardFooter className="p-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="default" onClick={handleEditClick} className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex-grow">
              <Edit className="h-5 w-5 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="default" onClick={handleShare} className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white flex-grow">
              <Share2 className="h-5 w-5 mr-2" />
              Compartilhar
            </Button>
        </CardFooter>
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
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeleting ? 'Apagando...' : 'Apagar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
