
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
  tipoDeObjeto: string;
  quantidade: string;
};


type OtherInfo = {
  observacoes: string;
  auxilios: string;
  destinacaoDoObjeto: string[];
  qthExato: string;
  vtrApoio: string;
};

export default function TO07Form({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [existingReport, setExistingReport] = useState<any>(null);
  const [showVtrApoio, setShowVtrApoio] = useState(false);


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
    destinacaoDoObjeto: [],
    qthExato: '',
    vtrApoio: '',
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
          setShowVtrApoio(!!formData.otherInfo?.vtrApoio && formData.otherInfo.vtrApoio !== 'NILL');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  const handleGeneralInfoChange = (field: keyof GeneralInfo, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleDestinacaoChange = (destinacaoId: string, checked: boolean) => {
    setOtherInfo(prev => {
        const newDestinacoes = checked
            ? [...prev.destinacaoDoObjeto, destinacaoId]
            : prev.destinacaoDoObjeto.filter(id => id !== destinacaoId);
        return { ...prev, destinacaoDoObjeto: newDestinacoes };
    });
  };

  const handleOtherInfoChange = (field: keyof Omit<OtherInfo, 'destinacaoDoObjeto'>, value: string) => {
    setOtherInfo(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!otherInfo.destinacaoDoObjeto.includes('pr13')) {
      setOtherInfo(prev => ({ ...prev, qthExato: '' }));
    }
  }, [otherInfo.destinacaoDoObjeto]);

  
  const fillEmptyFields = (data: any): any => {
    if (Array.isArray(data)) {
        if (data.length === 0) return 'NILL';
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
    const optionalFields = ['vtrApoio'];

    if (!showVtrApoio) {
        optionalFields.push('vtrApoio');
    }

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            // Pula a validação de campos opcionais
            if (key === 'qthExato' && !otherInfo.destinacaoDoObjeto.includes('pr13')) continue;
            if (optionalFields.includes(key)) continue;

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
      ...existingReport,
      category: categorySlug,
      formData: {
        generalInfo: fillEmptyFields(generalInfo),
        otherInfo: fillEmptyFields(otherInfo),
      }
    };

    if (!otherInfo.destinacaoDoObjeto.includes('pr13')) {
        filledData.formData.otherInfo.qthExato = 'NILL';
    }
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
            <Field label="QTH (LOCAL)">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Km 125 da MS-112" value={generalInfo.qth} onChange={(e) => handleGeneralInfoChange('qth', e.target.value)}/>
            </Field>
             <Field label="SENTIDO">
                <RadioGroup value={generalInfo.sentido} onValueChange={(value) => handleGeneralInfoChange('sentido', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="norte" id="s-norte" /><Label htmlFor="s-norte" className="text-xl font-normal">NORTE</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="sul" id="s-sul" /><Label htmlFor="s-sul" className="text-xl font-normal">SUL</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="norte_e_sul" id="s-norte_e_sul" /><Label htmlFor="s-norte_e_sul" className="text-xl font-normal">NORTE E SUL</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="eixo_central" id="s-eixo_central" /><Label htmlFor="s-eixo_central" className="text-xl font-normal">EIXO CENTRAL</Label></div>
                </RadioGroup>
            </Field>
            <Field label="LOCAL/ÁREA">
                <RadioGroup value={generalInfo.localArea} onValueChange={(value) => handleGeneralInfoChange('localArea', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="faixa_de_rolamento" id="la-faixa_de_rolamento" /><Label htmlFor="la-faixa_de_rolamento" className="text-xl font-normal">FAIXA DE ROLAMENTO</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="terceira_faixa" id="la-terceira_faixa" /><Label htmlFor="la-terceira_faixa" className="text-xl font-normal">TERCEIRA FAIXA</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="acostamento" id="la-acostamento" /><Label htmlFor="la-acostamento" className="text-xl font-normal">ACOSTAMENTO</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="faixa_de_bordo" id="la-faixa_de_bordo" /><Label htmlFor="la-faixa_de_bordo" className="text-xl font-normal">FAIXA DE BORDO</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="area_de_dominio" id="la-area_de_dominio" /><Label htmlFor="la-area_de_dominio" className="text-xl font-normal">ÁREA DE DOMÍNIO</Label></div>
                </RadioGroup>
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
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="do-pr06" checked={otherInfo.destinacaoDoObjeto.includes('pr06')} onCheckedChange={(checked) => handleDestinacaoChange('pr06', !!checked)} />
                    <Label htmlFor="do-pr06" className="text-xl font-normal">PR06</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="do-pr13" checked={otherInfo.destinacaoDoObjeto.includes('pr13')} onCheckedChange={(checked) => handleDestinacaoChange('pr13', !!checked)} />
                    <Label htmlFor="do-pr13" className="text-xl font-normal">PR13</Label>
                </div>
              </div>
            </Field>
            {otherInfo.destinacaoDoObjeto.length > 0 && (
              <Field label={`QTH ${otherInfo.destinacaoDoObjeto.join(', ')}`}>
                  <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Km 123" value={otherInfo.qthExato} onChange={(e) => handleOtherInfoChange('qthExato', e.target.value)}/>
              </Field>
            )}
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="show-vtr-apoio"
                checked={showVtrApoio}
                onCheckedChange={(checked) => setShowVtrApoio(Boolean(checked))}
              />
              <label
                htmlFor="show-vtr-apoio"
                className="text-base font-bold uppercase leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Houve VTR de Apoio?
              </label>
            </div>
            {showVtrApoio && (
                <Field label="VTR DE APOIO">
                  <Textarea className="text-2xl placeholder:capitalize placeholder:text-sm" placeholder="Descreva as viaturas de apoio" value={otherInfo.vtrApoio} onChange={(e) => handleOtherInfoChange('vtrApoio', e.target.value)} />
                </Field>
            )}
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
