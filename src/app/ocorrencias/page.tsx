
'use client';

import { useState, useEffect } from 'react';
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
import { Timestamp } from 'firebase/firestore';


interface Report {
  id: string;
  category: string;
  createdAt: string; // ISO string
  formData: any;
  uid?: string; // Kept for potential future use
  updatedAt?: string; // ISO string
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

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Data indisponível';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString; // Fallback to original string
  }
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
  relatorio: "RELATÓRIO/OBSERVAÇÕES"
};

const formatKey = (key: string) => {
  if (sectionTitles[key]) return sectionTitles[key];
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

  return String(value).toUpperCase();
};

const generateWhatsappMessage = (report: Report): string => {
  const { formData, category } = report;
  const { title } = getCategoryInfo(category);

  let message = `*${title.toUpperCase()}*\n\n`;

  const processData = (data: any): string => {
    let content = '';

    if (typeof data !== 'object' || data === null) {
      return formatValue(data);
    }
    
    if (Array.isArray(data)) {
        return data.map((item, index) => {
            const itemTitle = `\n*${formatKey(Object.keys(item).find(k => k.includes('marca') || k.includes('nome')) || 'Item')} ${index + 1}*\n`;
            return itemTitle + processData(item);
        }).join('');
    }

    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || value === null || value === undefined || value === 'NILL' || (Array.isArray(value) && value.length === 0)) continue;

      const formattedKey = formatKey(key);
      
      if (typeof value === 'object') {
        const nestedContent = processData(value);
        if(nestedContent) {
           message += `*${formattedKey.toUpperCase()}*\n${nestedContent}\n`;
        }
      } else {
        const formattedValue = formatValue(value);
        if (formattedValue && formattedValue !== 'N/A') {
          message += `*${formattedKey}:* ${formattedValue}\n`;
        }
      }
    }
    return content;
  };
  
  processData(formData);
  return message.trim();
};


const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function getHistoryKey(userEmail: string | null): string | null {
  if (!userEmail) return null;
  return `ocorrencias-historico-${userEmail}`;
}

function ReportCard({ report, onDelete }: { report: Report; onDelete: () => void }) {
  const router = useRouter();
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
    const rodovia = report.formData?.generalInfo?.rodovia;
    let phoneNumber = '';
    
    if (rodovia === 'ms-112' || rodovia === 'br-158') {
      phoneNumber = '+5567981630190';
    } else if (rodovia === 'ms-306') {
      phoneNumber = ''; // User will choose
    }
    
    const message = generateWhatsappMessage(report);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
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
                <ReportDetail formData={report.formData} />
             </div>
          </CardContent>
        )}
        <CardFooter className="p-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="default" onClick={handleEdit} className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex-grow">
              <Edit className="h-5 w-5 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="default" onClick={handleShare} className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white flex-grow">
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
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        const historyKey = getHistoryKey(user.email);
        if (historyKey) {
          try {
            const savedReports = localStorage.getItem(historyKey);
            if (savedReports) {
              const parsedReports: Report[] = JSON.parse(savedReports);
              parsedReports.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                return dateB - dateA;
              });
              setReports(parsedReports);
            }
          } catch (error) {
            console.error("Failed to load reports from localStorage", error);
            toast({
              variant: "destructive",
              title: "Erro ao carregar relatórios",
              description: "Não foi possível ler seus relatórios salvos."
            });
          }
        }
      }
      setIsLoading(false);
    }
  }, [user, isUserLoading, toast]);

  const handleDeleteReport = (reportId: string) => {
    if (!user) return;
    const historyKey = getHistoryKey(user.email);
    if (historyKey) {
        const updatedReports = reports.filter(r => r.id !== reportId);
        localStorage.setItem(historyKey, JSON.stringify(updatedReports));
        setReports(updatedReports);
        toast({
            title: 'Relatório apagado!',
            description: 'Seu relatório foi removido com sucesso.',
        });
    }
  };


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

      {(isLoading || isUserLoading) && <LoadingSkeleton />}

      {!isLoading && !isUserLoading && reports.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">Nenhum relatório encontrado.</p>
          <p className="text-muted-foreground">
            Os relatórios que você salvar aparecerão aqui.
          </p>
        </div>
      )}

      {!isLoading && !isUserLoading && reports.length > 0 && (
        <div className="space-y-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onDelete={() => handleDeleteReport(report.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
