
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useAuth } from '@/firebase'; // Import useAuth
import { onAuthStateChanged, User } from 'firebase/auth'; // Import onAuthStateChanged
import { eventCategories } from '@/lib/events';
import ReportDetail from '@/components/ReportDetail';

interface ReportData {
  category: string;
  formData: any;
  uid?: string; // Add uid to the interface
  createdAt?: any;
}

export default function PreviewPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth(); // Get auth instance
  const { toast } = useToast();

  const [report, setReport] = useState<ReportData | null>(null);
  const [user, setUser] = useState<User | null>(null); // State for the user
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      const savedData = localStorage.getItem('reportPreview');
      if (savedData) {
        setReport(JSON.parse(savedData));
      } else {
        // If no preview data, redirect to home.
        // This might happen if the user navigates here directly.
        router.push('/');
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [router, auth]);
  
  const handleSaveAndGoToHistory = async () => {
    if (!report || !firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Relatório ou usuário não encontrado. Não é possível salvar.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const reportWithUser = {
        ...report,
        uid: user.uid, // Add user's UID to the report
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'reports'), reportWithUser.formData);

      toast({
        title: 'Sucesso!',
        description: 'Seu relatório foi salvo.',
      });
      localStorage.removeItem('reportPreview');
      router.push('/'); 
    } catch (error) {
      console.error('Erro ao salvar o relatório: ', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o seu relatório. Tente novamente.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  const getCategoryTitle = (slug: string) => {
    const category = eventCategories.find((c) => c.slug === slug);
    return category ? category.title : slug;
  };
  
    const formatDate = (dateSource: any): string => {
        if (!dateSource) return 'N/A';
        
        let date;
        if (dateSource instanceof Timestamp) {
            date = dateSource.toDate();
        } else if (dateSource instanceof Date) {
            date = dateSource;
        } else if (typeof dateSource === 'string' || typeof dateSource === 'number') {
            try {
                date = new Date(dateSource);
                if (isNaN(date.getTime())) {
                    return String(dateSource);
                }
            } catch {
                return String(dateSource);
            }
        } else {
            return String(dateSource);
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
  

  if (isLoading || !report) {
    return (
      <main className="flex flex-col items-center p-4 md:p-6">
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
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-bold">
                      {getCategoryTitle(report.category)}
                    </CardTitle>
                    <CardDescription>
                      Pré-visualização do Relatório
                    </CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
              <ReportDetail formData={report.formData} />
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row justify-end gap-4 pt-6">
               <Button
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => router.push(`/${report.category}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                className="w-full md:w-auto"
                onClick={handleSaveAndGoToHistory}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Relatório
              </Button>
              <Button
                variant="secondary"
                className="bg-green-500 hover:bg-green-600 text-white w-full md:w-auto"
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
