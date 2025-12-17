
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Share2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import ReportDetail from '@/components/ReportDetail';
import { eventCategories } from '@/lib/events';
import { useUser } from '@/app/layout';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Timestamp, collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';


interface Report {
  id: string;
  category: string;
  createdAt: any; 
  formData: any;
  uid?: string; 
  updatedAt?: any;
  numeroOcorrencia?: string;
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-36 rounded-lg" />
    <Skeleton className="h-36 rounded-lg" />
    <Skeleton className="h-36 rounded-lg" />
  </div>
);

const getCategoryInfo = (slug: string) => {
    const category = eventCategories.find((c) => c.slug === slug);
    return {
        title: category ? category.title : slug,
        color: category ? category.color : '#808080'
    };
};

const formatDate = (dateSource: any) => {
  if (!dateSource) return 'Data indisponível';
  
  let date: Date;

  if (dateSource.seconds) { // Check if it's a Firestore Timestamp
    date = new Timestamp(dateSource.seconds, dateSource.nanoseconds).toDate();
  } else {
    date = new Date(dateSource);
  }

  if (isNaN(date.getTime())) return String(dateSource); // Return original if invalid

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  destinacaoAnimal: 'DESTINAÇÃO DO ANIMAL',
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
  numeroOcorrencia: 'NÚMERO DA OCORRÊNCIA',
};

const autoCorrectMap: { [key: string]: string } = {
    'area': 'Área',
    'veiculo': 'Veículo',
    'veiculos': 'Veículos',
    'condicao': 'Condição',
    'sinalizacao': 'Sinalização',
    'tracado': 'Traçado',
    'saida': 'Saída',
    'reboque': 'Reboque',
    'numero': 'Número',
    'ocorrencia': 'Ocorrência',
    'observacoes': 'Observações',
    'informacoes': 'Informações',
    'caracteristicas': 'Características',
    'auxilios': 'Auxílios',
    'vitima': 'Vítima',
    'vitimas': 'Vítimas',
    'operacionais': 'Operacionais',
    'materiais': 'Materiais',
    'destinacao': 'Destinação',
    'responsavel': 'Responsável',
    'frequencia': 'Frequência',
    'inicio': 'Início',
    'termino': 'Término',
    'dominio': 'Domínio',
};

const autoCorrect = (text: string): string => {
  if (typeof text !== 'string') return text;
  const regex = new RegExp(`\\b(${Object.keys(autoCorrectMap).join('|')})\\b`, 'gi');
  return text.replace(regex, (matched) => autoCorrectMap[matched.toLowerCase()] || matched);
};


const formatKey = (key: string) => {
    if (sectionTitles[key as keyof typeof sectionTitles]) {
        return `*${sectionTitles[key as keyof typeof sectionTitles]}*`;
    }
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
    return `*${autoCorrect(formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)).toUpperCase()}*`;
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
  
  const correctedValue = autoCorrect(String(value));
  return correctedValue.replace(/[-_]/g, ' ').toUpperCase();
};

const generateWhatsappMessage = (report: Report): string => {
  const { formData, category, numeroOcorrencia } = report;
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
             const subSectionText = processSection(value, sectionTitles[key] || autoCorrect(key));
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

      const sectionTitle = sectionTitles[sectionKey] || autoCorrect(sectionKey);
      const sectionResult = processSection(sectionData, sectionTitle);
      
      if (sectionResult) {
          message += sectionResult;
      }
  }
  
  if (numeroOcorrencia) {
      message += `\n*NÚMERO DA OCORRÊNCIA*: ${numeroOcorrencia}`;
  }

  return message.trim();
};


const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};


function ReportCard({ report, onDelete }: { report: Report; onDelete: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { title, color } = getCategoryInfo(report.category);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem('reportPreview', JSON.stringify(report));
    router.push(`/${report.category}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!report.numeroOcorrencia) {
        toast({
            variant: "destructive",
            title: "Número da Ocorrência ausente",
            description: "Por favor, edite o relatório e adicione um número de ocorrência para poder compartilhar.",
        });
        return;
    }

    const message = generateWhatsappMessage(report);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    onDelete();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const displayDate = report.updatedAt || report.createdAt;

  return (
    <>
      <Card 
        className="relative"
        style={{ 
          backgroundColor: hexToRgba(color, 0.1),
        }}
      >
        <Button variant="destructive" size="icon" onClick={handleDeleteClick} className="absolute top-2 right-2 h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Apagar</span>
        </Button>
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <CardTitle className="truncate pr-10">{title}</CardTitle>
          <CardDescription className="text-base font-bold text-muted-foreground">
            {formatDate(displayDate)} {report.updatedAt && report.createdAt !== report.updatedAt ? '(Editado)' : ''}
          </CardDescription>
        </CardHeader>
        
        {isExpanded && (
          <CardContent>
             <div className="mt-4 pt-4 border-t">
                <ReportDetail formData={report.formData} numeroOcorrencia={report.numeroOcorrencia} />
             </div>
          </CardContent>
        )}
        <CardFooter className="p-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="default" onClick={handleEdit} className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex-grow">
              <Edit className="h-5 w-5 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="default" onClick={handleShare} className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white flex-grow" disabled={!report.numeroOcorrencia}>
              <Share2 className="h-5 w-5 mr-2" />
              Compartilhar
            </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá apagar permanentemente o seu relatório.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeleting ? 'Apagando...' : 'Apagar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


export default function OcorrenciasPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();

  useEffect(() => {
    // Clear the edit-mode flag when entering this page
    localStorage.removeItem('reportPreview');
  }, []);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'reports'), where('uid', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: reports, isLoading: areReportsLoading } = useCollection<Report>(reportsQuery);

  const sortedReports = useMemo(() => {
    if (!reports) return [];
    return [...reports].sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt.toDate()).getTime() : new Date(a.createdAt.toDate()).getTime();
        const dateB = b.updatedAt ? new Date(b.updatedAt.toDate()).getTime() : new Date(b.createdAt.toDate()).getTime();
        return dateB - dateA;
    });
  }, [reports]);

  const handleDeleteReport = async (reportId: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(firestore, 'reports', reportId));
        toast({
            title: 'Relatório apagado!',
            description: 'Seu relatório foi removido com sucesso.',
        });
    } catch (error) {
        console.error("Error deleting report: ", error);
        toast({
            variant: "destructive",
            title: "Erro ao apagar",
            description: "Não foi possível remover o relatório."
        });
    }
  };

  const isLoading = isUserLoading || areReportsLoading;

  return (
    <main className="flex flex-col p-4 md:p-6">
      <div className="w-full mb-6 pt-4 flex items-center">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o início
          </Link>
        </Button>
      </div>

      <div className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
          Histórico de Ocorrências
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          Visualize todos os seus relatórios salvos.
        </p>
      </div>

      {isLoading && <LoadingSkeleton />}

      {!isLoading && sortedReports.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">Nenhum relatório encontrado.</p>
          <p className="text-muted-foreground">
            Os relatórios que você salvar aparecerão aqui.
          </p>
        </div>
      )}

      {!isLoading && sortedReports.length > 0 && (
        <div className="space-y-6">
          {sortedReports.map((report) => (
            <ReportCard key={report.id} report={report} onDelete={() => handleDeleteReport(report.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
