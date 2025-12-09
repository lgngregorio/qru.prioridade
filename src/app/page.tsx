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
    <main className="flex min-h-screen flex-col items-center p-4 pt-8 md:p-6">
      <div className="w-full max-w-md">
        <header className="text-left mb-6">
          <div className='flex items-center space-x-2'>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="14" height="14" rx="2" stroke="#0B3C95" strokeWidth="2"/>
              <rect x="9" y="9" width="6" height="6" rx="1" fill="#0B3C95"/>
            </svg>
            <h1 className="text-2xl font-bold text-primary">
              QRU <span className='font-light'>|</span> PRIORIDADE
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
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
