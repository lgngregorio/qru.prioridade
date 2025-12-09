'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { eventCategories } from '@/lib/events';
import EventCategoryGrid from '@/components/EventCategoryGrid';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = eventCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pt-8 md:p-6">
      <div className="w-full max-w-md">
        <header className="text-left mb-6 flex items-center gap-4">
           <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Ocorrências
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Selecione o tipo de ocorrência para gerar o relatório.
            </p>
          </div>
        </header>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar"
              className="w-full pl-9 h-10 text-sm rounded-md shadow-sm bg-card border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar ocorrência"
            />
          </div>
        </div>

        <EventCategoryGrid categories={filteredCategories} />
      </div>
    </main>
  );
}
