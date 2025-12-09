'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

import { eventCategories } from '@/lib/events';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

function FormSection({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-bold text-center bg-blue-100 text-blue-800 p-1 rounded-md">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label?: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      {label && <Label className="text-xs font-semibold">{label}</Label>}
      {children}
    </div>
  )
}

function CheckboxGroup({ items, columns = 2 }: { items: string[], columns?: number }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-2';
  
  return (
    <div className={`grid ${gridCols} gap-2`}>
      {items.map(item => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox id={item.toLowerCase().replace(/ /g, '-')} />
          <Label htmlFor={item.toLowerCase().replace(/ /g, '-')} className="text-xs font-normal">{item}</Label>
        </div>
      ))}
    </div>
  );
}


function ReportForm() {
  return (
    <form className="space-y-6 text-sm">
      {/* Header */}
      <div className="border p-2 rounded-lg">
        <div className="grid grid-cols-3 gap-2 text-xs items-center">
            <div className="font-bold">Código: RQ-21</div>
            <div className="font-bold">Revisão: 01</div>
            <div className="font-bold">Data da revisão: 30/01/2025</div>
            <div className="font-bold">Data de emissão: 11/01/2022</div>
            <div></div>
            <div className="font-bold">Pág.: 1 de 2</div>
        </div>
      </div>
      
      <FormSection title="DADOS OPERACIONAIS DA EQUIPE DE APH">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="ur" />
                    <Label htmlFor="ur" className="font-normal">UR</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="usa" />
                    <Label htmlFor="usa" className="font-normal">USA</Label>
                </div>
            </div>
            <div className="col-span-2 space-y-1">
                <Field label="EQUIPE: MÉDICO REGULADOR, CONDUTOR, RESGATISTA I:">
                    <Input />
                </Field>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <Field label="DATA:"><Input type="date" /></Field>
            <Field label="Nº OCORRÊNCIA:"><Input /></Field>
            <Field label="KM:"><Input /></Field>
            <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                    <Checkbox id="norte" />
                    <Label htmlFor="norte" className="font-normal">NORTE</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="sul" />
                    <Label htmlFor="sul" className="font-normal">SUL</Label>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
             <Field label="ACIONAMENTO:"><Input type="time" /></Field>
             <Field label="SAÍDA DO LOCAL:"><Input type="time" /></Field>
             <Field label="CHEGADA NO LOCAL:"><Input type="time" /></Field>
             <Field label="CHEGADA NO HOSPITAL:"><Input type="time" /></Field>
             <Field label="SAÍDA DO HOSPITAL:"><Input type="time" /></Field>
             <Field label="CHEGADA NA BSO/TÉRMINO DO QRU:"><Input type="time" /></Field>
        </div>
      </FormSection>

      <FormSection title="DADOS CADASTRAIS DO USUÁRIO">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <div className="md:col-span-2">
                <Field label="NOME:"><Input /></Field>
            </div>
            <div className="flex items-center space-x-2">
                <Label>SEXO:</Label>
                <div className="flex items-center space-x-1"><Checkbox id="sexo-m" /><Label htmlFor="sexo-m" className="font-normal">M</Label></div>
                <div className="flex items-center space-x-1"><Checkbox id="sexo-f" /><Label htmlFor="sexo-f" className="font-normal">F</Label></div>
                 <Field label="IDADE:"><Input className="w-20" /></Field>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
             <div className="md:col-span-2"><Field label="ENDEREÇO:"><Input /></Field></div>
             <Field label="DN:"><Input type="date" /></Field>
             <Field label="TEL:"><Input /></Field>
             <div className="md:col-span-2"><Field label="ACOMPANHANTE DO USUÁRIO:"><Input /></Field></div>
             <Field label="CPF:"><Input /></Field>
             <Field label="RG:"><Input /></Field>
         </div>
          <Field label="POSIÇÃO NO VEÍCULO:"><Input /></Field>
      </FormSection>

       <FormSection title="EVENTO">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                  <h4 className="font-bold mb-2 text-xs">TRAUMA</h4>
                  <CheckboxGroup items={["ACIDENTE AUTOMOBILÍSTICO", "QUEIMADURA", "ATROPELAMENTO", "QUEDA DE ALTURA"]} columns={1} />
                  <Field label="OUTROS:"><Input /></Field>
              </div>
              <div>
                  <h4 className="font-bold mb-2 text-xs">ATENDIMENTO CLÍNICO</h4>
                  <CheckboxGroup items={["MAL SÚBITO", "INTOXICAÇÃO EXÓGENA", "ASSISTÊNCIA AO PARTO", "CONVULSÃO", "DISTÚRBIO PSIQUIÁRICO"]} columns={1} />
                   <Field label="OUTROS:"><Input /></Field>
              </div>
              <div>
                  <h4 className="font-bold mb-2 text-xs">CONDIÇÕES DE SEGURANÇA</h4>
                  <CheckboxGroup items={["CINTO DE SEGURANÇA", "CADEIRINHA", "AIR BAG", "CAPACETE"]} columns={1} />
                   <Field label="OUTROS:"><Input /></Field>
              </div>
               <div>
                  <h4 className="font-bold mb-2 text-xs">VEÍCULO</h4>
                  <CheckboxGroup items={["BICICLETA", "MOTO", "CARRO/UTILITÁRIA", "ÔNIBUS", "CAMINHÃO", "CARRETA"]} columns={1} />
                   <Field label="PLACA:"><Input /></Field>
              </div>
          </div>
          <Field label="CINEMÁTICA:"><Input /></Field>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <h4 className="font-bold text-xs col-span-full">CONDIÇÃO INICIAL:</h4>
              <CheckboxGroup items={["ALERTA", "VERBALIZA", "ESTÍMULO DOLOROSO", "INCONSCIENTE", "DEAMBULANDO", "AO SOLO", "EJETADO", "ENCARCERADO/RETIDO"]} columns={4} />
          </div>
      </FormSection>

      <FormSection title="AVALIAÇÕES">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          {/* Avaliação Primária */}
          <div className="border p-2 rounded-md">
            <h4 className="font-bold text-xs mb-2 text-center">AVALIAÇÃO PRIMÁRIA</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span>X-HEMORRAGIA EXSANGUINANTE:</span>
                <Checkbox id="hemorragia-nao" /><Label htmlFor="hemorragia-nao">NÃO</Label>
                <Checkbox id="hemorragia-sim" /><Label htmlFor="hemorragia-sim">SIM</Label>
              </div>
              <div className="flex items-center space-x-2">
                <span>A-VIAS AÉREAS:</span>
                <Checkbox id="vias-pervias" /><Label htmlFor="vias-pervias">PÉRVIAS</Label>
                <Field label="OBSTRUÍDAS POR:"><Input className="h-6" /></Field>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span>B-VENTILAÇÃO:</span>
                <Checkbox id="vent-presente" /><Label htmlFor="vent-presente">PRESENTE</Label>
                <Checkbox id="vent-ausente" /><Label htmlFor="vent-ausente">AUSENTE</Label>
                <Checkbox id="vent-simetrica" /><Label htmlFor="vent-simetrica">SIMÉTRICA</Label>
                <Checkbox id="vent-assimetrica" /><Label htmlFor="vent-assimetrica">ASSIMÉTRICA</Label>
                <Checkbox id="vent-apneia" /><Label htmlFor="vent-apneia">APNEIA</Label>
                <Checkbox id="vent-eupneia" /><Label htmlFor="vent-eupneia">EUPNEIA</Label>
                <Checkbox id="vent-taquipneia" /><Label htmlFor="vent-taquipneia">TAQUIPNEIA</Label>
                <Checkbox id="vent-gasping" /><Label htmlFor="vent-gasping">GASPING</Label>
              </div>
               <div className="flex flex-wrap items-center gap-2">
                <span>C-CIRCULAÇÃO E HEMORRAGIAS:</span>
                <Checkbox id="pulso-presente" /><Label htmlFor="pulso-presente">PULSO: PRESENTE</Label>
                <Checkbox id="pulso-cheio" /><Label htmlFor="pulso-cheio">CHEIO</Label>
                <Checkbox id="pulso-filiforme" /><Label htmlFor="pulso-filiforme">FILIFORME</Label>
              </div>
               <div className="flex items-center space-x-2">
                <span>PELE:</span>
                <Checkbox id="pele-normal" /><Label htmlFor="pele-normal">NORMAL</Label>
                <Checkbox id="pele-fria" /><Label htmlFor="pele-fria">FRIA</Label>
                <Checkbox id="pele-sudorese" /><Label htmlFor="pele-sudorese">SUDORESE</Label>
              </div>
              <div className="flex items-center space-x-2">
                <span>PERFUSÃO:</span>
                <Checkbox id="perfusao-menor2" /><Label htmlFor="perfusao-menor2">{'<2 SEG'}</Label>
                <Checkbox id="perfusao-maior2" /><Label htmlFor="perfusao-maior2">{'>2 SEG'}</Label>
              </div>
               <div className="flex items-center space-x-2">
                <span>SANGRAMENTO ATIVO:</span>
                <Checkbox id="sangramento-presente" /><Label htmlFor="sangramento-presente">PRESENTE</Label>
                <Checkbox id="sangramento-ausente" /><Label htmlFor="sangramento-ausente">AUSENTE</Label>
              </div>
              <div>
                <h5 className="font-bold">D-NEUROLÓGICO: GLASGOW</h5>
                 <div className="flex items-center space-x-2">
                    <span>PUPILAS:</span>
                    <Checkbox id="pupilas-isocoricas" /><Label htmlFor="pupilas-isocoricas">ISOCÓRICAS</Label>
                    <Checkbox id="pupilas-anisocoricas" /><Label htmlFor="pupilas-anisocoricas">ANISOCÓRICAS</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <span>FOTORREAGENTES:</span>
                    <Checkbox id="foto-sim" /><Label htmlFor="foto-sim">SIM</Label>
                    <Checkbox id="foto-nao" /><Label htmlFor="foto-nao">NÃO</Label>
                </div>
              </div>
               <div>
                <h5 className="font-bold">E-EXPOSIÇÃO:</h5>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="sem-lesoes" /><Label htmlFor="sem-lesoes">SEM LESÕES APARENTES</Label>
                    <Checkbox id="hipotermia" /><Label htmlFor="hipotermia">HIPOTERMIA</Label>
                 </div>
                 <Field label="LESÕES APARENTES E QUEIXAS PRINCIPAIS:"><Textarea className="text-xs" rows={2} /></Field>
              </div>
            </div>
          </div>
          {/* Avaliação Secundária */}
          <div className="border p-2 rounded-md row-span-2">
            <h4 className="font-bold text-xs mb-2 text-center">AVALIAÇÃO SECUNDÁRIA</h4>
            <div className="space-y-2">
                <div>
                    <h5 className="font-bold text-xs">SINAIS VITAIS:</h5>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        <Field label="PA:"><div className="flex items-center gap-1"><Input className="h-6"/> X <Input className="h-6"/><span>MMHG</span></div></Field>
                        <Field label="FC:"><div className="flex items-center gap-1"><Input className="h-6"/><span>BPM</span></div></Field>
                        <Field label="FR:"><div className="flex items-center gap-1"><Input className="h-6"/><span>RPM</span></div></Field>
                        <Field label="SAT O²:"><div className="flex items-center gap-1"><Input className="h-6"/><span>%</span></div></Field>
                        <Field label="TAX:"><div className="flex items-center gap-1"><Input className="h-6"/><span>ºC</span></div></Field>
                        <Field label="DXT:"><div className="flex items-center gap-1"><Input className="h-6"/><span>MG/DL</span></div></Field>
                    </div>
                </div>
                <Field label="ALERGIAS:"><Textarea className="text-xs" rows={2} /></Field>
                <Field label="MEDICAMENTOS EM USO:"><Textarea className="text-xs" rows={2} /></Field>
                <Field label="COMORBIDADES/GESTAÇÃO:"><Textarea className="text-xs" rows={2} /></Field>
                <Field label="ÚLTIMA REFEIÇÃO/JEJUM:"><Textarea className="text-xs" rows={2} /></Field>
                <Field label="AVALIAÇÃO CRÂNIO-CAUDAL:"><Textarea className="text-xs" rows={3} /></Field>
            </div>
          </div>
        </div>
      </FormSection>
      
      <FormSection title="ESCALA DE GLASGOW">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
                <h4 className="font-bold mb-2">ABERTURA OCULAR</h4>
                <CheckboxGroup items={["(04) ESPONTÂNEA", "(03) ESTÍMulo VERBAL", "(02) ESTÍMulo DOLOROSO", "(01) AUSENTE"]} columns={1} />
            </div>
            <div>
                <h4 className="font-bold mb-2">RESPOSTA VERBAL</h4>
                <CheckboxGroup items={["(05) ORIENTADO", "(04) CONFUSO", "(03) PALAVRAS INAPROPRIADAS", "(02) SONS INCOMPREENSÍVEIS", "(01) AUSENTE"]} columns={1} />
            </div>
             <div>
                <h4 className="font-bold mb-2">RESPOSTA MOTORA</h4>
                <CheckboxGroup items={["(06) OBEDECE A COMANDOS", "(05) LOCALIZA A DOR", "(04) RETIRA O MEMBRO À DOR", "(03) DECORTICAÇÃO (FLEXÃO ANORMAL)", "(02) DESCEREBRAÇÃO (EXTENSÃO ANORMAL)", "(01) AUSENTE"]} columns={1} />
            </div>
        </div>
      </FormSection>

       <FormSection title="PROCEDIMENTOS REALIZADOS">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-xs">
              <CheckboxGroup items={[
                "COLAR CERVICAL", "PRANCHAMENTO: DECÚBITO/EM PÉ", "EXTRICAÇÃO COM KED", 
                "EXTRICAÇÃO C/ TEREZA/RAUTEK", "DESENCARCERAMENTO", "RETIRADA DE CAPACETE"
              ]} columns={1} />
              <div className="space-y-1">
                  <h4 className="font-bold">IMOBILIZAÇÃO DE MEMBROS:</h4>
                  <div className="flex items-center gap-2">
                     <Checkbox id="mse" /><Label htmlFor="mse">MSE</Label>
                     <Checkbox id="msd" /><Label htmlFor="msd">MSD</Label>
                     <Checkbox id="mie" /><Label htmlFor="mie">MIE</Label>
                     <Checkbox id="mid" /><Label htmlFor="mid">MID</Label>
                  </div>
              </div>
               <CheckboxGroup items={["IMOBILIZAÇÃO DE PELVE"]} columns={1}/>

              <CheckboxGroup items={[
                "DESOBSTRUÇÃO DE VIAS AÉREAS", "CÂNULA DE GUEDEL", "OXIGÊNIO: MÁSCARA/CATETER NASAL",
                "VENTILAÇÃO COM AMBU", "OXIMETRIA DE PULSO", "DEA - DESFIBRILADOR EXTERNO AUTOMÁTICO",
                "RCP - RESSUSCITAÇÃO CARDIOPULMONAR", "CURATIVO: OCLUSIVO/COMPRESSIVO"
              ]} columns={1} />
              
               <div className="col-span-full md:col-span-1 space-y-2">
                  <CheckboxGroup items={[
                    "TORNIQUETE", "AFERIÇÃO DE SINAIS VITAIS", "ORIENTAÇÕES", "RESGATE EM ALTURA"
                  ]} columns={1} />
                   <Field label="OUTROS:"><Input className="h-7" /></Field>
              </div>
          </div>
      </FormSection>


      <div className="flex flex-col md:flex-row gap-4 pt-8">
        <Button size="lg" className="w-full md:w-auto flex-1 bg-green-600 hover:bg-green-700 rounded-full" type="submit">
          Salvar
        </Button>
        <Button size="lg" className="w-full md:w-auto flex-1 rounded-full" type="submit">
          <Send className="mr-2 h-4 w-4" />
          Enviar Relatório
        </Button>
      </div>
    </form>
  );
}

export default function ReportPage() {
  const params = useParams<{ category: string }>();
  const category = eventCategories.find((c) => c.slug === params.category);

  if (!category) {
    notFound();
  }
  
  const isAph = category.slug === 'qud-aph';
  const title = "FICHA DE ATENDIMENTO PRÉ-HOSPITALAR";
  const description = " ";


  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 pt-12 md:p-12 lg:p-24">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <Card className="w-full shadow-lg rounded-2xl">
          <CardHeader className="text-center p-8">
            <CardTitle className="text-3xl font-bold">
              {title}
            </CardTitle>
            <CardDescription className="text-base mt-1">
             {description}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-8">
            <ReportForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
