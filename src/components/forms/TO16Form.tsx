
'use client';

import { useRouter } from 'next/navigation';
import { Save, PlusCircle, Trash2, CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

function Field({ label, children, className }: { label?: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {label && <Label className="text-xl font-semibold uppercase">{label}</Label>}
      {children}
    </div>
  )
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-between mt-8 mb-4 border-b-2 border-foreground pb-2">
        <h2 className={cn("text-xl font-semibold text-foreground uppercase")}>
            {children}
        </h2>
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
}


export default function TO16Form({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const [dadosOperacionais, setDadosOperacionais] = useState<any>({});
  const [victims, setVictims] = useState<Victim[]>([
    { 
      id: 1, 
      dados_cadastrais: {},
      evento: {},
      veiculo: { tipo: [] },
      avaliacao: {},
      avaliacao_primaria: {},
      avaliacao_secundaria: { sinais_vitais: {} },
      escala_glasgow: {},
      procedimentos_realizados: {},
      rol_valores: [],
      equipamentos_retidos: [],
      conduta: {},
    }
  ]);

  const [consumoMateriais, setConsumoMateriais] = useState<ListItem[]>([]);
  const [relatorio, setRelatorio] = useState('');
  
  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const { formData } = JSON.parse(savedData);
      if (formData) {
        setDadosOperacionais(formData.dadosOperacionais || {});
        setVictims(formData.victims || victims);
        setConsumoMateriais(formData.consumoMateriais || []);
        setRelatorio(formData.relatorio || '');
      }
    }
  }, []);

  const handleOperationalDataChange = (key: string, value: any) => {
    setDadosOperacionais((prev: any) => ({ ...prev, [key]: value }));
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
  
  const formatCPF = (value: string) => {
    if (!value) return value;
    const cpf = value.replace(/[^\d]/g, "");
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  };

  const formatRG = (value: string) => {
      if (!value) return value;
      const rg = value.replace(/[^\d]/g, "");
      if (rg.length <= 2) return rg;
      if (rg.length <= 5) return `${rg.slice(0, 2)}.${rg.slice(2)}`;
      if (rg.length <= 8) return `${rg.slice(0, 2)}.${rg.slice(2, 5)}.${rg.slice(5)}`;
      return `${rg.slice(0, 2)}.${rg.slice(2, 5)}.${rg.slice(5, 8)}-${rg.slice(8, 9)}`;
  };

  const handleVictimChange = (victimId: number, section: keyof Omit<Victim, 'id' | 'rol_valores' | 'equipamentos_retidos'>, key: string, value: any) => {
    
    if (key === 'telefone') {
      value = formatPhoneNumber(value);
    }
    if (key === 'cpf') {
      value = formatCPF(value);
    }
    if (key === 'rg') {
      value = formatRG(value);
    }
    
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
  
  const addVictim = () => {
    setVictims(prev => [...prev, { 
      id: Date.now(), 
      dados_cadastrais: {},
      evento: {},
      veiculo: { tipo: [] },
      avaliacao: {},
      avaliacao_primaria: {},
      avaliacao_secundaria: { sinais_vitais: {} },
      escala_glasgow: {},
      procedimentos_realizados: {},
      rol_valores: [],
      equipamentos_retidos: [],
      conduta: {},
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

  const renderRadioGroup = (
    victimId: number,
    section: keyof Victim,
    key: string,
    options: { id: string; label: string }[],
    orientation: 'vertical' | 'horizontal' = 'vertical'
  ) => {
    const victim = victims.find(v => v.id === victimId);
    if (!victim) return null;
  
    const value = (victim[section] as any)?.[key] || '';
  
    return (
      <RadioGroup
        value={value}
        onValueChange={(v) => handleVictimChange(victimId, section as any, key, v)}
        className={cn("flex gap-x-4 gap-y-2", orientation === 'vertical' ? 'flex-col space-y-2' : 'flex-wrap flex-row')}
      >
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={`${section}-${key}-${option.id}-${victimId}`} />
            <Label htmlFor={`${section}-${key}-${option.id}-${victimId}`} className="font-normal text-xl">{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    );
  };
  
  const renderCheckboxes = (victimId: number, section: keyof Victim, key: string, options: { id: string, label: string }[]) => {
    const victim = victims.find(v => v.id === victimId);
    if (!victim) return null;

    const currentValues = (victim[section] as any)?.[key] || [];
    
    return (
      <div className="flex flex-col space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            <Checkbox
              id={`${section}-${key}-${option.id}-${victimId}`}
              checked={currentValues.includes(option.id)}
              onCheckedChange={(checked) => handleVictimCheckboxChange(victimId, section, key, option.id, !!checked)}
            />
            <label htmlFor={`${section}-${key}-${option.id}-${victimId}`} className="text-xl font-normal leading-none">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    );
  }

  const fillEmptyFields = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map(item => fillEmptyFields(item));
    }
    if (typeof data === 'object' && data !== null) {
      const newData: { [key: string]: any } = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          newData[key] = fillEmptyFields(data[key]);
        }
      }
      return newData;
    }
    if (data === '' || data === null || data === undefined) {
      return 'NILL';
    }
    return data;
  };
  
  const validateObject = (obj: any, parentKey = ''): boolean => {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            if (['id', 'trauma_outros', 'clinico_outros', 'seguranca_outros', 'cinematica_outros', 'removido_por_terceiros_obs', 'unidade_hospitalar', 'outros'].includes(key)) {
                continue;
            }

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                if (!validateObject(value, fullKey)) return false;
            } else if (Array.isArray(value)) {
                if(value.length > 0 && value.some(item => (typeof item === 'object' && !validateObject(item)) || item === '')) return false;
            } else if (value === '' || value === null || value === undefined) {
                console.log(`Validation failed for: ${fullKey}`);
                return false;
            }
        }
    }
    return true;
  };

  const prepareReportData = () => {
    const reportData = {
      dadosOperacionais,
      victims,
      consumoMateriais,
      relatorio,
    };
    
    if (!validateObject(reportData)) {
        toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos antes de continuar.",
        });
        return null;
    }
    
    return {
      category: categorySlug,
      formData: fillEmptyFields(reportData)
    };
  };

  const handleGenerateReport = () => {
    const reportData = prepareReportData();
    if (reportData) {
      localStorage.setItem('reportPreview', JSON.stringify(reportData));
      router.push('/relatorio/preview');
    }
  };
  
  return (
    <div className="w-full p-4 sm:p-6 md:p-8">
      <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
        <div>
            <SectionTitle>DADOS OPERACIONAIS DA EQUIPE DE APH</SectionTitle>
            <div>
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
                    <Field label="Data">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal text-xl",
                              !dadosOperacionais.data && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dadosOperacionais.data ? format(new Date(dadosOperacionais.data), "PPP") : <span>Data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dadosOperacionais.data ? new Date(dadosOperacionais.data) : undefined}
                            onSelect={(date) => handleOperationalDataChange('data', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                    <Field label="Nº Ocorrência"><Input className="text-xl" value={dadosOperacionais.n_ocorrencia || ''} onChange={(e) => handleOperationalDataChange('n_ocorrencia', e.target.value)} /></Field>
                    <Field label="KM"><Input className="text-xl" value={dadosOperacionais.km || ''} onChange={(e) => handleOperationalDataChange('km', e.target.value)} /></Field>
                    <Field label="Sentido">
                        <RadioGroup value={dadosOperacionais.sentido || ''} onValueChange={(v) => handleOperationalDataChange('sentido', v)} className="flex flex-row space-y-0 gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="norte" id="op-norte" /><Label htmlFor="op-norte" className="font-normal text-xl">Norte</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="sul" id="op-sul" /><Label htmlFor="op-sul" className="font-normal text-xl">Sul</Label></div>
                        </RadioGroup>
                    </Field>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                    <Field label="Acionamento"><Input type="time" className="text-xl" value={dadosOperacionais.acionamento || ''} onChange={(e) => handleOperationalDataChange('acionamento', e.target.value)} /></Field>
                    <Field label="Chegada no Local"><Input type="time" className="text-xl" value={dadosOperacionais.chegada_local || ''} onChange={(e) => handleOperationalDataChange('chegada_local', e.target.value)} /></Field>
                    <Field label="Saída do Local"><Input type="time" className="text-xl" value={dadosOperacionais.saida_local || ''} onChange={(e) => handleOperationalDataChange('saida_local', e.target.value)} /></Field>
                    <Field label="Chegada no Hospital"><Input type="time" className="text-xl" value={dadosOperacionais.chegada_hospital || ''} onChange={(e) => handleOperationalDataChange('chegada_hospital', e.target.value)} /></Field>
                    <Field label="Saída do Hospital"><Input type="time" className="text-xl" value={dadosOperacionais.saida_hospital || ''} onChange={(e) => handleOperationalDataChange('saida_hospital', e.target.value)} /></Field>
                    <Field label="Chegada BSO/Término"><Input type="time" className="text-xl" value={dadosOperacionais.chegada_bso || ''} onChange={(e) => handleOperationalDataChange('chegada_bso', e.target.value)} /></Field>
                </div>
            </div>
        </div>


        {victims.map((victim, index) => (
            <div key={victim.id} className="border-2 border-dashed border-primary/50 p-6 rounded-lg mt-8 relative">
                {victims.length > 1 && <Button variant="destructive" size="icon" className="absolute -top-4 -right-4 rounded-full" onClick={() => removeVictim(victim.id)}><Trash2 className="h-4 w-4" /></Button>}
                <h2 className="text-2xl font-bold text-primary mb-6">VÍTIMA {index + 1}</h2>

                <div>
                    <SectionTitle>DADOS CADASTRAIS DO USUÁRIO</SectionTitle>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Field label="Nome"><Input className="text-xl" placeholder="Nome Completo" value={victim.dados_cadastrais.nome || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'nome', e.target.value)} /></Field>
                            <Field label="Acompanhante"><Input className="text-xl" placeholder="Nome do acompanhante" value={victim.dados_cadastrais.acompanhante || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'acompanhante', e.target.value)} /></Field>
                            <Field label="Endereço"><Input className="text-xl" placeholder="Endereço da vítima" value={victim.dados_cadastrais.endereco || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'endereco', e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
                            <Field label="Sexo">
                                <RadioGroup value={victim.dados_cadastrais.sexo || ''} onValueChange={v => handleVictimChange(victim.id, 'dados_cadastrais', 'sexo', v)} className="flex flex-row space-y-0 gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="M" id={`sexo-m-${victim.id}`} /><Label htmlFor={`sexo-m-${victim.id}`} className="font-normal text-xl">M</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="F" id={`sexo-f-${victim.id}`} /><Label htmlFor={`sexo-f-${victim.id}`} className="font-normal text-xl">F</Label></div>
                                </RadioGroup>
                            </Field>
                            <Field label="DN">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal text-xl",
                                      !victim.dados_cadastrais.dn && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {victim.dados_cadastrais.dn ? format(new Date(victim.dados_cadastrais.dn), "PPP") : <span>Data</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={victim.dados_cadastrais.dn ? new Date(victim.dados_cadastrais.dn) : undefined}
                                    onSelect={(date) => handleVictimChange(victim.id, 'dados_cadastrais', 'dn', date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </Field>
                            <Field label="Idade"><Input type="number" placeholder="Ex: 35" className="text-xl" value={victim.dados_cadastrais.idade || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'idade', e.target.value)} /></Field>
                            <Field label="Telefone">
                                <Input 
                                    className="text-xl" 
                                    placeholder="(00) 00000-0000" 
                                    value={victim.dados_cadastrais.telefone || ''} 
                                    onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'telefone', e.target.value)}
                                    maxLength={15}
                                />
                            </Field>
                            <Field label="CPF">
                                <Input 
                                    className="text-xl" 
                                    placeholder="000.000.000-00" 
                                    value={victim.dados_cadastrais.cpf || ''} 
                                    onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'cpf', e.target.value)}
                                    maxLength={14}
                                />
                            </Field>
                            <Field label="RG">
                                <Input 
                                    className="text-xl" 
                                    placeholder="00.000.000-0" 
                                    value={victim.dados_cadastrais.rg || ''} 
                                    onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'rg', e.target.value)}
                                    maxLength={12}
                                />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                             <Field label="Posição no Veículo"><Input className="text-xl" placeholder="Ex: Condutor, Passageiro" value={victim.dados_cadastrais.posicao_veiculo || ''} onChange={(e) => handleVictimChange(victim.id, 'dados_cadastrais', 'posicao_veiculo', e.target.value)} /></Field>
                        </div>
                    </div>
                </div>

                <div>
                    <SectionTitle>EVENTO</SectionTitle>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <Field label="Trauma">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center space-x-2"><Checkbox id={`trauma-acidente-${victim.id}`} checked={victim.evento?.trauma?.includes('acidente')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'trauma', 'acidente', !!c)} /><Label htmlFor={`trauma-acidente-${victim.id}`} className="font-normal text-xl">Acidente Automobilístico</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`trauma-queimadura-${victim.id}`} checked={victim.evento?.trauma?.includes('queimadura')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'trauma', 'queimadura', !!c)} /><Label htmlFor={`trauma-queimadura-${victim.id}`} className="font-normal text-xl">Queimadura</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`trauma-atropelamento-${victim.id}`} checked={victim.evento?.trauma?.includes('atropelamento')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'trauma', 'atropelamento', !!c)} /><Label htmlFor={`trauma-atropelamento-${victim.id}`} className="font-normal text-xl">Atropelamento</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`trauma-queda-${victim.id}`} checked={victim.evento?.trauma?.includes('queda')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'trauma', 'queda', !!c)} /><Label htmlFor={`trauma-queda-${victim.id}`} className="font-normal text-xl">Queda de Altura</Label></div>
                                    <Input placeholder="Outros" className="mt-2 text-xl" value={victim.evento.trauma_outros || ''} onChange={(e) => handleVictimChange(victim.id, 'evento', 'trauma_outros', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Atendimento Clínico">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-mal-${victim.id}`} checked={victim.evento?.clinico?.includes('mal_subito')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'mal_subito', !!c)} /><Label htmlFor={`clinico-mal-${victim.id}`} className="font-normal text-xl">Mal Súbito</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-intoxicacao-${victim.id}`} checked={victim.evento?.clinico?.includes('intoxicacao')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'intoxicacao', !!c)} /><Label htmlFor={`clinico-intoxicacao-${victim.id}`} className="font-normal text-xl">Intoxicação Exógena</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-parto-${victim.id}`} checked={victim.evento?.clinico?.includes('parto')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'parto', !!c)} /><Label htmlFor={`clinico-parto-${victim.id}`} className="font-normal text-xl">Assistência ao Parto</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-convulsao-${victim.id}`} checked={victim.evento?.clinico?.includes('convulsao')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'convulsao', !!c)} /><Label htmlFor={`clinico-convulsao-${victim.id}`} className="font-normal text-xl">Convulsão</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`clinico-psiquiatrico-${victim.id}`} checked={victim.evento?.clinico?.includes('psiquiatrico')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'clinico', 'psiquiatrico', !!c)} /><Label htmlFor={`clinico-psiquiatrico-${victim.id}`} className="font-normal text-xl">Distúrbio Psiquiátrico</Label></div>
                                    <Input placeholder="Outros" className="mt-2 text-xl" value={victim.evento.clinico_outros || ''} onChange={(e) => handleVictimChange(victim.id, 'evento', 'clinico_outros', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Condições de Segurança">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center space-x-2"><Checkbox id={`seg-cinto-${victim.id}`} checked={victim.evento?.seguranca?.includes('cinto')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'seguranca', 'cinto', !!c)} /><Label htmlFor={`seg-cinto-${victim.id}`} className="font-normal text-xl">Cinto de Segurança</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`seg-cadeirinha-${victim.id}`} checked={victim.evento?.seguranca?.includes('cadeirinha')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'seguranca', 'cadeirinha', !!c)} /><Label htmlFor={`seg-cadeirinha-${victim.id}`} className="font-normal text-xl">Cadeirinha</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`seg-airbag-${victim.id}`} checked={victim.evento?.seguranca?.includes('airbag')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'seguranca', 'airbag', !!c)} /><Label htmlFor={`seg-airbag-${victim.id}`} className="font-normal text-xl">Air Bag</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`seg-capacete-${victim.id}`} checked={victim.evento?.seguranca?.includes('capacete')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'evento', 'seguranca', 'capacete', !!c)} /><Label htmlFor={`seg-capacete-${victim.id}`} className="font-normal text-xl">Capacete</Label></div>
                                    <Input placeholder="Outros" className="mt-2 text-xl" value={victim.evento.seguranca_outros || ''} onChange={(e) => handleVictimChange(victim.id, 'evento', 'seguranca_outros', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="Cinemática">
                                <div className="flex flex-col space-y-4">
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
                            <Field label="VEÍCULO">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-center space-x-2"><Checkbox id={`veiculo-bicicleta-${victim.id}`} checked={victim.veiculo?.tipo?.includes('bicicleta')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'veiculo', 'tipo', 'bicicleta', !!c)} /><Label htmlFor={`veiculo-bicicleta-${victim.id}`} className="font-normal text-xl">BICICLETA</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`veiculo-moto-${victim.id}`} checked={victim.veiculo?.tipo?.includes('moto')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'veiculo', 'tipo', 'moto', !!c)} /><Label htmlFor={`veiculo-moto-${victim.id}`} className="font-normal text-xl">MOTO</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`veiculo-carro-${victim.id}`} checked={victim.veiculo?.tipo?.includes('carro')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'veiculo', 'tipo', 'carro', !!c)} /><Label htmlFor={`veiculo-carro-${victim.id}`} className="font-normal text-xl">CARRO</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`veiculo-utilitaria-${victim.id}`} checked={victim.veiculo?.tipo?.includes('utilitaria')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'veiculo', 'tipo', 'utilitaria', !!c)} /><Label htmlFor={`veiculo-utilitaria-${victim.id}`} className="font-normal text-xl">UTILITÁRIA</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`veiculo-onibus-${victim.id}`} checked={victim.veiculo?.tipo?.includes('onibus')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'veiculo', 'tipo', 'onibus', !!c)} /><Label htmlFor={`veiculo-onibus-${victim.id}`} className="font-normal text-xl">ÔNIBUS</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`veiculo-caminhao-${victim.id}`} checked={victim.veiculo?.tipo?.includes('caminhao')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'veiculo', 'tipo', 'caminhao', !!c)} /><Label htmlFor={`veiculo-caminhao-${victim.id}`} className="font-normal text-xl">CAMINHÃO</Label></div>
                                    <div className="flex items-center space-x-2"><Checkbox id={`veiculo-carreta-${victim.id}`} checked={victim.veiculo?.tipo?.includes('carreta')} onCheckedChange={(c) => handleVictimCheckboxChange(victim.id, 'veiculo', 'tipo', 'carreta', !!c)} /><Label htmlFor={`veiculo-carreta-${victim.id}`} className="font-normal text-xl">CARRETA</Label></div>
                                </div>
                            </Field>
                            <Field label="Placa"><Input className="text-xl" placeholder="Ex: ABC-1234" value={victim.veiculo.placa || ''} onChange={e => handleVictimChange(victim.id, 'veiculo', 'placa', e.target.value)}/></Field>
                        </div>
                    </div>
                </div>
                
                <div>
                    <SectionTitle>AVALIAÇÃO</SectionTitle>
                    <div>
                        <div className="space-y-4">
                        <Field label="Condição Inicial">
                            {renderCheckboxes(victim.id, 'avaliacao', 'condicao_inicial', [
                                {id: 'alerta', label: 'Alerta'},
                                {id: 'verbaliza', label: 'Verbaliza'},
                                {id: 'doloroso', label: 'Estímulo Doloroso'},
                                {id: 'inconsciente', label: 'Inconsciente'},
                                {id: 'deambulando', label: 'Deambulando'},
                                {id: 'ao_solo', label: 'Ao Solo'},
                                {id: 'ejetado', label: 'Ejetado'},
                                {id: 'encarcerado_retido', label: 'Encarcerado/Retido'},
                            ])}
                        </Field>
                        </div>
                        <SubSectionTitle>Avaliação Primária</SubSectionTitle>
                        <div className="space-y-4">
                            <Field label="X - Hemorragia Exsanguinante">
                                {renderRadioGroup(victim.id, 'avaliacao_primaria', 'hemorragia', [{id: 'nao', label: 'Não'}, {id: 'sim', label: 'Sim'}], 'horizontal')}
                            </Field>
                            <Field label="A - Vias Aéreas">
                                <div className="flex items-center gap-4">
                                    {renderRadioGroup(victim.id, 'avaliacao_primaria', 'vias_aereas_status', [{id: 'pervias', label: 'Pérvias'}, {id: 'obstruidas', label: 'Obstruídas por:'}], 'horizontal')}
                                <Input className="text-xl" value={victim.avaliacao_primaria.vias_aereas_obs || ''} onChange={(e) => handleVictimChange(victim.id, 'avaliacao_primaria', 'vias_aereas_obs', e.target.value)} />
                                </div>
                            </Field>
                            <Field label="B - Ventilação">
                                {renderRadioGroup(victim.id, 'avaliacao_primaria', 'ventilacao_status', [
                                    {id: 'presente', label: 'Presente'}, {id: 'ausente', label: 'Ausente'}, {id: 'simetrica', label: 'Simétrica'}, {id: 'assimetrica', label: 'Assimétrica'},
                                    {id: 'apneia', label: 'Apneia'}, {id: 'eupneia', label: 'Eupneia'}, {id: 'taquipneia', label: 'Taquipneia'}, {id: 'gasping', label: 'Gasping'}
                                ], 'vertical')}
                            </Field>
                            <SubSectionTitle>C - Circulação e Hemorragias</SubSectionTitle>
                            <div className="grid grid-cols-1 gap-8">
                                <Field label="Pulso">
                                    {renderRadioGroup(victim.id, 'avaliacao_primaria', 'pulso', [{id: 'presente', label: 'Presente'}, {id: 'cheio', label: 'Cheio'}, {id: 'filiforme', label: 'Filiforme'}], 'vertical')}
                                </Field>
                                <Field label="Pele">
                                    {renderRadioGroup(victim.id, 'avaliacao_primaria', 'pele', [{id: 'normal', label: 'Normal'}, {id: 'fria', label: 'Fria'}, {id: 'sudorese', label: 'Sudorese'}], 'vertical')}
                                </Field>
                                <Field label="Perfusão">
                                    {renderRadioGroup(victim.id, 'avaliacao_primaria', 'perfusao', [{id: '<2seg', label: '< 2seg'}, {id: '>2seg', label: '> 2seg'}], 'vertical')}
                                </Field>
                            </div>
                            <Field label="Sangramento Ativo">
                                {renderRadioGroup(victim.id, 'avaliacao_primaria', 'sangramento', [{id: 'presente', label: 'Presente'}, {id: 'ausente', label: 'Ausente'}], 'horizontal')}
                            </Field>
                            <SubSectionTitle>D - Neurológico: Glasgow e Pupilas</SubSectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Field label="Pupilas">
                                    {renderRadioGroup(victim.id, 'avaliacao_primaria', 'pupilas', [{id: 'isocoricas', label: 'Isocóricas'}, {id: 'anisocoricas', label: 'Anisocóricas'}], 'vertical')}
                                </Field>
                                <Field label="Fotorreagentes">
                                    {renderRadioGroup(victim.id, 'avaliacao_primaria', 'fotorreagentes', [{id: 'sim', label: 'Sim'}, {id: 'nao', label: 'Não'}], 'vertical')}
                                </Field>
                            </div>
                            <SubSectionTitle>E - Exposição</SubSectionTitle>
                            <Field>
                                {renderRadioGroup(victim.id, 'avaliacao_primaria', 'exposicao', [{id: 'sem_lesoes', label: 'Sem Lesões Aparentes'}, {id: 'hipotermia', label: 'Hipotermia'}], 'horizontal')}
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
                    </div>
                </div>
                
                <div>
                    <SectionTitle>ESCALA DE COMA DE GLASGOW</SectionTitle>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            <Field label="Abertura Ocular">
                                {renderRadioGroup(victim.id, 'escala_glasgow', 'abertura_ocular', [
                                    { id: '4', label: '04 Espontânea' },
                                    { id: '3', label: '03 Estímulo Verbal' },
                                    { id: '2', label: '02 Estímulo Doloroso' },
                                    { id: '1', label: '01 Ausente' },
                                ])}
                            </Field>
                            <Field label="Resposta Verbal">
                                {renderRadioGroup(victim.id, 'escala_glasgow', 'resposta_verbal', [
                                    { id: '5', label: '05 Orientado' },
                                    { id: '4', label: '04 Confuso' },
                                    { id: '3', label: '03 Palavras Inapropriadas' },
                                    { id: '2', label: '02 Sons Incompreensíveis' },
                                    { id: '1', label: '01 Ausente' },
                                ])}
                            </Field>
                            <Field label="Resposta Motora">
                                {renderRadioGroup(victim.id, 'escala_glasgow', 'resposta_motora', [
                                    { id: '6', label: '06 Obedece a Comandos' },
                                    { id: '5', label: '05 Localiza a Dor' },
                                    { id: '4', label: '04 Retira o Membro à Dor' },
                                    { id: '3', label: '03 Decorticação (Flexão Anormal)' },
                                    { id: '2', label: '02 Descerebração (Extensão Anormal)' },
                                    { id: '1', label: '01 Ausente' },
                                ])}
                            </Field>
                        </div>
                        <div className="mt-4 text-right">
                            <p className="text-xl font-bold">TOTAL: {calculateGlasgow(victim)}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <SectionTitle>PROCEDIMENTOS REALIZADOS</SectionTitle>
                    <div>
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
                    </div>
                </div>
                
                <div>
                    <SectionTitle>ROL DE VALORES/PERTENCES</SectionTitle>
                    <div>
                        <div className="space-y-4">
                        {victim.rol_valores.map(item => (
                            <div key={item.id} className="flex items-end gap-2 p-2 border rounded-lg">
                            <Field label="MATERIAL" className="flex-1"><Input className="text-xl" value={item.material} onChange={e => updateListItem(victim.id, 'rol_valores', item.id, 'material', e.target.value)} /></Field>
                            <Field label="QTD" className="w-24"><Input type="number" className="text-xl" value={item.quantidade} onChange={e => updateListItem(victim.id, 'rol_valores', item.id, 'quantidade', e.target.value)} /></Field>
                            <Button variant="destructive" size="icon" onClick={() => removeListItem(victim.id, 'rol_valores', item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => addListItem(victim.id, 'rol_valores')}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Item</Button>
                        </div>
                        <Field label="Responsável pelo Recebimento (Assinatura)"><Input className="text-xl mt-4" value={victim.rol_valores.responsavel || ''} onChange={e => handleVictimChange(victim.id, 'rol_valores', 'responsavel', e.target.value)}/></Field>
                    </div>
                </div>

                <div>
                    <SectionTitle>EQUIPAMENTO/MATERIAIS RETIDOS</SectionTitle>
                    <div>
                        <div className="space-y-4">
                        {victim.equipamentos_retidos.map(item => (
                            <div key={item.id} className="flex items-end gap-2 p-2 border rounded-lg">
                            <Field label="MATERIAL" className="flex-1"><Input className="text-xl" value={item.material} onChange={e => updateListItem(victim.id, 'equipamentos_retidos', item.id, 'material', e.target.value)} /></Field>
                            <Field label="QTD" className="w-24"><Input type="number" className="text-xl" value={item.quantidade} onChange={e => updateListItem(victim.id, 'equipamentos_retidos', item.id, 'quantidade', e.target.value)} /></Field>
                            <Button variant="destructive" size="icon" onClick={() => removeListItem(victim.id, 'equipamentos_retidos', item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => addListItem(victim.id, 'equipamentos_retidos')}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Item</Button>
                        </div>
                        <Field label="Responsável pelo Recebimento (Assinatura)"><Input className="text-xl mt-4" value={victim.equipamentos_retidos.responsavel || ''} onChange={e => handleVictimChange(victim.id, 'equipamentos_retidos', 'responsavel', e.target.value)}/></Field>
                    </div>
                </div>
                
                <div>
                    <SectionTitle>CONDUTA</SectionTitle>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col space-y-4">
                            {[
                                { id: 'liberacao_local', label: 'PRECISA de Liberação no Local c/ Orientações' },
                                { id: 'vitima_em_obito', label: 'PRECISA de Vítima em Óbito' },
                                { id: 'obito_durante_atendimento', label: 'PRECISA de Óbito Durante Atendimento' },
                                { id: 'recusa_atendimento', label: 'PRECISA de Recusa Atendimento' },
                                { id: 'recusa_remocao', label: 'PRECISA de Recusa Remoção à Unidade Hospitalar' },
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
                                <RadioGroup value={victim.conduta.codigo || ''} onValueChange={v => handleVictimChange(victim.id, 'conduta', 'codigo', v)} className="flex flex-col space-y-2 gap-y-2">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="vermelho" id={`cod-vermelho-${victim.id}`} /><Label htmlFor={`cod-vermelho-${victim.id}`} className="font-normal text-xl">Vermelho</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="amarelo" id={`cod-amarelo-${victim.id}`} /><Label htmlFor={`cod-amarelo-${victim.id}`} className="font-normal text-xl">Amarelo</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="verde" id={`cod-verde-${victim.id}`} /><Label htmlFor={`cod-verde-${victim.id}`} className="font-normal text-xl">Verde</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="azul" id={`cod-azul-${victim.id}`} /><Label htmlFor={`cod-azul-${victim.id}`} className="font-normal text-xl">Azul</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="preto" id={`cod-preto-${victim.id}`} /><Label htmlFor={`cod-preto-${victim.id}`} className="font-normal text-xl">Preto</Label></div>
                                </RadioGroup>
                            </Field>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}

        <Button variant="secondary" className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white dark:text-white" onClick={addVictim}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Vítima</Button>

        <div>
            <SectionTitle>CONSUMO DE MATERIAIS NO ATENDIMENTO</SectionTitle>
            <div>
                <div className="space-y-4">
                    {consumoMateriais.map((item) => (
                        <div key={item.id} className="flex items-end gap-2 p-2 border rounded-lg">
                            <Field label="MATERIAL" className="flex-1"><Input className="text-xl" value={item.material} onChange={e => updateConsumoItem(item.id, 'material', e.target.value)} /></Field>
                            <Field label="QTD" className="w-24"><Input type="number" className="text-xl" value={item.quantidade} onChange={e => updateConsumoItem(item.id, 'quantidade', e.target.value)} /></Field>
                            <Button variant="destructive" size="icon" onClick={() => removeConsumoItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addConsumoItem}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Material</Button>
                </div>
            </div>
        </div>


        <div>
            <SectionTitle>RELATÓRIO/OBSERVAÇÕES</SectionTitle>
            <div>
                <Textarea className="text-xl min-h-[200px]" value={relatorio} onChange={(e) => setRelatorio(e.target.value)} />
            </div>
        </div>

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
