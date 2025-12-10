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
};

type SinalizacaoInfo = {
  acao: string;
  nomeDaPlaca: string;
  quantidade: string;
};


type OtherInfo = {
  observacoes: string;
  auxilios: string;
  numeroOcorrencia: string;
};

export default function TO38Form({ categorySlug }: { categorySlug: string }) {
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
  });

  const [sinalizacaoInfo, setSinalizacaoInfo] = useState<SinalizacaoInfo>({
    acao: '',
    nomeDaPlaca: '',
    quantidade: '',
  });
  
  const [otherInfo, setOtherInfo] = useState<OtherInfo>({
    observacoes: '',
    auxilios: '',
    numeroOcorrencia: '',
  });

  const handleGeneralInfoChange = (field: keyof GeneralInfo, value: string) => {
    setGeneralInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSinalizacaoInfoChange = (field: keyof SinalizacaoInfo, value: string) => {
    setSinalizacaoInfo(prev => ({ ...prev, [field]: value }));
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
      sinalizacaoInfo: fillEmptyFields(sinalizacaoInfo),
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
    message += `Local/Área: ${reportData.generalInfo.localArea}\n\n`;

    message += `*PLACA*\n`;
    message += `Ação: ${reportData.sinalizacaoInfo.acao}\n`;
    message += `Nome da Placa: ${reportData.sinalizacaoInfo.nomeDaPlaca}\n`;
    message += `Quantidade: ${reportData.sinalizacaoInfo.quantidade}\n\n`;

    message += `*OUTRAS INFORMAÇÕES*\n`;
    message += `AUXÍLIOS/PR: ${reportData.otherInfo.auxilios}\n`;
    message += `Observações: ${reportData.otherInfo.observacoes}\n`;
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
                        <SelectItem value="area_de_dominio">ÁREA DE DOMÍNIO</SelectItem>
                        <SelectItem value="trevo">TREVO</SelectItem>
                        <SelectItem value="rotatoria">ROTATÓRIA</SelectItem>
                        <SelectItem value="acostamento">ACOSTAMENTO</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
          </div>
        </div>

        {/* Sinalização */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-foreground border-b-2 border-foreground pb-2 uppercase">PLACA</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Field label="AÇÃO">
                <Select value={sinalizacaoInfo.acao} onValueChange={(value) => handleSinalizacaoInfoChange('acao', value)}>
                    <SelectTrigger className="text-xl normal-case placeholder:text-base">
                        <SelectValue placeholder="Selecione a ação" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="retirar_placa">RETIRAR PLACA</SelectItem>
                        <SelectItem value="recolher_placa">RECOLHER PLACA</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
            <Field label="NOME DA PLACA">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: R-19" value={sinalizacaoInfo.nomeDaPlaca} onChange={(e) => handleSinalizacaoInfoChange('nomeDaPlaca', e.target.value)}/>
            </Field>
            <Field label="QUANTIDADE">
                <Input className="text-xl placeholder:capitalize placeholder:text-sm" placeholder="Ex: 1" value={sinalizacaoInfo.quantidade} onChange={(e) => handleSinalizacaoInfoChange('quantidade', e.target.value)}/>
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
