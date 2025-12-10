
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const codeSections = [
    {
        title: 'Códigos de Mensagem',
        content: 'Conteúdo para Códigos de Mensagem em breve.'
    },
    {
        title: 'Tipos de Ação/Providência',
        content: 'Conteúdo para Tipos de Ação/Providência em breve.'
    },
    {
        title: 'Tipos de Ocorrência',
        content: 'Conteúdo para Tipos de Ocorrência em breve.'
    },
    {
        title: 'Tipos de Pane',
        content: 'Conteúdo para Tipos de Pane em breve.'
    },
    {
        title: 'Outras Mensagens',
        content: 'Conteúdo para Outras Mensagens em breve.'
    },
    {
        title: 'Código Q (Alfabeto Fonético)',
        content: 'Conteúdo para Código Q (Alfabeto Fonético) em breve.'
    }
]

export default function CodigosPage() {
  return (
    <main className="flex flex-col items-center p-4 pt-8 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Início
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary font-headline tracking-wide">
              CÓDIGOS E ABREVIATURAS
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Consulte os códigos e abreviaturas utilizados na comunicação.
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
            {codeSections.map((section, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-xl hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="text-base p-4 bg-card rounded-md">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>

      </div>
    </main>
  );
}
