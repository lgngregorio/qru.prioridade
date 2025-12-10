
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
import { SidebarTrigger } from '../ui/sidebar';

const messageCodes = [
    { code: 'QAP', message: 'Na Escuta' },
    { code: 'QAR', message: 'Autorização para abandonar a escuta' },
    { code: 'QBU', message: 'Agitado, confusão mental, Alucinações' },
    { code: 'QRA', message: 'Prefixo da estação / Operador' },
    { code: 'QRM', message: 'Interferência de outra estação' },
    { code: 'QRV', message: 'Pronto para receber. À disposição' },
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

const acaoProvidenciaCodes = [
    { code: 'PR01', message: 'Atendimento inicial' },
    { code: 'PRO2', message: 'Auxílio no combate a incêndio' },
    { code: 'PRO3', message: 'Animal apreendido' },
    { code: 'PRO4', message: 'Retirada de animal morto da pista' },
    { code: 'PR05', message: 'Afugentamento de animal' },
    { code: 'PR06', message: 'Retirada de material da pista' },
    { code: 'PRO7', message: 'Escolta' },
    { code: 'PR08', message: 'Verificação da sinalização de obras' },
    { code: 'PR09', message: 'Outros' },
    { code: 'PR10', message: 'Embargo de obra' },
    { code: 'PR11', message: 'Remoção de vítima para hospital' },
    { code: 'PR12', message: 'Sinalização final de fila' },
    { code: 'PR13', message: 'Canalização/Sinalização' },
    { code: 'PR14', message: 'Tapa buraco' },
    { code: 'PR15', message: 'Orientação a andarilho' },
    { code: 'PR16', message: 'Remoção de andarilho' },
    { code: 'PR17', message: 'Orientação/Informação ao usuário' },
    { code: 'PR18', message: 'Recusa de dados' },
    { code: 'PR19', message: 'Operação comboio' },
    { code: 'PR20', message: 'Atendimento a funcionário' },
    { code: 'PR21', message: 'Remoção de carga derramada' },
    { code: 'PR22', message: 'Limpeza de pista' },
    { code: 'PR23', message: 'Remoção de óleo/outros com serragem' },
    { code: 'PR24', message: 'Troca de pneu' },
    { code: 'PR25', message: 'Pane solucionada' },
    { code: 'PR26', message: 'Transferência de carga' },
    { code: 'PR27', message: 'Remoção de veículo' },
    { code: 'PR28', message: 'Limpeza na praça' },
    { code: 'PR29', message: 'Regularização de Sinalização' },
    { code: 'PR30', message: 'Auxílio no transporte do usuário' },
    { code: 'PR31', message: 'Remoção de vítima das ferragens' },
    { code: 'PR32', message: 'Destombamento de veículo' },
    { code: 'PR33', message: 'Reparo em cerca' },
    { code: 'PR34', message: 'Remoção de placas / publicidade da faixa' },
    { code: 'PR35', message: 'Orientação a lindeiros da faixa de domínio' },
    { code: 'PR36', message: 'Notificação a lindeiros da faixa de domínio' },
    { code: 'PR37', message: 'Implantação de Pare e Siga/ Interdição total' },
    { code: 'PR38', message: 'Transporte de colaborador' },
    { code: 'PR39', message: 'Alocação de PMV móvel' },
    { code: 'PR40', message: 'Definição de mensagem no PMV móvel' },
    { code: 'PR41', message: 'Definição de mensagem no PMV fixo' },
    { code: 'PR42', message: 'Envio de SMS/ Aplicativo' },
    { code: 'PR43', message: 'Envio de Email' },
    { code: 'PR44', message: 'Acionamento de Polícia' },
    { code: 'PR45', message: 'Auxílio a usuário p/comprar combustível' },
    { code: 'PR46', message: 'Não localizado' },
    { code: 'PR47', message: 'Ocorrência não localizada' },
    { code: 'PR48', message: 'Orientação/Acompanhamento de Obra' },
    { code: 'PR49', message: 'Evento acompanhamento pelo CFTV' },
    { code: 'PR50', message: 'Remoção de vítima para P.S' },
    { code: 'PR51', message: 'Efetuado Registro Fotográfico' },
    { code: 'PR53', message: 'Meios próprios' },
    { code: 'PR54', message: 'Aux. com ferram./ Empréstimo ferram.' },
    { code: 'PR55', message: 'Desbloqueio de veículo' },
    { code: 'PR56', message: 'Enterro de Animal' },
    { code: 'PR57', message: 'Atendimento Clínico' },
    { code: 'PR58', message: 'Avaliação da Vítima' },
    { code: 'PR59', message: 'Aferição de pressão arterial' },
    { code: 'PR60', message: 'Subst. de Cancela Praça de Pedágio' },
    { code: 'PR61', message: 'Abordagem de vítima' },
    { code: 'PR62', message: 'Acionamento da Conservação' },
    { code: 'PR63', message: 'Desatolamento de Veículos' },
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


const codeSections = [
    {
        title: 'Códigos de Mensagem',
        content: <MessageCodesTable />
    },
    {
        title: 'Tipos de Ação/Providência',
        content: <AcaoProvidenciaTable />
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
        <div className="w-full mb-6 pt-4 flex items-center justify-between">
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
