'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
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

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp;
  formData: any;
}

export default function HistoricoPage() {
  const firestore = useFirestore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (!firestore) return;

      try {
        const reportsRef = collection(firestore, 'reports');
        const q = query(reportsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Report[];
        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching reports: ", error);
        // You might want to show a toast message here
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [firestore]);

  const getReportTitle = (report: Report) => {
    if (report.category === 'to-01') {
      const plate = report.formData?.vehicles?.[0]?.placa || 'N/A';
      return `Veículo Abandonado - Placa: ${plate}`;
    }
    // Add other report types here
    return `Relatório #${report.id.substring(0, 5)}`;
  };
  
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Data indisponível';
    return timestamp.toDate().toLocaleString('pt-BR');
  };

  return (
    <main className="flex flex-col items-center p-4 pt-8 md:p-6">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline tracking-wide">
              Histórico de Ocorrências
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Visualize, edite ou apague os relatórios salvos.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center p-10">
                <p className="text-muted-foreground">Nenhum relatório encontrado.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Relatório</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{getReportTitle(report)}</TableCell>
                      <TableCell>{formatDate(report.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" disabled>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="icon" disabled>
                          <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Apagar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
