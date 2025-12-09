'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, PlusCircle, Share, Save, Trash2, Edit, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';


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
             <div className="md_col-span-2"><Field label="ACOMPANHANTE DO USUÁRIO:"><Input /></Field></div>
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
                  <CheckboxGroup items={["MAL SÚBITO", "INTOXICAÇÃO EXÓGENA", "ASSISTÊNCIA AO PARTO", "CONVULSÃO", "DISTÚRBIO PSIQUIÁTRICO"]} columns={1} />
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
              <CheckboxGroup items={["ALERTA", "VERBALIZA", "ESTÍMulo DOLOROSO", "INCONSCIENTE", "DEAMBULANDO", "AO SOLO", "EJETADO", "ENCARCERADO/RETIDO"]} columns={4} />
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


type GeneralInfo = {
  rodovia: string;
  ocorrencia: string;
  tipoPane: string;
  qth: string;
  sentido: string;
  localArea: string;
};

type Vehicle = {
  id: number;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  placa: string;
  cidade: string;
  vindoDe: string;
  indoPara: string;
  eixos: string;
  tipo: string;
  pneu: string;
  carga: string;
  condutor: string;
  telefone: string;
  ocupantes: string;
};

type OtherInfo = {
  auxilios: string;
  observacoes: string;
  numeroOcorrencia: string;
};

