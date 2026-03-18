// src/lib/planConfig.ts

export const PLAN_MODULES = [
    { id: 'calendar', label: 'Kalender & Terminbuchung' },
    { id: 'status_display', label: 'Statusanzeige' },
    { id: 'digital_vouchers', label: 'Digitale Wertkarten' }, // Ehemals Feature, jetzt als Kern-Modul
    { id: 'chat', label: 'Chat-System' },
    { id: 'news', label: 'News & Updates' },
    { id: 'homework', label: 'Hausaufgaben & Trainingsplan' },
    { id: 'balance_topup', label: 'Self-Service Guthaben-Aufladung' },
    { id: 'invoice_download', label: 'Rechnungs-Download' },
    { id: 'certificates', label: 'Teilnahmebescheinigungen' },
    { id: 'widgets', label: 'Website-Integration (Widgets)' },
    { id: 'documents', label: 'Dokumente Modul' }
];

export const PLAN_FEATURES = [
    { id: 'white_label', label: 'White-Label (Eigenes Branding)' },
    { id: 'waitlist', label: 'Wartelisten-Funktion' },
    { id: 'automation', label: 'Automatisierung (Level & Abrechnung)' },
    { id: 'priority_support', label: 'Prioritäts-Support' },
    { id: 'lexware_export', label: 'Datev/Lexware Export' },
    { id: 'email_support', label: 'E-Mail Support' }
];
