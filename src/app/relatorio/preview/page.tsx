
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
import { useFirestore }from '@/firebase';
import { eventCategories } from '@/lib/events';
import ReportDetail from '@/components/ReportDetail';

interface ReportData {
  category: string;
  formData: any;
  createdAt?: any;
}

export default function PreviewPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      setReport(JSON.parse(savedData));
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);
  
  const getCategoryTitle = (slug: string) => {
    const category = eventCategories.find((c) => c.slug === slug);
    return category ? category.title : slug;
  };
  
    const formatDate = (dateSource: any): string => {
        if (!dateSource) return 'Carregando...';
        
        // Don't format if it's not a valid date string or object
        if (typeof dateSource !== 'string' && !(dateSource instanceof Date) && !(dateSource instanceof Timestamp)) {
            return String(dateSource);
        }
        
        try {
            const date = (dateSource instanceof Timestamp) ? dateSource.toDate() : new Date(dateSource);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return String(dateSource);
            }
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return String(dateSource); // Fallback for invalid date strings
        }
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
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.push(`/${report.category}`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Button>
                <Button
                  variant="secondary"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleShare}
                >
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
