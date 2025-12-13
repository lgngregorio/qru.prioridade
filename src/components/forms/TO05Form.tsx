
'use client';

import { useRouter } from 'next/navigation';
import { Save, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';


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
  vtrApoio: string;
  observacoes: string;
  numeroOcorrencia: string;
};

export default function TO05Form({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showVtrApoio, setShowVtrApoio] = useState(false);

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    rodovia: '',
    ocorrencia: categorySlug.toUpperCase(),
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
    vtrApoio: '',
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
  
  const validateObject = (obj: any): boolean => {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            if (key === 'vtrApoio' && !showVtrApoio) continue;
            if (key === 'id') continue;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                if (!validateObject(value)) return false;
            } else if (Array.isArray(value)) {
                 if (value.some(item => typeof item === 'object' && !validateObject(item))) return false;
            } else if (value === '' || value === null || value === undefined) {
                return false;
            }
        }
    }
    return true;
};

  const prepareReportData = () => {
    const reportData = {
      generalInfo,
      vehicles,
      otherInfo
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
      generalInfo: fillEmptyFields(generalInfo),
      vehicles: fillEmptyFields(vehicles),
      otherInfo: fillEmptyFields(otherInfo),
    };
    
    if (!showVtrApoio) {
      filledData.otherInfo.vtrApoio = 'NILL';
    }

    return {
      category: categorySlug,
      formData: filledData,
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
        {/* Informações Gerais */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">Informações Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="RODOVIA">
                <Select value={generalInfo.rodovia} onValueChange={(value) => handleGeneralInfoChange('rodovia', value)}>
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
            <Field label="OCORRÊNCIA">
                <Input className="text-xl uppercase" value={generalInfo.ocorrencia} disabled />
            </Field>
            <Field label="TIPO DE PANE">
                 <Select value={generalInfo.tipoPane} onValueChange={(value) => handleGeneralInfoChange('tipoPane', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
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
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Km 125 da MS-112" value={generalInfo.qth} onChange={(e) => handleGeneralInfoChange('qth', e.target.value)}/>
            </Field>
             <Field label="SENTIDO">
                <Select value={generalInfo.sentido} onValueChange={(value) => handleGeneralInfoChange('sentido', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione o sentido" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="norte">NORTE</SelectItem>
                        <SelectItem value="sul">SUL</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="LOCAL/ÁREA">
                <Select value={generalInfo.localArea} onValueChange={(value) => handleGeneralInfoChange('localArea', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione o local/área" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="acostamento">ACOSTAMENTO</SelectItem>
                        <SelectItem value="area_dominio">ÁREA DE DOMÍNIO</SelectItem>
                        <SelectItem value="terceira_faixa">TERCEIRA FAIXA</SelectItem>
                        <SelectItem value="faixa_rolamento_acostamento">FAIXA DE ROLAMENTO/ACOSTAMENTO</SelectItem>
                    </SelectContent>
                </Select>
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
                        <Select value={vehicle.eixos} onValueChange={value => handleVehicleChange(index, 'eixos', value)}>
                            <SelectTrigger className="text-xl normal-case placeholder:text-base"><SelectValue placeholder="Selecione os eixos" /></SelectTrigger>
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
                            <SelectTrigger className="text-xl normal-case placeholder:text-base"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mo">MO</SelectItem>
                                <SelectItem value="ap">AP</SelectItem>
                                <SelectItem value="utilitaria">UTILITÁRIA</SelectItem>
                                <SelectItem value="ca">CA</SelectItem>
                                <SelectItem value="on">ON</SelectItem>
                                <SelectItem value="car">CAR</SelectItem>
                                <SelectItem value="ca-romeu-julieta">CA/ ROMEU E JULIETA</SelectItem>
                                <SelectItem value="carretinha-reboque">CARRETINHA/REBOQUE</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="ESTADO DO PNEU">
                        <Select value={vehicle.pneu} onValueChange={value => handleVehicleChange(index, 'pneu', value)}>
                            <SelectTrigger className="text-xl normal-case placeholder:text-base"><SelectValue placeholder="Selecione o estado do pneu" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bom">BOM</SelectItem>
                                <SelectItem value="regular">REGULAR</SelectItem>
                                <SelectItem value="ruim">RUIM</SelectItem>
                            </SelectContent>
                        </Select>
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
            <Field label="NÚMERO DA OCORRÊNCIA">
              <Input className="text-2xl placeholder:capitalize placeholder:text-sm" placeholder="Número de controle interno" value={otherInfo.numeroOcorrencia} onChange={(e) => handleOtherInfoChange('numeroOcorrencia', e.target.value)} />
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
