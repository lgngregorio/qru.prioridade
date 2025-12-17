
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
  animal: string;
  quantidade: string;
  situacao: string[];
};

type CaracteristicasEntorno = {
  entornoNorte: string;
  entornoNorteOutro: string;
  entornoSul: string;
  entornoSulOutro: string;
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
    situacao: [],
  });
  
  const [caracteristicasEntorno, setCaracteristicasEntorno] = useState<CaracteristicasEntorno>({
    entornoNorte: '',
    entornoNorteOutro: '',
    entornoSul: '',
    entornoSulOutro: '',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  const handleGeneralInfoChange = (field: keyof Omit<GeneralInfo, 'situacao'>, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSituacaoChange = (situacaoId: string, checked: boolean) => {
    setGeneralInfo(prev => {
        const newSituacoes = checked
            ? [...prev.situacao, situacaoId]
            : prev.situacao.filter(id => id !== situacaoId);
        return { ...prev, situacao: newSituacoes };
    });
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
    const optionalFields = ['id', 'entornoNorteOutro', 'entornoSulOutro'];
    if (caracteristicasEntorno.entornoNorte !== 'outro') optionalFields.push('entornoNorteOutro');
    if (caracteristicasEntorno.entornoSul !== 'outro') optionalFields.push('entornoSulOutro');

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (optionalFields.includes(key)) continue;

            // Pula a validação de campos opcionais
            if (key === 'vtrApoio' && !showVtrApoio) continue;
            if (key === 'qthExato' && otherInfo.destinacaoAnimal !== 'pr13') continue;

            
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
      caracteristicasEntorno: {
          ...caracteristicasEntorno,
          entornoNorte: caracteristicasEntorno.entornoNorte === 'outro' ? caracteristicasEntorno.entornoNorteOutro : caracteristicasEntorno.entornoNorte,
          entornoSul: caracteristicasEntorno.entornoSul === 'outro' ? caracteristicasEntorno.entornoSulOutro : caracteristicasEntorno.entornoSul,
      },
      tracadoPista,
      otherInfo
    };

    const { entornoNorteOutro, entornoSulOutro, ...caracteristicasCleaned } = reportData.caracteristicasEntorno;

    const finalReportData = {
      ...reportData,
      caracteristicasEntorno: caracteristicasCleaned,
    };

    if (!validateObject(finalReportData)) {
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
      formData: fillEmptyFields(finalReportData),
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
            <Field label="ANIMAL">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: Cavalo" value={generalInfo.animal} onChange={(e) => handleGeneralInfoChange('animal', e.target.value)}/>
            </Field>
            <Field label="QUANTIDADE">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: 1" value={generalInfo.quantidade} onChange={(e) => handleGeneralInfoChange('quantidade', e.target.value)}/>
            </Field>
            <Field label="SITUAÇÃO">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="sit-ileso" checked={generalInfo.situacao.includes('ileso')} onCheckedChange={(checked) => handleSituacaoChange('ileso', !!checked)} />
                        <Label htmlFor="sit-ileso" className="text-xl font-normal">ILESO</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="sit-ferido" checked={generalInfo.situacao.includes('ferido')} onCheckedChange={(checked) => handleSituacaoChange('ferido', !!checked)} />
                        <Label htmlFor="sit-ferido" className="text-xl font-normal">FERIDO</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="sit-fatal" checked={generalInfo.situacao.includes('fatal')} onCheckedChange={(checked) => handleSituacaoChange('fatal', !!checked)} />
                        <Label htmlFor="sit-fatal" className="text-xl font-normal">FATAL</Label>
                    </div>
                </div>
            </Field>
          </div>
        </div>

        {/* Caracteristicas Entorno */}
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">CARACTERÍSTICAS DO ENTORNO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Field label="ENTORNO NORTE">
                    <RadioGroup value={caracteristicasEntorno.entornoNorte} onValueChange={(value) => handleCaracteristicasEntornoChange('entornoNorte', value)} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="area_urbana" id="en-area_urbana" /><Label htmlFor="en-area_urbana" className="text-xl font-normal">ÁREA URBANA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="curso_dagua" id="en-curso_dagua" /><Label htmlFor="en-curso_dagua" className="text-xl font-normal">CURSO D'ÁGUA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="fragmento_nativo" id="en-fragmento_nativo" /><Label htmlFor="en-fragmento_nativo" className="text-xl font-normal">FRAGMENTO NATIVO</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="plantio_agricola" id="en-plantio_agricola" /><Label htmlFor="en-plantio_agricola" className="text-xl font-normal">PLANTIO AGRÍCOLA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="pecuaria" id="en-pecuaria" /><Label htmlFor="en-pecuaria" className="text-xl font-normal">PECUÁRIA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="outro" id="en-outro" /><Label htmlFor="en-outro" className="text-xl font-normal">OUTRO</Label></div>
                    </RadioGroup>
                    {caracteristicasEntorno.entornoNorte === 'outro' && (
                        <Input className="text-xl mt-2" placeholder="Especifique" value={caracteristicasEntorno.entornoNorteOutro} onChange={(e) => handleCaracteristicasEntornoChange('entornoNorteOutro', e.target.value)} />
                    )}
                </Field>
                <Field label="ENTORNO SUL">
                    <RadioGroup value={caracteristicasEntorno.entornoSul} onValueChange={(value) => handleCaracteristicasEntornoChange('entornoSul', value)} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="area_urbana" id="es-area_urbana" /><Label htmlFor="es-area_urbana" className="text-xl font-normal">ÁREA URBANA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="curso_dagua" id="es-curso_dagua" /><Label htmlFor="es-curso_dagua" className="text-xl font-normal">CURSO D'ÁGUA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="fragmento_nativo" id="es-fragmento_nativo" /><Label htmlFor="es-fragmento_nativo" className="text-xl font-normal">FRAGMENTO NATIVO</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="plantio_agricola" id="es-plantio_agricola" /><Label htmlFor="es-plantio_agricola" className="text-xl font-normal">PLANTIO AGRÍCOLA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="pecuaria" id="es-pecuaria" /><Label htmlFor="es-pecuaria" className="text-xl font-normal">PECUÁRIA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="outro" id="es-outro" /><Label htmlFor="es-outro" className="text-xl font-normal">OUTRO</Label></div>
                    </RadioGroup>
                    {caracteristicasEntorno.entornoSul === 'outro' && (
                        <Input className="text-xl mt-2" placeholder="Especifique" value={caracteristicasEntorno.entornoSulOutro} onChange={(e) => handleCaracteristicasEntornoChange('entornoSulOutro', e.target.value)} />
                    )}
                </Field>
            </div>
        </div>

        {/* Traçado de Pista */}
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">TRAÇADO DA PISTA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Field label="PISTA">
                    <RadioGroup value={tracadoPista.pista} onValueChange={(value) => handleTracadoPistaChange('pista', value)} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="simples" id="tp-simples" /><Label htmlFor="tp-simples" className="text-xl font-normal">SIMPLES</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="dupla" id="tp-dupla" /><Label htmlFor="tp-dupla" className="text-xl font-normal">DUPLA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="multivias" id="tp-multivias" /><Label htmlFor="tp-multivias" className="text-xl font-normal">MULTIVIAS</Label></div>
                    </RadioGroup>
                </Field>
                 <Field label="ACOSTAMENTO">
                    <RadioGroup value={tracadoPista.acostamento} onValueChange={(value) => handleTracadoPistaChange('acostamento', value)} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="com_acostamento_norte_e_sul" id="ta-com_acostamento_norte_e_sul" /><Label htmlFor="ta-com_acostamento_norte_e_sul" className="text-xl font-normal">COM ACOSTAMENTO NORTE E SUL</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="com_acostamento_norte_e_sem_sul" id="ta-com_acostamento_norte_e_sem_sul" /><Label htmlFor="ta-com_acostamento_norte_e_sem_sul" className="text-xl font-normal">COM ACOSTAMENTO NORTE E SEM SUL</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="com_acostamento_sul_e_sem_norte" id="ta-com_acostamento_sul_e_sem_norte" /><Label htmlFor="ta-com_acostamento_sul_e_sem_norte" className="text-xl font-normal">COM ACOSTAMENTO SUL E SEM NORTE</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="sem_acostamento_norte_e_sul" id="ta-sem_acostamento_norte_e_sul" /><Label htmlFor="ta-sem_acostamento_norte_e_sul" className="text-xl font-normal">SEM ACOSTAMENTO NORTE E SUL</Label></div>
                    </RadioGroup>
                </Field>
                <Field label="TRAÇADO">
                    <RadioGroup value={tracadoPista.tracado} onValueChange={(value) => handleTracadoPistaChange('tracado', value)} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="reta" id="tt-reta" /><Label htmlFor="tt-reta" className="text-xl font-normal">RETA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="curva" id="tt-curva" /><Label htmlFor="tt-curva" className="text-xl font-normal">CURVA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="curva_acentuada" id="tt-curva_acentuada" /><Label htmlFor="tt-curva_acentuada" className="text-xl font-normal">CURVA ACENTUADA</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="curva_suave" id="tt-curva_suave" /><Label htmlFor="tt-curva_suave" className="text-xl font-normal">CURVA SUAVE</Label></div>
                    </RadioGroup>
                </Field>
                <Field label="PERFIL">
                    <RadioGroup value={tracadoPista.perfil} onValueChange={(value) => handleTracadoPistaChange('perfil', value)} className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="em_nivel" id="tpr-em_nivel" /><Label htmlFor="tpr-em_nivel" className="text-xl font-normal">EM NÍVEL</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="aclive" id="tpr-aclive" /><Label htmlFor="tpr-aclive" className="text-xl font-normal">ACLIVE</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="declive" id="tpr-declive" /><Label htmlFor="tpr-declive" className="text-xl font-normal">DECLIVE</Label></div>
                    </RadioGroup>
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
            <Field label="DESTINAÇÃO ANIMAL">
                <RadioGroup value={otherInfo.destinacaoAnimal} onValueChange={(value) => handleOtherInfoChange('destinacaoAnimal', value)} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="pr05" id="da-pr05" /><Label htmlFor="da-pr05" className="text-xl font-normal">PR05</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="pr56" id="da-pr56" /><Label htmlFor="da-pr56" className="text-xl font-normal">PR56</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="pr13" id="da-pr13" /><Label htmlFor="da-pr13" className="text-xl font-normal">PR13</Label></div>
                </RadioGroup>
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
