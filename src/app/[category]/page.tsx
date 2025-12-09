'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

import { eventCategories } from '@/lib/events';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

function ReportForm() {
  const checkboxItems = {
    "Abertura Ocular": ["Espontânea", "Comando Verbal", "Estímulo Doloroso", "Nenhuma"],
    "Resposta Verbal": ["Orientado", "Confuso", "Palavras Inapropriadas", "Palavras Incompreensíveis", "Nenhuma"],
    "Resposta Motora": ["Obedece Comandos", "Localiza Dor", "Retirada Inespecífica", "Decorticação", "Descerebração", "Nenhuma"],
    "Pupilas": ["Isocóricas", "Anisocóricas", "Fotorreagentes", "Não fotorreagentes", "Mióse", "Midríase"],
    "Sinais e Sintomas": [
      "Afundamento de crânio", "Agitação", "Amnésia", "Apneia", "Bradicardia", "Bradipneia",
      "Bronco Aspirando", "Cefaleia", "Ciaonose", "Convulsão", "Decorticação", "Descerebração",
      "Deformidade", "Dispneia", "Dor local", "Edema", "Enfisema subcutâneo", "Entorse",
      "Hemorragia", "Hipertensão", "Hipotensão", "Luxação", "Parada cardiorrespiratória",
      "Priapismo", "Prurido", "Saturação", "Sudorese", "Taquicardia", "Taquipneia", "TCE",
      "Vômito", "Outro"
    ],
    "Procedimentos efetuados": [
      "Aferição de pressão", "Aspiração de vias aéreas", "Avaliação inicial", "Avaliação dirigida",
      "Avaliação continuada", "Cânula de Guedel", "Colar cervical", "Compressivo", "Curativo",
      "Imobilizações", "Limpeza de ferimento", "Maca sobre rodas", "Manta térmica",
      "Máscara de oxigênio", "Medição de glicemia", "Oxigenioterapia", "Reanimação cardiopulmonar",
      "Rolamento 90º", "Rolamento 180º", "Retirada de capacete", "Tomada de decisão", "Uso de KED",
      "Uso de DAE", "Ventilação suporte", "Outro"
    ],
    "Materiais utilizados descartáveis": [
      "Atadura", "Cânula de Guedel", "Cateter", "Compressa", "Eletrodos", "Kit H, P ou Q", "Luvas",
      "Máscara", "Manta térmica", "Soro", "Tala", "Outro"
    ],
    "Materiais utilizados (deixados no hospital)": [
      "Base do rádio", "Base do estabilizador", "Cânula", "Colar", "DAE", "Imobilizador",
      "KED", "Maca", "Prancha", "Oxímetro", "Rádio", "Respirador", "Tirante", "Outro"
    ]
  };


  return (
    <form className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Paciente encontrado no local?</h3>
        <RadioGroup defaultValue="sim" className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sim" id="paciente-sim" />
            <Label htmlFor="paciente-sim">Sim</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao" id="paciente-nao" />
            <Label htmlFor="paciente-nao">Não</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tipo-ocorrencia">Tipo de Ocorrência</Label>
        <Select>
          <SelectTrigger id="tipo-ocorrencia">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clinico">Clínico</SelectItem>
            <SelectItem value="trauma">Trauma</SelectItem>
            <SelectItem value="psiquiatrico">Psiquiátrico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sexo</h3>
        <RadioGroup defaultValue="masculino" className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="masculino" id="sexo-masculino" />
            <Label htmlFor="sexo-masculino">Masculino</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="feminino" id="sexo-feminino" />
            <Label htmlFor="sexo-feminino">Feminino</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome-paciente">Nome do Paciente</Label>
        <Input id="nome-paciente" placeholder="Digite o nome completo" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="idade-paciente">Idade do Paciente</Label>
        <Input id="idade-paciente" type="number" placeholder="Digite a idade" />
      </div>

       <div className="space-y-2">
        <Label htmlFor="cpf-paciente">CPF/RG do Paciente</Label>
        <Input id="cpf-paciente" placeholder="Digite o CPF ou RG" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome-hospital">Nome do hospital</Label>
        <Input id="nome-hospital" placeholder="Digite o nome do hospital" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Acompanhante no local?</h3>
        <RadioGroup defaultValue="sim" className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sim" id="acompanhante-sim" />
            <Label htmlFor="acompanhante-sim">Sim</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nao" id="acompanhante-nao" />
            <Label htmlFor="acompanhante-nao">Não</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="nome-acompanhante">Nome do acompanhante</Label>
        <Input id="nome-acompanhante" placeholder="Digite o nome do acompanhante" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relacao-paciente">Relação com o paciente</Label>
        <Input id="relacao-paciente" placeholder="Ex: Pai, Mãe, Irmão" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone-acompanhante">Telefone do acompanhante</Label>
        <Input id="telefone-acompanhante" type="tel" placeholder="(00) 00000-0000" />
      </div>

      <Separator />

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-primary">SINAIS E SINTOMAS</h3>
        {Object.entries(checkboxItems).slice(0, 4).map(([title, items]) => (
          <div key={title} className="space-y-3">
            <h4 className="font-medium">{title}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map(item => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox id={`${title}-${item}`} />
                  <Label htmlFor={`${title}-${item}`} className="font-normal">{item}</Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <Separator />

      <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary">SINAIS VITAIS</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                  <Label>Pressão Arterial</Label>
                  <div className="flex items-center gap-2">
                      <Input placeholder="120" /><span>X</span><Input placeholder="80" />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label>Pulso</Label>
                  <Input placeholder="BPM" />
              </div>
              <div className="space-y-2">
                  <Label>Respiração</Label>
                  <Input placeholder="MRM" />
              </div>
              <div className="space-y-2">
                  <Label>Saturação</Label>
                  <Input placeholder="%" />
              </div>
              <div className="space-y-2">
                  <Label>HGT</Label>
                  <Input placeholder="mg/dL" />
              </div>
              <div className="space-y-2">
                  <Label>Temperatura</Label>
                  <Input placeholder="ºC" />
              </div>
          </div>
      </div>

      <Separator />

       <div className="space-y-3">
          <h4 className="font-medium text-primary">Sinais e Sintomas (Checklist)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {checkboxItems["Sinais e Sintomas"].map(item => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox id={`sintoma-${item}`} />
                <Label htmlFor={`sintoma-${item}`} className="font-normal">{item}</Label>
              </div>
            ))}
          </div>
        </div>

      <Separator />
      
      <div className="space-y-3">
          <h4 className="font-medium text-primary">Problemas encontrados suspeitos</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {["Psiquiátrico", "Respiratório", "Diabetes", "Obstétrico", "Cardiovascular", "Outro"].map(item => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox id={`problema-${item}`} />
                <Label htmlFor={`problema-${item}`} className="font-normal">{item}</Label>
              </div>
            ))}
          </div>
        </div>

      <Separator />
      
      <div className="space-y-3">
          <h4 className="font-medium text-primary">Procedimentos efetuados</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {checkboxItems["Procedimentos efetuados"].map(item => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox id={`procedimento-${item}`} />
                <Label htmlFor={`procedimento-${item}`} className="font-normal">{item}</Label>
              </div>
            ))}
          </div>
        </div>

      <Separator />
      
       <div className="space-y-3">
          <h4 className="font-medium text-primary">Materiais utilizados descartáveis</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {checkboxItems["Materiais utilizados descartáveis"].map(item => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox id={`material-desc-${item}`} />
                <Label htmlFor={`material-desc-${item}`} className="font-normal">{item}</Label>
              </div>
            ))}
          </div>
        </div>

      <Separator />

       <div className="space-y-3">
          <h4 className="font-medium text-primary">Materiais utilizados (deixados no hospital)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {checkboxItems["Materiais utilizados (deixados no hospital)"].map(item => (
              <div key={item} className="flex items-center space-x-2">
                <Checkbox id={`material-hosp-${item}`} />
                <Label htmlFor={`material-hosp-${item}`} className="font-normal">{item}</Label>
              </div>
            ))}
          </div>
        </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="obs-medicao">Anamnese / Observações importantes</Label>
        <Textarea id="obs-medicao" placeholder="Descreva as informações relevantes" rows={5} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>MÉDICO REGULADOR</Label>
          <Input placeholder="Nome do médico" />
        </div>
        <div className="space-y-2">
          <Label>CÓDIGO P/ OCORRÊNCIA</Label>
          <Input placeholder="Código" />
        </div>
        <div className="space-y-2">
          <Label>CÓDIGO P/ SIAS</Label>
          <Input placeholder="Código SIAS" />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button size="lg" className="w-full md:w-auto flex-1 bg-green-600 hover:bg-green-700 rounded-full" type="submit">
          Salvar
        </Button>
        <Button size="lg" className="w-full md:w-auto flex-1 rounded-full" type="submit">
          <Send className="mr-2 h-4 w-4" />
          Enviar Relatório
        </Button>
      </div>
    </form>
  );
}

export default function ReportPage({
  params,
}: {
  params: { category: string };
}) {
  const category = eventCategories.find((c) => c.slug === params.category);

  if (!category) {
    notFound();
  }
  
  const isAph = category.slug === 'qud-aph';
  const title = isAph ? "ATENDIMENTO CLÍNICO" : `Registrar ${category.name}`;
  const description = isAph ? "Preencha as informações do atendimento" : category.description;


  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 pt-12 md:p-12 lg:p-24">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <Card className="w-full shadow-lg rounded-2xl">
          <CardHeader className="text-center p-8">
             {!isAph && (
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <category.icon className="h-12 w-12 text-primary" />
              </div>
            )}
            <CardTitle className="text-3xl font-bold">
              {title}
            </CardTitle>
            <CardDescription className="text-base mt-1">
             {description}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-8">
            <ReportForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
