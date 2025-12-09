import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventCategory } from '@/lib/events';

type EventCategoryGridProps = {
  categories: EventCategory[];
};

function formatCategoryName(name: string) {
  const words = name.split(' ');
  if (words.length <= 2) {
    return name;
  }
  // This logic is simple, it can be improved if needed
  // For now, it joins words trying to make two lines
  if (words.length === 3) {
    return (
      <>
        {words.slice(0, 2).join(' ')}
        <br />
        {words[2]}
      </>
    );
  }
   if (words.length === 4) {
    return (
      <>
        {words.slice(0, 2).join(' ')}
        <br />
        {words.slice(2, 4).join(' ')}
      </>
    );
  }
  return name;
}


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
    <div className="grid grid-cols-4 gap-3">
      {categories.map((category) => (
        <Link href={`/${category.slug}`} key={category.slug} className="group">
          <Card className="h-full text-center shadow-lg rounded-lg border-b-4 border-neutral-800 bg-card transform transition-transform duration-150 ease-in-out active:border-b-2 active:translate-y-px group-hover:-translate-y-1">
            <CardHeader className="flex flex-col items-center justify-center p-1 aspect-[3/4]">
              <div
                className="w-12 h-12 rounded-full mb-1 flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <category.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-card-foreground leading-tight">
                {formatCategoryName(category.name)}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
