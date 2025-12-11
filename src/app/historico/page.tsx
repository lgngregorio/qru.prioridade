
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2, ArrowLeft, Trash2, ChevronDown, Edit, Share2 } from 'lucide-react';
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

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp | null;
  formData: any;
}

const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (value instanceof Timestamp) return formatDate(value);
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
        // Simple object rendering, may need to be more sophisticated
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
        .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
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

const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Carregando...';
    return timestamp.toDate().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

export default function HistoricoPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) {
      setLoading(true);
      return;
    };

    const reportsRef = collection(firestore, 'reports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const fetchedReports = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
          } as Report;
        });
        setReports(fetchedReports);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching reports: ', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar relatórios.',
          description: 'Houve um problema ao carregar as ocorrências.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, toast]);
  
  const getCategoryTitle = (slug: string) => {
    const category = eventCategories.find(c => c.slug === slug);
    return category ? category.title : slug;
  }
  
  const handleDelete = (reportId: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, 'reports', reportId)).then(() => {
        toast({ title: 'Relatório apagado com sucesso!' });
    }).catch ((error) => {
      console.error('Error deleting report: ', error);
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
        message += `\n${generateWhatsappMessage(value, formatKey(key))}`;
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
            <CardTitle className="text-3xl font-bold">Histórico de Ocorrências</CardTitle>
            <CardDescription>Visualize, edite ou apague os relatórios salvos.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reports.length > 0 ? (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {reports.map((report) => (
                        <AccordionItem value={report.id} key={report.id} className="border rounded-lg bg-card/50">
                            <AccordionTrigger className="p-4 text-xl hover:no-underline">
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold">{getCategoryTitle(report.category)}</span>
                                        <span className="text-sm font-normal text-muted-foreground">{formatDate(report.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-0">
                                         <Button asChild variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/${report.category}`}>
                                              <Edit className="h-5 w-5 text-primary" />
                                            </Link>
                                          </Button>
                                         <Button variant="ghost" size="icon" className="text-green-500 hover:bg-green-500/10 hover:text-green-500" onClick={(e) => {e.stopPropagation(); handleShare(report);}}>
                                            <Share2 className="h-5 w-5"/>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                                    <Trash2 className="h-5 w-5"/>
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
                                        <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                <ReportDetail formData={report.formData} />
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
