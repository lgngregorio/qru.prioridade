import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventCategory } from '@/lib/events';

type EventCategoryGridProps = {
  categories: EventCategory[];
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
    <div className="grid grid-cols-4 gap-2">
      {categories.map((category) => (
        <Link href={`/${category.slug}`} key={category.slug} className="group">
          <Card className="h-full text-center shadow-sm rounded-lg border bg-card">
            <CardHeader className="flex flex-col items-center justify-center p-0 aspect-[3/4]">
              <div
                className="w-8 h-8 rounded-full mb-1 flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <category.icon className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-[10px] font-medium text-card-foreground leading-tight">
                {category.name.split(' ').map((word, index) => <div key={index}>{word}</div>)}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
