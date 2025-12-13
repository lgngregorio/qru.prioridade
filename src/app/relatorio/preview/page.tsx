
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Edit, Share2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventCategories } from '@/lib/events';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import ReportDetail from '@/components/ReportDetail';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp | { seconds: number, nanoseconds: number } | null;
  formData: any;
}

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
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatKey = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

export default function PreviewPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [reportData, setReportData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        const storedData = localStorage.getItem('reportPreview');
        if (storedData) {
            setReportData(JSON.parse(storedData));
        } else {
            router.push('/');
        }
    }, [router]);

    const getCategoryTitle = (slug: string) => {
        const category = eventCategories.find(c => c.slug === slug);
        return category ? category.title : slug;
    }

    const handleEdit = () => {
        if (reportData) {
            router.push(`/${reportData.category}`);
        }
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
    
      const generateWhatsappMessage = (data: any): string => {
        let message = `*${getCategoryTitle(reportData.category).toUpperCase()}*\n`;
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

    const handleShare = () => {
        if (!reportData) return;
        const message = generateWhatsappMessage(reportData.formData);
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
     const handleSave = async () => {
        if (!firestore || !user || !reportData) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível salvar. Verifique sua conexão e autenticação.',
            });
            return;
        }

        setIsSaving(true);
        const reportToSave = {
            ...reportData,
            uid: user.uid,
            createdAt: serverTimestamp(),
        };

        const collectionRef = collection(firestore, 'reports');
        addDoc(collectionRef, reportToSave)
            .then(() => {
                toast({
                    title: 'Sucesso!',
                    description: 'Relatório salvo e enviado para o histórico.',
                });
                localStorage.removeItem('reportPreview');
                router.push('/');
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: collectionRef.path,
                    operation: 'create',
                    requestResourceData: reportToSave,
                });
                errorEmitter.emit('permission-error', permissionError);
                 toast({
                    variant: "destructive",
                    title: "Erro de Permissão",
                    description: "Você não tem permissão para salvar este relatório.",
                });
            })
            .finally(() => {
                setIsSaving(false);
            });
    };


    if (!reportData) {
        return (
            <main className="flex flex-col items-center p-4 pt-8 md:p-6">
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            </main>
        );
    }

    return (
        <main className="flex flex-col items-center p-4 pt-8 md:p-6">
            <div className="w-full max-w-4xl">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">{getCategoryTitle(reportData.category)}</CardTitle>
                        <CardDescription>Pré-visualização do Relatório</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReportDetail formData={reportData.formData} />
                    </CardContent>
                     <CardFooter className="flex flex-col md:flex-row justify-between gap-4 pt-6">
                        <Button variant="outline" onClick={handleEdit} disabled={isSaving}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                        <div className="flex gap-4">
                             <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {isSaving ? 'Salvando...' : 'Salvar e Ir para Início'}
                            </Button>
                            <Button variant="secondary" className="bg-green-500 hover:bg-green-600 text-white" onClick={handleShare} disabled={isSaving}>
                                <Share2 className="mr-2 h-4 w-4" />
                                Compartilhar no WhatsApp
                            </Button>
                        </div>
                    </CardFooter>
                 </Card>
            </div>
        </main>
    );
}
