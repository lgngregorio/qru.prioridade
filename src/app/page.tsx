
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Input } from '@/components/ui/input';
import { Search, Notebook, FileCode } from 'lucide-react';
import { eventCategories } from '@/lib/events';
import EventCategoryGrid from '@/components/EventCategoryGrid';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  allCodes,
  type MessageCode,
  type AcaoProvidenciaCode,
  type OcorrenciaCode,
  type TiposPaneCode,
  type OutrasMensagensCode,
  type AlfabetoFonetico,
} from '@/lib/codes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp | null;
}

type SearchableCode =
  | MessageCode
  | AcaoProvidenciaCode
  | OcorrenciaCode
  | TiposPaneCode
  | OutrasMensagensCode
  | AlfabetoFonetico;

export default function Home() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    setLoadingNotes(true);
    const notesRef = collection(firestore, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedNotes = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt:
              data.createdAt instanceof Timestamp ? data.createdAt : null,
          } as Note;
        });
        setNotes(fetchedNotes);
        setLoadingNotes(false);
      },
      (error) => {
        console.error('Error fetching notes: ', error);
        setLoadingNotes(false);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return {
        categories: eventCategories,
        notes: [],
        codes: [],
      };
    }

    const lowerCaseQuery = searchQuery.toLowerCase();

    const filteredCategories = eventCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(lowerCaseQuery) ||
        category.title.toLowerCase().includes(lowerCaseQuery) ||
        category.slug.toLowerCase().includes(lowerCaseQuery)
    );

    const filteredNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerCaseQuery) ||
        note.content.toLowerCase().includes(lowerCaseQuery)
    );

    const filteredCodes = allCodes.filter((item) => {
      const values = Object.values(item).join(' ').toLowerCase();
      return values.includes(lowerCaseQuery);
    });

    return {
      categories: filteredCategories,
      notes: filteredNotes,
      codes: filteredCodes,
    };
  }, [searchQuery, notes]);

  const isSearching = searchQuery.length > 0;

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleDateString('pt-BR');
  };

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
              <div className="flex h-10 items-center gap-1">
                <div className="w-[1.5px] h-full bg-white"></div>
                <div
                  className="w-[1.5px] h-full animate-move-dashes"
                  style={{
                    backgroundImage:
                      'linear-gradient(to bottom, white 50%, transparent 50%)',
                    backgroundSize: '1.5px 20px',
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
              placeholder="Buscar em todo o aplicativo..."
              className="w-full pl-9 h-12 text-lg rounded-md shadow-sm bg-card border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar em todo o aplicativo"
            />
          </div>
        </div>

        {isSearching ? (
          <div className="space-y-8">
            {searchResults.categories.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Categorias</h2>
                <EventCategoryGrid categories={searchResults.categories} />
              </div>
            )}
            {loadingNotes && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Anotações</h2>
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
              </div>
            )}
            {!loadingNotes && searchResults.notes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Anotações</h2>
                <div className="space-y-4">
                  {searchResults.notes.map((note) => (
                    <Link
                      href={`/bloco-de-notas/editar/${note.id}`}
                      key={note.id}
                    >
                      <Card className="hover:bg-accent cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Notebook /> {note.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-2 text-muted-foreground">
                            {note.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(note.createdAt)}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
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
             {searchResults.categories.length === 0 && searchResults.notes.length === 0 && searchResults.codes.length === 0 && !loadingNotes && (
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
