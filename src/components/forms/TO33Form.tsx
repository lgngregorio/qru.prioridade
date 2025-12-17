
'use client';

import { useRouter } from 'next/navigation';
import { Save, PlusCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

type GeneralInfo = {
  rodovia: string;
  ocorrencia: string;
  tipoPane: string[];
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
  eixosOutro: string;
  tipo: string;
  pneu: string;
  carga: string;
  condutor: string;
  telefone: string;
  ocupantes: string;
};

type OtherInfo = {
  auxilios: string;
  vtrApoio: string;
  observacoes: string;
};

const paneTypes = [
    { id: 'tp01', label: 'TP01' },
    { id: 'tp02', label: 'TP02' },
    { id: 'tp03', label: 'TP03' },
    { id: 'tp04', label: 'TP04' },
    { id: 'tp05', label: 'TP05' },
    { id: 'tp07', label: 'TP07' },
    { id: 'nill', label: 'NILL' },
]

const eixosOptions = ["02", "03", "04", "05", "06", "07", "08", "09", "10"];

export default function TO33Form({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showVtrApoio, setShowVtrApoio] = useState(false);
  const [existingReport, setExistingReport] = useState<any>(null);


  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    rodovia: '',
    ocorrencia: categorySlug.toUpperCase(),
    tipoPane: [],
    qth: '',
    sentido: '',
    localArea: '',
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1, marca: '', modelo: '', ano: '', cor: '', placa: '', cidade: '',
      vindoDe: '', indoPara: '', eixos: '', eixosOutro: '', tipo: '', pneu: '', carga: '',
      condutor: '', telefone: '', ocupantes: ''
    }
  ]);

  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    auxilios: '',
    vtrApoio: '',
    observacoes: '',
  });

  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.category === categorySlug) {
        setExistingReport(parsedData);
        const { formData } = parsedData;
        if (formData) {
          setGeneralInfo(formData.generalInfo || {
            rodovia: '',
            ocorrencia: categorySlug.toUpperCase(),
            tipoPane: [],
            qth: '',
            sentido: '',
            localArea: '',
          });
          setVehicles(formData.vehicles && formData.vehicles.length > 0 ? formData.vehicles.map((v: Vehicle) => ({...v, eixosOutro: v.eixos && !eixosOptions.includes(v.eixos) ? v.eixos : ''})) : [{
            id: 1, marca: '', modelo: '', ano: '', cor: '', placa: '', cidade: '',
            vindoDe: '', indoPara: '', eixos: '', eixosOutro: '', tipo: '', pneu: '', carga: '',
            condutor: '', telefone: '', ocupantes: ''
          }]);
          setOtherInfo(formData.otherInfo || {
            auxilios: '',
            vtrApoio: '',
            observacoes: '',
          });
          setShowVtrApoio(!!formData.otherInfo?.vtrApoio && formData.otherInfo.vtrApoio !== 'NILL');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);


  const handleGeneralInfoChange = (field: keyof Omit<GeneralInfo, 'tipoPane'>, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaneTypeChange = (paneId: string, checked: boolean) => {
    setGeneralInfo(prev => {
        const newPaneTypes = checked 
            ? [...prev.tipoPane, paneId]
            : prev.tipoPane.filter(id => id !== paneId);
        return { ...prev, tipoPane: newPaneTypes };
    });
  };

  const handleVehicleChange = (index: number, field: keyof Omit<Vehicle, 'eixos'>, value: string) => {
    const newVehicles = [...vehicles];
    if (field === 'telefone') {
      value = formatPhoneNumber(value);
    }
    (newVehicles[index] as any)[field] = value;
    setVehicles(newVehicles);
  };
  
  const handleEixosChange = (index: number, value: string) => {
    const newVehicles = [...vehicles];
    newVehicles[index].eixos = value;
    if (value !== 'outro') {
        newVehicles[index].eixosOutro = '';
    }
    setVehicles(newVehicles);
  }

  const handleOtherInfoChange = (field: keyof OtherInfo, value: string) => {
    setOtherInfo(prev => ({ ...prev, [field]: value }));
  };

  const addVehicle = () => {
    setVehicles([...vehicles, {
      id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1,
      marca: '', modelo: '', ano: '', cor: '', placa: '', cidade: '',
      vindoDe: '', indoPara: '', eixos: '', eixosOutro: '', tipo: '', pneu: '', carga: '',
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
  
  const fillEmptyFields = (data: any): any => {
    if (Array.isArray(data)) {
      if(data.length === 0) return 'NILL';
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
  
  const validateObject = (obj: any): boolean => {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            if (key === 'vtrApoio' && !showVtrApoio) continue;
            if (key === 'id') continue;
            if (key === 'eixosOutro' && obj['eixos'] !== 'outro') continue;
            if (key === 'tipoPane' && Array.isArray(value) && value.length === 0) return false;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                if (!validateObject(value)) return false;
            } else if (Array.isArray(value)) {
                 if (value.length > 0 && value.some(item => (typeof item === 'object' && !validateObject(item)) || (typeof item !== 'object' && item === ''))) return false;
            } else if (value === '' || value === null || value === undefined) {
                return false;
            }
        }
    }
    return true;
};

  const prepareReportData = () => {
    const processedVehicles = vehicles.map(v => {
        const { eixosOutro, ...rest } = v;
        return {
            ...rest,
            eixos: v.eixos === 'outro' ? v.eixosOutro : v.eixos
        };
    });

    const reportData = {
      generalInfo,
      vehicles: processedVehicles,
      otherInfo,
    };
    
    if (!validateObject(reportData)) {
        toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos antes de continuar.",
        });
        return null;
    }

    const filledData = {
      ...existingReport,
      category: categorySlug,
      formData: fillEmptyFields(reportData)
    };
    
    if (!showVtrApoio) {
      filledData.formData.otherInfo.vtrApoio = 'NILL';
    }

    return filledData;
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
        {/* Informações Gerais */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">Informações Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="RODOVIA">
                <RadioGroup value={generalInfo.rodovia} onValueChange={(value) => handleGeneralInfoChange('rodovia', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="ms-112" id="r-ms-112" /><Label htmlFor="r-ms-112" className="text-xl font-normal">MS-112</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="br-158" id="r-br-158" /><Label htmlFor="r-br-158" className="text-xl font-normal">BR-158</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="ms-306" id="r-ms-306" /><Label htmlFor="r-ms-306" className="text-xl font-normal">MS-306</Label></div>
                </RadioGroup>
            </Field>
            <Field label="OCORRÊNCIA">
                <Input className="text-xl uppercase" value={generalInfo.ocorrencia} disabled />
            </Field>
            <Field label="TIPO DE PANE">
                 <div className="flex flex-col space-y-2">
                    {paneTypes.map(pane => (
                        <div key={pane.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`pane-${pane.id}`}
                                checked={generalInfo.tipoPane.includes(pane.id)}
                                onCheckedChange={(checked) => handlePaneTypeChange(pane.id, !!checked)}
                            />
                            <Label htmlFor={`pane-${pane.id}`} className="font-normal text-xl">{pane.label}</Label>
                        </div>
                    ))}
                 </div>
            </Field>
            <Field label="QTH (LOCAL)">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Km 125 da MS-112" value={generalInfo.qth} onChange={(e) => handleGeneralInfoChange('qth', e.target.value)}/>
            </Field>
             <Field label="SENTIDO">
                 <RadioGroup value={generalInfo.sentido} onValueChange={(value) => handleGeneralInfoChange('sentido', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="norte" id="s-norte" /><Label htmlFor="s-norte" className="text-xl font-normal">NORTE</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="sul" id="s-sul" /><Label htmlFor="s-sul" className="text-xl font-normal">SUL</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="ambos" id="s-ambos" /><Label htmlFor="s-ambos" className="text-xl font-normal">AMBOS</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="eixo_central" id="s-eixo_central" /><Label htmlFor="s-eixo_central" className="text-xl font-normal">EIXO CENTRAL</Label></div>
                </RadioGroup>
            </Field>
            <Field label="LOCAL/ÁREA">
                <RadioGroup value={generalInfo.localArea} onValueChange={(value) => handleGeneralInfoChange('localArea', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="acostamento" id="la-acostamento" /><Label htmlFor="la-acostamento" className="text-xl font-normal">ACOSTAMENTO</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="area_dominio" id="la-area_dominio" /><Label htmlFor="la-area_dominio" className="text-xl font-normal">ÁREA DE DOMÍNIO</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="terceira_faixa" id="la-terceira_faixa" /><Label htmlFor="la-terceira_faixa" className="text-xl font-normal">TERCEIRA FAIXA</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="faixa_de_rolamento" id="la-faixa_de_rolamento" /><Label htmlFor="la-faixa_de_rolamento" className="text-xl font-normal">FAIXA DE ROLAMENTO</Label></div>
                </RadioGroup>
            </Field>
          </div>
        </div>

        {vehicles.map((vehicle, index) => (
          <div key={vehicle.id} className="space-y-12 border-2 border-dashed border-foreground/50 p-6 rounded-lg relative">
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
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">Dados do Veículo {index + 1}</h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <Field label="MARCA"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Vw" value={vehicle.marca} onChange={e => handleVehicleChange(index, 'marca', e.target.value)}/></Field>
                    <Field label="MODELO"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Gol" value={vehicle.modelo} onChange={e => handleVehicleChange(index, 'modelo', e.target.value)} /></Field>
                    <Field label="ANO"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: 2020" value={vehicle.ano} onChange={e => handleVehicleChange(index, 'ano', e.target.value)}/></Field>
                    <Field label="COR"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Branco" value={vehicle.cor} onChange={e => handleVehicleChange(index, 'cor', e.target.value)}/></Field>
                    <Field label="PLACA"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Abc-1234" value={vehicle.placa} onChange={e => handleVehicleChange(index, 'placa', e.target.value)}/></Field>
                    <Field label="CIDADE EMPLACAMENTO"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: São paulo" value={vehicle.cidade} onChange={e => handleVehicleChange(index, 'cidade', e.target.value)}/></Field>
                    <Field label="VINDO DE"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Rio de janeiro" value={vehicle.vindoDe} onChange={e => handleVehicleChange(index, 'vindoDe', e.target.value)}/></Field>
                    <Field label="INDO PARA"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Belo horizonte" value={vehicle.indoPara} onChange={e => handleVehicleChange(index, 'indoPara', e.target.value)}/></Field>
                    <Field label="QUANTIDADE DE EIXOS">
                        <RadioGroup value={vehicle.eixos} onValueChange={(value) => handleEixosChange(index, value)} className="flex flex-wrap gap-x-4 gap-y-2">
                            {eixosOptions.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`eixos-${option}-${vehicle.id}`} />
                                    <Label htmlFor={`eixos-${option}-${vehicle.id}`} className="text-xl font-normal">{option}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="outro" id={`eixos-outro-${vehicle.id}`} />
                                <Label htmlFor={`eixos-outro-${vehicle.id}`} className="text-xl font-normal">Outro</Label>
                                {vehicle.eixos === 'outro' && (
                                    <Input 
                                        type="number" 
                                        className="text-xl w-24" 
                                        value={vehicle.eixosOutro} 
                                        onChange={e => handleVehicleChange(index, 'eixosOutro', e.target.value)} 
                                        placeholder="Qtd."
                                    />
                                )}
                            </div>
                        </RadioGroup>
                    </Field>
                    <Field label="TIPO DE VEÍCULO">
                        <RadioGroup value={vehicle.tipo} onValueChange={value => handleVehicleChange(index, 'tipo', value)} className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="mo" id={`v-tipo-mo-${vehicle.id}`} /><Label htmlFor={`v-tipo-mo-${vehicle.id}`} className="text-xl font-normal">MO</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="ap" id={`v-tipo-ap-${vehicle.id}`} /><Label htmlFor={`v-tipo-ap-${vehicle.id}`} className="text-xl font-normal">AP</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="utilitaria" id={`v-tipo-utilitaria-${vehicle.id}`} /><Label htmlFor={`v-tipo-utilitaria-${vehicle.id}`} className="text-xl font-normal">UTILITÁRIA</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="ca" id={`v-tipo-ca-${vehicle.id}`} /><Label htmlFor={`v-tipo-ca-${vehicle.id}`} className="text-xl font-normal">CA</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="on" id={`v-tipo-on-${vehicle.id}`} /><Label htmlFor={`v-tipo-on-${vehicle.id}`} className="text-xl font-normal">ON</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="car" id={`v-tipo-car-${vehicle.id}`} /><Label htmlFor={`v-tipo-car-${vehicle.id}`} className="text-xl font-normal">CAR</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="ca-romeu-julieta" id={`v-tipo-ca-romeu-julieta-${vehicle.id}`} /><Label htmlFor={`v-tipo-ca-romeu-julieta-${vehicle.id}`} className="text-xl font-normal">CA/ ROMEU E JULIETA</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="carretinha-reboque" id={`v-tipo-carretinha-reboque-${vehicle.id}`} /><Label htmlFor={`v-tipo-carretinha-reboque-${vehicle.id}`} className="text-xl font-normal">CARRETINHA/REBOQUE</Label></div>
                        </RadioGroup>
                    </Field>
                    <Field label="ESTADO DO PNEU">
                        <RadioGroup value={vehicle.pneu} onValueChange={value => handleVehicleChange(index, 'pneu', value)} className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="bom" id={`v-pneu-bom-${vehicle.id}`} /><Label htmlFor={`v-pneu-bom-${vehicle.id}`} className="text-xl font-normal">BOM</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="regular" id={`v-pneu-regular-${vehicle.id}`} /><Label htmlFor={`v-pneu-regular-${vehicle.id}`} className="text-xl font-normal">REGULAR</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="ruim" id={`v-pneu-ruim-${vehicle.id}`} /><Label htmlFor={`v-pneu-ruim-${vehicle.id}`} className="text-xl font-normal">RUIM</Label></div>
                        </RadioGroup>
                    </Field>
                    <Field label="TIPO DE CARGA"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Vazio, soja" value={vehicle.carga} onChange={e => handleVehicleChange(index, 'carga', e.target.value)}/></Field>
               </div>
            </div>

            {/* Condutor */}
            <div className="space-y-8">
                <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">Condutor</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <Field label="QRA DO CONDUTOR(A)"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Nome do condutor" value={vehicle.condutor} onChange={e => handleVehicleChange(index, 'condutor', e.target.value)}/></Field>
                     <Field label="BAIXA FREQUÊNCIA">
                        <Input 
                          className="text-xl placeholder:capitalize placeholder:text-sm"
                          placeholder="(00) 00000-0000" 
                          value={vehicle.telefone}
                          onChange={e => handleVehicleChange(index, 'telefone', e.target.value)}
                          maxLength={15}
                        />
                     </Field>
                     <Field label="OCUPANTES"><Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: 2 adultos, 1 criança" value={vehicle.ocupantes} onChange={e => handleVehicleChange(index, 'ocupantes', e.target.value)}/></Field>
                </div>
            </div>
          </div>
        ))}
        
        <Button size="lg" variant="secondary" className="w-full uppercase text-xl" type="button" onClick={addVehicle}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Veículo
        </Button>

        {/* Outras Informações */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">Outras Informações</h2>
          <div className="space-y-8">
            <Field label="AUXÍLIOS/PR">
              <Textarea className="text-2xl placeholder:capitalize placeholder:text-sm" placeholder="Descreva os auxílios prestados" value={otherInfo.auxilios} onChange={(e) => handleOtherInfoChange('auxilios', e.target.value)} />
            </Field>
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="show-vtr-apoio"
                checked={showVtrApoio}
                onCheckedChange={(checked) => setShowVtrApoio(Boolean(checked))}
              />
              <label
                htmlFor="show-vtr-apoio"
                className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Houve VTR de Apoio?
              </label>
            </div>
            {showVtrApoio && (
                <Field label="VTR DE APOIO">
                  <Textarea className="text-2xl placeholder:capitalize placeholder:text-sm" placeholder="Descreva as viaturas de apoio" value={otherInfo.vtrApoio} onChange={(e) => handleOtherInfoChange('vtrApoio', e.target.value)} />
                </Field>
            )}
            <Field label="OBSERVAÇÕES">
              <Textarea className="text-2xl placeholder:capitalize placeholder:text-sm" placeholder="Descreva detalhes adicionais sobre a ocorrência" value={otherInfo.observacoes} onChange={(e) => handleOtherInfoChange('observacoes', e.target.value)} />
            </Field>
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

    

    