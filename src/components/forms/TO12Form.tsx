
'use client';

import { useRouter } from 'next/navigation';
import { Save, Share, Loader2, PlusCircle, Trash2, RotateCcw } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


interface FieldProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
  onClear?: () => void;
}

function Field({ label, onClear, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-xl font-semibold uppercase">{label}</Label>
          {onClear && (
             <Button variant="ghost" size="icon" onClick={onClear} className="h-6 w-6 text-muted-foreground hover:text-destructive" type="button">
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Limpar campo</span>
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
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

interface ListItem {
  id: number;
  material: string;
  quantidade: string;
}

const initialFormData = {
  dados_operacionais: {},
  dados_usuario: {},
  evento: {},
  avaliacao_primaria: {},
  avaliacao_secundaria: { sinais_vitais: {}, outros: {} },
  glasgow: {},
  procedimentos: {},
  rol_valores: {},
  equipamentos_retidos: {},
  conduta: {},
  termo_recusa: {},
  observacoes: {},
};


export default function TO12Form({ categorySlug }: { categorySlug: string }) {
  const [formData, setFormData] = useState<any>(initialFormData);
  const [rolDeValores, setRolDeValores] = useState<ListItem[]>([]);
  const [equipamentosRetidos, setEquipamentosRetidos] = useState<ListItem[]>([]);
  const [consumoMateriais, setConsumoMateriais] = useState<ListItem[]>([]);

  // Handlers for dynamic lists
  const addListItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>) => {
    setter(prev => [...prev, { id: Date.now(), material: '', quantidade: '' }]);
  };

  const removeListItem = (id: number, setter: React.Dispatch<React.SetStateAction<ListItem[]>>) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  const updateListItem = (id: number, field: 'material' | 'quantidade', value: string, setter: React.Dispatch<React.SetStateAction<ListItem[]>>) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };


  const handleValueChange = (section: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };
  
  const clearValue = (section: string, key: string) => {
     setFormData((prev: any) => {
      const newSection = { ...prev[section] };
      delete newSection[key];
      return {
        ...prev,
        [section]: newSection,
      };
    });
  }

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

  const clearNestedValue = (section: string, subSection: string, key: string) => {
    setFormData((prev: any) => {
        const newSubSection = { ...prev[section]?.[subSection] };
        delete newSubSection[key];
        return {
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: newSubSection,
            },
        };
    });
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
  
  const clearCheckboxGroup = (section: string, key: string) => {
     setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: [],
      },
    }));
  }

  const renderCheckboxes = (section: string, key: string, options: { id: string, label: string }[]) => (
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-3">
          <Checkbox
            id={`${section}-${key}-${option.id}`}
            checked={formData[section]?.[key]?.includes(option.id) || false}
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
      value={formData[section]?.[key] || ''}
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
            <Field label="UR/USA" onClear={() => clearValue('dados_operacionais', 'ur_usa')}>
              {renderRadioGroup('dados_operacionais', 'ur_usa', [
                { id: 'ur', label: 'UR' },
                { id: 'usa', label: 'USA' },
              ])}
            </Field>
            <Field label="Médico Regulador" onClear={() => clearValue('dados_operacionais', 'medico_regulador')}><Input className="text-xl" value={formData.dados_operacionais?.medico_regulador || ''} onChange={(e) => handleValueChange('dados_operacionais', 'medico_regulador', e.target.value)} /></Field>
            <Field label="Condutor" onClear={() => clearValue('dados_operacionais', 'condutor')}><Input className="text-xl" value={formData.dados_operacionais?.condutor || ''} onChange={(e) => handleValueChange('dados_operacionais', 'condutor', e.target.value)} /></Field>
            <Field label="Resgatista I" onClear={() => clearValue('dados_operacionais', 'resgatista')}><Input className="text-xl" value={formData.dados_operacionais?.resgatista || ''} onChange={(e) => handleValueChange('dados_operacionais', 'resgatista', e.target.value)} /></Field>
            <Field label="Data" onClear={() => clearValue('dados_operacionais', 'data')}><Input type="date" className="text-xl" value={formData.dados_operacionais?.data || ''} onChange={(e) => handleValueChange('dados_operacionais', 'data', e.target.value)} /></Field>
            <Field label="Nº Ocorrência" onClear={() => clearValue('dados_operacionais', 'n_ocorrencia')}><Input className="text-xl" value={formData.dados_operacionais?.n_ocorrencia || ''} onChange={(e) => handleValueChange('dados_operacionais', 'n_ocorrencia', e.target.value)} /></Field>
            <Field label="KM" onClear={() => clearValue('dados_operacionais', 'km')}><Input className="text-xl" value={formData.dados_operacionais?.km || ''} onChange={(e) => handleValueChange('dados_operacionais', 'km', e.target.value)} /></Field>
             <Field label="Sentido" onClear={() => clearValue('dados_operacionais', 'sentido')}>
              {renderRadioGroup('dados_operacionais', 'sentido', [
                { id: 'norte', label: 'Norte' },
                { id: 'sul', label: 'Sul' },
              ])}
            </Field>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Acionamento" onClear={() => clearValue('dados_operacionais', 'acionamento')}><Input type="time" className="text-xl" value={formData.dados_operacionais?.acionamento || ''} onChange={(e) => handleValueChange('dados_operacionais', 'acionamento', e.target.value)} /></Field>
            <Field label="Chegada no Local" onClear={() => clearValue('dados_operacionais', 'chegada_local')}><Input type="time" className="text-xl" value={formData.dados_operacionais?.chegada_local || ''} onChange={(e) => handleValueChange('dados_operacionais', 'chegada_local', e.target.value)} /></Field>
            <Field label="Saída do Local" onClear={() => clearValue('dados_operacionais', 'saida_local')}><Input type="time" className="text-xl" value={formData.dados_operacionais?.saida_local || ''} onChange={(e) => handleValueChange('dados_operacionais', 'saida_local', e.target.value)} /></Field>
            <Field label="Chegada no Hospital" onClear={() => clearValue('dados_operacionais', 'chegada_hospital')}><Input type="time" className="text-xl" value={formData.dados_operacionais?.chegada_hospital || ''} onChange={(e) => handleValueChange('dados_operacionais', 'chegada_hospital', e.target.value)} /></Field>
            <Field label="Saída do Hospital" onClear={() => clearValue('dados_operacionais', 'saida_hospital')}><Input type="time" className="text-xl" value={formData.dados_operacionais?.saida_hospital || ''} onChange={(e) => handleValueChange('dados_operacionais', 'saida_hospital', e.target.value)} /></Field>
            <Field label="Chegada BSO/Término" onClear={() => clearValue('dados_operacionais', 'chegada_bso')}><Input type="time" className="text-xl" value={formData.dados_operacionais?.chegada_bso || ''} onChange={(e) => handleValueChange('dados_operacionais', 'chegada_bso', e.target.value)} /></Field>
        </div>

        <SectionTitle>DADOS CADASTRAIS DO USUÁRIO</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Nome" onClear={() => clearValue('dados_usuario', 'nome')}><Input className="text-xl" value={formData.dados_usuario?.nome || ''} onChange={(e) => handleValueChange('dados_usuario', 'nome', e.target.value)} /></Field>
            <Field label="Acompanhante" onClear={() => clearValue('dados_usuario', 'acompanhante')}><Input className="text-xl" value={formData.dados_usuario?.acompanhante || ''} onChange={(e) => handleValueChange('dados_usuario', 'acompanhante', e.target.value)} /></Field>
            <Field label="Endereço" onClear={() => clearValue('dados_usuario', 'endereco')}><Input className="text-xl" value={formData.dados_usuario?.endereco || ''} onChange={(e) => handleValueChange('dados_usuario', 'endereco', e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <Field label="Sexo" onClear={() => clearValue('dados_usuario', 'sexo')}>
                {renderRadioGroup('dados_usuario', 'sexo', [{id: 'm', label: 'M'}, {id: 'f', label: 'F'}])}
            </Field>
            <Field label="DN" onClear={() => clearValue('dados_usuario', 'dn')}><Input type="date" className="text-xl" value={formData.dados_usuario?.dn || ''} onChange={(e) => handleValueChange('dados_usuario', 'dn', e.target.value)} /></Field>
            <Field label="Idade" onClear={() => clearValue('dados_usuario', 'idade')}><Input type="number" className="text-xl" value={formData.dados_usuario?.idade || ''} onChange={(e) => handleValueChange('dados_usuario', 'idade', e.target.value)} /></Field>
            <Field label="Telefone" onClear={() => clearValue('dados_usuario', 'tel')}><Input className="text-xl" value={formData.dados_usuario?.tel || ''} onChange={(e) => handleValueChange('dados_usuario', 'tel', e.target.value)} /></Field>
            <Field label="CPF" onClear={() => clearValue('dados_usuario', 'cpf')}><Input className="text-xl" value={formData.dados_usuario?.cpf || ''} onChange={(e) => handleValueChange('dados_usuario', 'cpf', e.target.value)} /></Field>
            <Field label="RG" onClear={() => clearValue('dados_usuario', 'rg')}><Input className="text-xl" value={formData.dados_usuario?.rg || ''} onChange={(e) => handleValueChange('dados_usuario', 'rg', e.target.value)} /></Field>
            <Field label="Posição no Veículo" onClear={() => clearValue('dados_usuario', 'posicao_veiculo')}><Input className="text-xl" value={formData.dados_usuario?.posicao_veiculo || ''} onChange={(e) => handleValueChange('dados_usuario', 'posicao_veiculo', e.target.value)} /></Field>
        </div>
        
        <SectionTitle>EVENTO</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Field label="Trauma" onClear={() => { clearCheckboxGroup('evento', 'trauma'); clearValue('evento', 'trauma_outros');}}>
              {renderCheckboxes('evento', 'trauma', [
                  { id: 'acidente_automobilistico', label: 'Acidente Automobilístico' },
                  { id: 'queimadura', label: 'Queimadura' },
                  { id: 'atropelamento', label: 'Atropelamento' },
                  { id: 'queda_altura', label: 'Queda de Altura' },
              ])}
              <Input placeholder="Outros" className="mt-2 text-xl" value={formData.evento?.trauma_outros || ''} onChange={(e) => handleValueChange('evento', 'trauma_outros', e.target.value)} />
            </Field>
            <Field label="Atendimento Clínico" onClear={() => { clearCheckboxGroup('evento', 'atendimento_clinico'); clearValue('evento', 'clinico_outros');}}>
              {renderCheckboxes('evento', 'atendimento_clinico', [
                  { id: 'mal_subito', label: 'Mal Súbito' },
                  { id: 'intoxicacao_exogena', label: 'Intoxicação Exógena' },
                  { id: 'assistencia_parto', label: 'Assistência ao Parto' },
                  { id: 'convulsao', label: 'Convulsão' },
                  { id: 'disturbio_psiquiatrico', label: 'Distúrbio Psiquiátrico' },
              ])}
              <Input placeholder="Outros" className="mt-2 text-xl" value={formData.evento?.clinico_outros || ''} onChange={(e) => handleValueChange('evento', 'clinico_outros', e.target.value)} />
            </Field>
            <Field label="Condições de Segurança" onClear={() => { clearCheckboxGroup('evento', 'condicoes_seguranca'); clearValue('evento', 'seguranca_outros');}}>
              {renderCheckboxes('evento', 'condicoes_seguranca', [
                  { id: 'cinto_seguranca', label: 'Cinto de Segurança' },
                  { id: 'cadeirinha', label: 'Cadeirinha' },
                  { id: 'air_bag', label: 'Air Bag' },
                  { id: 'capacete', label: 'Capacete' },
              ])}
              <Input placeholder="Outros" className="mt-2 text-xl" value={formData.evento?.seguranca_outros || ''} onChange={(e) => handleValueChange('evento', 'seguranca_outros', e.target.value)} />
            </Field>
        </div>
        
        <SectionTitle>AVALIAÇÕES</SectionTitle>
        <Field label="Condição Inicial" onClear={() => clearValue('avaliacoes', 'condicao_inicial')}>
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
        <Field label="X - Hemorragia Exsanguinante" onClear={() => clearValue('avaliacao_primaria', 'hemorragia')}>
          {renderRadioGroup('avaliacao_primaria', 'hemorragia', [{id: 'nao', label: 'Não'}, {id: 'sim', label: 'Sim'}])}
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="A - Vias Aéreas" onClear={() => { clearValue('avaliacao_primaria', 'vias_aereas'); clearValue('avaliacao_primaria', 'vias_aereas_obs');}}>
                <div className="flex items-center gap-4">
                  {renderRadioGroup('avaliacao_primaria', 'vias_aereas', [{id: 'pervias', label: 'Pérvias'}, {id: 'obstruidas', label: 'Obstruídas por:'}])}
                  <Input className="text-xl" value={formData.avaliacao_primaria?.vias_aereas_obs || ''} onChange={(e) => handleValueChange('avaliacao_primaria', 'vias_aereas_obs', e.target.value)} />
                </div>
            </Field>
             <Field label="B - Ventilação" onClear={() => { clearValue('avaliacao_primaria', 'ventilacao_status'); clearValue('avaliacao_primaria', 'ventilacao_tipo');}}>
                {renderRadioGroup('avaliacao_primaria', 'ventilacao_status', [{id: 'presente', label: 'Presente'}, {id: 'ausente', label: 'Ausente'}, {id: 'simetrica', label: 'Simétrica'}, {id: 'assimetrica', label: 'Assimétrica'}])}
                {renderRadioGroup('avaliacao_primaria', 'ventilacao_tipo', [{id: 'apneia', label: 'Apneia'}, {id: 'eupneia', label: 'Eupneia'}, {id: 'taquipneia', label: 'Taquipneia'}, {id: 'gasping', label: 'Gasping'}])}
            </Field>
        </div>
        <SubSectionTitle>C - Circulação e Hemorragias</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Field label="Pulso" onClear={() => clearValue('avaliacao_primaria', 'pulso')}>
                {renderRadioGroup('avaliacao_primaria', 'pulso', [{id: 'presente', label: 'Presente'}, {id: 'cheio', label: 'Cheio'}, {id: 'filiforme', label: 'Filiforme'}])}
            </Field>
            <Field label="Pele" onClear={() => clearValue('avaliacao_primaria', 'pele')}>
                {renderRadioGroup('avaliacao_primaria', 'pele', [{id: 'normal', label: 'Normal'}, {id: 'fria', label: 'Fria'}, {id: 'sudorese', label: 'Sudorese'}])}
            </Field>
            <Field label="Perfusão" onClear={() => clearValue('avaliacao_primaria', 'perfusao')}>
                {renderRadioGroup('avaliacao_primaria', 'perfusao', [{id: '<2seg', label: '< 2seg'}, {id: '>2seg', label: '> 2seg'}])}
            </Field>
        </div>
         <Field label="Sangramento Ativo" onClear={() => clearValue('avaliacao_primaria', 'sangramento')}>
             {renderRadioGroup('avaliacao_primaria', 'sangramento', [{id: 'presente', label: 'Presente'}, {id: 'ausente', label: 'Ausente'}])}
        </Field>

        <SubSectionTitle>D - Neurológico: Glasgow</SubSectionTitle>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Pupilas" onClear={() => clearValue('avaliacao_primaria', 'pupilas')}>
                {renderRadioGroup('avaliacao_primaria', 'pupilas', [{id: 'isocoricas', label: 'Isocóricas'}, {id: 'anisocoricas', label: 'Anisocóricas'}])}
            </Field>
            <Field label="Fotorreagentes" onClear={() => clearValue('avaliacao_primaria', 'fotorreagentes')}>
                {renderRadioGroup('avaliacao_primaria', 'fotorreagentes', [{id: 'sim', label: 'Sim'}, {id: 'nao', label: 'Não'}])}
            </Field>
        </div>

        <SubSectionTitle>E - Exposição</SubSectionTitle>
        <Field onClear={() => clearValue('avaliacao_primaria', 'exposicao')}>
            {renderRadioGroup('avaliacao_primaria', 'exposicao', [{id: 'sem_lesoes', label: 'Sem Lesões Aparentes'}, {id: 'hipotermia', label: 'Hipotermia'}])}
        </Field>
         <Field label="Lesões Aparentes e Queixas Principais" onClear={() => clearValue('avaliacao_primaria', 'lesoes_queixas')}>
            <Textarea className="text-xl" value={formData.avaliacao_primaria?.lesoes_queixas || ''} onChange={(e) => handleValueChange('avaliacao_primaria', 'lesoes_queixas', e.target.value)}/>
        </Field>

        <SubSectionTitle>Avaliação Secundária</SubSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <SubSectionTitle>Sinais Vitais</SubSectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <Field label="PA (mmHg)" onClear={() => clearNestedValue('avaliacao_secundaria', 'sinais_vitais', 'pa')}><Input className="text-xl" value={formData.avaliacao_secundaria?.sinais_vitais?.pa || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'pa', e.target.value)} /></Field>
                <Field label="FC (bpm)" onClear={() => clearNestedValue('avaliacao_secundaria', 'sinais_vitais', 'fc')}><Input type="number" className="text-xl" value={formData.avaliacao_secundaria?.sinais_vitais?.fc || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'fc', e.target.value)} /></Field>
                <Field label="FR (rpm)" onClear={() => clearNestedValue('avaliacao_secundaria', 'sinais_vitais', 'fr')}><Input type="number" className="text-xl" value={formData.avaliacao_secundaria?.sinais_vitais?.fr || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'fr', e.target.value)} /></Field>
                <Field label="Sat O² (%)" onClear={() => clearNestedValue('avaliacao_secundaria', 'sinais_vitais', 'sat')}><Input type="number" className="text-xl" value={formData.avaliacao_secundaria?.sinais_vitais?.sat || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'sat', e.target.value)} /></Field>
                <Field label="TAX (°C)" onClear={() => clearNestedValue('avaliacao_secundaria', 'sinais_vitais', 'tax')}><Input type="number" className="text-xl" value={formData.avaliacao_secundaria?.sinais_vitais?.tax || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'tax', e.target.value)} /></Field>
                <Field label="DXT (mg/dl)" onClear={() => clearNestedValue('avaliacao_secundaria', 'sinais_vitais', 'dxt')}><Input type="number" className="text-xl" value={formData.avaliacao_secundaria?.sinais_vitais?.dxt || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'sinais_vitais', 'dxt', e.target.value)} /></Field>
              </div>
            </div>
            <div className="space-y-4">
                <Field label="Alergias" onClear={() => clearNestedValue('avaliacao_secundaria', 'outros', 'alergias')}><Textarea className="text-xl" value={formData.avaliacao_secundaria?.outros?.alergias || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'alergias', e.target.value)} /></Field>
                <Field label="Medicamentos em Uso" onClear={() => clearNestedValue('avaliacao_secundaria', 'outros', 'medicamentos')}><Textarea className="text-xl" value={formData.avaliacao_secundaria?.outros?.medicamentos || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'medicamentos', e.target.value)} /></Field>
                <Field label="Comorbidades/Gestação" onClear={() => clearNestedValue('avaliacao_secundaria', 'outros', 'comorbidades')}><Textarea className="text-xl" value={formData.avaliacao_secundaria?.outros?.comorbidades || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'comorbidades', e.target.value)} /></Field>
                <Field label="Última Refeição/Jejum" onClear={() => clearNestedValue('avaliacao_secundaria', 'outros', 'ultima_refeicao')}><Textarea className="text-xl" value={formData.avaliacao_secundaria?.outros?.ultima_refeicao || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'ultima_refeicao', e.target.value)} /></Field>
            </div>
        </div>
        <Field label="Avaliação Crânio-Caudal" onClear={() => clearNestedValue('avaliacao_secundaria', 'outros', 'cranio_caudal')}>
            <Textarea className="text-xl" value={formData.avaliacao_secundaria?.outros?.cranio_caudal || ''} onChange={(e) => handleNestedValueChange('avaliacao_secundaria', 'outros', 'cranio_caudal', e.target.value)}/>
        </Field>

        <SectionTitle>ESCALA DE GLASGOW</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Field label="Abertura Ocular" onClear={() => clearValue('glasgow', 'abertura_ocular')}>
                {renderRadioGroup('glasgow', 'abertura_ocular', [
                    { id: '4', label: '04 Espontânea' },
                    { id: '3', label: '03 Estímulo Verbal' },
                    { id: '2', label: '02 Estímulo Doloroso' },
                    { id: '1', label: '01 Ausente' },
                ])}
            </Field>
             <Field label="Resposta Verbal" onClear={() => clearValue('glasgow', 'resposta_verbal')}>
                {renderRadioGroup('glasgow', 'resposta_verbal', [
                    { id: '5', label: '05 Orientado' },
                    { id: '4', label: '04 Confuso' },
                    { id: '3', label: '03 Palavras Inapropriadas' },
                    { id: '2', label: '02 Sons Incompreensíveis' },
                    { id: '1', label: '01 Ausente' },
                ])}
            </Field>
             <Field label="Resposta Motora" onClear={() => clearValue('glasgow', 'resposta_motora')}>
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
         <Field onClear={() => { clearCheckboxGroup('procedimentos', 'lista'); clearValue('procedimentos', 'outros');}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {renderCheckboxes('procedimentos', 'lista', [
                  { id: 'colar_cervical', label: 'Colar Cervical' },
                  { id: 'pranchamento', label: 'Pranchamento: Decúbito/Em Pé' },
                  { id: 'extricacao_ked', label: 'Extricação com KED' },
                  { id: 'extricacao_tereza_rautek', label: 'Extricação c/ Tereza/Rautek' },
                  { id: 'desencarceramento', label: 'Desencarceramento' },
                  { id: 'retirada_capacete', label: 'Retirada de Capacete' },
                  { id: 'imobilizacao_mse', label: 'Imobilização de MSE' },
                  { id: 'imobilizacao_msd', label: 'Imobilização de MSD' },
                  { id: 'imobilizacao_mie', label: 'Imobilização de MIE' },
                  { id: 'imobilizacao_mid', label: 'Imobilização de MID' },
                  { id: 'imobilizacao_pelve', label: 'Imobilização de Pelve' },
                  { id: 'desobstrucao_vias_aereas', label: 'Desobstrução de Vias Aéreas' },
                  { id: 'canula_guedel', label: 'Cânula de Guedel' },
                  { id: 'oxigenio', label: 'Oxigênio: Máscara/Cateter Nasal' },
                  { id: 'ventilacao_ambu', label: 'Ventilação com Ambu' },
                  { id: 'oximetria_pulso', label: 'Oximetria de Pulso' },
                  { id: 'dea', label: 'DEA - Desfibrilador Externo Automático' },
                  { id: 'rcp', label: 'RCP - Ressuscitação Cardiopulmonar' },
                  { id: 'curativo', label: 'Curativo: Oclusivo/Compressivo' },
                  { id: 'torniquete', label: 'Torniquete' },
                  { id: 'afericao_sinais_vitais', label: 'Aferição de Sinais Vitais' },
                  { id: 'orientacoes', label: 'Orientações' },
                  { id: 'resgate_altura', label: 'Resgate em Altura' },
              ])}
            </div>
          </Field>
        <Field label="Outros" onClear={() => clearValue('procedimentos', 'outros')}><Input className="text-xl" value={formData.procedimentos?.outros || ''} onChange={(e) => handleValueChange('procedimentos', 'outros', e.target.value)} /></Field>

        <SectionTitle>ROL DE VALORES/PERTENCES</SectionTitle>
        <div className="space-y-4">
            {rolDeValores.map((item, index) => (
                <div key={item.id} className="flex items-end gap-4 p-4 border rounded-lg">
                    <Field label="MATERIAL" className="flex-1"><Input className="text-xl" value={item.material} onChange={e => updateListItem(item.id, 'material', e.target.value, setRolDeValores)} /></Field>
                    <Field label="QUANTIDADE" className="w-32"><Input type="number" className="text-xl" value={item.quantidade} onChange={e => updateListItem(item.id, 'quantidade', e.target.value, setRolDeValores)} /></Field>
                    <Button variant="destructive" size="icon" onClick={() => removeListItem(item.id, setRolDeValores)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => addListItem(setRolDeValores)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Item
            </Button>
        </div>
         <Field label="Responsável pelo Recebimento (Assinatura)" onClear={() => clearValue('rol_valores', 'responsavel')}>
            <Input className="text-xl" value={formData.rol_valores?.responsavel || ''} onChange={(e) => handleValueChange('rol_valores', 'responsavel', e.target.value)} />
        </Field>

        <SectionTitle>EQUIPAMENTOS / MATERIAIS RETIDOS</SectionTitle>
        <div className="space-y-4">
            {equipamentosRetidos.map((item, index) => (
                <div key={item.id} className="flex items-end gap-4 p-4 border rounded-lg">
                    <Field label="MATERIAL" className="flex-1"><Input className="text-xl" value={item.material} onChange={e => updateListItem(item.id, 'material', e.target.value, setEquipamentosRetidos)} /></Field>
                    <Field label="QUANTIDADE" className="w-32"><Input type="number" className="text-xl" value={item.quantidade} onChange={e => updateListItem(item.id, 'quantidade', e.target.value, setEquipamentosRetidos)} /></Field>
                    <Button variant="destructive" size="icon" onClick={() => removeListItem(item.id, setEquipamentosRetidos)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => addListItem(setEquipamentosRetidos)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Item
            </Button>
        </div>
        <Field label="Responsável pelo Recebimento (Assinatura)" onClear={() => clearValue('equipamentos_retidos', 'responsavel')}>
            <Input className="text-xl" value={formData.equipamentos_retidos?.responsavel || ''} onChange={(e) => handleValueChange('equipamentos_retidos', 'responsavel', e.target.value)} />
        </Field>


        <SectionTitle>CONDUTA</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field onClear={() => { clearCheckboxGroup('conduta', 'acoes'); clearCheckboxGroup('conduta', 'removido_terceiros_check'); clearCheckboxGroup('conduta', 'removido_terceiros_options'); clearValue('conduta', 'removido_terceiros_outros'); clearCheckboxGroup('conduta', 'removido_unidade_check'); clearValue('conduta', 'unidade_hospitalar'); }}>
                 {renderCheckboxes('conduta', 'acoes', [
                    { id: 'liberacao_local', label: 'Liberação no Local c/ Orientações' },
                    { id: 'vitima_em_obito', label: 'Vítima em Óbito' },
                    { id: 'obito_durante_atendimento', label: 'Óbito Durante Atendimento' },
                    { id: 'recusa_atendimento', label: 'Recusa Atendimento' },
                    { id: 'recusa_remocao', label: 'Recusa Remoção à Unidade Hospitalar' },
                ])}
                <div className="flex items-center space-x-3 mt-2">
                     <Checkbox id="removido_terceiros" checked={formData.conduta?.removido_terceiros_check?.includes('removido_terceiros') || false} onCheckedChange={(checked) => handleCheckboxChange('conduta', 'removido_terceiros_check', 'removido_terceiros', !!checked)} />
                     <label htmlFor="removido_terceiros" className="text-xl font-normal leading-none">Removido por Terceiros:</label>
                     {renderCheckboxes('conduta', 'removido_terceiros_options', [
                        { id: 'cobom', label: 'CoBom' },
                        { id: 'samu', label: 'SAMU' },
                     ])}
                     <Input placeholder="Outros" className="text-xl" value={formData.conduta?.removido_terceiros_outros || ''} onChange={(e) => handleValueChange('conduta', 'removido_terceiros_outros', e.target.value)} />
                </div>
                 <div className="flex items-center space-x-3 mt-2">
                     <Checkbox id="removido_unidade_hospitalar" checked={formData.conduta?.removido_unidade_check?.includes('removido_unidade_hospitalar') || false} onCheckedChange={(checked) => handleCheckboxChange('conduta', 'removido_unidade_check', 'removido_unidade_hospitalar', !!checked)} />
                     <label htmlFor="removido_unidade_hospitalar" className="text-xl font-normal leading-none">Removido à Unidade Hospitalar:</label>
                     <Input className="text-xl" value={formData.conduta?.unidade_hospitalar || ''} onChange={(e) => handleValueChange('conduta', 'unidade_hospitalar', e.target.value)} />
                </div>
            </Field>
            <div>
                <Field label="Médico Regulador/Intervencionista" onClear={() => clearValue('conduta', 'medico_regulador')}><Input className="text-xl" value={formData.conduta?.medico_regulador || ''} onChange={(e) => handleValueChange('conduta', 'medico_regulador', e.target.value)} /></Field>
                <Field label="Médico Receptor" onClear={() => clearValue('conduta', 'medico_receptor')}><Input className="text-xl" value={formData.conduta?.medico_receptor || ''} onChange={(e) => handleValueChange('conduta', 'medico_receptor', e.target.value)} /></Field>
                <Field label="Código" onClear={() => clearCheckboxGroup('conduta', 'codigo')}>
                     {renderCheckboxes('conduta', 'codigo', [
                        { id: 'vermelho', label: 'Vermelho' },
                        { id: 'amarelo', label: 'Amarelo' },
                        { id: 'verde', label: 'Verde' },
                        { id: 'azul', label: 'Azul' },
                        { id: 'preto', label: 'Preto' },
                    ])}
                </Field>
            </div>
        </div>

        <SectionTitle>TERMO DE RECUSA</SectionTitle>
        <Field onClear={() => clearValue('termo_recusa', 'texto')}>
            <Textarea 
                className="text-xl"
                rows={8}
                placeholder="Eu, (NOME), portador do CPF (NÚMERO) e RG (NÚMERO), residente no endereço (ENDEREÇO), em plena consciência dos meus atos e orientado pela equipe de resgate, declaro para todos os fins que recuso o atendimento pré-hospitalar da Way Brasil, assumindo toda a responsabilidade por qualquer prejuízo à minha saúde e integridade física ou a de (NOME DO RESPONSÁVEL), na condição de seu responsável de quem sou (GRAU DE PARENTESCO)."
                value={formData.termo_recusa?.texto || ''}
                onChange={(e) => handleValueChange('termo_recusa', 'texto', e.target.value)}
            />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <Field label="Testemunha 1" onClear={() => clearValue('termo_recusa', 'testemunha1')}><Input className="text-xl" value={formData.termo_recusa?.testemunha1 || ''} onChange={(e) => handleValueChange('termo_recusa', 'testemunha1', e.target.value)}/></Field>
            <Field label="Testemunha 2" onClear={() => clearValue('termo_recusa', 'testemunha2')}><Input className="text-xl" value={formData.termo_recusa?.testemunha2 || ''} onChange={(e) => handleValueChange('termo_recusa', 'testemunha2', e.target.value)}/></Field>
        </div>
        <Field label="Assinatura da Vítima/Responsável" onClear={() => clearValue('termo_recusa', 'assinatura')}>
            <Input className="text-xl" value={formData.termo_recusa?.assinatura || ''} onChange={(e) => handleValueChange('termo_recusa', 'assinatura', e.target.value)} />
        </Field>

        <SectionTitle>CONSUMO DE MATERIAIS NO ATENDIMENTO</SectionTitle>
        <div className="space-y-4">
            {consumoMateriais.map((item) => (
                <div key={item.id} className="flex items-end gap-4 p-4 border rounded-lg">
                    <Field label="MATERIAL" className="flex-1">
                        <Input className="text-xl" value={item.material} onChange={(e) => updateListItem(item.id, 'material', e.target.value, setConsumoMateriais)} />
                    </Field>
                    <Field label="QUANTIDADE" className="w-32">
                        <Input type="number" className="text-xl" value={item.quantidade} onChange={(e) => updateListItem(item.id, 'quantidade', e.target.value, setConsumoMateriais)} />
                    </Field>
                    <Button variant="destructive" size="icon" onClick={() => removeListItem(item.id, setConsumoMateriais)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => addListItem(setConsumoMateriais)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Material
            </Button>
        </div>


        <SectionTitle>RELATÓRIO/OBSERVAÇÕES</SectionTitle>
        <Field onClear={() => clearValue('observacoes', 'texto')}>
            <Textarea className="text-xl" rows={6} value={formData.observacoes?.texto || ''} onChange={(e) => handleValueChange('observacoes', 'texto', e.target.value)} />
        </Field>


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
