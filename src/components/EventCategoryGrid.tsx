
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventCategory } from '@/lib/events';
import { cn } from '@/lib/utils';

type EventCategoryGridProps = {
  categories: EventCategory[];
};

function formatCategoryName(name: string) {
  const words = name.split(' ');
  if (words.length <= 2) {
    return name;
  }
  
  if (words.length === 3) {
     const firstLine = words.slice(0, 1).join(' ');
     const secondLine = words.slice(1).join(' ');
      return (
        <>
          {firstLine}
          <br />
          {secondLine}
        </>
      );
  }

  // Find a good split point, trying to keep lines balanced
  const midPoint = Math.ceil(words.length / 2);
  const firstLine = words.slice(0, midPoint).join(' ');
  const secondLine = words.slice(midPoint).join(' ');

  return (
    <>
      {firstLine}
      <br />
      {secondLine}
    </>
  );
}

const handleCategoryClick = () => {
    // Limpa o preview do relatório do localStorage para garantir que o formulário abra vazio.
    localStorage.removeItem('reportPreview');
};

export default function EventCategoryGrid({
  categories,
}: EventCategoryGridProps) {
  if (categories.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        Nenhuma categoria encontrada.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {categories.map((category) => (
        <Link 
            href={`/${category.slug}`} 
            key={category.slug} 
            className="group"
            onClick={handleCategoryClick}
        >
          <Card 
            className="h-full text-center shadow-lg rounded-lg border-b-4 border-foreground/20 transform transition-transform duration-150 ease-in-out active:border-b-2 active:translate-y-px group-hover:-translate-y-px bg-card/70 hover:bg-card/90 text-card-foreground"
          >
            <CardHeader className="flex flex-col items-center justify-center p-2 aspect-[3/4]">
              <div
                className="w-10 h-10 rounded-full mb-1 flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <category.icon className="h-6 w-6 text-white animate-pulse" />
              </div>
              <CardTitle className="text-sm font-bold leading-tight text-card-foreground">
                {formatCategoryName(category.name)}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
