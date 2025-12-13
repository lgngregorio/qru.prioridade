
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  collection,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase/client';
import { ArrowLeft, Loader2, Share2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import ReportDetail from '@/components/ReportDetail';
import { eventCategories } from '@/lib/events';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp;
  formData: any;
}

const getCategoryTitle = (slug: string) => {
  const category = eventCategories.find((c) => c.slug === slug);
  return category ? category.title : slug;
};

const formatDate = (dateSource: any): string => {
  if (!dateSource) return 'Data indisponível';
  try {
    const date =
      dateSource instanceof Timestamp ? dateSource.toDate() : new Date(dateSource);
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

const formatKey = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

const formatWhatsappValue = (value: any): string => {
    if (value === null || value === undefined || value === 'NILL' || value === '') return '';
    if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';
    if (value instanceof Date) return formatDate(value);
    if (Array.isArray(value)) return value.join(', ').toUpperCase();
    
    const isDateString = typeof value === 'string' && isNaN(Number(value)) && !/^\d{1,2}$/.test(value) && (new Date(value)).toString() !== 'Invalid Date';
    if (isDateString) {
         return formatDate(value);
    }

    return String(value).toUpperCase();
};
    
const generateWhatsappMessage = (reportData: Report): string => {
    let message = `*${getCategoryTitle(reportData!.category).toUpperCase()}*\n`;
    const sectionTitles: { [key: string]: string } = {
      generalInfo: 'INFORMAÇÕES GERAIS',
      vehicles: 'VEÍCULOS',
      caracteristicasEntorno: 'CARACTERÍSTICAS DO ENTORNO',
      tracadoPista: 'TRAÇADO DA PISTA',
      sinalizacaoInfo: 'SINALIZAÇÃO',
      otherInfo: 'OUTRAS INFORMAÇÕES',
    };
    
    const data = reportData.formData;
  
    for (const sectionKey in data) {
      if (Object.prototype.hasOwnProperty.call(data, sectionKey) && sectionTitles[sectionKey]) {
        const sectionData = data[sectionKey];
        const sectionTitle = sectionTitles[sectionKey];
  
        if (sectionData && Object.keys(sectionData).length > 0) {
          
          message += `\n*${sectionTitle}*\n`;
  
          if (sectionKey === 'vehicles' && Array.isArray(sectionData)) {
            sectionData.forEach((vehicle, index) => {
              message += `\n*VEÍCULO ${index + 1}*\n`;
              for (const [key, value] of Object.entries(vehicle)) {
                if (key === 'id') continue;
                const formattedValue = formatWhatsappValue(value);
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
              const formattedValue = formatWhatsappValue(value);
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


export default function OcorrenciasPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const reportsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );

  const {
    data: reports,
    isLoading,
    error,
  } = useCollection<Report>(reportsQuery);

  const handleDelete = async (reportId: string) => {
    if (!firestore) return;
    setIsDeleting(reportId);
    try {
      const reportRef = doc(firestore, 'reports', reportId);
      await deleteDoc(reportRef);
      toast({
        title: 'Sucesso!',
        description: 'Relatório excluído.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o relatório.',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleShare = (report: Report) => {
    const message = generateWhatsappMessage(report);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
            Ocorrências
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Consulte o histórico de relatórios salvos.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-10">
            <p>
              Ocorreu um erro ao carregar as ocorrências: {error.message}
            </p>
          </div>
        )}

        {!isLoading && !error && reports?.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            Nenhum relatório encontrado.
          </p>
        )}

        <div className="space-y-4">
          {reports?.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{getCategoryTitle(report.category)}</span>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isDeleting === report.id}
                        >
                          {isDeleting === report.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o relatório.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(report.id)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </CardTitle>
                <CardDescription>
                  {formatDate(report.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportDetail formData={report.formData} />
              </CardContent>
              <CardFooter className="justify-end gap-2">
                  <Button variant="secondary" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleShare(report)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartilhar
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
