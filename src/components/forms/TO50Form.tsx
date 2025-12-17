
'use client';

import { useRouter } from 'next/navigation';
import { Save, Share, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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

type GeneralInfo = {
  rodovia: string;
  ocorrencia: string;
  qth: string;
  sentido: string;
  localArea: string;
  tipoDeServico: string;
  qraResponsavel: string;
  baixaFrequencia: string;
  rg: string;
  cpf: string;
  qtrInicio: string;
  qtrTermino: string;
};


type OtherInfo = {
  observacoes: string;
  auxilios: string;
};

export default function TO50Form({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [existingReport, setExistingReport] = useState<any>(null);


  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    rodovia: '',
    ocorrencia: categorySlug.toUpperCase(),
    qth: '',
    sentido: '',
    localArea: '',
    tipoDeServico: '',
    qraResponsavel: '',
    baixaFrequencia: '',
    rg: '',
    cpf: '',
    qtrInicio: '',
    qtrTermino: '',
  });
  
  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    observacoes: '',
    auxilios: '',
  });
  
  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.category === categorySlug) {
        setExistingReport(parsedData);
        const { formData } = parsedData;

        if (formData) {
          setGeneralInfo(formData.generalInfo || generalInfo);
          setOtherInfo(formData.otherInfo || otherInfo);
        }
      }
    }
  }, [categorySlug]);

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

  const handleGeneralInfoChange = (field: keyof GeneralInfo, value: string) => {
     if (field === 'baixaFrequencia') {
      value = formatPhoneNumber(value);
    }
    if (field === 'cpf') {
      value = formatCPF(value);
    }
    if (field === 'rg') {
      value = formatRG(value);
    }
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleOtherInfoChange = (field: keyof OtherInfo, value: string) => {
    setOtherInfo(prev => ({ ...prev, [field]: value }));
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
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                if (!validateObject(value)) return false;
            } else if (Array.isArray(value)) {
                 if (value.length === 0) return false;
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
      otherInfo
    }
    
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
      formData: {
        generalInfo: fillEmptyFields(reportData.generalInfo),
        otherInfo: fillEmptyFields(reportData.otherInfo),
      }
    };

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
            <Field label="QTH (LOCAL)">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Km 125 da MS-112" value={generalInfo.qth} onChange={(e) => handleGeneralInfoChange('qth', e.target.value)}/>
            </Field>
             <Field label="SENTIDO">
                <RadioGroup value={generalInfo.sentido} onValueChange={(value) => handleGeneralInfoChange('sentido', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="norte" id="s-norte" /><Label htmlFor="s-norte" className="text-xl font-normal">NORTE</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="sul" id="s-sul" /><Label htmlFor="s-sul" className="text-xl font-normal">SUL</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="norte_e_sul" id="s-norte_e_sul" /><Label htmlFor="s-norte_e_sul" className="text-xl font-normal">NORTE E SUL</Label></div>
                </RadioGroup>
            </Field>
            <Field label="LOCAL/ÁREA">
                <RadioGroup value={generalInfo.localArea} onValueChange={(value) => handleGeneralInfoChange('localArea', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="bso" id="la-bso" /><Label htmlFor="la-bso" className="text-xl font-normal">BSO</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="praca_de_pedagio" id="la-praca_de_pedagio" /><Label htmlFor="la-praca_de_pedagio" className="text-xl font-normal">PRAÇA DE PEDÁGIO</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="area_de_dominio" id="la-area_de_dominio" /><Label htmlFor="la-area_de_dominio" className="text-xl font-normal">ÁREA DE DOMÍNIO</Label></div>
                </RadioGroup>
            </Field>
            <Field label="TIPO DE SERVIÇO">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Tipo de Serviço" value={generalInfo.tipoDeServico} onChange={(e) => handleGeneralInfoChange('tipoDeServico', e.target.value)}/>
            </Field>
            <Field label="QRA DO RESPONSÁVEL">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Nome do responsável" value={generalInfo.qraResponsavel} onChange={(e) => handleGeneralInfoChange('qraResponsavel', e.target.value)}/>
            </Field>
            <Field label="BAIXA FREQUÊNCIA">
                <Input 
                  className="text-xl placeholder:capitalize placeholder:text-sm"
                  placeholder="(00) 00000-0000" 
                  value={generalInfo.baixaFrequencia}
                  onChange={e => handleGeneralInfoChange('baixaFrequencia', e.target.value)}
                  maxLength={15}
                />
            </Field>
             <Field label="RG">
                <Input 
                    className="text-xl placeholder:capitalize placeholder:text-sm" 
                    placeholder="00.000.000-0" 
                    value={generalInfo.rg} 
                    onChange={e => handleGeneralInfoChange('rg', e.target.value)}
                    maxLength={12}
                />
             </Field>
             <Field label="CPF">
                <Input 
                    className="text-xl placeholder:capitalize placeholder:text-sm" 
                    placeholder="000.000.000-00" 
                    value={generalInfo.cpf} 
                    onChange={e => handleGeneralInfoChange('cpf', e.target.value)}
                    maxLength={14}
                />
             </Field>
            <Field label="QTR DE INÍCIO">
                <Input type="time" className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="HH:MM" value={generalInfo.qtrInicio} onChange={(e) => handleGeneralInfoChange('qtrInicio', e.target.value)}/>
            </Field>
            <Field label="QTR DE TÉRMINO">
                <Input type="time" className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="HH:MM" value={generalInfo.qtrTermino} onChange={(e) => handleGeneralInfoChange('qtrTermino', e.target.value)}/>
            </Field>
          </div>
        </div>

        {/* Outras Informações */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">Outras Informações</h2>
          <div className="space-y-8">
            <Field label="AUXÍLIOS/PR">
              <Textarea className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Descreva os auxílios prestados" value={otherInfo.auxilios} onChange={(e) => handleOtherInfoChange('auxilios', e.target.value)} />
            </Field>
            <Field label="OBSERVAÇÕES">
              <Textarea className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Descreva detalhes adicionais sobre a ocorrência" value={otherInfo.observacoes} onChange={(e) => handleOtherInfoChange('observacoes', e.target.value)} />
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
