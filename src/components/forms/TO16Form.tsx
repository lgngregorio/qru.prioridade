
'use client';

import { useRouter } from 'next/navigation';
import { Save, Share, Loader2, PlusCircle, Trash2, X, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import React from 'react';

import { cn } from '@/lib/utils';
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

const SectionTitle = ({ children, onClear }: { children: React.ReactNode, onClear?: () => void }) => (
    <div className="flex items-center justify-between mt-8 mb-4 border-b-2 border-foreground pb-2">
        <h2 className="text-xl font-semibold text-foreground uppercase">
            {children}
        </h2>
        {onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="flex items-center gap-2 text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
                Limpar
            </Button>
        )}
    </div>
);

interface ListItem {
  id: number;
  value: string;
}

interface Victim {
  id: number;
  dados_cadastrais: any;
  evento: any;
  veiculo: any;
  avaliacao: any;
  avaliacao_primaria: any;
  avaliacao_secundaria: any;
  escala_glasgow: any;
  procedimentos_realizados: any;
  rol_valores: ListItem[];
  equipamentos_retidos: ListItem[];
  conduta: any;
  termo_recusa: any;
}


export default function TO16Form({ categorySlug }: { categorySlug: string }) {
  const [dadosOperacionais, setDadosOperacionais] = useState<any>({});
  const [victims, setVictims] = useState<Victim[]>([
    { 
      id: 1, 
      dados_cadastrais: {},
      evento: {},
      veiculo: {},
      avaliacao: {},
      avaliacao_primaria: {},
      avaliacao_secundaria: {},
      escala_glasgow: {},
      procedimentos_realizados: {},
      rol_valores: [],
      equipamentos_retidos: [],
      conduta: {},
      termo_recusa: {} 
    }
  ]);
  const [consumoMateriais, setConsumoMateriais] = useState<ListItem[]>([]);
  const [relatorio, setRelatorio] = useState('');
  const { toast } = useToast();

  const handleVictimChange = (victimId: number, section: keyof Victim, key: string, value: any) => {
    setVictims(prev => prev.map(v => v.id === victimId ? { ...v, [section]: { ...v[section], [key]: value } } : v));
  };
  
  const handleVictimCheckboxChange = (victimId: number, section: keyof Victim, key: string, id: string, checked: boolean) => {
    setVictims(prevVictims => prevVictims.map(victim => {
        if (victim.id === victimId) {
            const currentSection = victim[section] as any;
            const currentValues = currentSection[key] || [];
            const newValues = checked ? [...currentValues, id] : currentValues.filter((v: string) => v !== id);
            return {
                ...victim,
                [section]: {
                    ...currentSection,
                    [key]: newValues
                }
            };
        }
        return victim;
    }));
  };

  const addVictim = () => {
    setVictims(prev => [...prev, { 
      id: Date.now(), 
      dados_cadastrais: {},
      evento: {},
      veiculo: {},
      avaliacao: {},
      avaliacao_primaria: {},
      avaliacao_secundaria: {},
      escala_glasgow: {},
      procedimentos_realizados: {},
      rol_valores: [],
      equipamentos_retidos: [],
      conduta: {},
      termo_recusa: {} 
    }]);
  };
  
  const removeVictim = (victimId: number) => {
      setVictims(prev => prev.filter(v => v.id !== victimId));
  }


  const addListItem = (setter: React.Dispatch<React.SetStateAction<ListItem[]>>) => {
    setter(prev => [...prev, { id: Date.now(), value: '' }]);
  };

  const removeListItem = (id: number, setter: React.Dispatch<React.SetStateAction<ListItem[]>>) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  const updateListItem = (id: number, value: string, setter: React.Dispatch<React.SetStateAction<ListItem[]>>) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, value } : item));
  };
  
  const renderListSection = (title: string, list: ListItem[], setList: React.Dispatch<React.SetStateAction<ListItem[]>>) => (
    <>
      <SectionTitle onClear={() => setList([])}>{title}</SectionTitle>
      <div className="space-y-4">
        {list.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-2 border rounded-lg">
            <Input className="text-xl flex-1" value={item.value} onChange={e => updateListItem(item.id, e.target.value, setList)} />
            <Button variant="destructive" size="icon" onClick={() => removeListItem(item.id, setList)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" className="w-full" onClick={() => addListItem(setList)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Item
        </Button>
      </div>
    </>
  );
  

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        <SectionTitle>DADOS OPERACIONAIS DA EQUIPE DE APH</SectionTitle>
        {/* ... DADOS OPERACIONAIS form fields ... */}

        {victims.map((victim, index) => (
            <div key={victim.id} className="border-2 border-dashed border-primary/50 p-6 rounded-lg mt-8 relative">
                {victims.length > 1 && <Button variant="destructive" size="icon" className="absolute -top-4 -right-4 rounded-full" onClick={() => removeVictim(victim.id)}><Trash2 className="h-4 w-4" /></Button>}
                <h2 className="text-2xl font-bold text-primary mb-6">VÍTIMA {index + 1}</h2>

                <SectionTitle>DADOS CADASTRAIS DO USUÁRIO</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="Nome"><Input className="text-xl" value={victim.dados_cadastrais.nome || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'nome', e.target.value)} /></Field>
                    <Field label="Endereço"><Input className="text-xl" value={victim.dados_cadastrais.endereco || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'endereco', e.target.value)} /></Field>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
                    <Field label="Sexo"><RadioGroup value={victim.dados_cadastrais.sexo || ''} onValueChange={v => handleVictimChange(victim.id, 'dados_cadastrais', 'sexo', v)}><RadioGroupItem value="M" id={`sexo-m-${victim.id}`} /><Label htmlFor={`sexo-m-${victim.id}`}>M</Label><RadioGroupItem value="F" id={`sexo-f-${victim.id}`} /><Label htmlFor={`sexo-f-${victim.id}`}>F</Label></RadioGroup></Field>
                    <Field label="DN"><Input type="date" className="text-xl" value={victim.dados_cadastrais.dn || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'dn', e.target.value)} /></Field>
                    <Field label="Idade"><Input type="number" className="text-xl" value={victim.dados_cadastrais.idade || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'idade', e.target.value)} /></Field>
                    <Field label="Telefone"><Input className="text-xl" value={victim.dados_cadastrais.telefone || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'telefone', e.target.value)} /></Field>
                    <Field label="CPF"><Input className="text-xl" value={victim.dados_cadastrais.cpf || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'cpf', e.target.value)} /></Field>
                    <Field label="RG"><Input className="text-xl" value={victim.dados_cadastrais.rg || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'rg', e.target.value)} /></Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <Field label="Acompanhante do Usuário"><Input className="text-xl" value={victim.dados_cadastrais.acompanhante || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'acompanhante', e.target.value)} /></Field>
                    <Field label="Posição no Veículo"><Input className="text-xl" value={victim.dados_cadastrais.posicao_veiculo || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'posicao_veiculo', e.target.value)} /></Field>
                </div>

                <SectionTitle>EVENTO</SectionTitle>
                {/* ... Evento form fields for the victim ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Field label="Tipo de Veículo"><Input className="text-xl" value={victim.veiculo.tipo || ''} onChange={e => handleVictimChange(victim.id, 'veiculo', 'tipo', e.target.value)}/></Field>
                    <Field label="Placa"><Input className="text-xl" value={victim.veiculo.placa || ''} onChange={e => handleVictimChange(victim.id, 'veiculo', 'placa', e.target.value)}/></Field>
                </div>

                <SectionTitle>AVALIAÇÃO</SectionTitle>
                {/* ... Avaliação form fields for the victim ... */}
                
                 <SectionTitle>ESCALA DE COMA DE GLASGOW</SectionTitle>
                {/* ... Glasgow form fields for the victim ... */}

                <SectionTitle>PROCEDIMENTOS REALIZADOS</SectionTitle>
                {/* ... Procedimentos form fields for the victim ... */}
                
                {renderListSection("ROL DE VALORES/PERTENCES", victim.rol_valores, (newList) => setVictims(victims.map(v => v.id === victim.id ? {...v, rol_valores: newList} : v)))}

                {renderListSection("EQUIPAMENTO/MATERIAIS RETIDOS", victim.equipamentos_retidos, (newList) => setVictims(victims.map(v => v.id === victim.id ? {...v, equipamentos_retidos: newList} : v)))}
            
                <SectionTitle>CONDUTA</SectionTitle>
                {/* ... Conduta form fields for the victim ... */}

                <SectionTitle>TERMO DE RECUSA</SectionTitle>
                {/* ... Termo de Recusa form fields for the victim ... */}
            </div>
        ))}

        <Button variant="outline" className="w-full" onClick={addVictim}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Vítima</Button>

        {renderListSection("CONSUMO DE MATERIAIS NO ATENDIMENTO", consumoMateriais, setConsumoMateriais)}

        <SectionTitle>RELATÓRIO/OBSERVAÇÕES</SectionTitle>
        <Textarea className="text-xl min-h-[200px]" value={relatorio} onChange={(e) => setRelatorio(e.target.value)} />

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
