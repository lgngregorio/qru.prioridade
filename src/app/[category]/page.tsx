
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

import { eventCategories } from '@/lib/events';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
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


const formComponents: { [key: string]: ComponentType<{ categorySlug: string }> } = {
  'qud-aph': dynamic(() => import('@/components/forms/QudAphForm'), { loading: () => <LoadingSkeleton /> }),
  'qud-operacao': dynamic(() => import('@/components/forms/QudOperacaoForm'), { loading: () => <LoadingSkeleton /> }),
  'tracado-de-pista': dynamic(() => import('@/components/forms/TracadoDePistaForm'), { loading: () => <LoadingSkeleton /> }),
  'to-01': dynamic(() => import('@/components/forms/VeiculoAbandonadoForm'), { loading: () => <LoadingSkeleton /> }),
  'to-02': dynamic(() => import('@/components/forms/IncendioForm'), { loading: () => <LoadingSkeleton /> }),
  'to-03': dynamic(() => import('@/components/forms/TO03Form'), { loading: () => <LoadingSkeleton /> }),
  'to-04': dynamic(() => import('@/components/forms/TO04Form'), { loading: () => <LoadingSkeleton /> }),
  'to-05': dynamic(() => import('@/components/forms/TO05Form'), { loading: () => <LoadingSkeleton /> }),
  'to-06': dynamic(() => import('@/components/forms/TO06Form'), { loading: () => <LoadingSkeleton /> }),
  'to-07': dynamic(() => import('@/components/forms/TO07Form'), { loading: () => <LoadingSkeleton /> }),
  'to-09': dynamic(() => import('@/components/forms/TO09Form'), { loading: () => <LoadingSkeleton /> }),
  'to-11': dynamic(() => import('@/components/forms/TO11Form'), { loading: () => <LoadingSkeleton /> }),
  'to-12': dynamic(() => import('@/components/forms/TO12Form'), { loading: () => <LoadingSkeleton /> }),
  'to-15': dynamic(() => import('@/components/forms/TO15Form'), { loading: () => <LoadingSkeleton /> }),
  'to-16': dynamic(() => import('@/components/forms/TO16Form'), { loading: () => <LoadingSkeleton /> }),
  'to-17': dynamic(() => import('@/components/forms/TO17Form'), { loading: () => <LoadingSkeleton /> }),
  'to-33': dynamic(() => import('@/components/forms/TO33Form'), { loading: () => <LoadingSkeleton /> }),
  'to-34': dynamic(() => import('@/components/forms/TO34Form'), { loading: () => <LoadingSkeleton /> }),
  'to-35': dynamic(() => import('@/components/forms/TO35Form'), { loading: () => <LoadingSkeleton /> }),
  'to-37': dynamic(() => import('@/components/forms/TO37Form'), { loading: () => <LoadingSkeleton /> }),
  'to-38': dynamic(() => import('@/components/forms/TO38Form'), { loading: () => <LoadingSkeleton /> }),
  'to-39': dynamic(() => import('@/components/forms/TO39Form'), { loading: () => <LoadingSkeleton /> }),
  'to-50': dynamic(() => import('@/components/forms/TO50Form'), { loading: () => <LoadingSkeleton /> }),
};

function ReportFormComponent({ categorySlug }: { categorySlug: string }) {
  const FormComponent = formComponents[categorySlug];

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

  return (
    <main className="flex flex-col items-center">
      <div className="w-full">
        <div className="p-4 md:p-6 mb-4 flex items-center gap-4">
          <Button asChild variant="outline" className="rounded-full text-base">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o início
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
