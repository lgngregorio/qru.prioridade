
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader2, History, Search, FileText, Notebook as NotebookIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser } from '@/app/layout';
import { useToast } from '@/hooks/use-toast';
import { getActivityLog, deleteActivity, clearAllActivities, type Activity } from '@/lib/activity-logger';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'navigation':
            return <History className="h-5 w-5 text-muted-foreground" />;
        case 'search':
            return <Search className="h-5 w-5 text-muted-foreground" />;
        case 'report':
            return <FileText className="h-5 w-5 text-muted-foreground" />;
        case 'note':
            return <NotebookIcon className="h-5 w-5 text-muted-foreground" />;
        default:
            return <History className="h-5 w-5 text-muted-foreground" />;
    }
};

export default function AtividadesPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      setActivities(getActivityLog(user.email));
      setIsLoading(false);
    } else if (!isUserLoading && !user) {
      setIsLoading(false);
    }
  }, [user, isUserLoading]);

  const handleDelete = (activityId: string) => {
    if (user && user.email) {
      deleteActivity(user.email, activityId);
      setActivities(getActivityLog(user.email));
      toast({
        title: 'Atividade removida!',
        description: 'A atividade foi apagada do seu histórico.',
      });
    }
    setActivityToDelete(null);
  };
  
  const handleClearAll = () => {
    if (user && user.email) {
        clearAllActivities(user.email);
        setActivities([]);
        toast({
            title: 'Histórico limpo!',
            description: 'Todas as suas atividades foram apagadas.',
        });
    }
    setShowClearAllConfirm(false);
  }
  
  const handleCardClick = (activity: Activity) => {
    if (activity.url) {
      router.push(activity.url);
    }
  };

  return (
    <main className="flex flex-col p-4 md:p-6">
      <div className="w-full mb-6 pt-4 flex items-center justify-between">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o início
          </Link>
        </Button>
        {activities.length > 0 && (
            <Button
                variant="destructive"
                onClick={() => setShowClearAllConfirm(true)}
                size="sm"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Histórico
            </Button>
        )}
      </div>

      <div className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
          Histórico de Atividades
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          Veja e gerencie suas ações recentes no aplicativo.
        </p>
      </div>

      {(isLoading || isUserLoading) && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && !isUserLoading && activities.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">Nenhuma atividade registrada.</p>
          <p className="text-muted-foreground">Suas ações no aplicativo aparecerão aqui.</p>
        </div>
      )}

      {!isLoading && !isUserLoading && activities.length > 0 && (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className="hover:bg-accent/50 cursor-pointer relative group"
            >
              <CardContent className="p-4 flex items-center gap-4" onClick={() => handleCardClick(activity)}>
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="font-semibold">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </CardContent>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    setActivityToDelete(activity.id);
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar esta atividade do seu histórico permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActivityToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => activityToDelete && handleDelete(activityToDelete)} className="bg-destructive hover:bg-destructive/90">
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todo o histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente TODAS as atividades do seu histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">
              Apagar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  );
}
