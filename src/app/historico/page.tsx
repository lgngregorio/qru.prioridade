
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { eventCategories } from '@/lib/events';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp;
  formData: any;
}

export default function HistoricoPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    setLoading(true);
    const reportsRef = collection(firestore, 'reports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const fetchedReports = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : new Timestamp(0, 0),
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ocorrência</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>QTH</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{getCategoryTitle(report.category)}</TableCell>
                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                        <TableCell>{report.formData?.generalInfo?.qth || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" disabled>
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" disabled>
                            <span className="sr-only">Apagar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Nenhum relatório encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
