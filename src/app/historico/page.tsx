
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

interface Report {
  id: string;
  category: string;
  createdAt: Timestamp;
  formData: any;
}

export default function HistoricoPage() {
 

  return (
    <main className="flex flex-col items-center p-4 pt-8 md:p-6">
     
    </main>
  );
}
