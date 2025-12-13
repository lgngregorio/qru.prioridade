
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { eventCategories } from '@/lib/events';
import { Timestamp } from 'firebase/firestore';

const formatDate = (timestamp: Timestamp | { seconds: number, nanoseconds: number } | null) => {
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

const getCategoryInfo = (slug: string) => {
  return eventCategories.find(c => c.slug === slug) || { title: slug, icon: () => null };
};

export default function OcorrenciasPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'reports'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user?.uid]);

  const { data: reports, isLoading: isReportsLoading } = useCollection(reportsQuery);

  const isLoading = isUserLoading || (reportsQuery && isReportsLoading);

  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
            Minhas Ocorrências
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Visualize todos os relatórios que você salvou.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => {
              const categoryInfo = getCategoryInfo(report.category);
              const CategoryIcon = categoryInfo.icon;
              return (
                <Card key={report.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: categoryInfo.color || '#ccc' }}>
                        <CategoryIcon className="h-6 w-6 text-white" />
                       </div>
                       <div className="flex-1">
                          <CardTitle className="text-xl">{categoryInfo.title}</CardTitle>
                          <CardDescription>
                            Salvo em: {formatDate(report.createdAt)}
                          </CardDescription>
                       </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              Você ainda não salvou nenhum relatório.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Criar meu primeiro relatório</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
