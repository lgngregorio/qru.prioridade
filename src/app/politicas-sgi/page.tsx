
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PolicySection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
            {children}
        </p>
    </div>
);

export default function PoliticasSgiPage() {
  return (
    <main className="flex flex-col items-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        <div className="w-full mb-6 pt-4 flex items-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Início
            </Link>
          </Button>
        </div>

        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="text-center px-0">
            <CardTitle className="text-3xl font-bold text-foreground font-headline tracking-wide uppercase">
              Políticas do Sistema de Gestão Integrada
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-6">
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                A Política do Sistema de Gestão Integrada da Way Brasil é definida pela integração dos seus Sistemas de Gestão e pela harmonização das políticas específicas. Todas as políticas foram desenvolvidas pela alta direção, que comprometimento. A comunicação e publicização são realizadas de forma clara e compreensível a todas as partes interessadas, clientes e comunidade em geral. Elas estão disponíveis no manual do motorista, na página da internet e afixadas em pontos estratégicos das instalações da empresa.
            </p>

            <div className="space-y-8">
                <PolicySection title="Satisfação do Usuário">
                    A Way Brasil tem sua conduta pautada nos compromissos contratuais e regulamentares, e visa promover a satisfação do usuário da Rodovia, sempre em busca da melhoria contínua dos processos e da qualidade dos serviços prestados.
                </PolicySection>

                <PolicySection title="Segurança Ocupacional e Viária">
                    A alta direção objetiva e se compromete com o cumprimento dos requisitos legais e com a redução de mortes e lesões graves. Essas práticas serão apoiadas através de programas de treinamentos efetivos e eficientes, com o desenvolvimento de planos anuais para melhoria contínua, além da aplicação das lições aprendidas no tratamento das não conformidades e investigação de acidentes.
                </PolicySection>

                <PolicySection title="Gestão Responsável">
                    Alcançar a solidez administrativa, econômica, operacional, segurança de dados e compliance e preservação da imagem da Concessionária com objetivo de assegurar o atendimento às expectativas de seus públicos interessados.
                </PolicySection>

                <PolicySection title="Socioambiental e Sustentabilidade">
                    Nos comprometemos a adotar práticas de gestão socioambiental responsáveis, considerando as melhores práticas globais e aos requisitos legais aplicáveis. Reconhecemos a urgência das mudanças climáticas e a importância da defesa dos direitos humanos como pilares fundamentais para um futuro sustentável. Defendemos a equidade, a inclusão e o respeito à dignidade humana, promovendo o bem-estar e a justiça social para todas as comunidades impactadas por nossas ações. Nossa abordagem visa equilibrar crescimento econômico, proteção ambiental e avanço social.
                </PolicySection>

                 <PolicySection title="Qualidade">
                    Comprometimento com a gestão dos processos das atividades, realização de revisões periódicas, para sua melhoria contínua e garantir a perpetuidade do negócio, além da manutenção do foco na satisfação de todos.
                </PolicySection>

                <PolicySection title="Reconhecimento e Valorização das Pessoas">
                    Promover a qualificação e a conscientização dos colaboradores e demais envolvidos, de modo a motivar desenvolvimento de competências para atuação responsável e adequada.
                </PolicySection>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
