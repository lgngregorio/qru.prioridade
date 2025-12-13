
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useUser } from '@/app/layout';

interface Report {
  id: string;
  category: string;
  createdAt: string; // ISO string
  formData: any;
  userEmail: string;
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

const formatDate = (isoDate: string) => {
  if (!isoDate) return 'Data indisponível';
  return new Date(isoDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function OcorrenciasPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading && user) {
      try {
        const allReports = JSON.parse(localStorage.getItem('qru-priority-reports') || '[]');
        const userReports = allReports.filter((report: Report) => report.userEmail === user.email);
        setReports(userReports.sort((a: Report, b: Report) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        console.error("Failed to load reports from localStorage", error);
      } finally {
        setIsLoading(false);
      }
    } else if (!isUserLoading && !user) {
        setIsLoading(false);
    }
  }, [user, isUserLoading]);

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

      <div className="flex items-center justify-between mb-8">
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

      {!isLoading && !isUserLoading && reports.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">Nenhum relatório encontrado.</p>
          <p className="text-muted-foreground">
            Os relatórios que você salvar aparecerão aqui.
          </p>
        </div>
      )}

      {!isLoading && reports.length > 0 && (
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
                <ReportDetail formData={report.formData} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
