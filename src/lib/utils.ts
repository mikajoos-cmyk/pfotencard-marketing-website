import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// previewUtils.ts

// 1. Definition der Typen (basierend auf EinstellungenPage.tsx)
export interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface LevelRequirement {
  id?: number;
  training_type_id: number;
  required_count: number;
}

export interface Level {
  id?: number;
  name: string;
  rank_order: number;
  badgeImage?: string;
  requirements: LevelRequirement[];
}

export interface PreviewConfigData {
  primaryColor: string;
  secondaryColor: string;
  schoolName: string;
  logo: string | undefined;
  levels: Level[];
  services: Service[];
  viewMode: 'app' | 'login';
  role: 'customer' | 'admin';
}

// 2. Die Basis-URL aus der Config
export const PREVIEW_APP_URL = 'https://preview.pfotencard.de/?mode=preview';

// 3. Die Generator-Funktion (Logik aus EinstellungenPage.tsx extrahiert)
export function generatePreviewUrl(data: PreviewConfigData): string {
  // Mapping der Levels für die Preview-App-Struktur
  const mappedLevels = data.levels.map((l, index) => ({
    ...l,
    id: index + 1, // IDs normalisieren (1, 2, 3...)
    requirements: l.requirements.map(r => ({
      id: r.id || `temp-${r.training_type_id}-${Math.random()}`,
      // Den Namen des Services anhand der ID suchen
      name: data.services.find(s => s.id === r.training_type_id)?.name || 'Unbekannt',
      required: r.required_count
    }))
  }));

  // Das Config-Objekt, das die Preview-App erwartet
  const config = {
    primary_color: data.primaryColor,
    secondary_color: data.secondaryColor,
    school_name: data.schoolName,
    logo: data.logo,
    levels: mappedLevels,
    services: data.services,
    view_mode: data.viewMode,
    role: data.role
  };

  // Base64 Encoding für die URL
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
  return `${PREVIEW_APP_URL}#config=${encoded}`;
}

// 4. Die Demo-Funktion mit den Repo-Daten
export function getRepoDemoUrl(viewMode: 'app' | 'login' = 'app', role: 'customer' | 'admin' = 'customer'): string {
  
  // -- Daten aus index.tsx / index.css --
  
  // Farben aus index.css (--brand-green, --brand-blue)
  const primaryColor = '#22C55E';
  const secondaryColor = '#3B82F6';
  
  // Name aus Sidebar/Manifest
  const schoolName = 'PfotenCard';
  
  // Logo aus public/paw.png
  const logo = '/paw.png'; // Hinweis: In der echten Preview muss dies eine volle URL sein, wenn es nicht lokal läuft.

  // Services (abgeleitet aus "debits" in index.tsx)
  // Wir geben ihnen feste IDs, um sie in den Levels zu referenzieren
  const services: Service[] = [
    { id: 1, name: 'Gruppenstunde', category: 'training', price: 15 },
    { id: 2, name: 'Prüfung', category: 'exam', price: 15 },
    { id: 3, name: 'Social Walk', category: 'training', price: 15 },
    { id: 4, name: 'Wirtshaustraining', category: 'training', price: 15 },
    { id: 5, name: 'Mantrailing', category: 'training', price: 18 },
    { id: 6, name: 'Erste-Hilfe-Kurs', category: 'workshop', price: 50 },
  ];

  // Levels (abgeleitet aus LEVELS und LEVEL_REQUIREMENTS in index.tsx)
  // ID-Referenzen müssen mit den Service-IDs oben übereinstimmen
  const levels: Level[] = [
    {
      id: 1,
      name: 'Welpen',
      rank_order: 1,
      requirements: [], // Keine Anforderungen
      badgeImage: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L1.png'
    },
    {
      id: 2,
      name: 'Grundlagen',
      rank_order: 2,
      requirements: [
        { training_type_id: 1, required_count: 6 }, // 6x Gruppenstunde
        { training_type_id: 2, required_count: 1 }  // 1x Prüfung
      ],
      badgeImage: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L2.png'
    },
    {
      id: 3,
      name: 'Fortgeschrittene',
      rank_order: 3,
      requirements: [
        { training_type_id: 1, required_count: 6 }, // 6x Gruppenstunde
        { training_type_id: 2, required_count: 1 }  // 1x Prüfung
      ],
      badgeImage: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L3.png'
    },
    {
      id: 4,
      name: 'Masterclass',
      rank_order: 4,
      requirements: [
        { training_type_id: 3, required_count: 6 }, // 6x Social Walk
        { training_type_id: 4, required_count: 2 }, // 2x Wirtshaustraining
        { training_type_id: 2, required_count: 1 }  // 1x Prüfung
      ],
      badgeImage: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L4.png'
    },
    {
      id: 5,
      name: 'Hundeführerschein',
      rank_order: 5,
      requirements: [
        { training_type_id: 2, required_count: 1 }  // 1x Prüfung
      ],
      badgeImage: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L5.png'
    }
  ];

  return generatePreviewUrl({
    primaryColor,
    secondaryColor,
    schoolName,
    logo,
    levels,
    services,
    viewMode,
    role
  });
}