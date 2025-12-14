
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Notebook, FileCode, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { eventCategories } from '@/lib/events';
import EventCategoryGrid from '@/components/EventCategoryGrid';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  allCodes,
  relacionamentosOcorrencias,
  type MessageCode,
  type AcaoProvidenciaCode,
  type OcorrenciaCode,
  type TiposPaneCode,
  type AlfabetoFonetico,
} from '@/lib/codes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SearchableCode =
  | MessageCode
  | AcaoProvidenciaCode
  | OcorrenciaCode
  | TiposPaneCode
  | OutrasMensagensCode
  | AlfabetoFonetico;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return {
        categories: eventCategories,
        codes: [],
        relationshipResults: [],
        showRelationships: false,
      };
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    // 1. Filter Categories
    const filteredCategories = eventCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(lowerCaseQuery) ||
        category.title.toLowerCase().includes(lowerCaseQuery) ||
        category.slug.toLowerCase().includes(lowerCaseQuery)
    );

    // 2. Filter Codes
    const filteredCodes = allCodes.filter((item) => {
      const values = Object.values(item).join(' ').toLowerCase();
      return values.includes(lowerCaseQuery);
    });
    
    // 3. Special search for relationships
    let relationshipResults: { title: string; items: AcaoProvidenciaCode[] }[] = [];
    const relationshipMatch = lowerCaseQuery.match(/(to\d{1,2}|ac\d{1,2}).*(pr)/);

    if (relationshipMatch) {
      const ocorrenciaCode = relationshipMatch[1].toUpperCase();
      const relacionamento = relacionamentosOcorrencias.find(
        (r) => r.ocorrencia.code === ocorrenciaCode
      );
      if (relacionamento) {
        relationshipResults.push({
          title: `Ações/Providências para ${relacionamento.ocorrencia.code}: ${relacionamento.ocorrencia.message}`,
          items: relacionamento.acoes,
        });
      }
    }


    // 4. Special case for "relacionamentos" link
    const showRelationships = 'relacionamentos'.includes(lowerCaseQuery) && relationshipResults.length === 0;

    return {
      categories: filteredCategories,
      codes: filteredCodes,
      relationshipResults,
      showRelationships,
    };
  }, [searchQuery]);

  const isSearching = searchQuery.length > 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 pt-16 md:p-6">
      <div className="absolute top-4 left-4 z-10 flex flex-col items-center md:hidden">
        <span className="text-sm font-bold uppercase text-muted-foreground -mb-1.5">
          Menu
        </span>
        <SidebarTrigger className="h-12 w-12" />
      </div>
      <div className="w-full max-w-md pt-8">
        <header className="text-center w-full mb-6">
          <div className="flex items-center gap-4 justify-center relative">
            <h1 className="text-4xl font-bold text-foreground font-headline tracking-wider flex items-center justify-center gap-4">
              QRU
              <div className="flex h-10 items-center gap-2">
                <div className="w-[2px] h-full bg-foreground"></div>
                <div
                  className="w-[2px] h-full animate-move-dashes"
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, hsl(var(--foreground)) 50%, transparent 50%)',
                    backgroundSize: '2px 20px',
                    backgroundRepeat: 'repeat-y',
                  }}
                ></div>
              </div>
              PRIORIDADE
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-base">
            Selecione o tipo de ocorrência para gerar o relatório.
          </p>
        </header>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por ocorrência, código ou PR..."
              className="w-full pl-9 h-12 text-lg rounded-md shadow-sm bg-card border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar por ocorrência, código ou PR"
            />
          </div>
        </div>

        {isSearching ? (
          <div className="space-y-8">
             {searchResults.relationshipResults.length > 0 && (
              <div>
                {searchResults.relationshipResults.map((result, idx) => (
                    <div key={idx}>
                         <h2 className="text-2xl font-bold mb-4">{result.title}</h2>
                         <div className="space-y-2">
                            {result.items.map((item, index) => (
                                <Link href="/codigos" key={index}>
                                <Card className="hover:bg-accent cursor-pointer">
                                    <CardContent className="p-4 flex items-center gap-4">
                                    <FileCode className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-bold">{item.code}</p>
                                        <p className="text-muted-foreground">{item.message}</p>
                                    </div>
                                    </CardContent>
                                </Card>
                                </Link>
                            ))}
                         </div>
                    </div>
                ))}
              </div>
            )}
            
            {searchResults.categories.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Categorias</h2>
                <EventCategoryGrid categories={searchResults.categories} />
              </div>
            )}
            
            {searchResults.codes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Códigos</h2>
                <div className="space-y-2">
                  {searchResults.codes.map((item, index) => (
                    <Link href="/codigos" key={index}>
                      <Card className="hover:bg-accent cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-4">
                          <FileCode className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-bold">
                              {'code' in item ? item.code : item.letra}
                            </p>
                            <p className="text-muted-foreground">
                              {'message' in item
                                ? item.message
                                : item.palavra}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {searchResults.showRelationships && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Seções</h2>
                 <Link href="/codigos">
                    <Card className="hover:bg-accent cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                        <p className="font-bold">Relacionamentos</p>
                        <p className="text-muted-foreground">
                            Ver relação entre ocorrências, ações e panes.
                        </p>
                        </div>
                    </CardContent>
                    </Card>
                </Link>
              </div>
            )}

            {searchResults.categories.length === 0 && searchResults.codes.length === 0 && !searchResults.showRelationships && searchResults.relationshipResults.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                    Nenhum resultado encontrado para &quot;{searchQuery}&quot;.
                </p>
            )}
          </div>
        ) : (
          <EventCategoryGrid categories={eventCategories} />
        )}
      </div>
    </main>
  );
}
