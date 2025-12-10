
'use client';

import { useRouter } from 'next/navigation';
import { Save, Share, Loader2 } from 'lucide-react';
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
  tracado: string;
  perfil: string;
};

type OtherInfo = {
  observacoes: string;
  auxilios: string;
  destinacaoAnimal: string;
  qthExato: string;
  numeroOcorrencia: string;
};

export default function TO07Form({ categorySlug }: { categorySlug: string }) {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

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
    tracado: '',
    perfil: '',
  });

  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    observacoes: '',
    auxilios: '',
    destinacaoAnimal: '',
    qthExato: '',
    numeroOcorrencia: '',
  });

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

  const prepareReportData = () => {
    const filledData = {
      generalInfo: fillEmptyFields(generalInfo),
      caracteristicasEntorno: fillEmptyFields(caracteristicasEntorno),
      tracadoPista: fillEmptyFields(tracadoPista),
      otherInfo: fillEmptyFields(otherInfo),
    };

    return {
      category: categorySlug,
      formData: filledData,
      createdAt: serverTimestamp(),
    };
  };
  
  const handleSave = async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível conectar ao banco de dados.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const reportData = prepareReportData();
      await addDoc(collection(firestore, 'reports'), reportData);
      
      toast({
        title: "Sucesso!",
        description: "Relatório salvo com sucesso.",
        className: "bg-green-600 text-white",
      });
      
      router.push('/historico');

    } catch (error) {
      console.error("Error saving report: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o relatório. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const reportData = prepareReportData().formData;
    const category = eventCategories.find(c => c.slug === categorySlug);
    
    let message = `*${category ? category.title.toUpperCase() : 'RELATÓRIO DE OCORRÊNCIA'}*\n\n`;

    message += `*INFORMAÇÕES GERAIS*\n`;
    message += `Rodovia: ${reportData.generalInfo.rodovia}\n`;
    message += `Ocorrência: ${reportData.generalInfo.ocorrencia}\n`;
    message += `QTH (Local): ${reportData.generalInfo.qth}\n`;
    message += `Sentido: ${reportData.generalInfo.sentido}\n`;
    message += `Local/Área: ${reportData.generalInfo.localArea}\n`;
    message += `Animal: ${reportData.generalInfo.animal}\n`;
    message += `Quantidade: ${reportData.generalInfo.quantidade}\n`;
    message += `Situação: ${reportData.generalInfo.situacao}\n\n`;

    message += `*CARACTERÍSTICAS ENTORNO*\n`;
    message += `Entorno Norte: ${reportData.caracteristicasEntorno.entornoNorte}\n`;
    message += `Entorno Sul: ${reportData.caracteristicasEntorno.entornoSul}\n\n`;

    message += `*TRAÇADO DE PISTA*\n`;
    message += `Pista: ${reportData.tracadoPista.pista}\n`;
    message += `Traçado: ${reportData.tracadoPista.tracado}\n`;
    message += `Perfil: ${reportData.tracadoPista.perfil}\n\n`;
    
    message += `*OUTRAS INFORMAÇÕES*\n`;
    message += `AUXÍLIOS/PR: ${reportData.otherInfo.auxilios}\n`;
    message += `Observações: ${reportData.otherInfo.observacoes}\n`;
    message += `Destinação do Animal: ${reportData.otherInfo.destinacaoAnimal}\n`;
    message += `QTH Exato: ${reportData.otherInfo.qthExato}\n`;
    message += `Nº Ocorrência: ${reportData.otherInfo.numeroOcorrencia}\n`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
            <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">CARACTERÍSTICAS ENTORNO</h2>
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
            <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">TRAÇADO DE PISTA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <Field label="NÚMERO DA OCORRÊNCIA">
              <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Número de controle interno" value={otherInfo.numeroOcorrencia} onChange={(e) => handleOtherInfoChange('numeroOcorrencia', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="flex sm:flex-row gap-4 pt-6">
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 uppercase text-base" onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Compartilhar WhatsApp
          </Button>
          <Button size="lg" className="w-32 bg-primary hover:bg-primary/90 uppercase text-base" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
