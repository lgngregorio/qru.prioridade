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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {categories.map((category) => (
        <Link href={`/${category.slug}`} key={category.slug} className="group">
          <Card className="h-full text-center shadow-sm rounded-2xl hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 border-2 border-transparent hover:border-primary/50">
            <CardHeader className="flex flex-col items-center justify-center p-6">
              <div className="bg-primary/10 p-4 rounded-full mb-4 transition-colors duration-300 group-hover:bg-primary/20">
                <category.icon className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold text-card-foreground">
                {category.name}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
