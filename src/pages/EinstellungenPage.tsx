import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL, fetchAppConfig, saveSettings, uploadImage, fetchUsers, updateUser } from '@/lib/api';
import {
  Save,
  Upload,
  Palette,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Smartphone,
  ExternalLink,
  Award,
  Loader2,
  LayoutPanelLeft,
  Sun,
  Moon,
  Calendar,
  Newspaper,
  MessageCircle,
  Layers,
  Lock,
  Wallet,
  ShieldCheck,
  Settings,
  Type,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Menu,
  ArrowLeft,
  Smartphone as PreviewIcon,
  Activity
} from 'lucide-react';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// --- TYPES (Frontend State) ---
interface Service {
  id?: number;
  name: string;
  category: string;
  price: number;
  rank_order: number;
}

interface TopUpOption {
  amount: number;
  bonus: number;
}

interface LevelRequirement {
  id?: number;
  training_type_id: number;
  required_count: number;
  is_additional?: boolean;
}

interface Level {
  id?: number;
  name: string;
  rank_order: number;
  badgeImage?: string;
  color?: string;
  has_additional_requirements?: boolean;
  requirements: LevelRequirement[];
}

interface UserPermission {
  can_create_courses: boolean;
  can_edit_status: boolean;
  can_delete_customers: boolean;
  can_create_messages: boolean;
  can_manage_appointments: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  permissions: UserPermission;
}

interface ColorRule {
  id: string;
  name: string;
  type: 'level' | 'service';
  target_ids: number[];
  color: string;
}

// Preview URL - Nutzt die Env-Variable oder Fallback auf deine echte App-URL
const PREVIEW_APP_URL = (import.meta as any).env.VITE_PREVIEW_APP_URL || 'https://preview.pfotencard.de/?mode=preview';

