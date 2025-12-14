
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Share2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import ReportDetail from '@/components/ReportDetail';
import { eventCategories } from '@/lib/events';
import { useUser } from '@/app/layout';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  formData: any;
  uid: string;
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-36 rounded-lg" />
    <Skeleton className="h-36 rounded-lg" />
    <Skeleton className="h-36 rounded-lg" />
  </div>
);

const getCategoryInfo = (slug: string) => {
    const category = eventCategories.find((c) => c.slug === slug);
    return {
        title: category ? category.title : slug,
        color: category ? category.color : '#808080'
    };
};

const formatDate = (timestamp: Timestamp | undefined) => {
  if (!timestamp) return 'Data indisponível';
  try {
    const date = timestamp.toDate();
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Data inválida';
  }
};

const formatWhatsappValue = (value: any, key: string): string => {
  if (value === null || value === undefined || value === 'NILL' || value === '') return '';
  if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';

  const dateKeys = ['data', 'dn', 'createdAt', 'updatedAt'];
  const timeKeys = ['qtrInicio', 'qtrTermino'];


  if (timeKeys.includes(key) && typeof value === 'string') {
     if (value.match(/^\d{2}:\d{2}$/)) {
        return value;
     }
  }

  if (dateKeys.includes(key)) {
     if (value instanceof Timestamp) {
      return formatDate(value);
    }
    return formatDate(new Timestamp(value.seconds, value.nanoseconds));
  }
  
  if (Array.isArray(value)) return value.join(', ').replace(/[-_]/g, ' ').toUpperCase();
  return String(value).replace(/[-_]/g, ' ').toUpperCase();
};

const formatKey = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const generateWhatsappMessage = (data: any, category: string): string => {
  const { title } = getCategoryInfo(category);
  let message = `*${title.toUpperCase()}*\n`;
  const sectionTitles: { [key: string]: string } = {
    generalInfo: 'INFORMAÇÕES GERAIS',
    vehicles: 'VEÍCULOS',
    caracteristicasEntorno: 'CARACTERÍSTICAS DO ENTORNO',
    tracadoPista: 'TRAÇADO DA PISTA',
    sinalizacaoInfo: 'SINALIZAÇÃO',
    otherInfo: 'OUTRAS INFORMAÇÕES',
  };

  for (const sectionKey in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, sectionKey) &&
      sectionTitles[sectionKey]
    ) {
      const sectionData = data[sectionKey];
      const sectionTitle = sectionTitles[sectionKey];

      if (sectionData && Object.keys(sectionData).length > 0) {
        
        const sectionEntries = Object.entries(sectionData).filter(([_, value]) => value !== 'NILL' && value !== '');
        if (sectionEntries.length === 0) continue;

        message += `\n*${sectionTitle}*\n`;

        if (sectionKey === 'vehicles' && Array.isArray(sectionData)) {
          sectionData.forEach((vehicle, index) => {
            message += `\n*VEÍCULO ${index + 1}*\n`;
            for (const [key, value] of Object.entries(vehicle)) {
              if (key === 'id') continue;
              const formattedValue = formatWhatsappValue(value, key);
              if (formattedValue) {
                const formattedKey = `*${formatKey(key).toUpperCase()}*`;
                message += `${formattedKey}: ${formattedValue}\n`;
              }
            }
          });
        } else if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
          for (const [key, value] of Object.entries(sectionData)) {
            if (key === 'qthExato' && sectionData.destinacaoDoObjeto === 'pr06') {
              continue;
            }
            const formattedValue = formatWhatsappValue(value, key);
            if (formattedValue) {
              const formattedKey = `*${formatKey(key).toUpperCase()}*`;
              message += `${formattedKey}: ${formattedValue}\n`;
            }
          }
        }
      }
    }
  }
  return message;
};

const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function ReportCard({ report, onDelete }: { report: Report; onDelete: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { title, color } = getCategoryInfo(report.category);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const serializableReport = {
      ...report,
      createdAt: report.createdAt?.toDate().toISOString(),
      updatedAt: report.updatedAt ? report.updatedAt.toDate().toISOString() : undefined,
    };
    localStorage.setItem('reportPreview', JSON.stringify(serializableReport));
    router.push(`/${report.category}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = generateWhatsappMessage(report.formData, report.category);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      toast({
        title: 'Relatório apagado!',
        description: 'Seu relatório foi removido com sucesso.',
      });
    } catch (error) {
      console.error("Error deleting report: ", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao apagar',
        description: 'Não foi possível apagar o relatório. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const displayDate = report.updatedAt || report.createdAt;

  return (
    <>
      <Card 
        className="relative"
        style={{ 
          backgroundColor: hexToRgba(color, 0.1),
        }}
      >
        <Button variant="destructive" size="icon" onClick={handleDeleteClick} className="absolute top-2 right-2 h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Apagar</span>
        </Button>
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <CardTitle className="truncate pr-10">{title}</CardTitle>
          <CardDescription className="text-base font-bold text-muted-foreground">
            {formatDate(displayDate)} {report.updatedAt && report.createdAt.seconds !== report.updatedAt.seconds ? '(Editado)' : ''}
          </CardDescription>
        </CardHeader>
        
        {isExpanded && (
          <CardContent>
             <div className="mt-4 pt-4 border-t">
                <ReportDetail formData={report.formData} />
             </div>
          </CardContent>
        )}
        <CardFooter className="p-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="default" onClick={handleEdit} className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex-grow">
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
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente o seu relatório.
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


export default function OcorrenciasPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const reportsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'reports'), where('uid', '==', user.uid), orderBy('updatedAt', 'desc')) : null
  , [firestore, user]);

  const { data: reports, isLoading: areReportsLoading, error } = useCollection<Report>(reportsQuery);

  const handleDeleteReport = async (reportId: string) => {
    if (!firestore) return;
    try {
      const reportRef = doc(firestore, 'reports', reportId);
      await deleteDoc(reportRef);
      // useCollection will update the UI automatically
      toast({
        title: 'Relatório apagado!',
        description: 'Seu relatório foi removido com sucesso.',
      });
    } catch(error) {
       console.error("Error deleting report: ", error);
       toast({
        variant: 'destructive',
        title: 'Erro ao apagar',
        description: 'Não foi possível apagar o relatório. Tente novamente.',
      });
    }
  };

  const isLoading = isUserLoading || areReportsLoading;

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

      <div className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
          Histórico de Ocorrências
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          Visualize todos os seus relatórios salvos.
        </p>
      </div>

      {isLoading && <LoadingSkeleton />}
      
      {error && (
        <div className="text-center py-10 border-2 border-dashed border-destructive rounded-lg">
          <p className="text-destructive text-lg">Erro ao carregar relatórios.</p>
          <p className="text-muted-foreground">Tente novamente mais tarde.</p>
        </div>
      )}


      {!isLoading && !error && (!reports || reports.length === 0) && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">Nenhum relatório encontrado.</p>
          <p className="text-muted-foreground">
            Os relatórios que você salvar aparecerão aqui.
          </p>
        </div>
      )}

      {!isLoading && !error && reports && reports.length > 0 && (
        <div className="space-y-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onDelete={() => handleDeleteReport(report.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
