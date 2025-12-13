
'use client';

import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  tipoDeObjeto: string;
  quantidade: string;
};


type OtherInfo = {
  observacoes: string;
  auxilios: string;
  destinacaoDoObjeto: string;
  qthExato: string;
  numeroOcorrencia: string;
};

export default function TO07Form({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    rodovia: '',
    ocorrencia: categorySlug.toUpperCase(),
    qth: '',
    sentido: '',
    localArea: '',
    tipoDeObjeto: '',
    quantidade: '',
  });
  
  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    observacoes: '',
    auxilios: '',
    destinacaoDoObjeto: '',
    qthExato: '',
    numeroOcorrencia: '',
  });
  
  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const { formData } = JSON.parse(savedData);
      if (formData) {
        setGeneralInfo(formData.generalInfo || generalInfo);
        setOtherInfo(formData.otherInfo || otherInfo);
      }
    }
  }, []);

  const handleGeneralInfoChange = (field: keyof GeneralInfo, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleOtherInfoChange = (field: keyof OtherInfo, value: string) => {
    setOtherInfo(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (otherInfo.destinacaoDoObjeto !== 'pr13') {
      setOtherInfo(prev => ({ ...prev, qthExato: '' }));
    }
  }, [otherInfo.destinacaoDoObjeto]);

  
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

            // Pula a validação de campos opcionais
            if (key === 'qthExato' && otherInfo.destinacaoDoObjeto !== 'pr13') continue;

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
      otherInfo,
    };
    
    if (!validateObject(reportData)) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return null;
    }

    const filledData = {
      generalInfo: fillEmptyFields(generalInfo),
      otherInfo: fillEmptyFields(otherInfo),
    };

    if (otherInfo.destinacaoDoObjeto !== 'pr13') {
        filledData.otherInfo.qthExato = 'NILL';
    }

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
                        <SelectItem value="faixa_de_rolamento">FAIXA DE ROLAMENTO</SelectItem>
                        <SelectItem value="acostamento">ACOSTAMENTO</SelectItem>
                        <SelectItem value="terceira_faixa">TERCEIRA FAIXA</SelectItem>
                        <SelectItem value="area_de_dominio">ÁREA DE DOMÍNIO</SelectItem>
                        <SelectItem value="faixa_de_bordo">FAIXA DE BORDO</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="TIPO DE OBJETO">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Pneu, galho de árvore" value={generalInfo.tipoDeObjeto} onChange={(e) => handleGeneralInfoChange('tipoDeObjeto', e.target.value)}/>
            </Field>
            <Field label="QUANTIDADE">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: 1" value={generalInfo.quantidade} onChange={(e) => handleGeneralInfoChange('quantidade', e.target.value)}/>
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
            <Field label="DESTINAÇÃO DO OBJETO">
                <Select value={otherInfo.destinacaoDoObjeto} onValueChange={(value) => handleOtherInfoChange('destinacaoDoObjeto', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione a destinação" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pr06">PR06</SelectItem>
                        <SelectItem value="pr13">PR13</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            {otherInfo.destinacaoDoObjeto === 'pr13' && (
              <Field label="QTH EXATO">
                  <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Km 123" value={otherInfo.qthExato} onChange={(e) => handleOtherInfoChange('qthExato', e.target.value)}/>
              </Field>
            )}
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
