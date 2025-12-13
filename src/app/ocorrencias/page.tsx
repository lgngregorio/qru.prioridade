
'use client';

import { useState, useMemo } from 'react';
import { Loader2, History, Trash2, Edit, Share2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { eventCategories } from '@/lib/events';
import ReportDetail from '@/components/ReportDetail';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';

interface Report {
    id: string;
    category: string;
    createdAt: { seconds: number, nanoseconds: number };
    formData: any;
    uid: string;
}

export default function OcorrenciasPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const reportsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) {
            return null;
        }
        return query(collection(firestore, 'reports'), where('uid', '==', user.uid));
    }, [firestore, user?.uid]);

    const { data: reports, isLoading: isLoadingReports } = useCollection<Report>(reportsQuery);

    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const sortedReports = useMemo(() => {
        if (!reports) return [];
        return [...reports].sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    }, [reports]);

    const formatDate = (timestamp: { seconds: number, nanoseconds: number }) => {
        if (!timestamp) return 'Data indisponível';
        try {
            const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return 'Data inválida';
        }
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
                        const formattedValue = String(value).toUpperCase();
                        if (formattedValue && value !== 'NILL') {
                        const formattedKey = `*${formatKey(key).toUpperCase()}*`;
                        message += `${formattedKey}: ${formattedValue}\n`;
                        }
                    }
                    });
                } else if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
                    for (const [key, value] of Object.entries(sectionData)) {
                    const formattedValue = String(value).toUpperCase();
                    if (formattedValue && value !== 'NILL') {
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
    
    if (isUserLoading || (user && isLoadingReports)) {
        return (
            <main className="flex flex-col items-center p-4 md:p-6">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            </main>
        );
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
                    {sortedReports && sortedReports.length > 0 ? (
                        sortedReports.map((report) => (
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
