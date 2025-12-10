
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const messageCodes = [
    { code: 'QAP', message: 'Na Escuta' },
    { code: 'QAR', message: 'Autorização para abandonar a escuta' },
    { code: 'QBU', message: 'Agitado, confusão mental, Alucinações' },
    { code: 'QRA', message: 'Prefixo da estação / Operador' },
    { code: 'QRM', message: 'Interferência de outra estação' },
    { code: 'QRV', message: 'Ponto para receber. À disposição' },
    { code: 'QRX', message: 'Espere, aguarde' },
    { code: 'QRU', message: 'Ocorrência. Evento' },
    { code: 'QSA', message: 'Intensidade do Sinal' },
    { code: 'QSJ', message: 'Dinheiro, Pagamento, valor' },
    { code: 'QSL', message: 'Confirmado, compreendido, Afirmativo' },
    { code: 'QSM', message: 'Repetir o último câmbio' },
    { code: 'QSO', message: 'Contato entre duas estações, pessoas' },
    { code: 'QTA', message: 'Cancelar' },
    { code: 'QTC', message: 'Mensagem. Comunicado' },
    { code: 'QTH', message: 'Endereço. Localização' },
    { code: 'QTI', message: 'A caminho. Destino' },
    { code: 'QTO', message: 'Banheiro' },
    { code: 'QTR', message: 'HORA CERTA / EXATA' },
    { code: 'QUD', message: 'Prioridade na rede' },
    { code: 'TKS', message: 'Grato. Obrigado, agradeço' },
];

const MessageCodesTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[120px]">Código</TableHead>
        <TableHead>Mensagem</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {messageCodes.map((item) => (
        <TableRow key={item.code}>
          <TableCell className="font-medium">{item.code}</TableCell>
          <TableCell>{item.message}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);


const codeSections = [
    {
        title: 'Códigos de Mensagem',
        content: <MessageCodesTable />
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
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="w-full mb-6 pt-4">
           <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground font-headline tracking-wide">
              CÓDIGOS E ABREVIATURAS
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Consulte os códigos e abreviaturas utilizados na comunicação.
            </p>
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
