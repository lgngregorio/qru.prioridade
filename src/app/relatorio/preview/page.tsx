
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Edit, Share2 } from 'lucide-react';
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
import { logActivity } from '@/lib/activity-logger';
import { Timestamp } from 'firebase/firestore';


interface ReportData {
  id?: string;
  category: string;
  formData: any;
  uid?: string;
  createdAt?: any;
  updatedAt?: any;
}

function getHistoryKey(userEmail: string | null): string | null {
  if (!userEmail) return null;
  return `ocorrencias-historico-${userEmail}`;
}

const getCategoryInfo = (slug: string) => {
    const category = eventCategories.find((c) => c.slug === slug);
    return {
        title: category ? category.title : slug,
        color: category ? category.color : '#808080'
    };
};

const sectionTitles: { [key: string]: string } = {
  generalInfo: 'INFORMAÇÕES GERAIS',
  vehicles: 'VEÍCULOS',
  caracteristicasEntorno: 'CARACTERÍSTICAS DO ENTORNO',
  tracadoPista: 'TRAÇADO DA PISTA',
  sinalizacaoInfo: 'SINALIZAÇÃO',
  otherInfo: 'OUTRAS INFORMAÇÕES',
  previa: 'ACIDENTE PRÉVIA',
  confirmacao: 'CONFIRMAÇÃO DA PRÉVIA',
  condicao: 'CONDIÇÃO',
  pista: 'PISTA',
  sinalizacao: 'SINALIZAÇÃO (GERAL)',
  dadosOperacionais: "DADOS OPERACIONAIS",
  victims: "VÍTIMAS",
  consumoMateriais: "CONSUMO DE MATERIAIS",
  relatorio: "RELATÓRIO/OBSERVAÇÕES",
  observacoes: "OBSERVAÇÕES",
  ocorrencia: "OCORRÊNCIA",
  destinacaoAnimal: 'DESTINAÇÃO ANIMAL',
  qthExato: 'QTH EXATO',
  qraResponsavel: 'QRA DO RESPONSÁVEL',
  baixaFrequencia: 'BAIXA FREQUÊNCIA',
  qtrInicio: 'QTR DE INÍCIO',
  qtrTermino: 'QTR DE TÉRMINO',
  qthInicio: 'QTH DE INÍCIO',
  qthTermino: 'QTH DE TÉRMINO',
  tipoDeObra: 'TIPO DE OBRA',
  tipoDeDefeito: 'TIPO DE DEFEITO',
  nomeDaPlaca: 'NOME DA PLACA',
  tipoDeServico: 'TIPO DE SERVIÇO',
  situacao: 'SITUAÇÃO',
};

const formatKey = (key: string) => {
    if (sectionTitles[key as keyof typeof sectionTitles]) {
        return `*${sectionTitles[key as keyof typeof sectionTitles]}*`;
    }
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
    return `*${formattedKey.toUpperCase()}*`;
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === 'NILL' || value === '') {
    return 'N/A';
  }
  if (typeof value === 'boolean') {
    return value ? 'SIM' : 'NÃO';
  }
  if (Array.isArray(value)) {
    return value.map(formatValue).join(', ').toUpperCase();
  }
   if (value instanceof Date || (value && value.seconds && typeof value.seconds === 'number')) {
      try {
        const date = (value instanceof Timestamp) ? value.toDate() : new Date(value);
        if(!isNaN(date.getTime())) {
            return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      } catch { /* ignore */ }
  }
  if (typeof value === 'object') {
     return '';
  }

  return String(value).replace(/[-_]/g, ' ').toUpperCase();
};

const generateWhatsappMessage = (report: ReportData): string => {
  const { formData, category } = report;
  const categoryInfo = getCategoryInfo(category);
  let message = `*${categoryInfo.title.toUpperCase()}*\n\n`;

  const processSection = (data: any, sectionTitle: string) => {
    let sectionText = `*${sectionTitle.toUpperCase()}*\n`;
    let contentAdded = false;

    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            const itemTitle = `${sectionTitle.replace(/S$/, '')} ${index + 1}`;
            const subSection = processSection(item, itemTitle);
            if (subSection.trim() !== `*${itemTitle.toUpperCase()}*`) {
                sectionText += subSection;
                contentAdded = true;
            }
        });
        return contentAdded ? sectionText : '';
    }

    for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined || value === 'NILL' || value === '' || key === 'id') continue;
        
        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value.seconds && typeof value.seconds === 'number')) {
             const subSectionText = processSection(value, sectionTitles[key] || key);
             if (subSectionText) {
                 sectionText += subSectionText;
                 contentAdded = true;
             }
        } else {
            const formattedValue = formatValue(value);
            if (formattedValue !== 'N/A' && formattedValue.trim() !== '') {
                sectionText += `${formatKey(key)}: ${formattedValue}\n`;
                contentAdded = true;
            }
        }
    }
    return contentAdded ? sectionText + '\n' : '';
  };

  for (const [sectionKey, sectionData] of Object.entries(formData)) {
      if (sectionData === null || sectionData === undefined) continue;

      const sectionTitle = sectionTitles[sectionKey] || sectionKey;
      const sectionResult = processSection(sectionData, sectionTitle);
      
      if (sectionResult) {
          message += sectionResult;
      }
  }

  return message.trim();
};


export default function PreviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();

  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setReport(parsedData);
    }
    setIsLoading(false);
  }, []);

  const handleSaveAndGoToHistory = () => {
    if (!report || !user) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Relatório ou usuário não encontrado.',
      });
      return;
    }
    
    setIsSaving(true);
    
    const historyKey = getHistoryKey(user.email);
    if (!historyKey) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível identificar o usuário." });
        setIsSaving(false);
        return;
    }

    try {
        const savedReportsRaw = localStorage.getItem(historyKey);
        const savedReports = savedReportsRaw ? JSON.parse(savedReportsRaw) : [];

        const now = new Date().toISOString();
        let isEditing = false;
        
        const reportToSave: ReportData = {
            ...report,
            uid: user.uid,
            updatedAt: now,
        };

        let newReports = [];

        if (report.id) { // Editing existing report
            isEditing = true;
            newReports = savedReports.map((r: ReportData) => r.id === report.id ? reportToSave : r);
        } else { // Creating new report
            reportToSave.id = `report-${Date.now()}`;
            reportToSave.createdAt = now;
            newReports = [reportToSave, ...savedReports];
        }

        localStorage.setItem(historyKey, JSON.stringify(newReports));
        
        logActivity(user.email, {
            type: 'report',
            description: `${isEditing ? 'Editou' : 'Criou'} relatório: ${getCategoryTitle(report.category)}`,
            url: `/ocorrencias`
        });

        toast({
          title: 'Sucesso!',
          description: `Seu relatório foi ${isEditing ? 'atualizado' : 'salvo'}.`,
        });

      localStorage.removeItem('reportPreview');
      router.push('/ocorrencias'); 
    } catch (error) {
      console.error('Erro ao salvar o relatório no localStorage: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o seu relatório. Tente novamente.',
      });
    } finally {
        setIsSaving(false);
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
    
  const handleShare = () => {
    if (!report) return;
    const message = generateWhatsappMessage(report);
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
                        disabled={isSaving}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <Button
                        onClick={handleSaveAndGoToHistory}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Salvando...' : 'Salvar Relatório'}
                    </Button>
                </div>
                <Button
                    variant="secondary"
                    className="bg-green-500 hover:bg-green-600 text-white w-full"
                    onClick={handleShare}
                    disabled={isSaving}
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
