
'use client';

import { useRouter } from 'next/navigation';
import { Save, Share, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import React from 'react';

import { cn } from '@/lib/utils';
import { eventCategories } from '@/lib/events';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


function Field({ label, children, className }: { label?: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {label && <Label className="text-xl font-semibold uppercase">{label}</Label>}
      {children}
    </div>
  )
}

const SectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h2 className={cn("text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase mt-8 mb-4", className)}>
    {children}
  </h2>
);

const SubSectionTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h3 className={cn("text-lg font-semibold text-foreground pb-2 uppercase mt-4 mb-2", className)}>
    {children}
  </h3>
);

export default function TO12Form({ categorySlug }: { categorySlug: string }) {
  const [formData, setFormData] = useState<any>({});

  const handleValueChange = (section: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleNestedValueChange = (section: string, subSection: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section]?.[subSection],
          [key]: value,
        },
      },
    }));
  };
  
  const handleCheckboxChange = (section: string, key: string, id: string, checked: boolean) => {
    setFormData((prev: any) => {
      const current = prev[section]?.[key] || [];
      const newValues = checked ? [...current, id] : current.filter((v: string) => v !== id);
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: newValues,
        },
      };
    });
  };

  const renderCheckboxes = (section: string, key: string, options: { id: string, label: string }[]) => (
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-3">
          <Checkbox
            id={`${section}-${key}-${option.id}`}
            onCheckedChange={(checked) => handleCheckboxChange(section, key, option.id, !!checked)}
          />
          <label htmlFor={`${section}-${key}-${option.id}`} className="text-xl font-normal leading-none">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
  
    const renderRadioGroup = (section: string, key: string, options: { id: string, label: string }[]) => (
    <RadioGroup
      onValueChange={(value) => handleValueChange(section, key, value)}
      className="flex flex-wrap gap-x-4 gap-y-2"
    >
      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-3">
          <RadioGroupItem value={option.id} id={`${section}-${key}-${option.id}`} />
          <Label htmlFor={`${section}-${key}-${option.id}`} className="text-xl font-normal">{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        
        <SectionTitle>DADOS OPERACIONAIS DA EQUIPE DE APH</SectionTitle>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Field label="UR/USA">
              {renderRadioGroup('dados_operacionais', 'ur_usa', [
                { id: 'ur', label: 'UR' },
                { id: 'usa', label: 'USA' },
              ])}
            </Field>
            <Field label="Médico Regulador"><Input className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'medico_regulador', e.target.value)} /></Field>
            <Field label="Condutor"><Input className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'condutor', e.target.value)} /></Field>
            <Field label="Resgatista I"><Input className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'resgatista', e.target.value)} /></Field>
            <Field label="Data"><Input type="date" className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'data', e.target.value)} /></Field>
            <Field label="Nº Ocorrência"><Input className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'n_ocorrencia', e.target.value)} /></Field>
            <Field label="KM"><Input className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'km', e.target.value)} /></Field>
             <Field label="Sentido">
              {renderRadioGroup('dados_operacionais', 'sentido', [
                { id: 'norte', label: 'Norte' },
                { id: 'sul', label: 'Sul' },
              ])}
            </Field>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Acionamento"><Input type="time" className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'acionamento', e.target.value)} /></Field>
            <Field label="Chegada no Local"><Input type="time" className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'chegada_local', e.target.value)} /></Field>
            <Field label="Saída do Local"><Input type="time" className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'saida_local', e.target.value)} /></Field>
            <Field label="Chegada no Hospital"><Input type="time" className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'chegada_hospital', e.target.value)} /></Field>
            <Field label="Saída do Hospital"><Input type="time" className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'saida_hospital', e.target.value)} /></Field>
            <Field label="Chegada BSO/Término"><Input type="time" className="text-xl" onChange={(e) => handleValueChange('dados_operacionais', 'chegada_bso', e.target.value)} /></Field>
        </div>

        <SectionTitle>DADOS CADASTRAIS DO USUÁRIO</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Nome"><Input className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'nome', e.target.value)} /></Field>
            <Field label="Acompanhante"><Input className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'acompanhante', e.target.value)} /></Field>
            <Field label="Endereço"><Input className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'endereco', e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <Field label="Sexo">
                {renderRadioGroup('dados_usuario', 'sexo', [{id: 'm', label: 'M'}, {id: 'f', label: 'F'}])}
            </Field>
            <Field label="DN"><Input type="date" className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'dn', e.target.value)} /></Field>
            <Field label="Idade"><Input type="number" className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'idade', e.target.value)} /></Field>
            <Field label="Telefone"><Input className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'tel', e.target.value)} /></Field>
            <Field label="CPF"><Input className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'cpf', e.target.value)} /></Field>
            <Field label="RG"><Input className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'rg', e.target.value)} /></Field>
            <Field label="Posição no Veículo"><Input className="text-xl" onChange={(e) => handleValueChange('dados_usuario', 'posicao_veiculo', e.target.value)} /></Field>
        </div>
        
        <SectionTitle>EVENTO</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Field label="Trauma">
              {renderCheckboxes('evento', 'trauma', [
                  { id: 'acidente_automobilistico', label: 'Acidente Automobilístico' },
                  { id: 'queimadura', label: 'Queimadura' },
                  { id: 'atropelamento', label: 'Atropelamento' },
                  { id: 'queda_altura', label: 'Queda de Altura' },
              ])}
              <Input placeholder="Outros" className="mt-2 text-xl" onChange={(e) => handleValueChange('evento', 'trauma_outros', e.target.value)} />
            </Field>
            <Field label="Atendimento Clínico">
              {renderCheckboxes('evento', 'atendimento_clinico', [
                  { id: 'mal_subito', label: 'Mal Súbito' },
                  { id: 'intoxicacao_exogena', label: 'Intoxicação Exógena' },
                  { id: 'assistencia_parto', label: 'Assistência ao Parto' },
                  { id: 'convulsao', label: 'Convulsão' },
                  { id: 'disturbio_psiquiatrico', label: 'Distúrbio Psiquiátrico' },
              ])}
              <Input placeholder="Outros" className="mt-2 text-xl" onChange={(e) => handleValueChange('evento', 'clinico_outros', e.target.value)} />
            </Field>
            <Field label="Condições de Segurança">
              {renderCheckboxes('evento', 'condicoes_seguranca', [
                  { id: 'cinto_seguranca', label: 'Cinto de Segurança' },
                  { id: 'cadeirinha', label: 'Cadeirinha' },
                  { id: 'air_bag', label: 'Air Bag' },
                  { id: 'capacete', label: 'Capacete' },
              ])}
              <Input placeholder="Outros" className="mt-2 text-xl" onChange={(e) => handleValueChange('evento', 'seguranca_outros', e.target.value)} />
            </Field>
        </div>
        
        <SectionTitle>AVALIAÇÕES</SectionTitle>
        <Field label="Condição Inicial">
            {renderRadioGroup('avaliacoes', 'condicao_inicial', [
                {id: 'alerta', label: 'Alerta'},
                {id: 'verbaliza', label: 'Verbaliza'},
                {id: 'estimulo_doloroso', label: 'Estímulo Doloroso'},
                {id: 'inconsciente', label: 'Inconsciente'},
                {id: 'deambulando', label: 'Deambulando'},
                {id: 'ao_solo', label: 'Ao Solo'},
                {id: 'ejetado', label: 'Ejetado'},
                {id: 'encarcerado_retido', label: 'Encarcerado/Retido'},
            ])}
        </Field>

        <SubSectionTitle>Avaliação Primária</SubSectionTitle>
        <Field label="X - Hemorragia Exsanguinante">
          {renderRadioGroup('avaliacao_primaria', 'hemorragia', [{id: 'nao', label: 'Não'}, {id: 'sim', label: 'Sim'}])}
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="A - Vias Aéreas">
                <div className="flex items-center gap-4">
                  {renderRadioGroup('avaliacao_primaria', 'vias_aereas', [{id: 'pervias', label: 'Pérvias'}, {id: 'obstruidas', label: 'Obstruídas por:'}])}
                  <Input className="text-xl" onChange={(e) => handleValueChange('avaliacao_primaria', 'vias_aereas_obs', e.target.value)} />
                </div>
            </Field>
             <Field label="B - Ventilação">
                {renderRadioGroup('avaliacao_primaria', 'ventilacao_status', [{id: 'presente', label: 'Presente'}, {id: 'ausente', label: 'Ausente'}, {id: 'simetrica', label: 'Simétrica'}, {id: 'assimetrica', label: 'Assimétrica'}])}
                {renderRadioGroup('avaliacao_primaria', 'ventilacao_tipo', [{id: 'apneia', label: 'Apneia'}, {id: 'eupneia', label: 'Eupneia'}, {id: 'taquipneia', label: 'Taquipneia'}, {id: 'gasping', label: 'Gasping'}])}
            </Field>
        </div>
        <SubSectionTitle>C - Circulação e Hemorragias</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Field label="Pulso">
                {renderRadioGroup('avaliacao_primaria', 'pulso', [{id: 'presente', label: 'Presente'}, {id: 'cheio', label: 'Cheio'}, {id: 'filiforme', label: 'Filiforme'}])}
            </Field>
            <Field label="Pele">
                {renderRadioGroup('avaliacao_primaria', 'pele', [{id: 'normal', label: 'Normal'}, {id: 'fria', label: 'Fria'}, {id: 'sudorese', label: 'Sudorese'}])}
            </Field>
            <Field label="Perfusão">
                {renderRadioGroup('avaliacao_primaria', 'perfusao', [{id: '<2seg', label: '< 2seg'}, {id: '>2seg', label: '> 2seg'}])}
            </Field>
        </div>
         <Field label="Sangramento Ativo">
             {renderRadioGroup('avaliacao_primaria', 'sangramento', [{id: 'presente', label: 'Presente'}, {id: 'ausente', label: 'Ausente'}])}
        </Field>

        <SubSectionTitle>D - Neurológico: Glasgow</SubSectionTitle>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Pupilas">
                {renderRadioGroup('avaliacao_primaria', 'pupilas', [{id: 'isocoricas', label: 'Isocóricas'}, {id: 'anisocoricas', label: 'Anisocóricas'}])}
            </Field>
            <Field label="Fotorreagentes">
                {renderRadioGroup('avaliacao_primaria', 'fotorreagentes', [{id: 'sim', label: 'Sim'}, {id: 'nao', label: 'Não'}])}
            </Field>
        </div>

        <SubSectionTitle>E - Exposição</SubSectionTitle>
        <Field label="">
            {renderRadioGroup('avaliacao_primaria', 'exposicao', [{id: 'sem_lesoes', label: 'Sem Lesões Aparentes'}, {id: 'hipotermia', label: 'Hipotermia'}])}
        </Field>
         <Field label="Lesões Aparentes e Queixas Principais">
            <Textarea className="text-xl" onChange={(e) => handleValueChange('avaliacao_primaria', 'lesoes_queixas', e.target.value)}/>
        </Field>

        <SubSectionTitle>Avaliação Secundária</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <SubSectionTitle>Sinais Vitais</SubSectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Field label="PA (mmHg)"><Input className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'pa', e.target.value)} /></Field>
                <Field label="FC (bpm)"><Input type="number" className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'fc', e.target.value)} /></Field>
                <Field label="FR (rpm)"><Input type="number" className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'fr', e.target.value)} /></Field>
                <Field label="Sat O² (%)"><Input type="number" className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'sat', e.target.value)} /></Field>
                <Field label="TAX (°C)"><Input type="number" className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'tax', e.target.value)} /></Field>
                <Field label="DXT (mg/dl)"><Input type="number" className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'dxt', e.target.value)} /></Field>
              </div>
            </div>
            <div className="space-y-4">
                <Field label="Alergias"><Textarea className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'alergias', e.target.value)} /></Field>
                <Field label="Medicamentos em Uso"><Textarea className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'medicamentos', e.target.value)} /></Field>
                <Field label="Comorbidades/Gestação"><Textarea className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'comorbidades', e.target.value)} /></Field>
                <Field label="Última Refeição/Jejum"><Textarea className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'ultima_refeicao', e.target.value)} /></Field>
            </div>
        </div>
        <Field label="Avaliação Crânio-Caudal">
            <Textarea className="text-xl" onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'cranio_caudal', e.target.value)}/>
        </Field>

        <SectionTitle>ESCALA DE GLASGOW</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Field label="Abertura Ocular">
                {renderRadioGroup('glasgow', 'abertura_ocular', [
                    { id: '4', label: '04 Espontânea' },
                    { id: '3', label: '03 Estímulo Verbal' },
                    { id: '2', label: '02 Estímulo Doloroso' },
                    { id: '1', label: '01 Ausente' },
                ])}
            </Field>
             <Field label="Resposta Verbal">
                {renderRadioGroup('glasgow', 'resposta_verbal', [
                    { id: '5', label: '05 Orientado' },
                    { id: '4', label: '04 Confuso' },
                    { id: '3', label: '03 Palavras Inapropriadas' },
                    { id: '2', label: '02 Sons Incompreensíveis' },
                    { id: '1', label: '01 Ausente' },
                ])}
            </Field>
             <Field label="Resposta Motora">
                {renderRadioGroup('glasgow', 'resposta_motora', [
                    { id: '6', label: '06 Obedece a Comandos' },
                    { id: '5', label: '05 Localiza a Dor' },
                    { id: '4', label: '04 Retira o Membro à Dor' },
                    { id: '3', label: '03 Decorticação (Flexão Anormal)' },
                    { id: '2', label: '02 Descerebração (Extensão Anormal)' },
                    { id: '1', label: '01 Ausente' },
                ])}
            </Field>
        </div>
        
        <SectionTitle>PROCEDIMENTOS REALIZADOS</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
             {renderCheckboxes('procedimentos', 'lista', [
                {id: 'colar_cervical', label: 'Colar Cervical'},
                {id: 'pranchamento', label: 'Pranchamento: Decúbito/Em Pé'},
                {id: 'extricacao_ked', label: 'Extricação com KED'},
                {id: 'extricacao_tereza_rautek', label: 'Extricação c/ Tereza/Rautek'},
                {id: 'desencarceramento', label: 'Desencarceramento'},
                {id: 'retirada_capacete', label: 'Retirada de Capacete'},
                {id: 'imobilizacao_membros', label: 'Imobilização de Membros: ( )MSE ( )MSD ( )MIE ( )MID'},
                {id: 'imobilizacao_pelve', label: 'Imobilização de Pelve'},
                {id: 'desobstrucao_vias_aereas', label: 'Desobstrução de Vias Aéreas'},
                {id: 'canula_guedel', label: 'Cânula de Guedel'},
                {id: 'oxigenio', label: 'Oxigênio: Máscara/Cateter Nasal'},
                {id: 'ventilacao_ambu', label: 'Ventilação com Ambu'},
                {id: 'oximetria_pulso', label: 'Oximetria de Pulso'},
                {id: 'dea', label: 'DEA - Desfibrilador Externo Automático'},
                {id: 'rcp', label: 'RCP - Ressuscitação Cardiopulmonar'},
                {id: 'curativo', label: 'Curativo: Oclusivo/Compressivo'},
                {id: 'torniquete', label: 'Torniquete'},
                {id: 'afericao_sinais_vitais', label: 'Aferição de Sinais Vitais'},
                {id: 'orientacoes', label: 'Orientações'},
                {id: 'resgate_altura', label: 'Resgate em Altura'},
            ])}
        </div>
        <Field label="Outros"><Input className="text-xl" onChange={(e) => handleValueChange('procedimentos', 'outros', e.target.value)} /></Field>

        <div className="flex sm:flex-row gap-4 pt-6">
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 uppercase text-base">
              <Share className="mr-2 h-4 w-4" />
              Compartilhar WhatsApp
          </Button>
          <Button size="lg" className="w-32 bg-primary hover:bg-primary/90 uppercase text-base">
              <Save className="mr-2 h-4 w-4" />
              Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
