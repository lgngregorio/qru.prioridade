import {
  Car,
  Flame,
  Waves,
  Mountain,
  ZapOff,
  Wind,
  WifiOff,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export type EventCategory = {
  name: string;
  slug: string;
  icon: LucideIcon;
  description: string;
};

export const eventCategories: EventCategory[] = [
  {
    name: 'Acidente de carro',
    slug: 'acidente-de-carro',
    icon: Car,
    description:
      'Relatar um acidente de trânsito envolvendo veículos.',
  },
  {
    name: 'Incêndio',
    slug: 'incendio',
    icon: Flame,
    description: 'Relatar um incêndio em andamento ou risco de incêndio.',
  },
  {
    name: 'Alagamento',
    slug: 'alagamento',
    icon: Waves,
    description: 'Relatar áreas alagadas, inundações ou risco de enchente.',
  },
  {
    name: 'Deslizamento',
    slug: 'deslizamento',
    icon: Mountain,
    description: 'Relatar deslizamentos de terra ou risco iminente.',
  },
  {
    name: 'Falta de energia',
    slug: 'falta-de-energia',
    icon: ZapOff,
    description:
      'Relatar uma interrupção no fornecimento de energia elétrica.',
  },
  {
    name: 'Vazamento de gás',
    slug: 'vazamento-de-gas',
    icon: Wind,
    description: 'Relatar suspeita de vazamento de gás em área pública ou privada.',
  },
  {
    name: 'Problemas na rede',
    slug: 'problemas-na-rede',
    icon: WifiOff,
    description:
      'Relatar problemas com a rede de internet ou telefonia celular.',
  },
  {
    name: 'Outros',
    slug: 'outros',
    icon: HelpCircle,
    description: 'Relatar outros tipos de incidentes não listados acima.',
  },
];
