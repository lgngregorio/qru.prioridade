
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ReportDetail from '@/components/ReportDetail';
import { eventCategories } from '@/lib/events';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp;
  formData: any;
}

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-48 rounded-lg" />
    <Skeleton className="h-48 rounded-lg" />
    <Skeleton className="h-48 rounded-lg" />
  </div>
);

const getCategoryTitle = (slug: string) => {
  const category = eventCategories.find((c) => c.slug === slug);
  return category ? category.title : slug;
};

const formatDate = (timestamp: Timestamp) => {
  if (!timestamp) return 'Data indisponível';
  return timestamp.toDate().toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function OcorrenciasPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const reportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'reports'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: reports, isLoading, error } = useCollection<Omit<Report, 'id'>>(reportsQuery);

  return (
    <main className="flex flex-col p-4 md:p-6">
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
            Histórico de Ocorrências
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Visualize todos os seus relatórios salvos.
          </p>
        </div>
      </div>

      {(isLoading || isUserLoading) && <LoadingSkeleton />}

      {error && (
        <div className="text-center py-10">
          <p className="text-destructive-foreground bg-destructive p-4 rounded-md">
            Ocorreu um erro ao carregar o histórico: {error.message}
          </p>
        </div>
      )}

      {!isLoading && !isUserLoading && !error && reports?.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">Nenhum relatório encontrado.</p>
          <p className="text-muted-foreground">
            Os relatórios que você salvar aparecerão aqui.
          </p>
        </div>
      )}

      {!isLoading && reports && reports.length > 0 && (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {getCategoryTitle(report.category)}
                </CardTitle>
                <CardDescription>
                  Registrado em: {formatDate(report.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportDetail formData={report} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
