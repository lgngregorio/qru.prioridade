
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
  numeroOcorrencia: string;
};

export default function TO50Form({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();

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
    numeroOcorrencia: '',
  });

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

  const prepareReportData = () => {
    const filledData = {
      generalInfo: fillEmptyFields(generalInfo),
      otherInfo: fillEmptyFields(otherInfo),
    };

    return {
      category: categorySlug,
      formData: filledData,
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
                    </SelectContent>
                </Select>
            </Field>
            <Field label="LOCAL/ÁREA">
                <Select value={generalInfo.localArea} onValueChange={(value) => handleGeneralInfoChange('localArea', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione o local/área" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bso">BSO</SelectItem>
                        <SelectItem value="praca_de_pedagio">PRAÇA DE PEDÁGIO</SelectItem>
                        <SelectItem value="area_de_dominio">ÁREA DE DOMÍNIO</SelectItem>
                    </SelectContent>
                </Select>
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
            <Field label="NÚMERO DA OCORRÊNCIA">
              <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Número de controle interno" value={otherInfo.numeroOcorrencia} onChange={(e) => handleOtherInfoChange('numeroOcorrencia', e.target.value)} />
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
