
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
        <header className="text-center mb-6 w-full">
           <div className="flex items-center gap-4 justify-center relative">
             <SidebarTrigger className="md:hidden absolute left-0"/>
             <h1 className="text-4xl font-bold text-foreground font-headline tracking-wider flex items-center justify-center gap-5">
                QRU
                <div className="flex h-10 items-center gap-1">
                  <div className="w-1 h-full bg-white"></div>
                  <div className="w-1 h-full bg-repeat-y bg-[length:4px_36px] bg-center animate-move-dashes" style={{ backgroundImage: "linear-gradient(to bottom, white 50%, transparent 50%)"}}></div>
                </div>
                PRIORIDADE
              </h1>
           </div>
          <p className="text-muted-foreground mt-2 text-base">
            Selecione o tipo de ocorrência para gerar o relatório.
          </p>
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






