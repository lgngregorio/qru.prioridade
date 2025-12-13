
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Edit, Share2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { eventCategories } from '@/lib/events';
import ReportDetail from '@/components/ReportDetail';
import { useUser } from '@/app/layout';

interface ReportData {
  category: string;
  formData: any;
  userEmail?: string;
  createdAt?: any;
}

export default function PreviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();

  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setReport(parsedData);
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleSaveAndGoToHistory = () => {
    if (!report || !user) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Relatório ou usuário não encontrado. Não é possível salvar.',
      });
      return;
    }

    try {
      const allReports = JSON.parse(localStorage.getItem('qru-priority-reports') || '[]');
      const newReport = {
        ...report,
        id: new Date().toISOString() + Math.random(), // Unique ID
        userEmail: user.email,
        createdAt: new Date().toISOString(),
      };

      allReports.push(newReport);
      localStorage.setItem('qru-priority-reports', JSON.stringify(allReports));

      toast({
        title: 'Sucesso!',
        description: 'Seu relatório foi salvo.',
      });
      localStorage.removeItem('reportPreview');
      router.push('/ocorrencias'); 
    } catch (error) {
      console.error('Erro ao salvar o relatório: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o seu relatório. Tente novamente.',
      });
    }
  };

  const handleEdit = () => {
      if (report) {
          router.push(`/${report.category}`);
      }
  };

  const getCategoryTitle = (slug: string) => {
    const category = eventCategories.find((c) => c.slug === slug);
    return category ? category.title : slug;
  };
    
    const formatDate = (dateSource: any): string => {
        if (!dateSource) return 'N/A';
        
        // Check if it's an ISO string or a Date object
        const date = new Date(dateSource);
        if (isNaN(date.getTime())) {
            return String(dateSource); // Not a valid date, return as is
        }
        
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    
    const formatWhatsappValue = (value: any, key: string): string => {
        if (value === null || value === undefined || value === 'NILL' || value === '') return '';
        if (typeof value === 'boolean') return value ? 'SIM' : 'NÃO';
        
        const dateKeys = ['data', 'dn', 'createdAt', 'qtrInicio', 'qtrTermino'];

        if (dateKeys.includes(key)) {
             return formatDate(value);
        }

        if (Array.isArray(value)) return value.join(', ').toUpperCase();
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

  const handleShare = () => {
    if (!report) return;
    const message = generateWhatsappMessage(report.formData, report.category);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  

  if (isLoading || isUserLoading || !report) {
    return (
      <main className="flex flex-col items-center p-4 md:p-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-lg">Carregando pré-visualização...</p>
        </div>
      </main>
    );
  }

  return (
      <main className="flex flex-col items-center p-4 pt-8 md:p-6">
        <div className="w-full max-w-4xl">
          <Card>
            <CardHeader className="text-center">
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {getCategoryTitle(report.category)}
                  </CardTitle>
                  <CardDescription>
                    Pré-visualização do Relatório
                  </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <ReportDetail formData={report.formData} />
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row justify-end gap-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <Button
                        variant="outline"
                        onClick={handleEdit}
                        className="w-full"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <Button
                        onClick={handleSaveAndGoToHistory}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Relatório
                    </Button>
                </div>
                <Button
                    variant="secondary"
                    className="bg-green-500 hover:bg-green-600 text-white w-full"
                    onClick={handleShare}
                >
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartilhar no WhatsApp
                </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
  );
}

