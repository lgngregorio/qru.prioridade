
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
  animal: string;
  quantidade: string;
  situacao: string;
};

type CaracteristicasEntorno = {
  entornoNorte: string;
  entornoSul: string;
};

type TracadoPista = {
  pista: string;
  acostamento: string;
  tracado: string;
  perfil: string;
};

type OtherInfo = {
  observacoes: string;
  auxilios: string;
  destinacaoAnimal: string;
  qthExato: string;
  vtrApoio: string;
};

export default function TO03Form({ categorySlug }: { categorySlug: string }) {
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
    animal: '',
    quantidade: '',
    situacao: '',
  });
  
  const [caracteristicasEntorno, setCaracteristicasEntorno] = useState<CaracteristicasEntorno>({
    entornoNorte: '',
    entornoSul: '',
  });

  const [tracadoPista, setTracadoPista] = useState<TracadoPista>({
    pista: '',
    acostamento: '',
    tracado: '',
    perfil: '',
  });

  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    observacoes: '',
    auxilios: '',
    destinacaoAnimal: '',
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
          setCaracteristicasEntorno(formData.caracteristicasEntorno || caracteristicasEntorno);
          setTracadoPista(formData.tracadoPista || tracadoPista);
          setOtherInfo(formData.otherInfo || otherInfo);
          setShowVtrApoio(!!formData.otherInfo?.vtrApoio && formData.otherInfo.vtrApoio !== 'NILL');
        }
      }
    }
  }, [categorySlug]);

  const handleGeneralInfoChange = (field: keyof GeneralInfo, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCaracteristicasEntornoChange = (field: keyof CaracteristicasEntorno, value: string) => {
    setCaracteristicasEntorno(prev => ({ ...prev, [field]: value }));
  };

  const handleTracadoPistaChange = (field: keyof TracadoPista, value: string) => {
    setTracadoPista(prev => ({ ...prev, [field]: value }));
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

            // Pula a validação de campos opcionais
            if (key === 'vtrApoio' && !showVtrApoio) continue;
            if (key === 'qthExato' && otherInfo.destinacaoAnimal !== 'pr13') continue;

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
      caracteristicasEntorno,
      tracadoPista,
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
      ...existingReport,
      category: categorySlug,
      formData: {
        generalInfo: fillEmptyFields(generalInfo),
        caracteristicasEntorno: fillEmptyFields(caracteristicasEntorno),
        tracadoPista: fillEmptyFields(tracadoPista),
        otherInfo: fillEmptyFields(otherInfo),
      }
    };
    
    if (!showVtrApoio) {
      filledData.formData.otherInfo.vtrApoio = 'NILL';
    }
    if (otherInfo.destinacaoAnimal !== 'pr13') {
        filledData.formData.otherInfo.qthExato = 'NILL';
    }

    return filledData;
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
            <Field label="ANIMAL">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Cavalo" value={generalInfo.animal} onChange={(e) => handleGeneralInfoChange('animal', e.target.value)}/>
            </Field>
            <Field label="QUANTIDADE">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: 1" value={generalInfo.quantidade} onChange={(e) => handleGeneralInfoChange('quantidade', e.target.value)}/>
            </Field>
            <Field label="SITUAÇÃO">
                <Select value={generalInfo.situacao} onValueChange={(value) => handleGeneralInfoChange('situacao', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ileso">ILESO</SelectItem>
                        <SelectItem value="ferido">FERIDO</SelectItem>
                        <SelectItem value="fatal">FATAL</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
          </div>
        </div>

        {/* Caracteristicas Entorno */}
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">CARACTERÍSTICAS DO ENTORNO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field label="ENTORNO NORTE">
                    <Select value={caracteristicasEntorno.entornoNorte} onValueChange={(value) => handleCaracteristicasEntornoChange('entornoNorte', value)}>
                        <SelectTrigger className="text-xl normal-case placeholder:text-base">
                            <SelectValue placeholder="Selecione o entorno" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="area_urbana">ÁREA URBANA</SelectItem>
                            <SelectItem value="curso_dagua">CURSO D'ÁGUA</SelectItem>
                            <SelectItem value="fragmento_nativo">FRAGMENTO NATIVO</SelectItem>
                            <SelectItem value="plantio_agricola">PLANTIO AGRÍCOLA</SelectItem>
                            <SelectItem value="pecuaria">PECUÁRIA</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="ENTORNO SUL">
                    <Select value={caracteristicasEntorno.entornoSul} onValueChange={(value) => handleCaracteristicasEntornoChange('entornoSul', value)}>
                        <SelectTrigger className="text-xl normal-case placeholder:text-base">
                            <SelectValue placeholder="Selecione o entorno" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="area_urbana">ÁREA URBANA</SelectItem>
                            <SelectItem value="curso_dagua">CURSO D'ÁGUA</SelectItem>
                            <SelectItem value="fragmento_nativo">FRAGMENTO NATIVO</SelectItem>
                            <SelectItem value="plantio_agricola">PLANTIO AGRÍCOLA</SelectItem>
                            <SelectItem value="pecuaria">PECUÁRIA</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
            </div>
        </div>

        {/* Traçado de Pista */}
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">TRAÇADO DA PISTA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Field label="PISTA">
                    <Select value={tracadoPista.pista} onValueChange={(value) => handleTracadoPistaChange('pista', value)}>
                        <SelectTrigger className="text-xl normal-case placeholder:text-base">
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="simples">SIMPLES</SelectItem>
                            <SelectItem value="dupla">DUPLA</SelectItem>
                            <SelectItem value="multivias">MULTIVIAS</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                 <Field label="ACOSTAMENTO">
                    <Select value={tracadoPista.acostamento} onValueChange={(value) => handleTracadoPistaChange('acostamento', value)}>
                        <SelectTrigger className="text-xl normal-case placeholder:text-base">
                            <SelectValue placeholder="Selecione a condição do acostamento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="com_acostamento_sul_e_norte">COM ACOSTAMENTO SUL E NORTE</SelectItem>
                            <SelectItem value="com_acostamento_sul">COM ACOSTAMENTO SUL</SelectItem>
                            <SelectItem value="com_acostamento_norte">COM ACOSTAMENTO NORTE</SelectItem>
                            <SelectItem value="sem_acostamento">SEM ACOSTAMENTO</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="TRAÇADO">
                    <Select value={tracadoPista.tracado} onValueChange={(value) => handleTracadoPistaChange('tracado', value)}>
                        <SelectTrigger className="text-xl normal-case placeholder:text-base">
                            <SelectValue placeholder="Selecione o traçado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reta">RETA</SelectItem>
                            <SelectItem value="curva">CURVA</SelectItem>
                            <SelectItem value="curva_acentuada">CURVA ACENTUADA</SelectItem>
                            <SelectItem value="curva_suave">CURVA SUAVE</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>
                <Field label="PERFIL">
                    <Select value={tracadoPista.perfil} onValueChange={(value) => handleTracadoPistaChange('perfil', value)}>
                        <SelectTrigger className="text-xl normal-case placeholder:text-base">
                            <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="em_nivel">EM NÍVEL</SelectItem>
                            <SelectItem value="aclive">ACLIVE</SelectItem>
                            <SelectItem value="declive">DECLIVE</SelectItem>
                        </SelectContent>
                    </Select>
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
            <Field label="DESTINAÇÃO DO ANIMAL">
                <Select value={otherInfo.destinacaoAnimal} onValueChange={(value) => handleOtherInfoChange('destinacaoAnimal', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione a destinação" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pr05">PR05</SelectItem>
                        <SelectItem value="pr56">PR56</SelectItem>
                        <SelectItem value="pr13">PR13</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label={otherInfo.destinacaoAnimal || "QTH EXATO"}>
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Km 123" value={otherInfo.qthExato} onChange={(e) => handleOtherInfoChange('qthExato', e.target.value)}/>
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
