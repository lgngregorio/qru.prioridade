
'use client';

import { useMemo } from 'react';
import { collection, orderBy, query, Timestamp, doc, deleteDoc, where } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Loader2, ArrowLeft, Trash2, Edit, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { eventCategories } from '@/lib/events';
import { useCollection } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp | { seconds: number, nanoseconds: number } | null;
  formData: any;
  uid: string;
}

const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (value instanceof Timestamp) return formatDate(value);
    if (typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
      const ts = new Timestamp(value.seconds, value.nanoseconds);
      return formatDate(ts);
    }
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
        return (
            <ul className="list-disc pl-5 space-y-1">
                {Object.entries(value).map(([key, val]) => (
                    <li key={key}>
                        <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {renderValue(val)}
                    </li>
                ))}
            </ul>
        );
    }
    return String(value);
};


const formatKey = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};


const ReportDetail = ({ formData }: { formData: any }) => {
    if (!formData) return <p>Sem detalhes para exibir.</p>;

    const renderSection = (title: string, data: any) => {
        if (!data || Object.keys(data).length === 0) return null;
        return (
            <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2 text-primary">{title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-lg">
                    {Object.entries(data).map(([key, value]) => (
                         <div key={key} className="flex flex-col">
                            <span className="font-bold text-muted-foreground">{formatKey(key)}</span>
                            <span>{renderValue(value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
     const renderVehicleSection = (vehicles: any[]) => {
        if (!vehicles || vehicles.length === 0) return null;
        return (
            <div>
                 {vehicles.map((vehicle, index) => (
                    <div key={index} className="mb-6 mt-4 border-t pt-4">
                        <h4 className="text-xl font-semibold mb-2 text-primary">Veículo {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-lg">
                             {Object.entries(vehicle).map(([key, value]) => (
                                <div key={key} className="flex flex-col">
                                    <span className="font-bold text-muted-foreground">{formatKey(key)}</span>
                                    <span>{renderValue(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                 ))}
            </div>
        )
    };


    return (
        <div className="space-y-4">
            {renderSection("Informações Gerais", formData.generalInfo)}
            {renderVehicleSection(formData.vehicles)}
            {renderSection("Características do Entorno", formData.caracteristicasEntorno)}
            {renderSection("Traçado da Pista", formData.tracadoPista)}
            {renderSection("Sinalização", formData.sinalizacaoInfo)}
            {renderSection("Outras Informações", formData.otherInfo)}
        </div>
    );
};

const formatDate = (timestamp: Report['createdAt']) => {
    if (!timestamp) return 'Carregando...';
    
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp) {
      date = new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
    } else {
        return 'Data inválida';
    }

    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

export default function OcorrenciasPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const reportsQuery = useMemoFirebase(() => {
    if (isUserLoading || !user || !firestore) {
      return null;
    }
    return query(
      collection(firestore, 'reports'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user, isUserLoading]);

  const { data: reports, isLoading: reportsLoading, error } = useCollection<Report>(reportsQuery);

  const isLoading = isUserLoading || (reportsQuery !== null && reportsLoading);
  
  const getCategoryTitle = (slug: string) => {
    const category = eventCategories.find(c => c.slug === slug);
    return category ? category.title : slug;
  }
  
  const handleDelete = (reportId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'reports', reportId);
    deleteDoc(docRef).then(() => {
        toast({ title: 'Relatório apagado com sucesso!' });
    }).catch ((error) => {
      const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Erro ao apagar relatório.',
        description: 'Não foi possível apagar o relatório.',
      });
    });
  };
  
  const formatWhatsappValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';
    if (value instanceof Timestamp) return formatDate(value);
    if (Array.isArray(value)) return value.join(', ').toUpperCase();
    if (typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
      const ts = new Timestamp(value.seconds, value.nanoseconds);
      return formatDate(ts);
    }
    return String(value).toUpperCase();
  };

  const generateWhatsappMessage = (data: any, sectionTitle?: string): string => {
    let message = '';
    if (sectionTitle) {
      message += `*${sectionTitle.toUpperCase()}*\n`;
    }
  
    for (const [key, value] of Object.entries(data)) {
      const formattedKey = `*${formatKey(key).toUpperCase()}*`;
  
      if (key.toLowerCase().includes('veiculo') || key.toLowerCase().includes('vehicles')) {
        if (Array.isArray(value)) {
          value.forEach((vehicle, index) => {
            message += `\n*VEÍCULO ${index + 1}*\n`;
            message += generateWhatsappMessage(vehicle);
          });
        }
      } else if (typeof value === 'object' && value !== null && !(value instanceof Timestamp) && !Array.isArray(value)) {
         if (value.seconds === undefined || value.nanoseconds === undefined) {
            message += `\n${generateWhatsappMessage(value, formatKey(key))}`;
        } else {
             if(value !== 'NILL' && value !== '' && !(Array.isArray(value) && value.length === 0)) {
               message += `${formattedKey}: ${formatWhatsappValue(value)}\n`;
             }
        }
      } else {
         if(value !== 'NILL' && value !== '' && !(Array.isArray(value) && value.length === 0)) {
           message += `${formattedKey}: ${formatWhatsappValue(value)}\n`;
         }
      }
    }
    return message;
  };
  
  const handleShare = (report: Report) => {
    const title = `*${getCategoryTitle(report.category).toUpperCase()}*`;
    const reportDetails = generateWhatsappMessage(report.formData);
    const message = `${title}\n\n${reportDetails}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


  return (
    <main className="flex flex-col items-center p-4 pt-8 md:p-6">
      <div className="w-full max-w-6xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Ocorrências Salvas</CardTitle>
            <CardDescription>Visualize, edite ou apague os relatórios salvos.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reports && reports.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {reports.map((report) => (
                        <AccordionItem value={report.id} key={report.id} className="border rounded-lg bg-card/50">
                             <AccordionTrigger className="p-4 text-xl hover:no-underline flex justify-between items-center w-full">
                               <div className="flex flex-col text-left">
                                    <span className="font-bold">{getCategoryTitle(report.category)}</span>
                                    <span className="text-sm font-normal text-muted-foreground">{formatDate(report.createdAt)}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <ReportDetail formData={report.formData} />
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                     <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/${report.category}`}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Editar
                                        </Link>
                                      </Button>
                                     <Button variant="secondary" size="sm" className="text-green-500 hover:bg-green-500/10 hover:text-green-500" onClick={(e) => {e.stopPropagation(); handleShare(report);}}>
                                        <Share2 className="mr-2 h-4 w-4"/>
                                        Compartilhar
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                Apagar
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Essa ação não pode ser desfeita. Isso irá apagar permanentemente o relatório.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(report.id)} className="bg-destructive hover:bg-destructive/80">
                                              Apagar
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center py-16">
                     <p className="text-muted-foreground">Nenhum relatório encontrado.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
