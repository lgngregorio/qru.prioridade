'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { eventCategories } from '@/lib/events';
import EventCategoryGrid from '@/components/EventCategoryGrid';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = eventCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pt-12 md:p-12 lg:p-24">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
            Event Reporter
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Selecione uma categoria para iniciar seu relatório.
          </p>
        </header>

        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar categoria..."
              className="w-full pl-12 h-12 text-base rounded-full shadow-sm bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar categoria de evento"
            />
          </div>
        </div>

        <EventCategoryGrid categories={filteredCategories} />
      </div>
    </main>
  );
}
