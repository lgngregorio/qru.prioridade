
'use client';

import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase mt-8 mb-4">
    {children}
  </h2>
);


export default function TracadoDePistaForm({ categorySlug }: { categorySlug: string }) {
  const [formData, setFormData] = useState<any>({
    previa: {cinematica: [], veiculos:[], gravidade:[], recursos:[]},
    confirmacao: {cinematica:[], gravidade_abordagem:[], recursos:[]},
    condicao: {},
    pista: {},
    sinalizacao: {},
  });
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.category === categorySlug && parsedData.formData) {
        setFormData(parsedData.formData);
      }
    }
  }, [categorySlug]);


  const handleValueChange = (section: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
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
      className="flex flex-col space-y-2"
    >
      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-3">
          <RadioGroupItem value={option.id} id={`${section}-${key}-${option.id}`} />
          <Label htmlFor={`${section}-${key}-${option.id}`} className="text-xl font-normal">{option.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
  
  const validateObject = (obj: any): boolean => {
    if (obj === null || obj === undefined) return false;

    const optionalFields = ['id', 'cinematica_outros', 'recursos_outros', 'especiais_outros', 'sinalizacao_outros', 'obstaculo_canteiro_outros', 'obstaculo_acostamento_outros', 'deficiencia_obras_outros'];
    if (!formData.previa?.cinematica?.includes('outros')) optionalFields.push('cinematica_outros');

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (optionalFields.includes(key)) continue;

            const value = obj[key];

            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                if (!validateObject(value)) return false;
            } else if (Array.isArray(value)) {
                if (value.length === 0) return false;
                if (value.some(item => (typeof item === 'object' && !validateObject(item)) || (item === '' && item !== null && item !== undefined))) return false;
            } else if (value === '' || value === null || value === undefined) {
                return false;
            }
        }
    }
    return true;
};


  const prepareReportData = () => {
    if (!validateObject(formData)) {
        toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos antes de continuar.",
        });
        return null;
    }
    return {
      category: categorySlug,
      formData: formData,
    };
  };

  const handleGenerateReport = () => {
    const reportData = prepareReportData();
    if(reportData) {
        localStorage.setItem('reportPreview', JSON.stringify(reportData));
        router.push('/relatorio/preview');
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        
        <SectionTitle>ACIDENTE PRÉVIA</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Field label="Rodovia">
                 <RadioGroup value={formData.previa?.rodovia || ''} onValueChange={(value) => handleValueChange('previa', 'rodovia', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="ms-112" id="previa-ms-112" /><Label htmlFor="previa-ms-112" className="text-xl font-normal">MS-112</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="br-158" id="previa-br-158" /><Label htmlFor="previa-br-158" className="text-xl font-normal">BR-158</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="ms-306" id="previa-ms-306" /><Label htmlFor="previa-ms-306" className="text-xl font-normal">MS-306</Label></div>
                </RadioGroup>
            </Field>
            <Field label="QTH exato"><Input className="text-xl" value={formData.previa?.qth || ''} onChange={(e) => handleValueChange('previa', 'qth', e.target.value)} /></Field>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Field label="Sentido">
                {renderRadioGroup('previa', 'sentido', [
                    { id: 'norte', label: 'Norte' },
                    { id: 'sul', label: 'Sul' },
                ])}
            </Field>
            <Field label="Faixa de rolamento interditada?">
                {renderRadioGroup('previa', 'faixa_interditada', [
                    { id: 'norte_sul', label: 'Norte e Sul' },
                    { id: 'norte', label: 'Norte' },
                    { id: 'sul', label: 'Sul' },
                    { id: 'nill', label: 'NILL' },
                ])}
            </Field>
        </div>
        <Field label="Provável cinemática">
            {renderCheckboxes('previa', 'cinematica', [
                { id: 'colisao', label: 'Colisão' },
                { id: 'saida_pista', label: 'Saída de pista' },
                { id: 'capotamento', label: 'Capotamento' },
                { id: 'tombamento', label: 'Tombamento' },
                { id: 'atropelamento', label: 'Atropelamento' },
                { id: 'outros', label: 'Outros' },
            ])}
            {formData.previa?.cinematica?.includes('outros') && <Input placeholder="Outros" value={formData.previa?.cinematica_outros || ''} onChange={(e) => handleValueChange('previa', 'cinematica_outros', e.target.value)} className="mt-2 text-xl" />}
        </Field>
        <Field label="Veículos">
            {renderCheckboxes('previa', 'veiculos', [
                { id: 'ap', label: 'AP' },
                { id: 'mo', label: 'MO' },
                { id: 'ca', label: 'CA' },
                { id: 'car', label: 'CAR' },
                { id: 'on', label: 'ON' },
                { id: 'utilitaria', label: 'Utilitária' },
            ])}
        </Field>
        <Field label="Quantidade de vítimas"><Input type="number" className="text-xl" value={formData.previa?.vitimas_qtd || ''} onChange={(e) => handleValueChange('previa', 'vitimas_qtd', e.target.value)} /></Field>
        <Field label="Potencial de gravidade">
            {renderCheckboxes('previa', 'gravidade', [
                { id: 'deambulando', label: 'Deambulando' },
                { id: 'ao_solo', label: 'Ao solo' },
                { id: 'interior_veiculo', label: 'Interior do veículo' },
            ])}
        </Field>
        <Field label="Recursos adicionais (se precisar)">
            {renderCheckboxes('previa', 'recursos', [
                { id: 'resgate', label: 'Resgate' },
                { id: 'cobom', label: 'COBOM' },
                { id: 'pmr', label: 'PMR' },
                { id: 'conserva', label: 'Conserva' },
                { id: 'energisa', label: 'ENERGISA' },
                { id: 'iml', label: 'IML' },
            ])}
        </Field>
        <p className="text-center font-bold text-2xl">"QRX para confirmação da prévia."</p>

        <SectionTitle>CONFIRMAÇÃO DA PRÉVIA</SectionTitle>
        <Field label="Cinemática">
            {renderCheckboxes('confirmacao', 'cinematica', [
                { id: 'colisao', label: 'Colisão' },
                { id: 'saida_pista', label: 'Saída de pista' },
                { id: 'capotamento', label: 'Capotamento' },
                { id: 'tombamento', label: 'Tombamento' },
                { id: 'atropelamento', label: 'Atropelamento' },
            ])}
            <Input placeholder="Outros" value={formData.confirmacao?.cinematica_outros || ''} onChange={(e) => handleValueChange('confirmacao', 'cinematica_outros', e.target.value)} className="mt-2 text-xl" />
        </Field>
        <Field label="Energia">{renderRadioGroup('confirmacao', 'energia', [{ id: 'baixa', label: 'Baixa' }, { id: 'media', label: 'Média' }, { id: 'alta', label: 'Alta' }])}</Field>
        <Field label="Avarias">{renderRadioGroup('confirmacao', 'avarias', [{ id: 'poucas', label: 'Poucas' }, { id: 'moderadas', label: 'Moderadas' }, { id: 'grandes', label: 'Grandes' }])}</Field>
        <Field label="Posição do veículo">
            {renderRadioGroup('confirmacao', 'posicao_veiculo', [
                { id: 'original', label: 'Posição original' },
                { id: 'rodados_cima', label: 'Com os rodados para cima/ ângulo de 180°' },
                { id: 'lateralizado', label: 'Lateralizado/ ângulo de 90°' },
            ])}
        </Field>
        <Field label="Quantidade de vítimas"><Input type="number" className="text-xl" value={formData.confirmacao?.vitimas_qtd || ''} onChange={(e) => handleValueChange('confirmacao', 'vitimas_qtd', e.target.value)} /></Field>
        <Field label="Potencial de gravidade/Abordagem">
            {renderCheckboxes('confirmacao', 'gravidade_abordagem', [
                { id: 'alerta', label: 'Alerta' },
                { id: 'deambulando', label: 'Deambulando' },
                { id: 'verbalizando', label: 'Verbalizando' },
                { id: 'consciente', label: 'Consciente' },
                { id: 'orientado', label: 'Orientado' },
                { id: 'inconsciente', label: 'Inconsciente' },
                { id: 'encarcerado_retido', label: 'Encarcerado/Retido' },
            ])}
        </Field>
        <Field label="Cód. 61/62?">{renderRadioGroup('confirmacao', 'cod_61_62', [{ id: '61', label: '61' }, { id: '62', label: '62' }, { id: 'nill', label: 'NILL' }])}</Field>
        <Field label="Recursos adicionais (se precisar)">
            {renderCheckboxes('confirmacao', 'recursos', [
                { id: 'resgate', label: 'Resgate' },
                { id: 'cobom', label: 'COBOM' },
                { id: 'pmr', label: 'PMR' },
                { id: 'conserva', label: 'Conserva' },
                { id: 'energisa', label: 'ENERGISA' },
                { id: 'iml', label: 'IML' },
            ])}
            <Input placeholder="Outros" value={formData.confirmacao?.recursos_outros || ''} onChange={(e) => handleValueChange('confirmacao', 'recursos_outros', e.target.value)} className="mt-2 text-xl" />
        </Field>

        <SectionTitle>CONDIÇÃO</SectionTitle>
        <Field label="Condições meteorológicas">{renderRadioGroup('condicao', 'meteorologicas', [{id: "nao_identificado", label: "Não identificado"}, {id: "bom", label: "Bom"}, {id: "chuva", label: "Chuva"}, {id: "neblina", label: "Neblina"}, {id: "garoa", label: "Garoa"}, {id: "nublado", label: "Nublado"}, {id: "chuva_torrencial", label: "Chuva torrencial"}, {id: "vento_forte", label: "Vento forte"}, {id: "chuva_com_ventania", label: "Chuva com ventania"}, {id: "chuva_com_granizo", label: "Chuva com granizo"}])}</Field>
        <Field label="Condição de visibilidade">{renderRadioGroup('condicao', 'visibilidade', [{id: "boa", label: "Boa"}, {id: "parcial", label: "Parcial"}, {id: "ruim", label: "Ruim"}])}</Field>
        <Field label="Condições especiais">
            {renderRadioGroup('condicao', 'especiais', [{id: "nill", label: "NILL"}, {id: "fumaca", label: "Fumaça"}, {id: "poeira", label: "Poeira"}, {id: "lama", label: "Lama"}, {id: "oleo", label: "Óleo"}, {id: "poca_dagua", label: "Poça d'água"}])}
            <Input placeholder="Outros" value={formData.condicao?.especiais_outros || ''} onChange={e => handleValueChange('condicao', 'especiais_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>
        <Field label="Condições de sinalização">
            {renderRadioGroup('condicao', 'sinalizacao', [{id: "existente_visivel", label: "Existente e visível"}, {id: "existente_encoberta", label: "Existente e encoberta"}, {id: "inexistente", label: "Inexistente"}])}
            <Input placeholder="Outros" value={formData.condicao?.sinalizacao_outros || ''} onChange={e => handleValueChange('condicao', 'sinalizacao_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>

        <SectionTitle>PISTA</SectionTitle>
        <Field label="Tipo de pista">{renderRadioGroup('pista', 'tipo', [{id: "dupla", label: "Dupla"}, {id: "simples", label: "Simples"}, {id: "multivias", label: "Multivias"}])}</Field>
        <Field label="Traçado de pista">{renderRadioGroup('pista', 'tracado', [{id: "dupla", label: "Dupla"}, {id: "simples", label: "Simples"}, {id: "curva", label: "Curva"}, {id: "reta", label: "Reta"}, {id: "faixa_rolamento", label: "Faixa de rolamento"}, {id: "curva_acentuada", label: "Curva acentuada"}, {id: "curva_suave", label: "Curva suave"}])}</Field>
        <Field label="Perfil">{renderRadioGroup('pista', 'perfil', [{id: "em_nivel", label: "Em nível"}, {id: "aclive", label: "Aclive"}, {id: "declive", label: "Declive"}])}</Field>
        <Field label="Obras na pista">{renderRadioGroup('pista', 'obras', [{id: "nao_existe", label: "Não existe"}, {id: "existe_mal_sinalizada", label: "Existe mal sinalizada"}, {id: "existe_bem_sinalizada", label: "Existe bem sinalizada"}])}</Field>
        <Field label="Condição de pista">{renderRadioGroup('pista', 'condicao', [{id: "molhada", label: "Molhada"}, {id: "seca", label: "Seca"}, {id: "contaminada", label: "Contaminada"}, {id: "escorregadia", label: "Escorregadia"}])}</Field>
        <Field label="Obstáculo canteiro central">
            {renderRadioGroup('pista', 'obstaculo_canteiro', [{id: "nao_existe", label: "Não existe"}, {id: "acostamento", label: "Acostamento"}, {id: "barreira", label: "Barreira"}, {id: "meio_fio", label: "Meio fio"}, {id: "defensa_metalica", label: "Defensa metálica"}])}
            <Input placeholder="Outros" value={formData.pista?.obstaculo_canteiro_outros || ''} onChange={e => handleValueChange('pista', 'obstaculo_canteiro_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>
        <Field label="Obstáculo acostamento">
            {renderRadioGroup('pista', 'obstaculo_acostamento', [{id: "nao_existe", label: "Não existe"}, {id: "acostamento", label: "Acostamento"}, {id: "barreira", label: "Barreira"}, {id: "meio_fio", label: "Meio fio"}, {id: "defensa_metalica", label: "Defensa metálica"}])}
            <Input placeholder="Outros" value={formData.pista?.obstaculo_acostamento_outros || ''} onChange={e => handleValueChange('pista', 'obstaculo_acostamento_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>
        <Field label="Obras no acostamento">{renderRadioGroup('pista', 'obras_acostamento', [{id: "nao_existe", label: "Não existe"}, {id: "existe_mal_sinalizada", label: "Existe mal sinalizada"}, {id: "existe_bem_sinalizada", label: "Existe bem sinalizada"}])}</Field>
        <Field label="Estado de conservação">{renderRadioGroup('pista', 'conservacao', [{id: "bom", label: "Bom"}, {id: "ruim", label: "Ruim"}])}</Field>
        <Field label="Interseções na pista">{renderRadioGroup('pista', 'intersecoes', [{id: 'cruzamento_entroncamento', label: 'Cruzamento/entroncamento'}, {id: 'trevo', label: 'Trevo'}, {id: 'rotatoria', label: 'Rotatória'}, {id: 'nao_existe', label: 'Não existe'}])}</Field>
        <Field label="Deficiência em obras">
            {renderRadioGroup('pista', 'deficiencia_obras', [{id: 'obstruida', label: 'Obstruída'}, {id: 'interrompida', label: 'Interrompida'}, {id: 'pista_estreita', label: 'Pista estreita'}, {id: 'pista_fechada', label: 'Pista fechada'}, {id: 'sublevacao_negativa', label: 'Sublevação negativa'}, {id: 'ondulada', label: 'Ondulada'}, {id: 'nao_existe', label: 'Não existe'}])}
            <Input placeholder="Outros" value={formData.pista?.deficiencia_obras_outros || ''} onChange={e => handleValueChange('pista', 'deficiencia_obras_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>
        <Field label="Obras de arte">{renderRadioGroup('pista', 'obras_arte', [{id: 'ponte', label: 'Ponte'}, {id: 'tunel', label: 'Túnel'}, {id: 'passagem_superior', label: 'Passagem superior'}, {id: 'passagem_inferior', label: 'Passagem inferior'}, {id: 'nao_existe', label: 'Não existe'}])}</Field>
        <Field label="Local">{renderRadioGroup('pista', 'local', [{id: 'canteiro_central', label: 'Canteiro central'}, {id: 'faixa_dominio', label: 'Faixa de domínio'}, {id: 'acostamento_norte', label: 'Acostamento norte'}, {id: 'acostamento_sul', label: 'Acostamento Sul'}, {id: 'faixa_rolamento', label: 'Faixa de rolamento'}, {id: 'acostamento', label: 'Acostamento'}])}</Field>

        <SectionTitle>SINALIZAÇÃO</SectionTitle>
        <Field label="Sinalização vertical (placas, banners, postes)">{renderRadioGroup('sinalizacao', 'vertical', [{id: 'existe', label: 'Existe'}, {id: 'nao_existe', label: 'Não existe'}])}</Field>
        <Field label="Sinalização horizontal (faixa de bordo, faixa segmentada, pintura de pista...)">{renderRadioGroup('sinalizacao', 'horizontal', [{id: 'existe', label: 'Existe'}, {id: 'nao_existe', label: 'Não existe'}])}</Field>
        <Field label="Sinalização semáforo">{renderRadioGroup('sinalizacao', 'semaforo', [{id: 'funciona', label: 'Funciona'}, {id: 'nao_funciona', label: 'Não funciona'}, {id: 'funciona_defeito', label: 'Funciona com defeito'}, {id: 'inexistente', label: 'Inexistente'}])}</Field>

        <div className="flex justify-end pt-8">
            <Button
              size="lg"
              className="uppercase text-xl"
              onClick={handleGenerateReport}
            >
              <Save className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
        </div>
      </form>
    </div>
  );
}