const colorPresets = [
  { name: 'Grün', value: '#22C55E' },
  { name: 'Blau', value: '#3B82F6' },
  { name: 'Lila', value: '#A855F7' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Rot', value: '#EF4444' },
];

interface AppModule {
  id: string;
  name: string;
  description: string;
  premiumOnly: boolean;
  comingSoon?: boolean;
  icon: React.ElementType;
}

const AVAILABLE_MODULES: AppModule[] = [
  {
    id: 'status_display',
    name: 'Statusanzeige',
    description: 'Zeigt den aktuellen Status der Hundeschule (z.B. Trainingsausfall wegen Wetter) direkt auf dem Dashboard an.',
    premiumOnly: false,
    icon: Activity
  },
  {
    id: 'calendar',
    name: 'Kalender & Terminbuchung',
    description: 'Ermöglicht Kunden die direkte Buchung von Terminen.',
    premiumOnly: true,
    icon: Calendar
  },
  // {
  //   id: 'shop',
  //   name: 'Online-Shop',
  //   description: 'Verkaufe Produkte, Gutscheine und 10er-Karten direkt in der App.',
  //   premiumOnly: true,
  //   icon: ShoppingBag
  // },
  {
    id: 'news',
    name: 'News & Updates',
    description: 'Poste Neuigkeiten, die deine Kunden sofort auf dem Home-Screen sehen.',
    premiumOnly: false,
    icon: Newspaper
  },
  {
    id: 'chat',
    name: 'Chat-System',
    description: 'Direkter Draht zu deinen Kunden über einen integrierten Messenger.',
    premiumOnly: true,
    icon: MessageCircle
  },
  // {
  //   name: 'Dokumenten-Center',
  //   description: 'Stelle wichtige Unterlagen (AGB, Impfpass-Upload) bereit.',
  //   premiumOnly: false,
  //   icon: FileText
  // },
  {
    id: 'balance_topup',
    name: 'Guthaben-Aufladung',
    description: 'Ermöglicht Kunden, ihr Guthaben selbstständig aufzuladen. Hinweis: Es fallen Stripe-Gebühren an.',
    premiumOnly: true,
    icon: Wallet
  },
  // {
  //   id: 'marketplace',
  //   name: 'Partner-Marktplatz',
  //   description: 'Empfehle Futter & Zubehör und verdiene Provisionen.',
  //   premiumOnly: false, // Maybe open for all
  //   comingSoon: true,
  //   icon: Store
  // }
];

// --- NAVIGATION CONFIG ---
const NAVIGATION = [
  {
    group: 'Start',
    items: [
      { id: 'branding', label: 'Design & Marke', icon: Palette },
      { id: 'wording', label: 'Wording', icon: Type }
    ]
  },
  {
    group: 'Angebot',
    items: [
      { id: 'services', label: 'Leistungen', icon: Briefcase },
      { id: 'levels', label: 'Level-System', icon: Award },
      { id: 'topup', label: 'Guthaben & Aufladung', icon: Wallet }
    ]
  },
  {
    group: 'Module',
    items: [
      { id: 'modules', label: 'App-Module', icon: Layers }
    ]
  },
  {
    group: 'Team',
    items: [
      { id: 'rights', label: 'Mitarbeiter-Rechte', icon: ShieldCheck }
    ]
  }
];

// Feature Matrix definieren
const PLAN_FEATURES: Record<string, { branding: boolean; modules: string[] }> = {
  starter: {
    branding: false,
    modules: [],
  },
  pro: {
    branding: true,
    modules: ['news', 'chat', 'balance_topup'],
  },
  enterprise: {
    branding: true,
    modules: ['news', 'chat', 'calendar', 'balance_topup'],
  }
};

// Helper Type
type PlanType = 'starter' | 'pro' | 'enterprise' | 'verband';

export function EinstellungenPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('starter'); // Default

  const [schoolName, setSchoolName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#22C55E'); // Button Farbe
  const [secondaryColor, setSecondaryColor] = useState('#3B82F6');
  const [backgroundColor, setBackgroundColor] = useState('#F8FAFC'); // App Hintergrund
  const [sidebarColor, setSidebarColor] = useState('#1E293B'); // Seitenleiste
  const [openForAllColor, setOpenForAllColor] = useState('#10b981');
  const [workshopLectureColor, setWorkshopLectureColor] = useState('#F97316');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('');
  const [customSecondaryColor, _setCustomSecondaryColor] = useState('');
  const [customBackgroundColor, setCustomBackgroundColor] = useState('');
  const [customSidebarColor, setCustomSidebarColor] = useState('');
  const [levelTerm, setLevelTerm] = useState('Level');
  const [vipTerm, setVipTerm] = useState('VIP');

  const [topUpOptions, setTopUpOptions] = useState<TopUpOption[]>([]);
  const [allowCustomTopUp, setAllowCustomTopUp] = useState(true);

  const [services, setServices] = useState<Service[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [autoBillingEnabled, setAutoBillingEnabled] = useState(false);
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(false);

  // --- NEU: Standardwerte für Termine ---
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [defaultMaxParticipants, setDefaultMaxParticipants] = useState(10);
  const [colorRules, setColorRules] = useState<ColorRule[]>([]);

  // --- NEU: Mitarbeiter-Rechte ---
  const [staff, setStaff] = useState<User[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // State für Zusatz-Module (nur IDs speichern)
  const [activeModules, setActiveModules] = useState<string[]>(['news', 'documents']); // Default an

  const [hasLogo, setHasLogo] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const [previewViewMode, setPreviewViewMode] = useState<'app' | 'login'>('app');
  const [previewRole, setPreviewRole] = useState<'customer' | 'admin'>('customer');
  const [syncTrigger, setSyncTrigger] = useState(0);

  // --- Navigation State ---
  const activeSection = section || 'branding';

  const setActiveSection = (newSection: string) => {
    navigate(`/einstellungen/${newSection}`);
  };

  const [currentView, setCurrentView] = useState<'overview' | 'module-settings'>('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPreviewMobileOpen, setIsPreviewMobileOpen] = useState(false);
  const [isModulesExpanded, setIsModulesExpanded] = useState(false);
  const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);

  // --- NEU: Automatische Bereinigung abhängiger Module ---
  useEffect(() => {
    if (!activeModules.includes('calendar') && activeModules.includes('waitlist')) {
      setActiveModules(prev => prev.filter(id => id !== 'waitlist'));
    }
  }, [activeModules]);


  // --- SYNC TO PREVIEW (IFRAME) ---
  useEffect(() => {
    if (!showPreview || !iframeRef.current) return;

    // Normalisiere Levels für Preview (ID 1, 2, 3...) damit Farben stimmen
    const mappedLevels = levels.map((l, index) => ({
      ...l,
      id: index + 1,
      requirements: l.requirements.map(r => ({
        id: r.id || `temp-${r.training_type_id}-${Math.random()}`,
        name: services.find(s => s.id === r.training_type_id)?.name || 'Unbekannt',
        required: r.required_count,
        is_additional: r.is_additional,
        training_type_id: r.training_type_id
      }))
    }));

    const configPayload = {
      primary_color: customPrimaryColor || primaryColor,
      secondary_color: customSecondaryColor || secondaryColor,
      background_color: customBackgroundColor || backgroundColor,
      sidebar_color: customSidebarColor || sidebarColor,
      open_for_all_color: openForAllColor,
      workshop_lecture_color: workshopLectureColor,
      school_name: schoolName,
      logo: previewLogo || (hasLogo ? '/paw.png' : undefined),
      levels: mappedLevels,
      services: services,
      balance: {
        allow_custom_top_up: allowCustomTopUp,
        top_up_options: topUpOptions
      },
      view_mode: previewViewMode,
      role: previewRole,
      active_modules: activeModules,

      level_term: levelTerm,
      vip_term: vipTerm,
      color_rules: colorRules
    };

    const message = {
      type: 'UPDATE_CONFIG',
      payload: configPayload
    };

    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(message, '*');
    }, 100);

    return () => clearTimeout(timer);
  }, [showPreview, primaryColor, secondaryColor, backgroundColor, sidebarColor, customPrimaryColor, customSecondaryColor, customBackgroundColor, customSidebarColor, schoolName, levelTerm, vipTerm, syncTrigger, levels, services, hasLogo, previewLogo, previewViewMode, previewRole, topUpOptions, allowCustomTopUp, activeModules, colorRules]);

  const isFeatureAllowed = (feature: 'branding' | string, type: 'module' | 'setting' = 'module') => {
    const planKey = currentPlan === 'verband' ? 'enterprise' : currentPlan;
    const rules = PLAN_FEATURES[planKey as keyof typeof PLAN_FEATURES] || PLAN_FEATURES.starter;

    if (type === 'setting' && feature === 'branding') {
      return rules.branding;
    }
    if (type === 'module') {
      return rules.modules.includes(feature);
    }
    return false;
  };

  const getPreviewUrl = () => {
    const mappedLevels = levels.map((l, index) => ({
      ...l,
      id: index + 1,
      requirements: l.requirements.map(r => ({
        id: r.id || `temp-${r.training_type_id}-${Math.random()}`,
        name: services.find(s => s.id === r.training_type_id)?.name || 'Unbekannt',
        required: r.required_count,
        is_additional: r.is_additional,
        training_type_id: r.training_type_id
      }))
    }));

    const config = {
      primary_color: customPrimaryColor || primaryColor,
      secondary_color: customSecondaryColor || secondaryColor,
      background_color: customBackgroundColor || backgroundColor,
      sidebar_color: customSidebarColor || sidebarColor,
      open_for_all_color: openForAllColor,
      workshop_lecture_color: workshopLectureColor,
      school_name: schoolName,
      logo: previewLogo || (hasLogo ? '/paw.png' : undefined),
      levels: mappedLevels,
      services: services,
      balance: {
        allow_custom_top_up: allowCustomTopUp,
        top_up_options: topUpOptions
      },
      view_mode: previewViewMode,
      role: previewRole,
      active_modules: activeModules,
      level_term: levelTerm,
      vip_term: vipTerm,
      color_rules: colorRules
    };

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
    return `${PREVIEW_APP_URL}#config=${encoded}`;
  };

  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', category: 'training', price: 0, rank_order: 0 });

  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false);
  const [isAdditionalDialogOpen, setIsAdditionalDialogOpen] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(-1);
  const [requirementForm, setRequirementForm] = useState({ serviceId: '', quantity: 1 });

  const [uploadingLevelIndex, setUploadingLevelIndex] = useState<number | null>(null);

  // --- DATEN LADEN ---
  useEffect(() => {
    async function loadData() {
      try {
        const config = await fetchAppConfig();
        const t = config.tenant;

        setSchoolName(t.name);
        setSupportEmail(t.support_email || '');
        setSubdomain(t.subdomain);

        let plan = (t.plan || 'starter').toLowerCase();
        if (plan === 'verband') plan = 'enterprise';
        setCurrentPlan(plan as PlanType);

        const branding = t.config?.branding || {};
        const wording = t.config?.wording || {};
        const balance = t.config?.balance || {};

        setPrimaryColor(branding.primary_color || '#22C55E');
        setSecondaryColor(branding.secondary_color || '#3B82F6');
        setBackgroundColor(branding.background_color || '#F8FAFC');
        setSidebarColor(branding.sidebar_color || '#1E293B');
        setOpenForAllColor(branding.open_for_all_color || '#10b981');
        setWorkshopLectureColor(branding.workshop_lecture_color || '#F97316');
        setLevelTerm(wording.level || 'Level');
        setVipTerm(wording.vip || 'VIP');
        setTopUpOptions(balance.top_up_options || []);
        setAllowCustomTopUp(balance.allow_custom_top_up !== undefined ? balance.allow_custom_top_up : true);
        setActiveModules(t.config?.active_modules || ['news', 'documents']);
        setAutoBillingEnabled(t.config?.auto_billing_enabled || false);
        setAutoProgressEnabled(t.config?.auto_progress_enabled || false);

        const appointmentsConfig = t.config?.appointments || {};
        setDefaultDuration(appointmentsConfig.default_duration || 60);
        setDefaultMaxParticipants(appointmentsConfig.max_participants || 10);
        setColorRules(appointmentsConfig.color_rules || []);

        if (branding.logo_url) {
          const logoUrl = branding.logo_url.startsWith('http')
            ? branding.logo_url
            : `${API_BASE_URL}${branding.logo_url}`;
          setPreviewLogo(logoUrl);
          setHasLogo(true);
        }

        const mappedServices = config.training_types.map((tt: any) => ({
          id: tt.id,
          name: tt.name,
          category: tt.category,
          price: tt.default_price,
          rank_order: tt.rank_order || 0
        }));
        setServices(mappedServices);

        const mappedLevels = config.levels.map((l: any) => ({
          id: l.id,
          name: l.name,
          rank_order: l.rank_order,
          badgeImage: l.icon_url ? (l.icon_url.startsWith('http') ? l.icon_url : `${API_BASE_URL}${l.icon_url}`) : undefined,
          color: l.color,
          has_additional_requirements: l.has_additional_requirements || false,
          requirements: l.requirements.map((r: any) => ({
            id: r.id,
            training_type_id: r.training_type_id,
            required_count: r.required_count,
            is_additional: r.is_additional || false
          }))
        }));
        setLevels(mappedLevels);

      } catch (e) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Konnte Einstellungen nicht laden. Bist du eingeloggt?"
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast]);

  // --- DATEN SPEICHERN ---
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const normalizedLevels = levels.map((l, index) => ({
        ...l,
        rank_order: index + 1,
        badge_image: l.badgeImage,
        color: l.color,
        has_additional_requirements: l.has_additional_requirements
      }));

      const payload = {
        school_name: schoolName,
        support_email: supportEmail,
        subdomain: subdomain,
        primary_color: customPrimaryColor || primaryColor,
        secondary_color: customSecondaryColor || secondaryColor,
        background_color: customBackgroundColor || backgroundColor,
        sidebar_color: customSidebarColor || sidebarColor,
        open_for_all_color: openForAllColor,
        workshop_lecture_color: workshopLectureColor,
        logo_url: previewLogo,
        level_term: levelTerm,
        vip_term: vipTerm,
        allow_custom_top_up: allowCustomTopUp,
        top_up_options: topUpOptions,
        services: services.map((s, index) => ({ ...s, rank_order: index + 1 })),
        levels: normalizedLevels,
        active_modules: activeModules,
        auto_billing_enabled: autoBillingEnabled,
        auto_progress_enabled: autoProgressEnabled,
        appointments: {
          default_duration: defaultDuration,
          max_participants: defaultMaxParticipants,
          color_rules: colorRules
        }
      };

      await saveSettings(payload);

      toast({
        title: "Gespeichert",
        description: "Deine Änderungen wurden erfolgreich übernommen."
      });

      window.location.reload();

    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Speichern fehlgeschlagen."
      });
    } finally {
      setSaving(false);
    }
  };

  // --- LOGO UPLOAD ---
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const { url } = await uploadImage(file);
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        setPreviewLogo(fullUrl);
        setHasLogo(true);
      } catch (err) {
        console.error("Upload failed", err);
        toast({ variant: "destructive", title: "Upload fehlgeschlagen" });
      }
    }
  };

  const handleLogoUpload = () => {
    document.getElementById('logo-upload-input')?.click();
  };

  // --- BADGE UPLOAD ---
  const handleLevelBadgeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadingLevelIndex === null || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    try {
      const { url } = await uploadImage(file);
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

      const newLevels = [...levels];
      newLevels[uploadingLevelIndex].badgeImage = fullUrl;
      setLevels(newLevels);
      setUploadingLevelIndex(null);
    } catch (err) {
      console.error("Upload failed", err);
      toast({ variant: "destructive", title: "Upload fehlgeschlagen" });
    }
  };

  // --- SERVICES LOGIC ---
  const handleAddService = () => {
    if (editingService) {
      setServices(services.map((s) => s === editingService ? { ...editingService, ...serviceForm } : s));
    } else {
      setServices([...services, { ...serviceForm, id: -Date.now(), rank_order: services.length + 1 }]);
    }
    setIsServiceDialogOpen(false);
    setEditingService(null);
    setServiceForm({ name: '', category: 'training', price: 0, rank_order: 0 });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({ name: service.name, category: service.category, price: service.price, rank_order: service.rank_order });
    setIsServiceDialogOpen(true);
  };

  const handleDeleteService = (index: number) => {
    if (confirm('Möchten Sie diese Leistung wirklich löschen?')) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  // --- LEVEL LOGIC ---
  const handleAddLevel = () => {
    const maxRank = levels.length > 0 ? Math.max(...levels.map(l => l.rank_order || 0)) : 0;
    const nextRank = maxRank + 1;

    const newLevel: Level = {
      name: `${levelTerm} ${nextRank}`,
      rank_order: nextRank,
      badgeImage: undefined,
      has_additional_requirements: false,
      requirements: [],
    };
    setLevels([...levels, newLevel]);
  };

  const handleUpdateLevelName = (index: number, name: string) => {
    const newLevels = [...levels];
    newLevels[index].name = name;
    setLevels(newLevels);
  };

  const handleUploadBadge = (index: number) => {
    setUploadingLevelIndex(index);
    setTimeout(() => {
      document.getElementById('level-badge-upload-input')?.click();
    }, 100);
  };

  const handleDeleteLevel = (index: number) => {
    if (confirm('Möchten Sie dieses Level wirklich löschen?')) {
      setLevels(levels.filter((_, i) => i !== index));
    }
  };

  const handleToggleAdditional = (index: number, val: boolean) => {
    const newLevels = [...levels];
    newLevels[index].has_additional_requirements = val;
    setLevels(newLevels);
  };

  // --- REQUIREMENTS LOGIC ---
  const handleAddRequirement = (isAdditional: boolean = false) => {
    const newLevels = [...levels];
    const serviceId = parseInt(requirementForm.serviceId);
    newLevels[currentLevelIndex].requirements.push({
      training_type_id: serviceId,
      required_count: requirementForm.quantity,
      is_additional: isAdditional
    });
    setLevels(newLevels);
    setIsRequirementDialogOpen(false);
    setIsAdditionalDialogOpen(false);
    setRequirementForm({ serviceId: '', quantity: 1 });
  };

  const handleUpdateRequirement = (levelIndex: number, reqIndex: number, quantity: number) => {
    const newLevels = [...levels];
    newLevels[levelIndex].requirements[reqIndex].required_count = quantity;
    setLevels(newLevels);
  };

  const handleDeleteRequirement = (levelIndex: number, reqIndex: number) => {
    const newLevels = [...levels];
    newLevels[levelIndex].requirements.splice(reqIndex, 1);
    setLevels(newLevels);
  };

  const getServiceName = (id: number) => services.find((s) => s.id === id)?.name || 'Unbekannt';
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = { training: 'Training', workshop: 'Workshop', lecture: 'Vortrag', exam: 'Prüfung' };
    return labels[category] || category;
  };

  const handleToggleModule = useCallback((moduleId: string, isActive: boolean) => {
    setActiveModules((prev) => {
      if (isActive) {
        return prev.includes(moduleId) ? prev : [...prev, moduleId];
      } else {
        return prev.filter((id) => id !== moduleId);
      }
    });
  }, []);

  const loadStaff = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const users = await fetchUsers();
      // Filtere nur Mitarbeiter und Admins (oder alle, je nach Wunsch, aber hier Fokus auf Rechte)
      setStaff(users.filter((u: User) => u.role === 'admin' || u.role === 'mitarbeiter'));
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Mitarbeiter konnten nicht geladen werden."
      });
    } finally {
      setLoadingStaff(false);
    }
  }, [toast]);

  const handlePermissionChange = async (userId: number, field: keyof UserPermission, value: boolean) => {
    // Optimistisches Update
    setStaff(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          permissions: {
            ...u.permissions,
            [field]: value
          }
        };
      }
      return u;
    }));

    try {
      const userToUpdate = staff.find(u => u.id === userId);
      if (!userToUpdate) return;

      const newPermissions = {
        ...userToUpdate.permissions,
        [field]: value
      };

      await updateUser(userId, { permissions: newPermissions });

      toast({
        title: "Rechte aktualisiert",
        description: "Die Änderungen wurden gespeichert."
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Rechte konnten nicht gespeichert werden."
      });
      // Rollback bei Fehler
      loadStaff();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <span>Pfotencard</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {NAVIGATION.map((group) => (
          <div key={group.group} className="px-3">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActiveSection(item.id);
                        setCurrentView('overview');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${activeSection === item.id && currentView === 'overview'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </button>
                    {item.id === 'modules' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsModulesExpanded(!isModulesExpanded);
                        }}
                        className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        {isModulesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    )}
                  </div>

                  {/* Module Dropdown */}
                  {item.id === 'modules' && isModulesExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-9 space-y-1"
                    >
                      {activeModules.length === 0 && (
                        <p className="text-xs text-muted-foreground italic px-2 py-1">Keine aktiven Module</p>
                      )}
                      {activeModules.map(modId => {
                        const mod = AVAILABLE_MODULES.find(m => m.id === modId);
                        if (!mod) return null;

                        const isSelected = (activeSection === 'modules' && selectedModuleId === modId) || (modId === 'balance_topup' && activeSection === 'topup');

                        return (
                          <button
                            key={modId}
                            onClick={() => {
                              if (modId === 'balance_topup') {
                                setActiveSection('topup');
                              } else {
                                setActiveSection('modules');
                                setSelectedModuleId(modId);
                                setCurrentView('module-settings');
                              }
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-md transition-colors truncate ${isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                              }`}
                          >
                            {mod.name}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border text-sm">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
            {schoolName.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold truncate">{schoolName}</p>
            <p className="text-xs text-muted-foreground truncate uppercase">{currentPlan}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Lade Konfiguration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-foreground pt-20">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r bg-card sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* --- MOBILE SIDEBAR (SHEET) --- */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[240px]">
          <SheetHeader className="hidden">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Hauptnavigation der Einstellungen</SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* --- MAIN STAGE --- */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* STICKY HEADER */}
        <header className="sticky top-20 z-30 flex h-16 items-center border-b bg-background/95 backdrop-blur px-4 lg:px-6 gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
            <h1 className="text-lg font-semibold truncate">
              {currentView === 'module-settings' ? (
                <button onClick={() => setCurrentView('overview')} className="flex items-center gap-2 hover:text-primary transition-colors truncate">
                  <ArrowLeft size={18} className="shrink-0" />
                  <span className="truncate">{AVAILABLE_MODULES.find(m => m.id === selectedModuleId)?.name || 'Einstellungen'}</span>
                </button>
              ) : (
                'Einstellungen'
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="hidden lg:flex items-center gap-2 h-9 px-3 hover:bg-muted"
            >
              {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              <span>Vorschau</span>
            </Button>
            <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="shadow-sm h-9 px-4">
              {saving ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Save size={18} className="mr-2" />}
              <span className="inline-flex">Speichern</span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-[1fr_350px]' : 'grid-cols-1'}`}>
            <div className="min-w-0">
              {/* Content Area Rendering Logic */}

              {/* MIDDLE COLUMN: Content Area */}
              <div className="min-w-0">
                {/* Branding Section */}
                {activeSection === 'branding' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                    {!isFeatureAllowed('branding', 'setting') && (
                      <div className="bg-muted border border-border rounded-lg p-4 flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-full"><Lock size={18} className="text-muted-foreground" /></div>
                          <div>
                            <p className="font-medium text-sm">Branding ist im Starter-Paket deaktiviert</p>
                            <p className="text-xs text-muted-foreground">Aktualisiere auf Pro, um Logo und Farben anzupassen.</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => window.open(`/preise?subdomain=${subdomain}`, '_self')}>Zum Upgrade</Button>
                      </div>
                    )}

                    <div className={!isFeatureAllowed('branding', 'setting') ? 'opacity-50 pointer-events-none grayscale' : ''}>
                      <Card>
                        <CardHeader><CardTitle>Basis-Daten</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div><Label>Name der Hundeschule</Label><Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="mt-2" /></div>

                          <div className="space-y-2 py-4 border-t border-border mt-4">
                            <h3 className="text-sm font-semibold text-foreground">Support-Einstellungen</h3>
                            <div className="grid gap-1.5">
                              <Label htmlFor="support_email">Support-E-Mail für deine Kunden</Label>
                              <Input
                                id="support_email"
                                type="email"
                                placeholder="support@deine-hundeschule.de"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                              />
                              <p className="text-[11px] text-muted-foreground">
                                Diese Adresse wird deinen Kunden in der App angezeigt, wenn sie Hilfe benötigen.
                              </p>
                            </div>
                          </div>
                          <div><Label>Subdomain</Label><div className="flex items-center gap-2 mt-2"><Input value={subdomain} disabled className="bg-muted text-muted-foreground" /><span className="text-muted-foreground text-sm">.pfotencard.de</span></div></div>
                        </CardContent>
                      </Card>
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Palette className="w-5 h-5" />
                            Design & Farben
                          </CardTitle>
                          <CardDescription>Passe das Aussehen deiner App an. Texte und Rahmen passen sich automatisch an.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <Label>Logo</Label>
                            <input type="file" id="logo-upload-input" className="hidden" accept="image/*" onChange={handleLogoFileChange} />
                            <div onClick={handleLogoUpload} className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${hasLogo ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted'}`}>
                              {previewLogo || hasLogo ? (
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-24 h-24 bg-primary/20 rounded-lg flex items-center justify-center overflow-hidden"><img src={previewLogo || "/paw.png"} alt="Logo Preview" className="w-full h-full object-contain" /></div>
                                  <p className="text-sm font-medium">Logo hochgeladen</p><Button variant="outline" size="sm">Ändern</Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-3"><Upload size={48} className="text-muted-foreground" /><div><p className="text-sm font-medium">Logo hochladen</p></div></div>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="mb-3 block">Design-Presets</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div
                                className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted transition-all flex items-center gap-4 group"
                                onClick={() => {
                                  setPrimaryColor('#22C55E');
                                  setCustomPrimaryColor('#22C55E');
                                  setBackgroundColor('#F8FAFC');
                                  setCustomBackgroundColor('#F8FAFC');
                                  setSidebarColor('#1E293B');
                                  setCustomSidebarColor('#1E293B');
                                  toast({ title: "Light Mode angewendet", description: "Standard-Farben wurden gesetzt." });
                                }}
                              >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border group-hover:bg-white transition-colors">
                                  <Sun size={20} className="text-orange-500" />
                                </div>
                                <div>
                                  <span className="font-semibold block text-sm">Light Mode</span>
                                  <span className="text-xs text-muted-foreground">Standard-Design (Hell)</span>
                                </div>
                              </div>

                              <div
                                className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted transition-all flex items-center gap-4 group"
                                onClick={() => {
                                  setPrimaryColor('#22C55E');
                                  setCustomPrimaryColor('#22C55E');
                                  setBackgroundColor('#0F172A');
                                  setCustomBackgroundColor('#0F172A');
                                  setSidebarColor('#020617');
                                  setCustomSidebarColor('#020617');
                                  toast({ title: "Dark Mode angewendet", description: "Dunkle Farben wurden gesetzt." });
                                }}
                              >
                                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border group-hover:bg-slate-800 transition-colors">
                                  <Moon size={20} className="text-blue-400" />
                                </div>
                                <div>
                                  <span className="font-semibold block text-sm">Dark Mode</span>
                                  <span className="text-xs text-muted-foreground">Modernes Dunkel-Design</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-border my-6" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label>App Hintergrundfarbe</Label>
                              <div className="flex gap-3 mt-2">
                                <input
                                  type="color"
                                  value={customBackgroundColor || backgroundColor}
                                  onChange={e => { setCustomBackgroundColor(e.target.value); setBackgroundColor(e.target.value); }}
                                  className="w-12 h-12 rounded-lg cursor-pointer border-2"
                                />
                                <Input
                                  value={customBackgroundColor || backgroundColor}
                                  onChange={e => { setCustomBackgroundColor(e.target.value); setBackgroundColor(e.target.value); }}
                                  placeholder="#F8FAFC"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Bestimmt den Hintergrund der gesamten App.</p>
                            </div>

                            <div>
                              <Label className="flex items-center gap-2">
                                <LayoutPanelLeft className="w-4 h-4" />
                                Seitenleiste / Menü
                              </Label>
                              <div className="flex gap-3 mt-2">
                                <input
                                  type="color"
                                  value={customSidebarColor || sidebarColor}
                                  onChange={e => { setCustomSidebarColor(e.target.value); setSidebarColor(e.target.value); }}
                                  className="w-12 h-12 rounded-lg cursor-pointer border-2"
                                />
                                <Input
                                  value={customSidebarColor || sidebarColor}
                                  onChange={e => { setCustomSidebarColor(e.target.value); setSidebarColor(e.target.value); }}
                                  placeholder="#1E293B"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Hintergrundfarbe des Menüs.</p>
                            </div>

                            <div>
                              <Label>Button-Farbe (PrimÃ¤r)</Label>
                              <div className="flex gap-3 mt-2">
                                <input
                                  type="color"
                                  value={customPrimaryColor || primaryColor}
                                  onChange={e => { setCustomPrimaryColor(e.target.value); setPrimaryColor(e.target.value); }}
                                  className="w-12 h-12 rounded-lg cursor-pointer border-2"
                                />
                                <Input
                                  value={customPrimaryColor || primaryColor}
                                  onChange={e => { setCustomPrimaryColor(e.target.value); setPrimaryColor(e.target.value); }}
                                  placeholder="#22C55E"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Wird für wichtige Buttons und Aktionen verwendet.</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {/* Wording Section */}
                {activeSection === 'wording' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Card>
                      <CardHeader><CardTitle>Wording</CardTitle><CardDescription>Passe die Begriffe in deiner App an.</CardDescription></CardHeader>
                      <CardContent className="space-y-4">
                        <div><Label>Begriff für "Level"</Label><Input value={levelTerm} onChange={(e) => setLevelTerm(e.target.value)} placeholder="z.B. Klasse" className="mt-2" /></div>
                        <div><Label>Begriff für "VIP"</Label><Input value={vipTerm} onChange={(e) => setVipTerm(e.target.value)} placeholder="z.B. Profi" className="mt-2" /></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Services Section */}
                {activeSection === 'services' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center"><CardTitle>Leistungen & Preise</CardTitle>
                          <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                            <DialogTrigger asChild><Button onClick={() => { setEditingService(null); setServiceForm({ name: '', category: 'training', price: 0, rank_order: services.length + 1 }); }}><Plus size={20} className="mr-2" />Neue Leistung</Button></DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>{editingService ? 'Leistung bearbeiten' : 'Neue Leistung'}</DialogTitle></DialogHeader>
                              <div className="space-y-4 py-4">
                                <div><Label>Name</Label><Input value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} className="mt-2" /></div>
                                <div><Label>Kategorie</Label><Select value={serviceForm.category} onValueChange={(v: any) => setServiceForm({ ...serviceForm, category: v })}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="training">Training</SelectItem><SelectItem value="workshop">Workshop</SelectItem><SelectItem value="lecture">Vortrag</SelectItem><SelectItem value="exam">Prüfung</SelectItem></SelectContent></Select></div>
                                <div><Label>Preis (€)</Label><Input type="number" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })} className="mt-2" /></div>
                              </div>
                              <DialogFooter><Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>Abbrechen</Button><Button onClick={handleAddService}>{editingService ? 'Speichern' : 'Hinzufügen'}</Button></DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader><TableRow><TableHead className="w-[50px]"></TableHead><TableHead>Name</TableHead><TableHead>Kategorie</TableHead><TableHead>Preis</TableHead><TableHead className="text-right">Aktionen</TableHead></TableRow></TableHeader>
                          <Reorder.Group axis="y" values={services} onReorder={setServices} as="tbody" className="relative">
                            {services.map((service, index) => (
                              <Reorder.Item
                                key={service.id || `temp-${index}`}
                                value={service}
                                as="tr"
                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                              >
                                <TableCell>
                                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                </TableCell>
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{getCategoryLabel(service.category)}</span></TableCell>
                                <TableCell>{service.price.toFixed(2)} €</TableCell>
                                <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => handleEditService(service)}><Pencil size={16} /></Button><Button variant="ghost" size="sm" onClick={() => handleDeleteService(index)}><Trash2 size={16} /></Button></div></TableCell>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </Table>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Levels Section - Master-Detail with Sheet */}
                {activeSection === 'levels' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                    <input type="file" id="level-badge-upload-input" className="hidden" accept="image/*" onChange={handleLevelBadgeFileChange} />
                    <Card>
                      <CardHeader><CardTitle>Level-System</CardTitle><CardDescription>Definiere die Aufstiegsleiter. Klicke auf "Bearbeiten" für Details.</CardDescription></CardHeader>
                      <CardContent className="space-y-4">
                        {/* Global Level Colors */}
                        <div className="bg-card p-4 rounded-lg border border-border">
                          <h4 className="font-semibold mb-3">Farbe für "Alle Level"</h4>
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: openForAllColor }}></div>
                            <input type="color" value={openForAllColor} onChange={(e) => setOpenForAllColor(e.target.value)} className="h-8 w-20 p-1 border border-border rounded cursor-pointer" />
                          </div>
                        </div>
                        <div className="bg-card p-4 rounded-lg border border-border">
                          <h4 className="font-semibold mb-3">Farbe für Workshops & Vorträge</h4>
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full border border-border" style={{ backgroundColor: workshopLectureColor }}></div>
                            <input type="color" value={workshopLectureColor} onChange={(e) => setWorkshopLectureColor(e.target.value)} className="h-8 w-20 p-1 border border-border rounded cursor-pointer" />
                          </div>
                        </div>

                        {/* Master List - Reorderable */}
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-semibold mb-3">{levelTerm}-Übersicht</h4>
                          <Reorder.Group axis="y" values={levels} onReorder={setLevels} className="space-y-2">
                            {levels.map((level, index) => (
                              <Reorder.Item key={level.id || `level-${index}`} value={level} className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg cursor-grab active:cursor-grabbing">
                                <GripVertical size={18} className="text-muted-foreground" />
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground" style={{ backgroundColor: level.color || '#22C55E' }}>{index + 1}</div>
                                <span className="flex-1 font-medium">{level.name}</span>
                                {level.badgeImage && <Award size={18} className="text-primary" />}
                                <span className="text-xs text-muted-foreground">{level.requirements.length} Anforderungen</span>
                                <Button variant="outline" size="sm" onClick={() => setEditingLevelIndex(index)}><Pencil size={14} className="mr-1" /> Bearbeiten</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteLevel(index)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                          <Button variant="outline" size="lg" className="w-full border-2 border-dashed mt-4" onClick={handleAddLevel}><Plus size={20} className="mr-2" />Neues {levelTerm} hinzufügen</Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Level Detail Sheet */}
                    <Sheet open={editingLevelIndex !== null} onOpenChange={(open) => !open && setEditingLevelIndex(null)}>
                      <SheetContent className="w-[500px] sm:max-w-[540px] overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>{levelTerm} {(editingLevelIndex ?? 0) + 1} bearbeiten</SheetTitle>
                          <SheetDescription>Konfiguriere alle Details für dieses Level.</SheetDescription>
                        </SheetHeader>
                        {editingLevelIndex !== null && levels[editingLevelIndex] && (
                          <div className="space-y-6 py-6">
                            {/* Level Name */}
                            <div>
                              <Label>{levelTerm}-Name</Label>
                              <Input value={levels[editingLevelIndex].name} onChange={(e) => handleUpdateLevelName(editingLevelIndex, e.target.value)} className="mt-2" />
                            </div>

                            {/* Badge Upload */}
                            <div>
                              <Label className="text-sm mb-2 block">{levelTerm}-Abzeichen</Label>
                              <div onClick={() => handleUploadBadge(editingLevelIndex)} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${levels[editingLevelIndex].badgeImage ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted'}`}>
                                {levels[editingLevelIndex].badgeImage ? <div className="flex items-center justify-center gap-2"><Award size={24} className="text-primary" /><span className="text-sm font-medium">Abzeichen hochgeladen</span></div> : <div className="flex items-center justify-center gap-2"><Upload size={20} className="text-muted-foreground" /><span className="text-sm text-muted-foreground">Abzeichen hochladen</span></div>}
                              </div>
                            </div>

                            {/* Color */}
                            <div>
                              <Label className="text-base font-medium">Farbe</Label>
                              <p className="text-sm text-muted-foreground mb-2">Farbe für die Darstellung in Kalender & App.</p>
                              <div className="flex gap-2">
                                {colorPresets.map((preset) => (
                                  <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => {
                                      const newLevels = [...levels];
                                      newLevels[editingLevelIndex].color = preset.value;
                                      setLevels(newLevels);
                                    }}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${levels[editingLevelIndex].color === preset.value ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: preset.value }}
                                    title={preset.name}
                                  />
                                ))}
                                <input
                                  type="color"
                                  value={levels[editingLevelIndex].color || '#22C55E'}
                                  onChange={(e) => {
                                    const newLevels = [...levels];
                                    newLevels[editingLevelIndex].color = e.target.value;
                                    setLevels(newLevels);
                                  }}
                                  className="w-8 h-8 rounded-full border-2 border-transparent cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Additional Requirements Toggle */}
                            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                              <div className="space-y-0.5">
                                <Label className="text-base font-medium">Zusatzleistungen</Label>
                                <p className="text-sm text-muted-foreground">Sollen für dieses Level Zusatzleistungen abgefragt werden?</p>
                              </div>
                              <Switch checked={levels[editingLevelIndex].has_additional_requirements} onCheckedChange={(val) => handleToggleAdditional(editingLevelIndex, val)} />
                            </div>

                            {/* Requirements */}
                            <div>
                              <Label className="text-sm font-medium mb-3 block">Anforderungen</Label>
                              {levels[editingLevelIndex].requirements.filter(r => !r.is_additional).length === 0 ? <p className="text-sm text-muted-foreground italic">Noch keine Anforderungen definiert</p> : (
                                <Reorder.Group
                                  axis="y"
                                  values={levels[editingLevelIndex].requirements.filter(r => !r.is_additional)}
                                  onReorder={(newOrder) => {
                                    const newLevels = [...levels];
                                    const additionalReqs = newLevels[editingLevelIndex].requirements.filter(r => r.is_additional);
                                    newLevels[editingLevelIndex].requirements = [...newOrder, ...additionalReqs];
                                    setLevels(newLevels);
                                  }}
                                  className="space-y-2"
                                >
                                  {levels[editingLevelIndex].requirements.filter(r => !r.is_additional).map((req) => {
                                    const originalIdx = levels[editingLevelIndex].requirements.findIndex(r => r === req);
                                    return (
                                      <Reorder.Item key={req.id || `req-${req.training_type_id}-${originalIdx}`} value={req} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                        <GripVertical size={16} className="text-muted-foreground cursor-grab active:cursor-grabbing" />
                                        <Input type="number" min="1" value={req.required_count} onChange={(e) => handleUpdateRequirement(editingLevelIndex, originalIdx, parseInt(e.target.value) || 1)} className="w-16 h-8 text-center" />
                                        <span className="text-sm flex-1">x {getServiceName(req.training_type_id)}</span>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRequirement(editingLevelIndex, originalIdx)}><Trash2 size={14} /></Button>
                                      </Reorder.Item>
                                    );
                                  })}
                                </Reorder.Group>
                              )}
                              <Dialog open={isRequirementDialogOpen && currentLevelIndex === editingLevelIndex} onOpenChange={(open) => { setIsRequirementDialogOpen(open); if (open) setCurrentLevelIndex(editingLevelIndex); }}>
                                <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full mt-2" onClick={() => { setCurrentLevelIndex(editingLevelIndex); setRequirementForm({ serviceId: '', quantity: 1 }); }}><Plus size={16} className="mr-2" />Anforderung hinzufügen</Button></DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Neue Anforderung</DialogTitle>
                                    <div className="sr-only"><DialogDescription>Füge eine neue Anforderung hinzu.</DialogDescription></div>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div><Label>Anzahl</Label><Input type="number" min="1" value={requirementForm.quantity} onChange={(e) => setRequirementForm({ ...requirementForm, quantity: parseInt(e.target.value) || 1 })} className="mt-2" /></div>
                                    <div><Label>Leistung</Label><Select value={requirementForm.serviceId} onValueChange={(v) => setRequirementForm({ ...requirementForm, serviceId: v })}><SelectTrigger className="mt-2"><SelectValue placeholder="Leistung auswählen" /></SelectTrigger><SelectContent>{services.filter(s => s.id !== undefined).map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.price.toFixed(2)} €)</SelectItem>)}</SelectContent></Select></div>
                                  </div>
                                  <DialogFooter><Button variant="outline" onClick={() => setIsRequirementDialogOpen(false)}>Abbrechen</Button><Button onClick={() => handleAddRequirement(false)} disabled={!requirementForm.serviceId}>Hinzufügen</Button></DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>

                            {/* Additional Requirements */}
                            {levels[editingLevelIndex].has_additional_requirements && (
                              <div className="space-y-4 pt-4 border-t">
                                <Label className="text-sm font-medium mb-3 block">Zusatzleistungen (nur Vorträge & Workshops)</Label>
                                {levels[editingLevelIndex].requirements.filter(r => r.is_additional).length === 0 ? <p className="text-sm text-muted-foreground italic">Noch keine Zusatzleistungen definiert</p> : (
                                  <Reorder.Group
                                    axis="y"
                                    values={levels[editingLevelIndex].requirements.filter(r => r.is_additional)}
                                    onReorder={(newOrder) => {
                                      const newLevels = [...levels];
                                      const normalReqs = newLevels[editingLevelIndex].requirements.filter(r => !r.is_additional);
                                      newLevels[editingLevelIndex].requirements = [...normalReqs, ...newOrder];
                                      setLevels(newLevels);
                                    }}
                                    className="space-y-2"
                                  >
                                    {levels[editingLevelIndex].requirements.filter(r => r.is_additional).map((req) => {
                                      const originalIdx = levels[editingLevelIndex].requirements.findIndex(r => r === req);
                                      return (
                                        <Reorder.Item key={req.id || `add-req-${req.training_type_id}-${originalIdx}`} value={req} className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                                          <GripVertical size={16} className="text-muted-foreground cursor-grab active:cursor-grabbing mr-2" />
                                          <span className="text-sm flex-1">{getServiceName(req.training_type_id)}</span>
                                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRequirement(editingLevelIndex, originalIdx)}><Trash2 size={14} /></Button>
                                        </Reorder.Item>
                                      );
                                    })}
                                  </Reorder.Group>
                                )}
                                <Dialog open={isAdditionalDialogOpen && currentLevelIndex === editingLevelIndex} onOpenChange={(open) => { setIsAdditionalDialogOpen(open); if (open) setCurrentLevelIndex(editingLevelIndex); }}>
                                  <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full border-primary/20 hover:bg-primary/5 text-primary" onClick={() => { setCurrentLevelIndex(editingLevelIndex); setRequirementForm({ serviceId: '', quantity: 1 }); }}><Plus size={16} className="mr-2" />Zusatzleistung hinzufügen</Button></DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Zusatzleistung hinzufügen</DialogTitle>
                                      <div className="sr-only"><DialogDescription>Füge eine Zusatzleistung hinzu.</DialogDescription></div>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <p className="text-sm text-muted-foreground">Zusatzleistungen können pro Level nur einmal hinzugefügt werden.</p>
                                      <div><Label>Leistung</Label>
                                        <Select value={requirementForm.serviceId} onValueChange={(v) => setRequirementForm({ ...requirementForm, serviceId: v })}>
                                          <SelectTrigger className="mt-2"><SelectValue placeholder="Wähle einen Vortrag oder Workshop" /></SelectTrigger>
                                          <SelectContent>
                                            {services
                                              .filter(s => (s.category === 'lecture' || s.category === 'workshop') && s.id !== undefined)
                                              .filter(s => !levels[editingLevelIndex].requirements.some(r => r.training_type_id === s.id))
                                              .map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({getCategoryLabel(s.category)})</SelectItem>)
                                            }
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <DialogFooter><Button variant="outline" onClick={() => setIsAdditionalDialogOpen(false)}>Abbrechen</Button><Button onClick={() => handleAddRequirement(true)} disabled={!requirementForm.serviceId}>Hinzufügen</Button></DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>
                        )}
                      </SheetContent>
                    </Sheet>
                  </motion.div>
                )}

                {/* Balance Section */}
                {activeSection === 'topup' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Guthaben-Aufladung</CardTitle>
                            <CardDescription>Konfiguriere Bonus-Stufen und Optionen</CardDescription>
                          </div>
                          <Button onClick={() => setTopUpOptions([...topUpOptions, { amount: 0, bonus: 0 }])}>
                            <Plus size={20} className="mr-2" />Neue Stufe
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="space-y-0.5">
                            <Label>Individuelle Beträge</Label>
                            <p className="text-sm text-muted-foreground">Kunden können beliebige Beträge aufladen</p>
                          </div>
                          <Switch checked={allowCustomTopUp} onCheckedChange={setAllowCustomTopUp} />
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Betrag (€)</TableHead>
                              <TableHead>Bonus (€)</TableHead>
                              <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {topUpOptions.map((opt, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={opt.amount}
                                    onChange={(e) => {
                                      const newOpts = [...topUpOptions];
                                      newOpts[index].amount = parseFloat(e.target.value) || 0;
                                      setTopUpOptions(newOpts);
                                    }}
                                    className="w-32"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={opt.bonus}
                                    onChange={(e) => {
                                      const newOpts = [...topUpOptions];
                                      newOpts[index].bonus = parseFloat(e.target.value) || 0;
                                      setTopUpOptions(newOpts);
                                    }}
                                    className="w-32"
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTopUpOptions(topUpOptions.filter((_, i) => i !== index))}
                                  >
                                    <Trash2 size={16} className="text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {topUpOptions.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground italic py-8">
                                  Keine festen Auflade-Beträge definiert.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Module Hub - Master-Detail View */}
                {activeSection === 'modules' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {currentView === 'overview' ? (
                      <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                          <h2 className="text-2xl font-bold tracking-tight">App-Module</h2>
                          <p className="text-muted-foreground text-sm max-w-2xl">
                            Aktiviere oder deaktiviere Funktionen für deine Kunden. Aktive Module können über "⚙️ Einstellungen" konfiguriert werden.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {AVAILABLE_MODULES.map((module) => {
                            const isActive = activeModules.includes(module.id);
                            const isAllowed = isFeatureAllowed(module.id);

                            return (
                              <Card key={module.id} className={`transition-all duration-200 ${isActive ? 'ring-1 ring-primary/20 bg-primary/5 shadow-sm' : 'hover:border-primary/50 opacity-90'}`}>
                                <CardHeader className="p-4 pb-2">
                                  <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                      <module.icon size={20} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <Switch
                                        checked={isActive}
                                        disabled={module.premiumOnly && !isAllowed || module.comingSoon}
                                        onCheckedChange={(val) => {
                                          if (val) setActiveModules([...activeModules, module.id]);
                                          else setActiveModules(activeModules.filter(id => id !== module.id));
                                        }}
                                      />
                                      {module.comingSoon && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Coming Soon</span>}
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <CardTitle className="text-base">{module.name}</CardTitle>
                                    <CardDescription className="text-xs mt-1 leading-relaxed">{module.description}</CardDescription>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  {isActive && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full mt-4 h-9 font-medium border-primary/20 hover:bg-primary/10 text-primary transition-colors hover:text-primary"
                                      onClick={() => {
                                        setSelectedModuleId(module.id);
                                        setCurrentView('module-settings');
                                      }}
                                    >
                                      <Settings size={14} className="mr-2" />
                                      Einstellungen
                                    </Button>
                                  )}
                                  {module.premiumOnly && !isAllowed && !isActive && (
                                    <div className="mt-4 p-2 bg-amber-500/5 rounded border border-amber-500/10 flex items-center justify-between">
                                      <span className="text-[10px] font-semibold text-amber-600 uppercase flex items-center gap-1"><Lock size={10} /> Nur Pro/Enterprise</span>
                                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-amber-700 hover:text-amber-800 p-0" onClick={() => window.open(`/preise?subdomain=${subdomain}`, '_self')}>Upgrade</Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Module Detail Settings */
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                          <Button variant="ghost" size="sm" onClick={() => setCurrentView('overview')} className="h-9 px-2 hover:bg-muted">
                            <ArrowLeft size={18} className="mr-1" /> Zurück
                          </Button>
                          <div>
                            <h2 className="text-xl font-bold">{AVAILABLE_MODULES.find(m => m.id === selectedModuleId)?.name}</h2>
                            <p className="text-xs text-muted-foreground">Konfiguriere die Modul-Einstellungen</p>
                          </div>
                        </div>

                        {/* Calendar Details */}
                        {selectedModuleId === 'calendar' && (
                          <div className="grid gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle>Standardwerte für Termine</CardTitle>
                                <CardDescription>Diese Werte werden als Standard beim Erstellen neuer Termine vorgeschlagen.</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Standard-Dauer (Minuten)</Label>
                                    <Input type="number" min="5" value={defaultDuration} onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 60)} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Max. Teilnehmer (Standard)</Label>
                                    <Input type="number" min="1" value={defaultMaxParticipants} onChange={(e) => setDefaultMaxParticipants(parseInt(e.target.value) || 10)} />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle>Automatisierung & Optionen</CardTitle>
                                <CardDescription>Erweiterte Funktionen für deinen Kalender und Abrechnung</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                  <div className="space-y-0.5">
                                    <Label className="font-medium">Warteliste aktivieren</Label>
                                    <p className="text-xs text-muted-foreground italic">Kunden können sich bei vollen Terminen auf eine Warteliste setzen.</p>
                                  </div>
                                  <Switch
                                    checked={activeModules.includes('waitlist')}
                                    onCheckedChange={(val) => {
                                      if (val) setActiveModules([...activeModules, 'waitlist']);
                                      else setActiveModules(activeModules.filter(mId => mId !== 'waitlist'));
                                    }}
                                  />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                  <div className="space-y-0.5">
                                    <Label className="font-medium">Automatische Abrechnung</Label>
                                    <p className="text-xs text-muted-foreground italic">Termine werden automatisch vom Guthaben abgezogen</p>
                                  </div>
                                  <Switch checked={autoBillingEnabled} onCheckedChange={setAutoBillingEnabled} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                                  <div className="space-y-0.5">
                                    <Label className="font-medium">Automatischer Levelaufstieg</Label>
                                    <p className="text-xs text-muted-foreground italic">Mitglieder steigen bei erfüllten Anforderungen automatisch auf</p>
                                  </div>
                                  <Switch checked={autoProgressEnabled} onCheckedChange={setAutoProgressEnabled} />
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                  <CardTitle>Farbregeln</CardTitle>
                                  <CardDescription>Definiere Farben für Termine basierend auf Levels oder Leistungen</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => {
                                  const newRule: ColorRule = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name: '',
                                    type: 'service',
                                    target_ids: [],
                                    color: '#3B82F6'
                                  };
                                  setColorRules([...colorRules, newRule]);
                                }}>
                                  <Plus size={16} className="mr-2" />
                                  Regel hinzufügen
                                </Button>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {colorRules.length === 0 ? (
                                  <div className="text-center py-8 text-muted-foreground italic border-2 border-dashed rounded-lg">
                                    Keine Farbregeln definiert. Termine nutzen Standardfarben.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {colorRules.map((rule, idx) => (
                                      <div key={rule.id} className="p-4 border rounded-lg bg-background/50 space-y-4">
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="flex-1">
                                            <Input
                                              placeholder="Name der Regel (z.B. Welpenkurse)"
                                              value={rule.name}
                                              onChange={(e) => {
                                                const newRules = [...colorRules];
                                                newRules[idx].name = e.target.value;
                                                setColorRules(newRules);
                                              }}
                                            />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-10 h-10 rounded border cursor-pointer flex-shrink-0"
                                              style={{ backgroundColor: rule.color }}
                                              onClick={() => {
                                                const newColor = prompt('Farbe wählen (Hex):', rule.color);
                                                if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
                                                  const newRules = [...colorRules];
                                                  newRules[idx].color = newColor;
                                                  setColorRules(newRules);
                                                }
                                              }}
                                            />
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="text-destructive h-10 w-10"
                                              onClick={() => setColorRules(colorRules.filter((_, i) => i !== idx))}
                                            >
                                              <Trash2 size={18} />
                                            </Button>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                          <div className="w-1/3">
                                            <Select
                                              value={rule.type}
                                              onValueChange={(val: 'level' | 'service') => {
                                                const newRules = [...colorRules];
                                                newRules[idx].type = val;
                                                newRules[idx].target_ids = [];
                                                setColorRules(newRules);
                                              }}
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="service">Leistungen</SelectItem>
                                                <SelectItem value="level">Levels</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background">
                                              {(rule.type === 'service' ? services : levels).map((item: any) => {
                                                const isSelected = rule.target_ids.includes(item.id);
                                                return (
                                                  <button
                                                    key={item.id}
                                                    onClick={() => {
                                                      const newRules = [...colorRules];
                                                      if (isSelected) {
                                                        newRules[idx].target_ids = newRules[idx].target_ids.filter(id => id !== item.id);
                                                      } else {
                                                        newRules[idx].target_ids = [...newRules[idx].target_ids, item.id];
                                                      }
                                                      setColorRules(newRules);
                                                    }}
                                                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${isSelected
                                                      ? 'bg-primary text-primary-foreground border-primary'
                                                      : 'bg-muted text-muted-foreground border-transparent hover:border-muted-foreground/20'
                                                      }`}
                                                  >
                                                    {item.name}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}


                        {/* Generic Placeholder for other modules */}
                        {!['calendar'].includes(selectedModuleId || '') && (
                          <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Settings className="text-muted-foreground" />
                              </div>
                              <h3 className="font-semibold">Keine speziellen Einstellungen</h3>
                              <p className="text-sm text-muted-foreground max-w-xs mt-2">
                                Für dieses Modul sind aktuell keine weiteren Einstellungen erforderlich.
                              </p>
                              <Button variant="outline" className="mt-6" onClick={() => setCurrentView('overview')}>
                                Zurück zur Übersicht
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Team & Rights Section */}
                {activeSection === 'rights' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShieldCheck size={20} />
                          Team & Rechte
                        </CardTitle>
                        <CardDescription>Verwalte die Berechtigungen deines Teams.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingStaff ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-primary" />
                          </div>
                        ) : staff.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic text-center py-8">Keine Teammitglieder gefunden.</p>
                        ) : (
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead>Mitarbeiter</TableHead>
                                  <TableHead className="text-center">Termine</TableHead>
                                  <TableHead className="text-center">Kunden löschen</TableHead>
                                  <TableHead className="text-center">Nachrichten</TableHead>
                                  <TableHead className="text-right">Rolle</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {staff.map((member) => (
                                  <TableRow key={member.id}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                      {member.first_name || member.name} {member.last_name || ''}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Switch
                                        checked={member.role === 'admin' || (member.permissions?.can_manage_appointments || false)}
                                        onCheckedChange={(val) => handlePermissionChange(member.id, 'can_manage_appointments', val)}
                                        disabled={member.role === 'admin'}
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Switch
                                        checked={member.role === 'admin' || (member.permissions?.can_delete_customers || false)}
                                        onCheckedChange={(val) => handlePermissionChange(member.id, 'can_delete_customers', val)}
                                        disabled={member.role === 'admin'}
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Switch
                                        checked={member.role === 'admin' || (member.permissions?.can_create_messages || false)}
                                        onCheckedChange={(val) => handlePermissionChange(member.id, 'can_create_messages', val)}
                                        disabled={member.role === 'admin'}
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${member.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {member.role === 'admin' ? 'Admin' : 'Personal'}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Preview */}

            {/* --- DESKTOP PREVIEW COLUMN --- */}
            {showPreview && (
              <div className="hidden lg:block w-[350px]">
                <div className="sticky top-24 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Smartphone size={20} className="text-foreground" />
                        Live-Vorschau
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">So sieht deine Hundeschule später aus</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(getPreviewUrl(), '_blank')}
                      title="In neuem Tab öffnen"
                    >
                      <ExternalLink size={14} />
                    </Button>
                  </div>

                  <div className="flex justify-center gap-2 pt-2">
                    <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                      <button
                        onClick={() => setPreviewViewMode('app')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${previewViewMode === 'app'
                          ? 'bg-[#2F5233] text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          }`}
                      >
                        App
                      </button>
                      <button
                        onClick={() => setPreviewViewMode('login')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${previewViewMode === 'login'
                          ? 'bg-[#2F5233] text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          }`}
                      >
                        Login
                      </button>
                    </div>

                    <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                      <button
                        onClick={() => setPreviewRole('customer')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${previewRole === 'customer'
                          ? 'bg-[#2F5233] text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          }`}
                      >
                        Kunde
                      </button>
                      <button
                        onClick={() => setPreviewRole('admin')}
                        className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${previewRole === 'admin'
                          ? 'bg-[#2F5233] text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full aspect-[9/19] bg-gray-900 rounded-[2.5rem] shadow-2xl border-[8px] border-gray-800 overflow-hidden">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-xl z-10" />
                    <iframe
                      ref={iframeRef}
                      src={PREVIEW_APP_URL}
                      title="App Preview Desktop"
                      className="w-full h-full bg-white border-0"
                      onLoad={() => setSyncTrigger(prev => prev + 1)}
                    />
                  </div>                </div>
              </div>
            )}
          </div>
        </div>
      </main >

      {/* --- MOBILE PREVIEW FAB --- */}
      < Button
        onClick={() => setIsPreviewMobileOpen(true)
        }
        className="fixed bottom-6 right-6 xl:hidden w-14 h-14 rounded-full shadow-lg z-40 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <PreviewIcon size={24} />
      </Button >

      {/* --- MOBILE PREVIEW SHEET --- */}
      < Sheet open={isPreviewMobileOpen} onOpenChange={setIsPreviewMobileOpen} >
        <SheetContent side="bottom" className="p-0 h-[85vh] rounded-t-2xl overflow-hidden">
          <SheetHeader className="hidden">
            <SheetTitle>Live-Vorschau</SheetTitle>
            <SheetDescription>Mobile Vorschau der App</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b bg-background">
              <div className="flex items-center gap-2 font-semibold">
                <Smartphone size={18} />
                <span>Live-Vorschau</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsPreviewMobileOpen(false)}>Schließen</Button>
            </div>
            <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
              {/* Mobile Preview Content */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center space-x-1 bg-background p-1 rounded-md border">
                    <Button variant={previewViewMode === 'app' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setPreviewViewMode('app')}>App</Button>
                    <Button variant={previewViewMode === 'login' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setPreviewViewMode('login')}>Login</Button>
                  </div>
                  <div className="flex items-center space-x-1 bg-background p-1 rounded-md border">
                    <Button variant={previewRole === 'customer' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setPreviewRole('customer')}>Kunde</Button>
                    <Button variant={previewRole === 'admin' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setPreviewRole('admin')}>Admin</Button>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-[280px] aspect-[9/19] bg-gray-900 rounded-[2rem] shadow-xl border-[6px] border-gray-800 overflow-hidden">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-b-xl z-10" />
                    <iframe
                      ref={isPreviewMobileOpen ? iframeRef : null}
                      src={PREVIEW_APP_URL}
                      title="App Preview Mobile"
                      className="w-full h-full bg-white border-0"
                      onLoad={() => setSyncTrigger(prev => prev + 1)}
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => window.open(getPreviewUrl(), '_blank')}>
                  <ExternalLink size={16} className="mr-2" /> In neuem Tab öffnen
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet >
    </div >
  );
}
