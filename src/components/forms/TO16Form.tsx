
'use client';

import { useRouter } from 'next/navigation';
import { Save, Share, Loader2, PlusCircle, Trash2, X, Eye } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

function Field({ label, children, className }: { label?: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {label && <Label className="text-xl font-semibold uppercase">{label}</Label>}
      {children}
    </div>
  )
}

const SectionTitle = ({ children, onToggle, isOpen }: { children: React.ReactNode; onToggle?: () => void, isOpen?: boolean }) => (
    <div className="flex items-center justify-between mt-8 mb-4 border-b-2 border-foreground pb-2">
        <h2 className={cn("text-xl font-semibold text-foreground uppercase")}>
            {children}
        </h2>
        {onToggle && (
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onToggle}>
                    {isOpen ? <X className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    <span className="sr-only">{isOpen ? 'Ocultar' : 'Restaurar'}</span>
                </Button>
            </CollapsibleTrigger>
        )}
    </div>
);

const SubSectionTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className="flex items-center justify-between mt-4 mb-2">
      <h3 className={cn("text-lg font-semibold text-foreground uppercase pb-2", className)}>
          {children}
      </h3>
  </div>
);


interface ListItem {
  id: number;
  material: string;
  quantidade: string;
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
  openSections: { [key: string]: boolean };
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
      avaliacao_secundaria: { sinais_vitais: {} },
      escala_glasgow: {},
      procedimentos_realizados: {},
      rol_valores: [],
      equipamentos_retidos: [],
      conduta: {},
      termo_recusa: {},
      openSections: {
        dados_cadastrais: true,
        evento: true,
        avaliacao_container: true,
        glasgow: true,
        procedimentos: true,
        rol_valores: true,
        equipamentos_retidos: true,
        conduta: true,
        termo_recusa: true,
      }
    }
  ]);
  const [openOperationalData, setOpenOperationalData] = useState(true);
  const [openConsumo, setOpenConsumo] = useState(true);
  const [openRelatorio, setOpenRelatorio] = useState(true);

  const [consumoMateriais, setConsumoMateriais] = useState<ListItem[]>([]);
  const [relatorio, setRelatorio] = useState('');
  const { toast } = useToast();

  const handleOperationalDataChange = (key: string, value: any) => {
    setDadosOperacionais((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleVictimChange = (victimId: number, section: keyof Omit<Victim, 'id' | 'rol_valores' | 'equipamentos_retidos' | 'openSections'>, key: string, value: any) => {
    setVictims(prev => prev.map(v => {
      if (v.id === victimId) {
        const updatedSection = { ...v[section], [key]: value };
        return { ...v, [section]: updatedSection };
      }
      return v;
    }));
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
  
  const toggleVictimSection = (victimId: number, sectionKey: string) => {
    setVictims(prev => prev.map(v => {
      if (v.id === victimId) {
        return {
          ...v,
          openSections: {
            ...v.openSections,
            [sectionKey]: !v.openSections[sectionKey]
          }
        }
      }
      return v;
    }))
  }

  const addVictim = () => {
    setVictims(prev => [...prev, { 
      id: Date.now(), 
      dados_cadastrais: {},
      evento: {},
      veiculo: {},
      avaliacao: {},
      avaliacao_primaria: {},
      avaliacao_secundaria: { sinais_vitais: {} },
      escala_glasgow: {},
      procedimentos_realizados: {},
      rol_valores: [],
      equipamentos_retidos: [],
      conduta: {},
      termo_recusa: {},
      openSections: {
        dados_cadastrais: true,
        evento: true,
        avaliacao_container: true,
        glasgow: true,
        procedimentos: true,
        rol_valores: true,
        equipamentos_retidos: true,
        conduta: true,
        termo_recusa: true,
      }
    }]);
  };
  
  const removeVictim = (victimId: number) => {
      setVictims(prev => prev.filter(v => v.id !== victimId));
  }

  const addListItem = (victimId: number, listType: 'rol_valores' | 'equipamentos_retidos') => {
    setVictims(prev => prev.map(v => {
      if (v.id === victimId) {
        return { ...v, [listType]: [...v[listType], { id: Date.now(), material: '', quantidade: '' }] };
      }
      return v;
    }));
  };

  const removeListItem = (victimId: number, listType: 'rol_valores' | 'equipamentos_retidos', itemId: number) => {
    setVictims(prev => prev.map(v => {
      if (v.id === victimId) {
        return { ...v, [listType]: v[listType].filter(item => item.id !== itemId) };
      }
      return v;
    }));
  };

  const updateListItem = (victimId: number, listType: 'rol_valores' | 'equipamentos_retidos', itemId: number, field: 'material' | 'quantidade', value: string) => {
    setVictims(prev => prev.map(v => {
      if (v.id === victimId) {
        return { ...v, [listType]: v[listType].map(item => item.id === itemId ? { ...item, [field]: value } : item) };
      }
      return v;
    }));
  };
  
  const addConsumoItem = () => {
    setConsumoMateriais(prev => [...prev, { id: Date.now(), material: '', quantidade: '' }]);
  };

  const removeConsumoItem = (id: number) => {
    setConsumoMateriais(prev => prev.filter(item => item.id !== id));
  };
  
  const updateConsumoItem = (id: number, field: 'material' | 'quantidade', value: string) => {
    setConsumoMateriais(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateGlasgow = (victim: Victim) => {
    const ocular = parseInt(victim.escala_glasgow?.abertura_ocular || '0', 10);
    const verbal = parseInt(victim.escala_glasgow?.resposta_verbal || '0', 10);
    const motora = parseInt(victim.escala_glasgow?.resposta_motora || '0', 10);
    return ocular + verbal + motora;
  }

  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        <Collapsible open={openOperationalData} onOpenChange={setOpenOperationalData}>
            <SectionTitle onToggle={() => setOpenOperationalData(prev => !prev)} isOpen={openOperationalData}>DADOS OPERACIONAIS DA EQUIPE DE APH</SectionTitle>
            <CollapsibleContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Field label="UR/USA">
                        <RadioGroup value={dadosOperacionais.ur_usa || ''} onValueChange={(v) => handleOperationalDataChange('ur_usa', v)} className="flex flex-row space-y-0 gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="ur" id="op-ur" /><Label htmlFor="op-ur" className="font-normal text-xl">UR</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="usa" id="op-usa" /><Label htmlFor="op-usa" className="font-normal text-xl">USA</Label></div>
                        </RadioGroup>
                    </Field>
                    <Field label="Médico Regulador"><Input className="text-xl" value={dadosOperacionais.medico_regulador || ''} onChange={(e) => handleOperationalDataChange('medico_regulador', e.target.value)} /></Field>
                    <Field label="Condutor"><Input className="text-xl" value={dadosOperacionais.condutor || ''} onChange={(e) => handleOperationalDataChange('condutor', e.target.value)} /></Field>
                    <Field label="Resgatista I"><Input className="text-xl" value={dadosOperacionais.resgatista || ''} onChange={(e) => handleOperationalDataChange('resgatista', e.target.value)} /></Field>
                    <Field label="Data"><Input type="date" className="text-xl" value={dadosOperacionais.data || ''} onChange={(e) => handleOperationalDataChange('data', e.target.value)} /></Field>
                    <Field label="Nº Ocorrência"><Input className="text-xl" value={dadosOperacionais.n_ocorrencia || ''} onChange={(e) => handleOperationalDataChange('n_ocorrencia', e.target.value)} /></Field>
                    <Field label="KM"><Input className="text-xl" value={dadosOperacionais.km || ''} onChange={(e) => handleOperationalDataChange('km', e.target.value)} /></Field>
                    <Field label="Sentido">
                        <RadioGroup value={dadosOperacionais.sentido || ''} onValueChange={(v) => handleOperationalDataChange('sentido', v)} className="flex flex-row space-y-0 gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="norte" id="op-norte" /><Label htmlFor="op-norte" className="font-normal text-xl">Norte</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="sul" id="op-sul" /><Label htmlFor="op-sul" className="font-normal text-xl">Sul</Label></div>
                        </RadioGroup>
                    </Field>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">
                    <Field label="Acionamento"><Input type="time" className="text-xl" value={dadosOperacionais.acionamento || ''} onChange={(e) => handleOperationalDataChange('acionamento', e.target.value)} /></Field>
                    <Field label="Chegada no Local"><Input type="time" className="text-xl" value={dadosOperacionais.chegada_local || ''} onChange={(e) => handleOperationalDataChange('chegada_local', e.target.value)} /></Field>
                    <Field label="Saída do Local"><Input type="time" className="text-xl" value={dadosOperacionais.saida_local || ''} onChange={(e) => handleOperationalDataChange('saida_local', e.target.value)} /></Field>
                    <Field label="Chegada no Hospital"><Input type="time" className="text-xl" value={dadosOperacionais.chegada_hospital || ''} onChange={(e) => handleOperationalDataChange('chegada_hospital', e.target.value)} /></Field>
                    <Field label="Saída do Hospital"><Input type="time" className="text-xl" value={dadosOperacionais.saida_hospital || ''} onChange={(e) => handleOperationalDataChange('saida_hospital', e.target.value)} /></Field>
                    <Field label="Chegada BSO/Término"><Input type="time" className="text-xl" value={dadosOperacionais.chegada_bso || ''} onChange={(e) => handleOperationalDataChange('chegada_bso', e.target.value)} /></Field>
                </div>
            </CollapsibleContent>
        </Collapsible>


        {victims.map((victim, index) => (
            <div key={victim.id} className="border-2 border-dashed border-primary/50 p-6 rounded-lg mt-8 relative">
                {victims.length > 1 && <Button variant="destructive" size="icon" className="absolute -top-4 -right-4 rounded-full" onClick={() => removeVictim(victim.id)}><Trash2 className="h-4 w-4" /></Button>}
                <h2 className="text-2xl font-bold text-primary mb-6">VÍTIMA {index + 1}</h2>

                <Collapsible open={victim.openSections.dados_cadastrais} onOpenChange={() => toggleVictimSection(victim.id, 'dados_cadastrais')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'dados_cadastrais')} isOpen={victim.openSections.dados_cadastrais}>DADOS CADASTRAIS DO USUÁRIO</SectionTitle>
                    <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Field label="Nome"><Input className="text-xl" value={victim.dados_cadastrais.nome || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'nome', e.target.value)} /></Field>
                            <Field label="Endereço"><Input className="text-xl" value={victim.dados_cadastrais.endereco || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'endereco', e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
                            <Field label="Sexo">
                                <RadioGroup value={victim.dados_cadastrais.sexo || ''} onValueChange={v => handleVictimChange(victim.id, 'dados_cadastrais', 'sexo', v)} className="flex flex-row space-y-0 gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="M" id={`sexo-m-${victim.id}`} /><Label htmlFor={`sexo-m-${victim.id}`} className="font-normal text-xl">M</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="F" id={`sexo-f-${victim.id}`} /><Label htmlFor={`sexo-f-${victim.id}`} className="font-normal text-xl">F</Label></div>
                                </RadioGroup>
                            </Field>
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
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible open={victim.openSections.evento} onOpenChange={() => toggleVictimSection(victim.id, 'evento')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'evento')} isOpen={victim.openSections.evento}>EVENTO</SectionTitle>
                    <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <Field label="Trauma">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2"><Checkbox id={`trauma-acidente-${victim.id}`} checked={victim.evento?.trauma?.includes('acidente')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'trauma', 'acidente', !!c)} /><Label htmlFor={`trauma-acidente-${victim.id}`} className="font-normal text-xl">Acidente Automobilístico</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`trauma-queimadura-${victim.id}`} checked={victim.evento?.trauma?.includes('queimadura')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'trauma', 'queimadura', !!c)} /><Label htmlFor={`trauma-queimadura-${victim.id}`} className="font-normal text-xl">Queimadura</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`trauma-atropelamento-${victim.id}`} checked={victim.evento?.trauma?.includes('atropelamento')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'trauma', 'atropelamento', !!c)} /><Label htmlFor={`trauma-atropelamento-${victim.id}`} className="font-normal text-xl">Atropelamento</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`trauma-queda-${victim.id}`} checked={victim.evento?.trauma?.includes('queda')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'trauma', 'queda', !!c)} /><Label htmlFor={`trauma-queda-${victim.id}`} className="font-normal text-xl">Queda de Altura</Label></div>
                                    <Input placeholder="Outros" className="mt-2 text-xl" value={victim.evento.trauma_outros || ''} onChange={(e) => handleVictimChange(victim.id, 'evento', 'trauma_outros', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Atendimento Clínico">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-mal-${victim.id}`} checked={victim.evento?.clinico?.includes('mal_subito')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'mal_subito', !!c)} /><Label htmlFor={`clinico-mal-${victim.id}`} className="font-normal text-xl">Mal Súbito</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-intoxicacao-${victim.id}`} checked={victim.evento?.clinico?.includes('intoxicacao')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'intoxicacao', !!c)} /><Label htmlFor={`clinico-intoxicacao-${victim.id}`} className="font-normal text-xl">Intoxicação Exógena</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-parto-${victim.id}`} checked={victim.evento?.clinico?.includes('parto')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'parto', !!c)} /><Label htmlFor={`clinico-parto-${victim.id}`} className="font-normal text-xl">Assistência ao Parto</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-convulsao-${victim.id}`} checked={victim.evento?.clinico?.includes('convulsao')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'convulsao', !!c)} /><Label htmlFor={`clinico-convulsao-${victim.id}`} className="font-normal text-xl">Convulsão</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-psiquiatrico-${victim.id}`} checked={victim.evento?.clinico?.includes('psiquiatrico')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'psiquiatrico', !!c)} /><Label htmlFor={`clinico-psiquiatrico-${victim.id}`} className="font-normal text-xl">Distúrbio Psiquiátrico</Label></div>
                                    <Input placeholder="Outros" className="mt-2 text-xl" value={victim.evento.clinico_outros || ''} onChange={(e) => handleVictimChange(victim.id, 'evento', 'clinico_outros', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Condições de Segurança">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2"><Checkbox id={`seg-cinto-${victim.id}`} checked={victim.evento?.seguranca?.includes('cinto')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'seguranca', 'cinto', !!c)} /><Label htmlFor={`seg-cinto-${victim.id}`} className="font-normal text-xl">Cinto de Segurança</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`seg-cadeirinha-${victim.id}`} checked={victim.evento?.seguranca?.includes('cadeirinha')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'seguranca', 'cadeirinha', !!c)} /><Label htmlFor={`seg-cadeirinha-${victim.id}`} className="font-normal text-xl">Cadeirinha</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`seg-airbag-${victim.id}`} checked={victim.evento?.seguranca?.includes('airbag')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'seguranca', 'airbag', !!c)} /><Label htmlFor={`seg-airbag-${victim.id}`} className="font-normal text-xl">Air Bag</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`seg-capacete-${victim.id}`} checked={victim.evento?.seguranca?.includes('capacete')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'seguranca', 'capacete', !!c)} /><Label htmlFor={`seg-capacete-${victim.id}`} className="font-normal text-xl">Capacete</Label></div>
                                    <Input placeholder="Outros" className="mt-2 text-xl" value={victim.evento.seguranca_outros || ''} onChange={(e) => handleVictimChange(victim.id, 'evento', 'seguranca_outros', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Cinemática">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2"><Checkbox id={`cin-colisao-${victim.id}`} checked={victim.evento?.cinematica?.includes('colisao')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'cinematica', 'colisao', !!c)} /><Label htmlFor={`cin-colisao-${victim.id}`} className="font-normal text-xl">Colisão</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`cin-capotamento-${victim.id}`} checked={victim.evento?.cinematica?.includes('capotamento')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'cinematica', 'capotamento', !!c)} /><Label htmlFor={`cin-capotamento-${victim.id}`} className="font-normal text-xl">Capotamento</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`cin-atropelamento-${victim.id}`} checked={victim.evento?.cinematica?.includes('atropelamento')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'cinematica', 'atropelamento', !!c)} /><Label htmlFor={`cin-atropelamento-${victim.id}`} className="font-normal text-xl">Atropelamento</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`cin-queda-${victim.id}`} checked={victim.evento?.cinematica?.includes('queda')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'cinematica', 'queda', !!c)} /><Label htmlFor={`cin-queda-${victim.id}`} className="font-normal text-xl">Queda</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`cin-tombamento-${victim.id}`} checked={victim.evento?.cinematica?.includes('tombamento')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'cinematica', 'tombamento', !!c)} /><Label htmlFor={`cin-tombamento-${victim.id}`} className="font-normal text-xl">Tombamento</Label></div>
                                    <Input placeholder="Outros" className="mt-2 text-xl" value={victim.evento.cinematica_outros || ''} onChange={(e) => handleVictimChange(victim.id, 'evento', 'cinematica_outros', e.target.value)} />
                                </div>
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <Field label="Tipo de Veículo"><Input className="text-xl" value={victim.veiculo.tipo || ''} onChange={e => handleVictimChange(victim.id, 'veiculo', 'tipo', e.target.value)}/></Field>
                            <Field label="Placa"><Input className="text-xl" value={victim.veiculo.placa || ''} onChange={e => handleVictimChange(victim.id, 'veiculo', 'placa', e.target.value)}/></Field>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                
                <Collapsible open={victim.openSections.avaliacao_container} onOpenChange={() => toggleVictimSection(victim.id, 'avaliacao_container')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'avaliacao_container')} isOpen={victim.openSections.avaliacao_container}>AVALIAÇÃO</SectionTitle>
                    <CollapsibleContent>
                        <div className="space-y-4">
                        <Field label="Condição Inicial">
                            <RadioGroup value={victim.avaliacao.condicao_inicial || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao', 'condicao_inicial', v)} className="flex flex-wrap gap-x-4 gap-y-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="alerta" id={`ci-alerta-${victim.id}`} /><Label htmlFor={`ci-alerta-${victim.id}`} className="font-normal text-xl">Alerta</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="verbaliza" id={`ci-verbaliza-${victim.id}`} /><Label htmlFor={`ci-verbaliza-${victim.id}`} className="font-normal text-xl">Verbaliza</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="doloroso" id={`ci-doloroso-${victim.id}`} /><Label htmlFor={`ci-doloroso-${victim.id}`} className="font-normal text-xl">Estímulo Doloroso</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="inconsciente" id={`ci-inconsciente-${victim.id}`} /><Label htmlFor={`ci-inconsciente-${victim.id}`} className="font-normal text-xl">Inconsciente</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="deambulando" id={`ci-deambulando-${victim.id}`} /><Label htmlFor={`ci-deambulando-${victim.id}`} className="font-normal text-xl">Deambulando</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="ao_solo" id={`ci-ao_solo-${victim.id}`} /><Label htmlFor={`ci-ao_solo-${victim.id}`} className="font-normal text-xl">Ao Solo</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="ejetado" id={`ci-ejetado-${victim.id}`} /><Label htmlFor={`ci-ejetado-${victim.id}`} className="font-normal text-xl">Ejetado</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="encarcerado_retido" id={`ci-encarcerado_retido-${victim.id}`} /><Label htmlFor={`ci-encarcerado_retido-${victim.id}`} className="font-normal text-xl">Encarcerado/Retido</Label></div>
                            </RadioGroup>
                        </Field>
                        </div>
                        <SubSectionTitle>Avaliação Primária</SubSectionTitle>
                        <div className="space-y-4">
                            <Field label="X - Hemorragia Exsanguinante">
                                <RadioGroup value={victim.avaliacao_primaria.hemorragia || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'hemorragia', v)} className="flex flex-row space-y-0 gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="nao" id={`hemo-nao-${victim.id}`} /><Label htmlFor={`hemo-nao-${victim.id}`} className="font-normal text-xl">Não</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="sim" id={`hemo-sim-${victim.id}`} /><Label htmlFor={`hemo-sim-${victim.id}`} className="font-normal text-xl">Sim</Label></div>
                                </RadioGroup>
                            </Field>
                            <Field label="A - Vias Aéreas">
                                <div className="flex items-center gap-4">
                                    <RadioGroup value={victim.avaliacao_primaria.vias_aereas_status || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'vias_aereas_status', v)} className="flex flex-row space-y-0 gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="pervias" id={`vias-pervias-${victim.id}`} /><Label htmlFor={`vias-pervias-${victim.id}`} className="font-normal text-xl">Pérvias</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="obstruidas" id={`vias-obstruidas-${victim.id}`} /><Label htmlFor={`vias-obstruidas-${victim.id}`} className="font-normal text-xl">Obstruídas por:</Label></div>
                                </RadioGroup>
                                <Input className="text-xl" value={victim.avaliacao_primaria.vias_aereas_obs || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_primaria', 'vias_aereas_obs', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="B - Ventilação">
                                <RadioGroup value={victim.avaliacao_primaria.ventilacao_status || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'ventilacao_status', v)} className="flex flex-wrap gap-x-4 gap-y-2">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="presente" id={`vent-presente-${victim.id}`} /><Label htmlFor={`vent-presente-${victim.id}`} className="font-normal text-xl">Presente</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="ausente" id={`vent-ausente-${victim.id}`} /><Label htmlFor={`vent-ausente-${victim.id}`} className="font-normal text-xl">Ausente</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="simetrica" id={`vent-simetrica-${victim.id}`} /><Label htmlFor={`vent-simetrica-${victim.id}`} className="font-normal text-xl">Simétrica</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="assimetrica" id={`vent-assimetrica-${victim.id}`} /><Label htmlFor={`vent-assimetrica-${victim.id}`} className="font-normal text-xl">Assimétrica</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="apneia" id={`vent-apneia-${victim.id}`} /><Label htmlFor={`vent-apneia-${victim.id}`} className="font-normal text-xl">Apneia</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="eupneia" id={`vent-eupneia-${victim.id}`} /><Label htmlFor={`vent-eupneia-${victim.id}`} className="font-normal text-xl">Eupneia</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="taquipneia" id={`vent-taquipneia-${victim.id}`} /><Label htmlFor={`vent-taquipneia-${victim.id}`} className="font-normal text-xl">Taquipneia</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="gasping" id={`vent-gasping-${victim.id}`} /><Label htmlFor={`vent-gasping-${victim.id}`} className="font-normal text-xl">Gasping</Label></div>
                            </RadioGroup>
                            </Field>
                            <SubSectionTitle>C - Circulação e Hemorragias</SubSectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Field label="Pulso">
                                <RadioGroup value={victim.avaliacao_primaria.pulso || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'pulso', v)} className="flex flex-row space-y-0 gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="presente" id={`pulso-presente-${victim.id}`} /><Label htmlFor={`pulso-presente-${victim.id}`} className="font-normal text-xl">Presente</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="cheio" id={`pulso-cheio-${victim.id}`} /><Label htmlFor={`pulso-cheio-${victim.id}`} className="font-normal text-xl">Cheio</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="filiforme" id={`pulso-filiforme-${victim.id}`} /><Label htmlFor={`pulso-filiforme-${victim.id}`} className="font-normal text-xl">Filiforme</Label></div>
                                </RadioGroup>
                            </Field>
                            <Field label="Pele">
                                <RadioGroup value={victim.avaliacao_primaria.pele || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'pele', v)} className="flex flex-row space-y-0 gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="normal" id={`pele-normal-${victim.id}`} /><Label htmlFor={`pele-normal-${victim.id}`} className="font-normal text-xl">Normal</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="fria" id={`pele-fria-${victim.id}`} /><Label htmlFor={`pele-fria-${victim.id}`} className="font-normal text-xl">Fria</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="sudorese" id={`pele-sudorese-${victim.id}`} /><Label htmlFor={`pele-sudorese-${victim.id}`} className="font-normal text-xl">Sudorese</Label></div>
                                </RadioGroup>
                            </Field>
                            <Field label="Perfusão">
                                <RadioGroup value={victim.avaliacao_primaria.perfusao || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'perfusao', v)} className="flex flex-row space-y-0 gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="<2seg" id={`perf-menor-${victim.id}`} /><Label htmlFor={`perf-menor-${victim.id}`} className="font-normal text-xl">&lt; 2seg</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value=">2seg" id={`perf-maior-${victim.id}`} /><Label htmlFor={`perf-maior-${victim.id}`} className="font-normal text-xl">&gt; 2seg</Label></div>
                                </RadioGroup>
                            </Field>
                            </div>
                            <Field label="Sangramento Ativo">
                                <RadioGroup value={victim.avaliacao_primaria.sangramento || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'sangramento', v)} className="flex flex-row space-y-0 gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="presente" id={`sang-presente-${victim.id}`} /><Label htmlFor={`sang-presente-${victim.id}`} className="font-normal text-xl">Presente</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="ausente" id={`sang-ausente-${victim.id}`} /><Label htmlFor={`sang-ausente-${victim.id}`} className="font-normal text-xl">Ausente</Label></div>
                            </RadioGroup>
                            </Field>
                            <SubSectionTitle>D - Neurológico: Glasgow e Pupilas</SubSectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Field label="Pupilas">
                                    <RadioGroup value={victim.avaliacao_primaria.pupilas || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'pupilas', v)} className="flex flex-row space-y-0 gap-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="isocoricas" id={`pupilas-iso-${victim.id}`} /><Label htmlFor={`pupilas-iso-${victim.id}`} className="font-normal text-xl">Isocóricas</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="anisocoricas" id={`pupilas-aniso-${victim.id}`} /><Label htmlFor={`pupilas-aniso-${victim.id}`} className="font-normal text-xl">Anisocóricas</Label></div>
                                    </RadioGroup>
                                </Field>
                                <Field label="Fotorreagentes">
                                    <RadioGroup value={victim.avaliacao_primaria.fotorreagentes || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'fotorreagentes', v)} className="flex flex-row space-y-0 gap-4">
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="sim" id={`foto-sim-${victim.id}`} /><Label htmlFor={`foto-sim-${victim.id}`} className="font-normal text-xl">Sim</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="nao" id={`foto-nao-${victim.id}`} /><Label htmlFor={`foto-nao-${victim.id}`} className="font-normal text-xl">Não</Label></div>
                                    </RadioGroup>
                                </Field>
                            </div>
                            <SubSectionTitle>E - Exposição</SubSectionTitle>
                            <Field>
                                <RadioGroup value={victim.avaliacao_primaria.exposicao || ''} onValueChange={(v) => handleVictimChange(victim.id, 'avaliacao_primaria', 'exposicao', v)} className="flex flex-wrap gap-x-4 gap-y-2">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="sem_lesoes" id={`expo-sem-${victim.id}`} /><Label htmlFor={`expo-sem-${victim.id}`} className="font-normal text-xl">Sem Lesões Aparentes</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="hipotermia" id={`expo-hipo-${victim.id}`} /><Label htmlFor={`expo-hipo-${victim.id}`} className="font-normal text-xl">Hipotermia</Label></div>
                                </RadioGroup>
                            </Field>
                            <Field label="Lesões Aparentes e Queixas Principais">
                                <Textarea className="text-xl" value={victim.avaliacao_primaria.lesoes_queixas || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_primaria', 'lesoes_queixas', e.target.value)}/>
                            </Field>
                        </div>
                        <SubSectionTitle>Avaliação Secundária</SubSectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <SubSectionTitle>Sinais Vitais</SubSectionTitle>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="PA (mmHg)"><Input className="text-xl" value={victim.avaliacao_secundaria.sinais_vitais?.pa || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'sinais_vitais', { ...victim.avaliacao_secundaria.sinais_vitais, pa: e.target.value })} /></Field>
                                    <Field label="FC (bpm)"><Input type="number" className="text-xl" value={victim.avaliacao_secundaria.sinais_vitais?.fc || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'sinais_vitais', { ...victim.avaliacao_secundaria.sinais_vitais, fc: e.target.value })} /></Field>
                                    <Field label="FR (rpm)"><Input type="number" className="text-xl" value={victim.avaliacao_secundaria.sinais_vitais?.fr || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'sinais_vitais', { ...victim.avaliacao_secundaria.sinais_vitais, fr: e.target.value })} /></Field>
                                    <Field label="Sat O² (%)"><Input type="number" className="text-xl" value={victim.avaliacao_secundaria.sinais_vitais?.sat || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'sinais_vitais', { ...victim.avaliacao_secundaria.sinais_vitais, sat: e.target.value })} /></Field>
                                    <Field label="TAX (°C)"><Input type="number" className="text-xl" value={victim.avaliacao_secundaria.sinais_vitais?.tax || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'sinais_vitais', { ...victim.avaliacao_secundaria.sinais_vitais, tax: e.target.value })} /></Field>
                                    <Field label="DXT (mg/dl)"><Input type="number" className="text-xl" value={victim.avaliacao_secundaria.sinais_vitais?.dxt || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'sinais_vitais', { ...victim.avaliacao_secundaria.sinais_vitais, dxt: e.target.value })} /></Field>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Field label="Alergias"><Textarea className="text-xl" value={victim.avaliacao_secundaria.alergias || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'alergias', e.target.value)} /></Field>
                                <Field label="Medicamentos em Uso"><Textarea className="text-xl" value={victim.avaliacao_secundaria.medicamentos || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'medicamentos', e.target.value)} /></Field>
                                <Field label="Comorbidades/Gestação"><Textarea className="text-xl" value={victim.avaliacao_secundaria.comorbidades || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'comorbidades', e.target.value)} /></Field>
                                <Field label="Última Refeição/Jejum"><Textarea className="text-xl" value={victim.avaliacao_secundaria.ultima_refeicao || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'ultima_refeicao', e.target.value)} /></Field>
                            </div>
                        </div>
                        <Field label="Avaliação Crânio-Caudal">
                            <Textarea className="text-xl" value={victim.avaliacao_secundaria.cranio_caudal || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_secundaria', 'cranio_caudal', e.target.value)}/>
                        </Field>
                    </CollapsibleContent>
                </Collapsible>
                
                <Collapsible open={victim.openSections.glasgow} onOpenChange={() => toggleVictimSection(victim.id, 'glasgow')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'glasgow')} isOpen={victim.openSections.glasgow}>ESCALA DE COMA DE GLASGOW</SectionTitle>
                    <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            <Field label="Abertura Ocular">
                                <RadioGroup value={victim.escala_glasgow.abertura_ocular || ''} onValueChange={v => handleVictimChange(victim.id, 'escala_glasgow', 'abertura_ocular', v)}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="4" id={`ocular-4-${victim.id}`} /><Label htmlFor={`ocular-4-${victim.id}`} className="font-normal text-xl">04 Espontânea</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="3" id={`ocular-3-${victim.id}`} /><Label htmlFor={`ocular-3-${victim.id}`} className="font-normal text-xl">03 Estímulo Verbal</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`ocular-2-${victim.id}`} /><Label htmlFor={`ocular-2-${victim.id}`} className="font-normal text-xl">02 Estímulo Doloroso</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="1" id={`ocular-1-${victim.id}`} /><Label htmlFor={`ocular-1-${victim.id}`} className="font-normal text-xl">01 Ausente</Label></div>
                            </RadioGroup>
                            </Field>
                            <Field label="Resposta Verbal">
                            <RadioGroup value={victim.escala_glasgow.resposta_verbal || ''} onValueChange={v => handleVictimChange(victim.id, 'escala_glasgow', 'resposta_verbal', v)}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="5" id={`verbal-5-${victim.id}`} /><Label htmlFor={`verbal-5-${victim.id}`} className="font-normal text-xl">05 Orientado</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="4" id={`verbal-4-${victim.id}`} /><Label htmlFor={`verbal-4-${victim.id}`} className="font-normal text-xl">04 Confuso</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="3" id={`verbal-3-${victim.id}`} /><Label htmlFor={`verbal-3-${victim.id}`} className="font-normal text-xl">03 Palavras Inapropriadas</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`verbal-2-${victim.id}`} /><Label htmlFor={`verbal-2-${victim.id}`} className="font-normal text-xl">02 Sons Incompreensíveis</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="1" id={`verbal-1-${victim.id}`} /><Label htmlFor={`verbal-1-${victim.id}`} className="font-normal text-xl">01 Ausente</Label></div>
                            </RadioGroup>
                            </Field>
                            <Field label="Resposta Motora">
                            <RadioGroup value={victim.escala_glasgow.resposta_motora || ''} onValueChange={v => handleVictimChange(victim.id, 'escala_glasgow', 'resposta_motora', v)}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="6" id={`motora-6-${victim.id}`} /><Label htmlFor={`motora-6-${victim.id}`} className="font-normal text-xl">06 Obedece a Comandos</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="5" id={`motora-5-${victim.id}`} /><Label htmlFor={`motora-5-${victim.id}`} className="font-normal text-xl">05 Localiza a Dor</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="4" id={`motora-4-${victim.id}`} /><Label htmlFor={`motora-4-${victim.id}`} className="font-normal text-xl">04 Retira o Membro à Dor</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="3" id={`motora-3-${victim.id}`} /><Label htmlFor={`motora-3-${victim.id}`} className="font-normal text-xl">03 Decorticação (Flexão Anormal)</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`motora-2-${victim.id}`} /><Label htmlFor={`motora-2-${victim.id}`} className="font-normal text-xl">02 Descerebração (Extensão Anormal)</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="1" id={`motora-1-${victim.id}`} /><Label htmlFor={`motora-1-${victim.id}`} className="font-normal text-xl">01 Ausente</Label></div>
                            </RadioGroup>
                            </Field>
                        </div>
                        <div className="mt-4 text-right">
                            <p className="text-xl font-bold">TOTAL: {calculateGlasgow(victim)}</p>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                
                <Collapsible open={victim.openSections.procedimentos} onOpenChange={() => toggleVictimSection(victim.id, 'procedimentos')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'procedimentos')} isOpen={victim.openSections.procedimentos}>PROCEDIMENTOS REALIZADOS</SectionTitle>
                    <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {[
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
                            ].map(proc => (
                                <div key={proc.id} className="flex items-center space-x-2">
                                    <Checkbox id={`proc-${proc.id}-${victim.id}`} checked={victim.procedimentos_realizados?.lista?.includes(proc.id)} onCheckedChange={c => handleVictimCheckboxChange(victim.id, 'procedimentos_realizados', 'lista', proc.id, !!c)} />
                                    <Label htmlFor={`proc-${proc.id}-${victim.id}`} className="font-normal text-xl">{proc.label}</Label>
                                </div>
                            ))}
                        </div>
                        <Field label="Outros"><Input className="text-xl mt-2" value={victim.procedimentos_realizados.outros || ''} onChange={e => handleVictimChange(victim.id, 'procedimentos_realizados', 'outros', e.target.value)}/></Field>
                    </CollapsibleContent>
                </Collapsible>
                
                <Collapsible open={victim.openSections.rol_valores} onOpenChange={() => toggleVictimSection(victim.id, 'rol_valores')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'rol_valores')} isOpen={victim.openSections.rol_valores}>ROL DE VALORES/PERTENCES</SectionTitle>
                    <CollapsibleContent>
                        <div className="space-y-4">
                        {victim.rol_valores.map(item => (
                            <div key={item.id} className="flex items-end gap-2 p-2 border rounded-lg">
                            <Field label="MATERIAL" className="flex-1"><Input className="text-xl" value={item.material} onChange={e => updateListItem(victim.id, 'rol_valores', item.id, 'material', e.target.value)} /></Field>
                            <Field label="QTD" className="w-24"><Input type="number" className="text-xl" value={item.quantidade} onChange={e => updateListItem(victim.id, 'rol_valores', item.id, 'quantidade', e.target.value)} /></Field>
                            <Button variant="destructive" size="icon" onClick={() => removeListItem(victim.id, 'rol_valores', item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => addListItem(victim.id, 'rol_valores')}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar</Button>
                        </div>
                        <Field label="Responsável pelo Recebimento (Assinatura)"><Input className="text-xl mt-4" value={victim.rol_valores.responsavel || ''} onChange={e => handleVictimChange(victim.id, 'rol_valores', 'responsavel', e.target.value)}/></Field>
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible open={victim.openSections.equipamentos_retidos} onOpenChange={() => toggleVictimSection(victim.id, 'equipamentos_retidos')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'equipamentos_retidos')} isOpen={victim.openSections.equipamentos_retidos}>EQUIPAMENTO/MATERIAIS RETIDOS</SectionTitle>
                    <CollapsibleContent>
                        <div className="space-y-4">
                        {victim.equipamentos_retidos.map(item => (
                            <div key={item.id} className="flex items-end gap-2 p-2 border rounded-lg">
                            <Field label="MATERIAL" className="flex-1"><Input className="text-xl" value={item.material} onChange={e => updateListItem(victim.id, 'equipamentos_retidos', item.id, 'material', e.target.value)} /></Field>
                            <Field label="QTD" className="w-24"><Input type="number" className="text-xl" value={item.quantidade} onChange={e => updateListItem(victim.id, 'equipamentos_retidos', item.id, 'quantidade', e.target.value)} /></Field>
                            <Button variant="destructive" size="icon" onClick={() => removeListItem(victim.id, 'equipamentos_retidos', item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => addListItem(victim.id, 'equipamentos_retidos')}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar</Button>
                        </div>
                        <Field label="Responsável pelo Recebimento (Assinatura)"><Input className="text-xl mt-4" value={victim.equipamentos_retidos.responsavel || ''} onChange={e => handleVictimChange(victim.id, 'equipamentos_retidos', 'responsavel', e.target.value)}/></Field>
                    </CollapsibleContent>
                </Collapsible>
                
                <Collapsible open={victim.openSections.conduta} onOpenChange={() => toggleVictimSection(victim.id, 'conduta')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'conduta')} isOpen={victim.openSections.conduta}>CONDUTA</SectionTitle>
                    <CollapsibleContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            {[
                                { id: 'liberacao_local', label: 'Liberação no Local c/ Orientações' },
                                { id: 'vitima_em_obito', label: 'Vítima em Óbito' },
                                { id: 'obito_durante_atendimento', label: 'Óbito Durante Atendimento' },
                                { id: 'recusa_atendimento', label: 'Recusa Atendimento' },
                                { id: 'recusa_remocao', label: 'Recusa Remoção à Unidade Hospitalar' },
                            ].map(cond => (
                                <div key={cond.id} className="flex items-center space-x-2">
                                    <Checkbox id={`cond-${cond.id}-${victim.id}`} checked={victim.conduta?.acoes?.includes(cond.id)} onCheckedChange={c => handleVictimCheckboxChange(victim.id, 'conduta', 'acoes', cond.id, !!c)} />
                                    <Label htmlFor={`cond-${cond.id}-${victim.id}`} className="font-normal text-xl">{cond.label}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2 mt-2">
                                <Checkbox id={`cond-terceiros-${victim.id}`} checked={victim.conduta?.removido_por_terceiros} onCheckedChange={c => handleVictimChange(victim.id, 'conduta', 'removido_por_terceiros', !!c)} />
                                <Label htmlFor={`cond-terceiros-${victim.id}`} className="font-normal text-xl">Removido por Terceiros:</Label>
                                <Input className="text-xl" value={victim.conduta.removido_por_terceiros_obs || ''} onChange={e => handleVictimChange(victim.id, 'conduta', 'removido_por_terceiros_obs', e.target.value)}/>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                                <Checkbox id={`cond-hospital-${victim.id}`} checked={victim.conduta?.removido_unidade} onCheckedChange={c => handleVictimChange(victim.id, 'conduta', 'removido_unidade', !!c)} />
                                <Label htmlFor={`cond-hospital-${victim.id}`} className="font-normal text-xl">Removido à Unidade Hospitalar:</Label>
                                <Input className="text-xl" value={victim.conduta.unidade_hospitalar || ''} onChange={e => handleVictimChange(victim.id, 'conduta', 'unidade_hospitalar', e.target.value)}/>
                            </div>
                        </div>
                        <div>
                            <Field label="Médico Regulador/Intervencionista"><Input className="text-xl" value={victim.conduta.medico_regulador || ''} onChange={e => handleVictimChange(victim.id, 'conduta', 'medico_regulador', e.target.value)} /></Field>
                            <Field label="Médico Receptor"><Input className="text-xl" value={victim.conduta.medico_receptor || ''} onChange={e => handleVictimChange(victim.id, 'conduta', 'medico_receptor', e.target.value)} /></Field>
                            <Field label="Código">
                                <RadioGroup value={victim.conduta.codigo || ''} onValueChange={v => handleVictimChange(victim.id, 'conduta', 'codigo', v)} className="flex flex-wrap gap-x-4 gap-y-2">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="vermelho" id={`cod-vermelho-${victim.id}`} /><Label htmlFor={`cod-vermelho-${victim.id}`} className="font-normal text-xl">Vermelho</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="amarelo" id={`cod-amarelo-${victim.id}`} /><Label htmlFor={`cod-amarelo-${victim.id}`} className="font-normal text-xl">Amarelo</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="verde" id={`cod-verde-${victim.id}`} /><Label htmlFor={`cod-verde-${victim.id}`} className="font-normal text-xl">Verde</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="azul" id={`cod-azul-${victim.id}`} /><Label htmlFor={`cod-azul-${victim.id}`} className="font-normal text-xl">Azul</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="preto" id={`cod-preto-${victim.id}`} /><Label htmlFor={`cod-preto-${victim.id}`} className="font-normal text-xl">Preto</Label></div>
                                </RadioGroup>
                            </Field>
                        </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible open={victim.openSections.termo_recusa} onOpenChange={() => toggleVictimSection(victim.id, 'termo_recusa')}>
                    <SectionTitle onToggle={() => toggleVictimSection(victim.id, 'termo_recusa')} isOpen={victim.openSections.termo_recusa}>TERMO DE RECUSA</SectionTitle>
                    <CollapsibleContent>
                        <Field>
                        <Textarea 
                            className="text-xl"
                            rows={8}
                            placeholder="Eu, (NOME), portador do CPF (NÚMERO) e RG (NÚMERO), residente no endereço (ENDEREÇO), em plena consciência dos meus atos e orientado pela equipe de resgate, declaro para todos os fins que recuso o atendimento pré-hospitalar da Way Brasil, assumindo toda a responsabilidade por qualquer prejuízo à minha saúde e integridade física ou a de (NOME DO RESPONSÁVEL), na condição de seu responsável de quem sou (GRAU DE PARENTESCO)."
                            value={victim.termo_recusa.texto || ''}
                            onChange={(e) => handleVictimChange(victim.id, 'termo_recusa', 'texto', e.target.value)}
                        />
                        </Field>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <Field label="Testemunha 1"><Input className="text-xl" value={victim.termo_recusa.testemunha1 || ''} onChange={(e) => handleVictimChange(victim.id, 'termo_recusa', 'testemunha1', e.target.value)}/></Field>
                            <Field label="Testemunha 2"><Input className="text-xl" value={victim.termo_recusa.testemunha2 || ''} onChange={(e) => handleVictimChange(victim.id, 'termo_recusa', 'testemunha2', e.target.value)}/></Field>
                        </div>
                        <Field label="Assinatura da Vítima/Responsável">
                            <Input className="text-xl mt-4" value={victim.termo_recusa.assinatura || ''} onChange={(e) => handleVictimChange(victim.id, 'termo_recusa', 'assinatura', e.target.value)} />
                        </Field>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        ))}

        <Button variant="outline" className="w-full" onClick={addVictim}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Vítima</Button>

        <Collapsible open={openConsumo} onOpenChange={setOpenConsumo}>
            <SectionTitle onToggle={() => setOpenConsumo(prev => !prev)} isOpen={openConsumo}>CONSUMO DE MATERIAIS NO ATENDIMENTO</SectionTitle>
            <CollapsibleContent>
                <div className="space-y-4">
                    {consumoMateriais.map((item) => (
                        <div key={item.id} className="flex items-end gap-2 p-2 border rounded-lg">
                            <Field label="MATERIAL" className="flex-1"><Input className="text-xl" value={item.material} onChange={e => updateConsumoItem(item.id, 'material', e.target.value)} /></Field>
                            <Field label="QTD" className="w-24"><Input type="number" className="text-xl" value={item.quantidade} onChange={e => updateConsumoItem(item.id, 'quantidade', e.target.value)} /></Field>
                            <Button variant="destructive" size="icon" onClick={() => removeConsumoItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addConsumoItem}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar</Button>
                </div>
            </CollapsibleContent>
        </Collapsible>


        <Collapsible open={openRelatorio} onOpenChange={setOpenRelatorio}>
            <SectionTitle onToggle={() => setOpenRelatorio(prev => !prev)} isOpen={openRelatorio}>RELATÓRIO/OBSERVAÇÕES</SectionTitle>
            <CollapsibleContent>
                <Textarea className="text-xl min-h-[200px]" value={relatorio} onChange={(e) => setRelatorio(e.target.value)} />
            </CollapsibleContent>
        </Collapsible>

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
