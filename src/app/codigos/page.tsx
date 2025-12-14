
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
import {
  messageCodes,
  acaoProvidenciaCodes,
  ocorrenciaCodes,
  tiposPaneCodes,
  outrasMensagensCodes,
  alfabetoFonetico,
  relacionamentosOcorrencias,
} from '@/lib/codes';


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

const AcaoProvidenciaTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[120px]">Código</TableHead>
        <TableHead>Mensagem</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {acaoProvidenciaCodes.map((item) => (
        <TableRow key={item.code}>
          <TableCell className="font-medium">{item.code}</TableCell>
          <TableCell>{item.message}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const OcorrenciaCodesTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[120px]">Código</TableHead>
        <TableHead>Mensagem</TableHead>
        <TableHead>Grupo</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {ocorrenciaCodes.map((item) => (
        <TableRow key={item.code}>
          <TableCell className="font-medium">{item.code}</TableCell>
          <TableCell>{item.message}</TableCell>
          <TableCell>{item.group}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const TiposPaneTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[120px]">Código</TableHead>
        <TableHead>Mensagem</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tiposPaneCodes.map((item) => (
        <TableRow key={item.code}>
          <TableCell className="font-medium">{item.code}</TableCell>
          <TableCell>{item.message}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const OutrasMensagensTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[120px]">Código</TableHead>
        <TableHead>Mensagem</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {outrasMensagensCodes.map((item) => (
        <TableRow key={item.code}>
          <TableCell className="font-medium">{item.code}</TableCell>
          <TableCell>{item.message}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const AlfabetoFoneticoTable = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[100px]">Letra</TableHead>
                <TableHead>Palavra</TableHead>
                <TableHead>Pronúncia</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {alfabetoFonetico.map((item) => (
                <TableRow key={item.letra}>
                    <TableCell className="font-medium">{item.letra}</TableCell>
                    <TableCell>{item.palavra}</TableCell>
                    <TableCell>{item.pronuncia}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const RelacionamentoOcorrencias = () => (
    <Accordion type="multiple" className="w-full space-y-4">
      {relacionamentosOcorrencias.map((rel, index) => (
        <AccordionItem value={`rel-${index}`} key={index} className="border-none">
          <AccordionTrigger className="bg-card p-4 rounded-md text-lg hover:no-underline font-semibold">
            {rel.ocorrencia.code} - {rel.ocorrencia.message}
          </AccordionTrigger>
          <AccordionContent className="p-4 bg-background rounded-md mt-2 space-y-4">
            <div>
              <h4 className="text-md font-semibold text-muted-foreground mb-2">AÇÕES/PROVIDÊNCIAS RELACIONADAS:</h4>
              <div className="space-y-2">
                {rel.acoes.map(acao => (
                   <div key={acao.code} className="bg-card p-3 rounded-md">
                        <p><span className="font-bold">{acao.code}:</span> {acao.message}</p>
                   </div>
                ))}
              </div>
            </div>
            {rel.panes && rel.panes.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-muted-foreground mb-2">TIPOS DE PANE RELACIONADOS:</h4>
                 <div className="space-y-2">
                    {rel.panes.map(pane => (
                      <div key={pane.code} className="bg-card p-3 rounded-md">
                          <p><span className="font-bold">{pane.code}:</span> {pane.message}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
);


const codeSections = [
    {
        title: 'Tipos de Ocorrência',
        content: <OcorrenciaCodesTable />
    },
    {
        title: 'Tipos de Ação/Providência',
        content: <AcaoProvidenciaTable />
    },
    {
        title: 'Tipos de Pane',
        content: <TiposPaneTable />
    },
    {
        title: 'Outras Mensagens',
        content: <OutrasMensagensTable />
    },
    {
        title: 'Códigos de Mensagem',
        content: <MessageCodesTable />
    },
    {
        title: 'Código Q (Alfabeto Fonético)',
        content: <AlfabetoFoneticoTable />
    },
    {
        title: 'Relacionamentos',
        content: <RelacionamentoOcorrencias />
    }
]

export default function CodigosPage() {
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
                <AccordionTrigger className="text-xl hover:no-underline font-bold">
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
