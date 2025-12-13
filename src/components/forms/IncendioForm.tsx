
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
  qth: string;
  sentido: string;
  localArea: string;
  qthInicio: string;
  qthTermino: string;
  proporcaoMetros: string;
  areaTotal: string;
};


type OtherInfo = {
  auxilios: string;
  vtrApoio: string;
  observacoes: string;
  numeroOcorrencia: string;
};

export default function IncendioForm({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showVtrApoio, setShowVtrApoio] = useState(false);

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    rodovia: '',
    ocorrencia: categorySlug.toUpperCase(),
    qth: '',
    sentido: '',
    localArea: '',
    qthInicio: '',
    qthTermino: '',
    proporcaoMetros: '',
    areaTotal: '',
  });

  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    auxilios: '',
    vtrApoio: '',
    observacoes: '',
    numeroOcorrencia: '',
  });
  
  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const { formData } = JSON.parse(savedData);
      if (formData) {
        setGeneralInfo(formData.generalInfo || generalInfo);
        setOtherInfo(formData.otherInfo || otherInfo);
        setShowVtrApoio(!!formData.otherInfo?.vtrApoio && formData.otherInfo.vtrApoio !== 'NILL');
      }
    }
  }, []);

  const handleGeneralInfoChange = (field: keyof GeneralInfo, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleProportionChange = (value: string) => {
    let area = '';
    const parts = value.toLowerCase().split('x');
    if (parts.length === 2) {
      const length = parseFloat(parts[0]);
      const width = parseFloat(parts[1]);
      if (!isNaN(length) && !isNaN(width)) {
        area = (length * width).toString();
      }
    }
    setGeneralInfo(prev => ({
      ...prev,
      proporcaoMetros: value,
      areaTotal: area
    }));
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
  
  const validateObject = (obj: any, parentKey = ''): boolean => {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            // Pula a validação de campos opcionais
            if (key === 'vtrApoio' && !showVtrApoio) continue;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                if (!validateObject(value, fullKey)) return false;
            } else if (Array.isArray(value)) {
                if (value.some(item => (typeof item === 'object' && !validateObject(item)) || item === '')) return false;
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
      generalInfo: generalInfo,
      otherInfo: otherInfo,
    };

    if (!validateObject(reportData)) {
        toast({
            variant: "destructive",
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos antes de continuar.",
        });
        return null;
    }
    
    const filledReportData = {
        category: categorySlug,
        formData: fillEmptyFields(reportData),
    };
    
    return filledReportData;
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
                        <SelectItem value="area_de_dominio">ÁREA DE DOMÍNIO</SelectItem>
                        <SelectItem value="area_lindeira">ÁREA LINDEIRA</SelectItem>
                        <SelectItem value="area_de_dominio_lindeira">ÁREA DE DOMÍNIO/LINDEIRA</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="QTH DE INÍCIO">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Km inicial do incêndio" value={generalInfo.qthInicio} onChange={(e) => handleGeneralInfoChange('qthInicio', e.target.value)} />
            </Field>
            <Field label="QTH DE TÉRMINO">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Km final do incêndio" value={generalInfo.qthTermino} onChange={(e) => handleGeneralInfoChange('qthTermino', e.target.value)} />
            </Field>
            <Field label="PROPORÇÃO EM METROS">
              <Input type="text" className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: 20x200" value={generalInfo.proporcaoMetros} onChange={(e) => handleProportionChange(e.target.value)} />
            </Field>
            <Field label="ÁREA TOTAL (M²)">
              <Input type="text" className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Área total do incêndio" value={generalInfo.areaTotal} readOnly />
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

    