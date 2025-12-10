'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
import VeiculoAbandonadoForm from '@/components/forms/VeiculoAbandonadoForm';
import IncendioForm from '@/components/forms/IncendioForm';
import TO03Form from '@/components/forms/TO03Form';
import TO04Form from '@/components/forms/TO04Form';
import TO05Form from '@/components/forms/TO05Form';
import TO06Form from '@/components/forms/TO06Form';
import TO07Form from '@/components/forms/TO07Form';
import TO09Form from '@/components/forms/TO09Form';
import TO11Form from '@/components/forms/TO11Form';
import TO15Form from '@/components/forms/TO15Form';
import TO17Form from '@/components/forms/TO17Form';
import TO33Form from '@/components/forms/TO33Form';
import TO34Form from '@/components/forms/TO34Form';
import TO35Form from '@/components/forms/TO35Form';
import TO37Form from '@/components/forms/TO37Form';
import TO38Form from '@/components/forms/TO38Form';

function ReportFormComponent({ categorySlug }: { categorySlug: string }) {
  switch (categorySlug) {
    case 'to-01':
      return <VeiculoAbandonadoForm categorySlug={categorySlug} />;
    case 'to-02':
      return <IncendioForm categorySlug={categorySlug} />;
    case 'to-03':
        return <TO03Form categorySlug={categorySlug} />;
    case 'to-04':
        return <TO04Form categorySlug={categorySlug} />;
    case 'to-05':
        return <TO05Form categorySlug={categorySlug} />;
    case 'to-06':
        return <TO06Form categorySlug={categorySlug} />;
    case 'to-07':
        return <TO07Form categorySlug={categorySlug} />;
    case 'to-09':
        return <TO09Form categorySlug={categorySlug} />;
    case 'to-11':
        return <TO11Form categorySlug={categorySlug} />;
    case 'to-15':
        return <TO15Form categorySlug={categorySlug} />;
    case 'to-17':
        return <TO17Form categorySlug={categorySlug} />;
    case 'to-33':
        return <TO33Form categorySlug={categorySlug} />;
    case 'to-34':
        return <TO34Form categorySlug={categorySlug} />;
    case 'to-35':
        return <TO35Form categorySlug={categorySlug} />;
    case 'to-37':
        return <TO37Form categorySlug={categorySlug} />;
    case 'to-38':
        return <TO38Form categorySlug={categorySlug} />;
    default:
      // Um formulário padrão ou uma mensagem de "em breve" pode ser retornada aqui.
      return <p className="p-8 text-center">Formulário para {categorySlug} em construção.</p>;
  }
}


export default function ReportPage() {
  const params = useParams<{ category: string }>();
  const category = eventCategories.find((c) => c.slug === params.category);

  if (!category) {
    // Idealmente, redirecionar para uma página 404.
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
          <SidebarTrigger className="md:hidden" />
          <Button asChild variant="outline" className="rounded-full uppercase text-base">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              VOLTAR
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
