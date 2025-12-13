
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

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp | { seconds: number, nanoseconds: number } | null;
  formData: any;
}

const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined || value === 'NILL' || value === '') return 'N/A';
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
        const filteredData = Object.entries(data).filter(([_, value]) => value !== 'NILL' && value !== '' && (!Array.isArray(value) || value.length > 0));
        if (filteredData.length === 0) return null;

        return (
            <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2 text-primary">{title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-lg">
                    {filteredData.map(([key, value]) => (
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
                             {Object.entries(vehicle).map(([key, value]) => {
                                if (value === 'NILL' || value === '' || (Array.isArray(value) && value.length === 0)) return null;
                                return (
                                    <div key={key} className="flex flex-col">
                                        <span className="font-bold text-muted-foreground">{formatKey(key)}</span>
                                        <span>{renderValue(value)}</span>
                                    </div>
                                );
                            })}
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
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    
    const handleSave = async () => {
        if (!firestore || !reportData) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Não há dados de relatório para salvar.",
            });
            return;
        }

        setIsSaving(true);
        const reportsCollection = collection(firestore, 'reports');
        const dataToSave = {
            ...reportData,
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(reportsCollection, dataToSave);
            toast({
                title: "Sucesso!",
                description: "Relatório salvo. Redirecionando para o início.",
                className: "bg-green-600 text-white",
            });
            localStorage.removeItem('reportPreview');
            router.push('/');
        } catch (serverError) {
            const permissionError = new FirestorePermissionError({
                path: reportsCollection.path,
                operation: 'create',
                requestResourceData: dataToSave,
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsSaving(false);
        }
    };

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
        let message = '';
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
        const title = `*${getCategoryTitle(reportData.category).toUpperCase()}*`;
        const reportDetails = generateWhatsappMessage(reportData.formData);
        const message = `${title}\n${reportDetails}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
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
