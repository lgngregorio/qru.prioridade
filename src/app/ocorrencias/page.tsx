
'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Loader2, History, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Report {
    id: string;
    category: string;
    createdAt: Timestamp | { seconds: number; nanoseconds: number };
    formData: any;
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
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function OcorrenciasPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const reportsQuery = useMemoFirebase(() => {
        if (firestore) {
            return query(
                collection(firestore, 'reports'),
                orderBy('createdAt', 'desc')
            );
        }
        return null;
    }, [firestore]);

    const { data: reports, isLoading: isReportsLoading, error } = useCollection<Report>(reportsQuery);

    const isLoading = isUserLoading || isReportsLoading;

    if (isLoading) {
        return (
            <main className="flex flex-col items-center p-4 md:p-6">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            </main>
        );
    }
    
    if (error) {
        return (
            <main className="flex flex-col items-center p-4 md:p-6 text-center">
                 <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar ocorrências</h2>
                <p className="text-muted-foreground max-w-md">Não foi possível buscar seus relatórios. Verifique sua conexão ou tente novamente mais tarde.</p>
                 <pre className="mt-4 text-xs text-left bg-muted p-2 rounded-md max-w-full overflow-auto">
                    <code>{error.message}</code>
                </pre>
            </main>
        )
    }

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
                    <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase flex items-center justify-center gap-2">
                       <History className="h-8 w-8" />
                       Histórico de Ocorrências
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base">
                        Visualize todos os seus relatórios salvos.
                    </p>
                </div>

                <div className="space-y-4">
                    {reports && reports.length > 0 ? (
                        reports.map((report) => (
                            <Card key={report.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{report.formData?.generalInfo?.ocorrencia || 'Relatório'}</CardTitle>
                                            <CardDescription>{report.formData?.generalInfo?.qth || 'Local não informado'}</CardDescription>
                                        </div>
                                        <Badge variant="secondary">{formatDate(report.createdAt)}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground line-clamp-2">{report.formData?.otherInfo?.observacoes || 'Sem observações.'}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                           <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                           <h3 className="text-xl font-semibold">Nenhum relatório salvo</h3>
                           <p className="text-muted-foreground">Você ainda não salvou nenhuma ocorrência.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
