
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Trash2, Edit, Share2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore }from '@/firebase';
import { eventCategories } from '@/lib/events';
import ReportDetail from '@/components/ReportDetail';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp;
  formData: any;
  uid?: string;
}

export default function OcorrenciasPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const reportsRef = collection(firestore, 'reports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reportsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Report)
        );
        setReports(reportsData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching reports:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar relatórios',
          description:
            'Não foi possível carregar o histórico. Tente novamente.',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, toast]);

  const formatDate = (dateSource: any): string => {
    if (!dateSource) return 'Carregando...';
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
      return String(dateSource);
    }
  };

  const getCategoryTitle = (slug: string) => {
    const category = eventCategories.find((c) => c.slug === slug);
    return category ? category.title : slug;
  };
  
    const formatWhatsappValue = (value: any): string => {
        if (value === null || value === undefined || value === 'NILL' || value === '') return '';
        if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';
        if (value instanceof Date) return formatDate(value);
        if (Array.isArray(value)) return value.join(', ').toUpperCase();
        
        const dateKeys = ['data', 'dn', 'createdAt', 'qtrInicio', 'qtrTermino'];
        const key = '';

        const isDateString = typeof value === 'string' && isNaN(Number(value)) && !/^\d{1,2}$/.test(value) && (new Date(value)).toString() !== 'Invalid Date';
        if (dateKeys.includes(key) || isDateString) {
             return formatDate(value);
        }

        return String(value).toUpperCase();
    };
    
    const formatKey = (key: string) => {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const generateWhatsappMessage = (data: any, category: string): string => {
        let message = `*${getCategoryTitle(category).toUpperCase()}*\n`;
        const sectionTitles: { [key: string]: string } = {
          generalInfo: 'INFORMAÇÕES GERAIS',
          vehicles: 'VEÍCULOS',
          caracteristicasEntorno: 'CARACTERÍSTICAS DO ENTORNO',
          tracadoPista: 'TRAÇADO DA PISTA',
          sinalizacaoInfo: 'SINALIZAÇÃO',
          otherInfo: 'OUTRAS INFORMAÇÕES',
        };
      
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

  const handleShare = (report: Report) => {
    if (!report) return;
    const message = generateWhatsappMessage(report.formData, report.category);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDelete = async (reportId: string) => {
    if (!firestore) return;
    setIsDeleting(reportId);
    try {
      await deleteDoc(doc(firestore, 'reports', reportId));
      toast({
        title: 'Sucesso!',
        description: 'Relatório excluído.',
      });
      setSelectedReport(null); // Fecha a visualização de detalhes
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o relatório.',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <main className="flex flex-col items-center p-4 md:p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (selectedReport) {
    return (
      <main className="flex flex-col items-center p-4 pt-8 md:p-6">
        <div className="w-full max-w-4xl">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-bold">
                      {getCategoryTitle(selectedReport.category)}
                    </CardTitle>
                    <CardDescription>
                      Salvo em: {formatDate(selectedReport.createdAt)}
                    </CardDescription>
                  </div>
                   <Button variant="outline" onClick={() => setSelectedReport(null)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a Lista
                    </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ReportDetail formData={selectedReport.formData} />
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row justify-between gap-4 pt-6">
                 <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedReport.id)}
                    disabled={!!isDeleting}
                  >
                    {isDeleting === selectedReport.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Excluir
                  </Button>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.setItem('reportPreview', JSON.stringify(selectedReport));
                    router.push(`/${selectedReport.category}`);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="secondary"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleShare(selectedReport)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
            Ocorrências Salvas
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Visualize e gerencie os relatórios salvos.
          </p>
        </div>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              Nenhum relatório salvo ainda.
            </p>
          ) : (
            reports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSelectedReport(report)}
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">
                      {getCategoryTitle(report.category)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                   <Button variant="ghost" size="sm"
                     onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(report.id);
                    }}
                    disabled={isDeleting === report.id}
                   >
                        {isDeleting === report.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                   </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
