
'use client';

import { useRouter } from 'next/navigation';
import { Save, Share, PlusCircle, Trash2, Loader2 } from 'lucide-react';
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
  danoPatrimonio: string;
  observacoes: string;
  numeroOcorrencia: string;
};

export default function QudOperacaoForm({ categorySlug }: { categorySlug: string }) {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showVtrApoio, setShowVtrApoio] = useState(false);
  const [showDanoPatrimonio, setShowDanoPatrimonio] = useState(false);

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    rodovia: '',
    ocorrencia: '',
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
    danoPatrimonio: '',
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

  const validateFields = (data: any): boolean => {
      if (Array.isArray(data)) {
        return data.every(item => validateFields(item));
      }
      if (typeof data === 'object' && data !== null) {
        // Naive check for all properties in the object
        for (const key in data) {
          if (!validateFields(data[key])) return false;
        }
        return true;
      }
      // Allow NILL as a valid value
      if (data === 'NILL') return true;

      // Check for empty strings, null, or undefined
      return data !== '' && data !== null && data !== undefined;
  };

  const prepareReportData = () => {
    const filledData = {
      generalInfo: fillEmptyFields(generalInfo),
      vehicles: fillEmptyFields(vehicles),
      otherInfo: fillEmptyFields(otherInfo),
    };

    if (!showVtrApoio) {
      filledData.otherInfo.vtrApoio = 'NILL';
    }
    
    if (!showDanoPatrimonio) {
      filledData.otherInfo.danoPatrimonio = 'NILL';
    }

    return {
      category: categorySlug,
      formData: filledData,
      createdAt: serverTimestamp(),
    };
  };
  
  const saveReport = async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível conectar ao banco de dados.",
      });
      return false;
    }

    const reportData = prepareReportData();

    if (!validateFields(reportData.formData)) {
        toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos antes de salvar ou compartilhar.",
        });
        return false;
    }
    
    setIsSaving(true);
    
    const reportsCollection = collection(firestore, 'reports');

    addDoc(reportsCollection, reportData)
      .then(() => {
        console.log("Relatório salvo com sucesso em segundo plano.");
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: reportsCollection.path,
          operation: 'create',
          requestResourceData: reportData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      
    return true;
  };

  const handleSave = async () => {
    const success = await saveReport();
    if (success) {
      toast({
        title: "Sucesso!",
        description: "Relatório salvo e enviado para a fila.",
        className: "bg-green-600 text-white",
      });
      router.push('/historico');
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    const success = await saveReport();
    if (success) {
      const reportData = prepareReportData().formData;
      const category = eventCategories.find(c => c.slug === categorySlug);
      
      let message = `*${category ? category.title.toUpperCase() : 'RELATÓRIO DE OCORRÊNCIA'}*\n\n`;
      
      message += `*INFORMAÇÕES GERAIS*\n`;
      Object.entries(reportData.generalInfo).forEach(([key, value]) => {
          if (value !== 'NILL' && value !== '') {
             message += `*${key.toUpperCase()}:* ${String(value).toUpperCase()}\n`;
          }
      });
      message += '\n';

      reportData.vehicles.forEach((vehicle: any, index: number) => {
        message += `*DADOS DO VEÍCULO ${index + 1}*\n`;
        Object.entries(vehicle).forEach(([key, value]) => {
            if (key !== 'id' && value !== 'NILL' && value !== '') {
               message += `*${key.toUpperCase()}:* ${String(value).toUpperCase()}\n`;
            }
        });
        message += '\n';
      });
      
      message += `*OUTRAS INFORMAÇÕES*\n`;
      Object.entries(reportData.otherInfo).forEach(([key, value]) => {
          if (value !== 'NILL' && value !== '') {
             message += `*${key.toUpperCase()}:* ${String(value).toUpperCase()}\n`;
          }
      });

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      router.push('/historico');
    }
     setIsSaving(false);
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
              <Select value={generalInfo.ocorrencia} onValueChange={(value) => handleGeneralInfoChange('ocorrencia', value)}>
                  <SelectTrigger className="text-xl normal-case placeholder:text-base">
                      <SelectValue placeholder="Selecione o AC" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="ac01">AC01</SelectItem>
                      <SelectItem value="ac02">AC02</SelectItem>
                      <SelectItem value="ac03">AC03</SelectItem>
                  </SelectContent>
              </Select>
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
                        <SelectItem value="ambos">AMBOS</SelectItem>
                        <SelectItem value="eixo_central">EIXO CENTRAL</SelectItem>
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
                        <SelectItem value="faixa_de_rolamento">FAIXA DE ROLAMENTO</SelectItem>
                        <SelectItem value="area_lindeira">ÁREA LINDEIRA</SelectItem>
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

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="show-dano-patrimonio"
                checked={showDanoPatrimonio}
                onCheckedChange={(checked) => setShowDanoPatrimonio(Boolean(checked))}
              />
              <label
                htmlFor="show-dano-patrimonio"
                className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Houve Dano ao Patrimônio?
              </label>
            </div>
            {showDanoPatrimonio && (
                <Field label="DANO AO PATRIMÔNIO">
                  <Textarea className="text-2xl placeholder:capitalize placeholder:text-sm" placeholder="Descreva os danos ao patrimônio" value={otherInfo.danoPatrimonio} onChange={(e) => handleOtherInfoChange('danoPatrimonio', e.target.value)} />
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

        
      </form>
    </div>
  );
}

    
