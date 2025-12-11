
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

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase mt-8 mb-4">
    {children}
  </h2>
);


export default function TracadoDePistaForm({ categorySlug }: { categorySlug: string }) {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

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
      await addDoc(collection(firestore, 'reports'), {
        category: categorySlug,
        formData,
        createdAt: serverTimestamp(),
      });
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
    <div className="w-full p-4 sm:p-6 md:p-8">
      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        
        <SectionTitle>ACIDENTE PRÉVIA</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Field label="Rodovia">
                 <Select onValueChange={(value) => handleValueChange('previa', 'rodovia', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione a rodovia" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ms-112">MS-112</SelectItem>
                        <SelectItem value="br-158">BR-158</SelectItem>
                        <SelectItem value="ms-306">MS-306</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="QTH exato"><Input className="text-xl" onChange={(e) => handleValueChange('previa', 'qth', e.target.value)} /></Field>
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
            ])}
            <Input placeholder="Outros" onChange={(e) => handleValueChange('previa', 'cinematica_outros', e.target.value)} className="mt-2 text-xl" />
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
        <Field label="Quantidade de vítimas"><Input type="number" className="text-xl" onChange={(e) => handleValueChange('previa', 'vitimas_qtd', e.target.value)} /></Field>
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
            <Input placeholder="Outros" onChange={(e) => handleValueChange('confirmacao', 'cinematica_outros', e.target.value)} className="mt-2 text-xl" />
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
        <Field label="Quantidade de vítimas"><Input type="number" className="text-xl" onChange={(e) => handleValueChange('confirmacao', 'vitimas_qtd', e.target.value)} /></Field>
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
            <Input placeholder="Outros" onChange={(e) => handleValueChange('confirmacao', 'recursos_outros', e.target.value)} className="mt-2 text-xl" />
        </Field>

        <SectionTitle>CONDIÇÃO</SectionTitle>
        <Field label="Condições meteorológicas">{renderRadioGroup('condicao', 'meteorologicas', [{id: "nao_identificado", label: "Não identificado"}, {id: "bom", label: "Bom"}, {id: "chuva", label: "Chuva"}, {id: "neblina", label: "Neblina"}, {id: "garoa", label: "Garoa"}, {id: "nublado", label: "Nublado"}, {id: "chuva_torrencial", label: "Chuva torrencial"}, {id: "vento_forte", label: "Vento forte"}, {id: "chuva_com_ventania", label: "Chuva com ventania"}, {id: "chuva_com_granizo", label: "Chuva com granizo"}])}</Field>
        <Field label="Condição de visibilidade">{renderRadioGroup('condicao', 'visibilidade', [{id: "boa", label: "Boa"}, {id: "parcial", label: "Parcial"}, {id: "ruim", label: "Ruim"}])}</Field>
        <Field label="Condições especiais">
            {renderRadioGroup('condicao', 'especiais', [{id: "nill", label: "NILL"}, {id: "fumaca", label: "Fumaça"}, {id: "poeira", label: "Poeira"}, {id: "lama", label: "Lama"}, {id: "oleo", label: "Óleo"}, {id: "poca_dagua", label: "Poça d'água"}])}
            <Input placeholder="Outros" onChange={e => handleValueChange('condicao', 'especiais_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>
        <Field label="Condições de sinalização">
            {renderRadioGroup('condicao', 'sinalizacao', [{id: "existente_visivel", label: "Existente e visível"}, {id: "existente_encoberta", label: "Existente e encoberta"}, {id: "inexistente", label: "Inexistente"}])}
            <Input placeholder="Outros" onChange={e => handleValueChange('condicao', 'sinalizacao_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>

        <SectionTitle>PISTA</SectionTitle>
        <Field label="Tipo de pista">{renderRadioGroup('pista', 'tipo', [{id: "dupla", label: "Dupla"}, {id: "simples", label: "Simples"}, {id: "multivias", label: "Multivias"}])}</Field>
        <Field label="Traçado de pista">{renderRadioGroup('pista', 'tracado', [{id: "dupla", label: "Dupla"}, {id: "simples", label: "Simples"}, {id: "curva", label: "Curva"}, {id: "reta", label: "Reta"}, {id: "faixa_rolamento", label: "Faixa de rolamento"}, {id: "curva_acentuada", label: "Curva acentuada"}, {id: "curva_suave", label: "Curva suave"}])}</Field>
        <Field label="Perfil">{renderRadioGroup('pista', 'perfil', [{id: "em_nivel", label: "Em nível"}, {id: "aclive", label: "Aclive"}, {id: "declive", label: "Declive"}])}</Field>
        <Field label="Obras na pista">{renderRadioGroup('pista', 'obras', [{id: "nao_existe", label: "Não existe"}, {id: "existe_mal_sinalizada", label: "Existe mal sinalizada"}, {id: "existe_bem_sinalizada", label: "Existe bem sinalizada"}])}</Field>
        <Field label="Condição de pista">{renderRadioGroup('pista', 'condicao', [{id: "molhada", label: "Molhada"}, {id: "seca", label: "Seca"}, {id: "contaminada", label: "Contaminada"}, {id: "escorregadia", label: "Escorregadia"}])}</Field>
        <Field label="Obstáculo canteiro central">
            {renderRadioGroup('pista', 'obstaculo_canteiro', [{id: "nao_existe", label: "Não existe"}, {id: "acostamento", label: "Acostamento"}, {id: "barreira", label: "Barreira"}, {id: "meio_fio", label: "Meio fio"}, {id: "defensa_metalica", label: "Defensa metálica"}])}
            <Input placeholder="Outros" onChange={e => handleValueChange('pista', 'obstaculo_canteiro_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>
        <Field label="Obstáculo acostamento">
            {renderRadioGroup('pista', 'obstaculo_acostamento', [{id: "nao_existe", label: "Não existe"}, {id: "acostamento", label: "Acostamento"}, {id: "barreira", label: "Barreira"}, {id: "meio_fio", label: "Meio fio"}, {id: "defensa_metalica", label: "Defensa metálica"}])}
            <Input placeholder="Outros" onChange={e => handleValueChange('pista', 'obstaculo_acostamento_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>
        <Field label="Obras no acostamento">{renderRadioGroup('pista', 'obras_acostamento', [{id: "nao_existe", label: "Não existe"}, {id: "existe_mal_sinalizada", label: "Existe mal sinalizada"}, {id: "existe_bem_sinalizada", label: "Existe bem sinalizada"}])}</Field>
        <Field label="Estado de conservação">{renderRadioGroup('pista', 'conservacao', [{id: "bom", label: "Bom"}, {id: "ruim", label: "Ruim"}])}</Field>
        <Field label="Interseções na pista">{renderRadioGroup('pista', 'intersecoes', [{id: 'cruzamento_entroncamento', label: 'Cruzamento/entroncamento'}, {id: 'trevo', label: 'Trevo'}, {id: 'rotatoria', label: 'Rotatória'}, {id: 'nao_existe', label: 'Não existe'}])}</Field>
        <Field label="Deficiência em obras">
            {renderRadioGroup('pista', 'deficiencia_obras', [{id: 'obstruida', label: 'Obstruída'}, {id: 'interrompida', label: 'Interrompida'}, {id: 'pista_estreita', label: 'Pista estreita'}, {id: 'pista_fechada', label: 'Pista fechada'}, {id: 'sublevacao_negativa', label: 'Sublevação negativa'}, {id: 'ondulada', label: 'Ondulada'}, {id: 'nao_existe', label: 'Não existe'}])}
            <Input placeholder="Outros" onChange={e => handleValueChange('pista', 'deficiencia_obras_outros', e.target.value)} className="mt-2 text-xl"/>
        </Field>
        <Field label="Obras de arte">{renderRadioGroup('pista', 'obras_arte', [{id: 'ponte', label: 'Ponte'}, {id: 'tunel', label: 'Túnel'}, {id: 'passagem_superior', label: 'Passagem superior'}, {id: 'passagem_inferior', label: 'Passagem inferior'}, {id: 'nao_existe', label: 'Não existe'}])}</Field>
        <Field label="Local">{renderRadioGroup('pista', 'local', [{id: 'canteiro_central', label: 'Canteiro central'}, {id: 'faixa_dominio', label: 'Faixa de domínio'}, {id: 'acostamento_norte', label: 'Acostamento norte'}, {id: 'acostamento_sul', label: 'Acostamento Sul'}, {id: 'faixa_rolamento', label: 'Faixa de rolamento'}, {id: 'acostamento', label: 'Acostamento'}])}</Field>

        <SectionTitle>SINALIZAÇÃO</SectionTitle>
        <Field label="Sinalização vertical (placas, banners, postes)">{renderRadioGroup('sinalizacao', 'vertical', [{id: 'existe', label: 'Existe'}, {id: 'nao_existe', label: 'Não existe'}])}</Field>
        <Field label="Sinalização horizontal (faixa de bordo, faixa segmentada, pintura de pista...)">{renderRadioGroup('sinalizacao', 'horizontal', [{id: 'existe', label: 'Existe'}, {id: 'nao_existe', label: 'Não existe'}])}</Field>
        <Field label="Sinalização semáforo">{renderRadioGroup('sinalizacao', 'semaforo', [{id: 'funciona', label: 'Funciona'}, {id: 'nao_funciona', label: 'Não funciona'}, {id: 'funciona_defeito', label: 'Funciona com defeito'}, {id: 'inexistente', label: 'Inexistente'}])}</Field>

        <div className="flex sm:flex-row gap-4 pt-6">
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 uppercase text-base" disabled={isSaving}>
              <Share className="mr-2 h-4 w-4" />
              Compartilhar WhatsApp
          </Button>
          <Button size="lg" className="w-32 bg-primary hover:bg-primary/90 uppercase text-base" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

