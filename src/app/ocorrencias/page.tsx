'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { eventCategories } from '@/lib/events';
import { Timestamp } from 'firebase/firestore';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp | { seconds: number, nanoseconds: number } | null;
  formData: any;
  uid: string;
}

const formatDate = (timestamp: Report['createdAt']) => {
    if (!timestamp) return 'Data indisponível';
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

const getCategoryTitle = (slug: string) => {
    const category = eventCategories.find(c => c.slug === slug);
    return category ? category.title : slug.toUpperCase();
}

export default function OcorrenciasPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // 1. A consulta só é criada quando temos certeza que o user.uid e o firestore existem.
  const reportsQuery = useMemo(() => {
    if (!user || !firestore) {
      return null;
    }
    return query(
      collection(firestore, 'reports'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  // 2. O hook `useCollection` recebe a consulta (ou null) e gerencia a busca.
  const { data: reports, isLoading: isLoadingReports, error } = useCollection<Report>(reportsQuery);

  // 3. O estado de carregamento combinado aguarda o usuário e os relatórios.
  const isLoading = isUserLoading || (user && isLoadingReports);

  const handleViewReport = (report: Report) => {
    // A lógica para visualizar um relatório pode ser adicionada aqui no futuro.
    // Por exemplo, navegar para uma página de detalhes.
    console.log("Visualizando relatório:", report);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Carregando ocorrências...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <Card className="bg-destructive/10 border-destructive/50 text-destructive-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle /> Erro ao Carregar Ocorrências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ocorreu um erro ao buscar seus relatórios. Por favor, tente recarregar a página.</p>
            <p className="text-xs mt-2">Detalhe: {error.message}</p>
          </CardContent>
        </Card>
      );
    }
  
    if (reports && reports.length === 0) {
      return (
         <div className="text-center py-20">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">Nenhuma Ocorrência Encontrada</h2>
            <p className="text-muted-foreground mt-2">Você ainda não salvou nenhum relatório.</p>
            <Button asChild className="mt-4">
                <Link href="/">Criar novo relatório</Link>
            </Button>
        </div>
      );
    }
  
    return (
       <div className="space-y-4">
        {reports?.map((report) => (
          <Card key={report.id} className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle>{getCategoryTitle(report.category)}</CardTitle>
              <CardDescription>
                Salvo em: {formatDate(report.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Futuramente, podemos adicionar um botão para ver detalhes */}
              {/* <Button onClick={() => handleViewReport(report)}>Ver Detalhes</Button> */}
               <p className="text-sm text-muted-foreground">ID do Relatório: {report.id}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <main className="flex flex-col p-4 md:p-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8 pt-8">
            <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
              Minhas Ocorrências
            </h1>
            <p className="text-muted-foreground mt-1 text-base">
              Visualize todos os relatórios que você salvou.
            </p>
        </div>
        {renderContent()}
      </div>
    </main>
  );
}
