
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
  tipoDeDefeito: string;
  quantidade: string;
  qthInicio: string;
  qthTermino: string;
};


type OtherInfo = {
  observacoes: string;
  auxilios: string;
  vtrApoio: string;
  numeroOcorrencia: string;
};

export default function TO34Form({ categorySlug }: { categorySlug: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showVtrApoio, setShowVtrApoio] = useState(false);
  const [existingReport, setExistingReport] = useState<any>(null);


  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    rodovia: '',
    ocorrencia: categorySlug.toUpperCase(),
    qth: '',
    sentido: '',
    localArea: '',
    tipoDeDefeito: '',
    quantidade: '',
    qthInicio: '',
    qthTermino: '',
  });
  
  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    observacoes: '',
    auxilios: '',
    vtrApoio: '',
    numeroOcorrencia: '',
  });

  useEffect(() => {
    const savedData = localStorage.getItem('reportPreview');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setExistingReport(parsedData);
      const { formData } = parsedData;

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
    const reportData = {
      generalInfo,
      otherInfo
    }
    const filledData = {
      ...existingReport,
      category: categorySlug,
      formData: {
        generalInfo: fillEmptyFields(reportData.generalInfo),
        otherInfo: fillEmptyFields(reportData.otherInfo),
      }
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
            <Field label="QTH DE INÍCIO">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Km inicial" value={generalInfo.qthInicio} onChange={(e) => handleGeneralInfoChange('qthInicio', e.target.value)}/>
            </Field>
            <Field label="QTH DE TÉRMINO">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Km final" value={generalInfo.qthTermino} onChange={(e) => handleGeneralInfoChange('qthTermino', e.target.value)}/>
            </Field>
            <Field label="TIPO DE DEFEITO">
                <Select value={generalInfo.tipoDeDefeito} onValueChange={(value) => handleGeneralInfoChange('tipoDeDefeito', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione o tipo de defeito" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="buraco">BURACO</SelectItem>
                        <SelectItem value="deformidade">DEFORMIDADE</SelectItem>
                    </SelectContent>
                </Select>
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
