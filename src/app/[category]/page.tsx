import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
} from 'lucide-react';

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

function ReportForm() {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="location">Localização</Label>
        <Input id="location" placeholder="Ex: Rua das Flores, 123" />
        <p className="text-sm text-muted-foreground">
          Forneça o endereço ou a localização mais próxima do evento.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Descreva o que aconteceu com o máximo de detalhes possível..."
          rows={5}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="picture">Anexar foto</Label>
        <Input id="picture" type="file" />
         <p className="text-sm text-muted-foreground">
          Uma imagem pode ajudar as equipes de emergência.
        </p>
      </div>
      <Button size="lg" className="w-full rounded-full" type="submit">
        <Send className="mr-2 h-4 w-4" />
        Enviar Relatório
      </Button>
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 pt-12 md:p-12 lg:p-24">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Todas as categorias
            </Link>
          </Button>
        </div>
        <Card className="w-full shadow-lg rounded-2xl">
          <CardHeader className="text-center p-8">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <category.icon className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">{category.name}</CardTitle>
            <CardDescription className="text-base mt-1">
              {category.description}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-center">
              Registrar ocorrência
            </h3>
            <ReportForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