function VeiculoAbandonadoForm({ categorySlug }: { categorySlug: string }) {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    rodovia: '',
    ocorrencia: 'TO 01',
    tipoPane: '',
    qth: '',
    sentido: '',
    localArea: '',
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1, marca: '', modelo: '', ano: '', cor: '', placa: '', cidade: '',
      vindoDe: '', indoPara: '', eixos: '', tipo: '', pneu: '', carga: '',
      condutor: '', telefone: '', ocupantes: ''
    }
  ]);

  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    auxilios: '',
    observacoes: '',
    numeroOcorrencia: '',
  });

  const handleGeneralInfoChange = (field: keyof GeneralInfo, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (index: number, field: keyof Vehicle, value: string) => {
    const newVehicles = [...vehicles];
    if (field === 'telefone') {
      value = formatPhoneNumber(value);
    }
    (newVehicles[index] as any)[field] = value;
    setVehicles(newVehicles);
  };

  const handleOtherInfoChange = (field: keyof OtherInfo, value: string) => {
    setOtherInfo(prev => ({ ...prev, [field]: value }));
  };

  const addVehicle = () => {
    setVehicles([...vehicles, {
      id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1,
      marca: '', modelo: '', ano: '', cor: '', placa: '', cidade: '',
      vindoDe: '', indoPara: '', eixos: '', tipo: '', pneu: '', carga: '',
      condutor: '', telefone: '', ocupantes: ''
    }]);
  };

  const removeVehicle = (id: number) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };
  
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 3) return `(${phoneNumber}`;
    if (phoneNumberLength < 8) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };
  
  const handleSave = async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível conectar ao banco de dados.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const reportData = {
        category: categorySlug,
        formData: {
          generalInfo,
          vehicles,
          otherInfo,
        },
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(firestore, 'reports'), reportData);
      
      toast({
        title: "Sucesso!",
        description: "Relatório salvo com sucesso.",
        className: "bg-green-600 text-white",
      });
      
      router.push('/historico');

    } catch (error) {
      console.error("Error saving report: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o relatório. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* Informações Gerais */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">Informações Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="RODOVIA">
                <Select value={generalInfo.rodovia} onValueChange={(value) => handleGeneralInfoChange('rodovia', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a rodovia" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ms-112">MS-112</SelectItem>
                        <SelectItem value="br-158">BR-158</SelectItem>
                        <SelectItem value="ms-306">MS-306</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="OCORRÊNCIA">
                <Input value={generalInfo.ocorrencia} disabled />
            </Field>
            <Field label="TIPO DE PANE">
                 <Select value={generalInfo.tipoPane} onValueChange={(value) => handleGeneralInfoChange('tipoPane', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de pane" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tp01">TP01</SelectItem>
                        <SelectItem value="tp02">TP02</SelectItem>
                        <SelectItem value="tp03">TP03</SelectItem>
                        <SelectItem value="tp04">TP04</SelectItem>
                        <SelectItem value="tp05">TP05</SelectItem>
                        <SelectItem value="tp07">TP07</SelectItem>
                        <SelectItem value="nill">NILL</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="QTH (LOCAL)">
                <Input placeholder="Ex: km 125 da MS-112" value={generalInfo.qth} onChange={(e) => handleGeneralInfoChange('qth', e.target.value)}/>
            </Field>
             <Field label="SENTIDO">
                <Select value={generalInfo.sentido} onValueChange={(value) => handleGeneralInfoChange('sentido', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o sentido" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="norte">Norte</SelectItem>
                        <SelectItem value="sul">Sul</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="LOCAL/ÁREA">
                <Select value={generalInfo.localArea} onValueChange={(value) => handleGeneralInfoChange('localArea', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o local/área" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="faixa_rolamento">Faixa de Rolamento</SelectItem>
                        <SelectItem value="terceira_faixa">Terceira Faixa</SelectItem>
                        <SelectItem value="acostamento">Acostamento</SelectItem>
                        <SelectItem value="area_dominio">Área de Domínio</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
          </div>
        </div>

        {vehicles.map((vehicle, index) => (
          <div key={vehicle.id} className="space-y-4 border-2 border-dashed border-primary/50 p-4 rounded-lg relative">
             {vehicles.length > 1 && (
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute -top-4 -right-4 rounded-full h-8 w-8"
                onClick={() => removeVehicle(vehicle.id)}
                type="button"
                >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {/* Dados do Veículo */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">Dados do Veículo {index + 1}</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="MARCA"><Input placeholder="Ex: VW" value={vehicle.marca} onChange={e => handleVehicleChange(index, 'marca', e.target.value)}/></Field>
                    <Field label="MODELO"><Input placeholder="Ex: Gol" value={vehicle.modelo} onChange={e => handleVehicleChange(index, 'modelo', e.target.value)} /></Field>
                    <Field label="ANO"><Input placeholder="Ex: 2020" value={vehicle.ano} onChange={e => handleVehicleChange(index, 'ano', e.target.value)}/></Field>
                    <Field label="COR"><Input placeholder="Ex: Branco" value={vehicle.cor} onChange={e => handleVehicleChange(index, 'cor', e.target.value)}/></Field>
                    <Field label="PLACA"><Input placeholder="Ex: ABC-1234" value={vehicle.placa} onChange={e => handleVehicleChange(index, 'placa', e.target.value)}/></Field>
                    <Field label="CIDADE EMPLACAMENTO"><Input placeholder="Ex: São Paulo" value={vehicle.cidade} onChange={e => handleVehicleChange(index, 'cidade', e.target.value)}/></Field>
                    <Field label="VINDO DE"><Input placeholder="Ex: Rio de Janeiro" value={vehicle.vindoDe} onChange={e => handleVehicleChange(index, 'vindoDe', e.target.value)}/></Field>
                    <Field label="INDO PARA"><Input placeholder="Ex: Belo Horizonte" value={vehicle.indoPara} onChange={e => handleVehicleChange(index, 'indoPara', e.target.value)}/></Field>
                    <Field label="QUANTIDADE DE EIXOS">
                        <Select value={vehicle.eixos} onValueChange={value => handleVehicleChange(index, 'eixos', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione os eixos" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="02">02</SelectItem>
                                <SelectItem value="03">03</SelectItem>
                                <SelectItem value="04">04</SelectItem>
                                <SelectItem value="05">05</SelectItem>
                                <SelectItem value="06">06</SelectItem>
                                <SelectItem value="07">07</SelectItem>
                                <SelectItem value="08">08</SelectItem>
                                <SelectItem value="09">09</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="11">11</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="13">13</SelectItem>
                                <SelectItem value="14">14</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="16">16</SelectItem>
                                <SelectItem value="17">17</SelectItem>
                                <SelectItem value="18">18</SelectItem>
                                <SelectItem value="19">19</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="TIPO DE VEÍCULO">
                         <Select value={vehicle.tipo} onValueChange={value => handleVehicleChange(index, 'tipo', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mo">MO</SelectItem>
                                <SelectItem value="ap">AP</SelectItem>
                                <SelectItem value="utilitaria">UTILITÁRIA</SelectItem>
                                <SelectItem value="ca">CA</SelectItem>
                                <SelectItem value="on">ON</SelectItem>
                                <SelectItem value="car">CAR</SelectItem>
                                <SelectItem value="ca-romeu-julieta">CA/ ROMEU E JULIETA</SelectItem>
                                <SelectItem value="carretinha-reboque">CARETINHA/ REBOQUE</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="ESTADO DO PNEU">
                        <Select value={vehicle.pneu} onValueChange={value => handleVehicleChange(index, 'pneu', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione o estado do pneu" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bom">Bom</SelectItem>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="ruim">Ruim</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="TIPO DE CARGA"><Input placeholder="Ex: Vazio, Soja" value={vehicle.carga} onChange={e => handleVehicleChange(index, 'carga', e.target.value)}/></Field>
               </div>
            </div>

            {/* Condutor */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">Condutor</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Field label="QRA DO CONDUTOR(A)"><Input placeholder="Nome do condutor" value={vehicle.condutor} onChange={e => handleVehicleChange(index, 'condutor', e.target.value)}/></Field>
                     <Field label="BAIXA FREQUÊNCIA">
                        <Input 
                          placeholder="(00) 00000-0000" 
                          value={vehicle.telefone}
                          onChange={e => handleVehicleChange(index, 'telefone', e.target.value)}
                          maxLength={15}
                        />
                     </Field>
                     <Field label="OCUPANTES"><Input placeholder="Ex: 2 adultos, 1 criança" value={vehicle.ocupantes} onChange={e => handleVehicleChange(index, 'ocupantes', e.target.value)}/></Field>
                </div>
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full" type="button" onClick={addVehicle}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Veículo
        </Button>

        {/* Outras Informações */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary border-b-2 border-primary pb-2">Outras Informações</h2>
          <Field label="AUXÍLIOS/PR">
            <Textarea placeholder="Descreva os auxílios prestados" value={otherInfo.auxilios} onChange={(e) => handleOtherInfoChange('auxilios', e.target.value)} />
          </Field>
          <Field label="OBSERVAÇÕES">
            <Textarea placeholder="Descreva detalhes adicionais sobre a ocorrência" value={otherInfo.observacoes} onChange={(e) => handleOtherInfoChange('observacoes', e.target.value)} />
          </Field>
           <Field label="NÚMERO DA OCORRÊNCIA">
            <Input placeholder="Número de controle interno" value={otherInfo.numeroOcorrencia} onChange={(e) => handleOtherInfoChange('numeroOcorrencia', e.target.value)} />
          </Field>
        </div>

        <div className="flex flex-row gap-4 pt-6">
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
            <Share className="mr-2 h-4 w-4" />
            Compartilhar WhatsApp
          </Button>
          <Button size="lg" className="flex-none w-48 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams<{ category: string }>();
  const category = eventCategories.find((c) => c.slug === params.category);

  if (!category) {
    return null;
  }
  
  const isTo01 = category.slug === 'to-01';
  
  let title = "FICHA DE ATENDIMENTO PRÉ-HOSPITALAR";
  let description = " ";

  if (isTo01) {
    title = "VEÍCULO ABANDONADO";
    description = "Preencha os campos abaixo e envie o relatório completo.";
  }

  return (
    <main className="flex flex-col items-center">
      <div className="w-full">
        <div className="p-4 md:p-6 mb-2 flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <Card className="w-full max-w-4xl mx-auto shadow-none rounded-none border-0 bg-transparent">
          <CardHeader className="text-center px-4 pb-4 md:px-6 md:pb-6">
            <CardTitle className="text-3xl font-bold text-primary tracking-wide">
              {title}
            </CardTitle>
            <CardDescription className="text-base mt-1 text-muted-foreground">
             {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:px-6 md:pb-6">
            {isTo01 ? <VeiculoAbandonadoForm categorySlug={category.slug} /> : <ReportForm />}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
