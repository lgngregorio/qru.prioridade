
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ComponentType, useMemo } from 'react';

import { eventCategories } from '@/lib/events';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingSkeleton = () => (
  <div className="p-8 space-y-8">
    <Skeleton className="h-10 w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
     <Skeleton className="h-24 w-full" />
  </div>
);

const formComponentMap: Record<string, () => Promise<{ default: ComponentType<{ categorySlug: string }> }>> = {
  'qud-aph': () => import('@/components/forms/QudAphForm'),
  'qud-operacao': () => import('@/components/forms/QudOperacaoForm'),
  'tracado-de-pista': () => import('@/components/forms/TracadoDePistaForm'),
  'to-01': () => import('@/components/forms/VeiculoAbandonadoForm'),
  'to-02': () => import('@/components/forms/IncendioForm'),
  'to-03': () => import('@/components/forms/TO03Form'),
  'to-04': () => import('@/components/forms/TO04Form'),
  'to-05': () => import('@/components/forms/TO05Form'),
  'to-06': () => import('@/components/forms/TO06Form'),
  'to-07': () => import('@/components/forms/TO07Form'),
  'to-09': () => import('@/components/forms/TO09Form'),
  'to-11': () => import('@/components/forms/TO11Form'),
  'to-12': () => import('@/components/forms/TO12Form'),
  'to-15': () => import('@/components/forms/TO15Form'),
  'to-16': () => import('@/components/forms/TO16Form'),
  'to-17': () => import('@/components/forms/TO17Form'),
  'to-19': () => import('@/components/forms/TO19Form'),
  'to-33': () => import('@/components/forms/TO33Form'),
  'to-34': () => import('@/components/forms/TO34Form'),
  'to-35': () => import('@/components/forms/TO35Form'),
  'to-37': () => import('@/components/forms/TO37Form'),
  'to-38': () => import('@/components/forms/TO38Form'),
  'to-39': () => import('@/components/forms/TO39Form'),
  'to-50': () => import('@/components/forms/TO50Form'),
};

function ReportFormComponent({ categorySlug }: { categorySlug: string }) {
  const FormComponent = useMemo(() => {
    const componentLoader = formComponentMap[categorySlug];
    if (componentLoader) {
      return dynamic(componentLoader, {
        loading: () => <LoadingSkeleton />,
        ssr: false,
      });
    }
    return null;
  }, [categorySlug]);

  if (FormComponent) {
    return <FormComponent categorySlug={categorySlug} />;
  }

  return <p className="p-8 text-center">Formulário para {categorySlug} em construção.</p>;
}

export default function ReportPage() {
  const params = useParams<{ category: string }>();
  const category = eventCategories.find((c) => c.slug === params.category);

  if (!category) {
    return null;
  }
  
  const title = category.title;
  const description = (
    <>
      Preencha os campos abaixo e envie o relatório <br /> completo.
    </>
  );

  const backLink = '/';
  const backText = 'Voltar para o início';

  return (
    <main className="flex flex-col items-center">
      <div className="w-full">
        <div className="p-4 md:p-6 mb-4 flex items-center gap-4">
          <Button asChild variant="outline" className="rounded-full text-base">
            <Link href={backLink}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backText}
            </Link>
          </Button>
        </div>
        <Card className="w-full shadow-none rounded-none border-0 bg-transparent">
          <CardHeader className="text-center px-4 pb-4 md:px-6 md:pb-6">
            <CardTitle className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
              {title}
            </CardTitle>
            <CardDescription className="text-lg mt-1 text-muted-foreground normal-case">
             {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ReportFormComponent categorySlug={category.slug} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
