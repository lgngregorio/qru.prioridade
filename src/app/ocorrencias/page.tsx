
'use client';

import { useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Loader2, History, AlertCircle, Trash2, Edit, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { eventCategories } from '@/lib/events';
import { useState } from 'react';
import ReportDetail from '@/components/ReportDetail';


interface Report {
    id: string;
    category: string;
    createdAt: Timestamp | { seconds: number; nanoseconds: number };
    formData: any;
    uid: string;
}

const formatDate = (timestamp: Report['createdAt']) => {
    if (!timestamp) return 'Data indisponível';
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
        minute: '2-digit',
    });
};

const getCategoryTitle = (slug: string) => {
    const category = eventCategories.find(c => c.slug === slug);
    return category ? category.title : slug;
}

const formatKey = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

const formatWhatsappValue = (value: any): string => {
    if (value === null || value === undefined || value === 'NILL' || value === '') return '';
    if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';
    if (value instanceof Timestamp) return formatDate(value);
    if (Array.isArray(value)) return value.join(', ').toUpperCase();
    if (typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
      const ts = new Timestamp(value.seconds, value.nanoseconds);
      return formatDate(ts);
    }
    return String(value).toUpperCase();
  };

  const generateWhatsappMessage = (report: Report): string => {
    if (!report || !report.formData) return '';

    let message = `*${getCategoryTitle(report.category).toUpperCase()}*\n`;
    const sectionTitles: { [key: string]: string } = {
      generalInfo: 'INFORMAÇÕES GERAIS',
      vehicles: 'VEÍCULOS',
      caracteristicasEntorno: 'CARACTERÍSTICAS DO ENTORNO',
      tracadoPista: 'TRAÇADO DA PISTA',
      sinalizacaoInfo: 'SINALIZAÇÃO',
      otherInfo: 'OUTRAS INFORMAÇÕES',
    };
  
    for (const sectionKey in report.formData) {
        if (Object.prototype.hasOwnProperty.call(report.formData, sectionKey) && sectionTitles[sectionKey]) {
            const sectionData = report.formData[sectionKey];
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
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const reportsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) {
            return null;
        }
        return query(
            collection(firestore, 'reports'),
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, user?.uid]);

    const { data: reports, isLoading: isReportsLoading, error } = useCollection<Report>(reportsQuery);
    
    const handleEdit = (report: Report) => {
        localStorage.setItem('reportPreview', JSON.stringify(report));
        router.push(`/${report.category}`);
    };

    const handleShare = (report: Report) => {
        const message = generateWhatsappMessage(report);
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDelete = async (reportId: string) => {
        if (!firestore) return;
        setIsDeleting(reportId);
        try {
            const reportDocRef = doc(firestore, 'reports', reportId);
            await deleteDoc(reportDocRef);
            toast({
                title: 'Sucesso',
                description: 'Relatório apagado.',
            });
        } catch (e) {
            console.error("Erro ao apagar o relatório: ", e);
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível apagar o relatório.',
            });
        } finally {
            setIsDeleting(null);
        }
    };
    
    const isLoading = isUserLoading || (user && isReportsLoading);

    if (isLoading) {
        return (
            <main className="flex flex-col items-center p-4 md:p-6">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            </main>
        );
    }
    
    if (error) {
        return (
            <main className="flex flex-col items-center p-4 md:p-6 text-center">
                 <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar ocorrências</h2>
                <p className="text-muted-foreground max-w-md">Não foi possível buscar seus relatórios. Verifique sua conexão ou tente novamente mais tarde.</p>
                 <pre className="mt-4 text-xs text-left bg-muted p-2 rounded-md max-w-full overflow-auto">
                    <code>{error.message}</code>
                </pre>
            </main>
        )
    }

    if (!user) {
        return (
             <main className="flex flex-col items-center p-4 md:p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Sessão Expirada</h2>
                <p className="text-muted-foreground max-w-md">Você precisa estar logado para ver suas ocorrências.</p>
                 <Button asChild className="mt-4">
                    <Link href="/login">Fazer Login</Link>
                </Button>
            </main>
        )
    }

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
                    <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase flex items-center justify-center gap-2">
                       <History className="h-8 w-8" />
                       Histórico de Ocorrências
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base">
                        Visualize todos os seus relatórios salvos.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {reports && reports.length > 0 ? (
                        reports.map((report) => (
                             <Card key={report.id}>
                                <AccordionItem value={report.id} className="border-b-0">
                                    <AccordionTrigger className="hover:no-underline p-6">
                                        <div className="flex justify-between items-start w-full">
                                            <div>
                                                <CardTitle>{getCategoryTitle(report.category)}</CardTitle>
                                                <CardDescription>
                                                   Nº: {report.formData?.otherInfo?.numeroOcorrencia || 'N/A'}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="secondary">{formatDate(report.createdAt)}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                     <AccordionContent>
                                        <CardContent>
                                            <ReportDetail formData={report.formData} />
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2 pt-4">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(report)}>
                                                <Edit className="mr-2 h-4 w-4"/> Editar
                                            </Button>
                                            <Button variant="secondary" size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleShare(report)}>
                                                <Share2 className="mr-2 h-4 w-4"/> Compartilhar
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" disabled={isDeleting === report.id}>
                                                        {isDeleting === report.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                                                        {isDeleting === report.id ? 'Apagando...' : 'Apagar'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                        Esta ação não pode ser desfeita. Isso irá apagar permanentemente o relatório.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(report.id)}>Apagar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </CardFooter>
                                    </AccordionContent>
                                </AccordionItem>
                             </Card>
                        ))
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                           <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                           <h3 className="text-xl font-semibold">Nenhum relatório salvo</h3>
                           <p className="text-muted-foreground">Você ainda não salvou nenhuma ocorrência.</p>
                        </div>
                    )}
                </Accordion>
            </div>
        </main>
    );
}
