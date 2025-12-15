import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { fetchAppConfig, saveSettings, uploadImage } from '@/lib/api';
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
  Loader2
} from 'lucide-react';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  id?: number; // Optional, da neu erstellte noch keine ID haben
  name: string;
  category: string;
  price: number;
}

interface LevelRequirement {
  id?: number;
  training_type_id: number;
  required_count: number;
}

interface Level {
  id?: number;
  name: string;
  rank_order: number;
  badgeImage?: string;
  requirements: LevelRequirement[];
}

// Preview URL - could be env var
const PREVIEW_APP_URL = 'http://localhost:5173/?mode=preview';


const colorPresets = [
  { name: 'Grün', value: '#22C55E' },
  { name: 'Blau', value: '#3B82F6' },
  { name: 'Lila', value: '#A855F7' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Rot', value: '#EF4444' },
];

export function EinstellungenPage() {
  const { toast } = useToast();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data States
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#22C55E');
  const [secondaryColor, setSecondaryColor] = useState('#3B82F6');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('');
  const [customSecondaryColor, setCustomSecondaryColor] = useState('');
  const [levelTerm, setLevelTerm] = useState('Level');
  const [vipTerm, setVipTerm] = useState('VIP');

  const [services, setServices] = useState<Service[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  // UI States
  const [hasLogo, setHasLogo] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);

  // Iframe Ref
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Sync Timer to avoid spamming postMessage
  const [previewViewMode, setPreviewViewMode] = useState<'app' | 'login'>('app');
  const [previewRole, setPreviewRole] = useState<'customer' | 'admin'>('customer');
  const [syncTrigger, setSyncTrigger] = useState(0);

  // Sync settings to iframe when they change
  useEffect(() => {
    if (!showPreview || !iframeRef.current) return;

    const mappedLevels = levels.map(l => ({
      ...l,
      requirements: l.requirements.map(r => ({
        id: r.id || `temp-${r.training_type_id}-${Math.random()}`,
        name: services.find(s => s.id === r.training_type_id)?.name || 'Unbekannt',
        required: r.required_count
      }))
    }));

    const configPayload = {
      primary_color: customPrimaryColor || primaryColor,
      secondary_color: customSecondaryColor || secondaryColor,
      school_name: schoolName,
      logoUrl: previewLogo || (hasLogo ? '/paw.png' : undefined), // Use logoUrl to match App.tsx
      levels: mappedLevels,
      services: services,
      view_mode: previewViewMode,
      role: previewRole
    };

    const message = {
      type: 'UPDATE_CONFIG',
      payload: configPayload
    };

    // Small delay to ensure iframe is loaded or just debounce
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(message, '*');
    }, 100);

    return () => clearTimeout(timer);
  }, [showPreview, primaryColor, secondaryColor, customPrimaryColor, customSecondaryColor, schoolName, syncTrigger, levels, services, hasLogo, previewLogo, previewViewMode, previewRole]);

  const getPreviewUrl = () => {
    const mappedLevels = levels.map(l => ({
      ...l,
      requirements: l.requirements.map(r => ({
        id: r.id || `temp-${r.training_type_id}-${Math.random()}`,
        name: services.find(s => s.id === r.training_type_id)?.name || 'Unbekannt',
        required: r.required_count
      }))
    }));

    const config = {
      primary_color: customPrimaryColor || primaryColor,
      secondary_color: customSecondaryColor || secondaryColor,
      school_name: schoolName,
      logoUrl: previewLogo || (hasLogo ? '/paw.png' : undefined),
      levels: mappedLevels,
      services: services,
      view_mode: previewViewMode,
      role: previewRole
    };

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
    return `${PREVIEW_APP_URL}#config=${encoded}`;
  };


  // Dialog States
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'training',
    price: 0,
  });

  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(-1);
  const [requirementForm, setRequirementForm] = useState({
    serviceId: '',
    quantity: 1,
  });

  const [uploadingLevelIndex, setUploadingLevelIndex] = useState<number | null>(null);

  // --- API: DATEN LADEN ---
  useEffect(() => {
    async function loadData() {
      try {
        const config = await fetchAppConfig();
        const t = config.tenant;

        setSchoolName(t.name);
        setSubdomain(t.subdomain);

        // Config Fields
        const branding = t.config?.branding || {};
        const wording = t.config?.wording || {};

        setPrimaryColor(branding.primary_color || '#22C55E');
        setSecondaryColor(branding.secondary_color || '#3B82F6');
        setLevelTerm(wording.level || 'Level');
        setVipTerm(wording.vip || 'VIP');

        if (branding.logo_url) {
          setPreviewLogo(branding.logo_url);
          setHasLogo(true);
        }

        // Mapped Data: Backend -> Frontend State
        const mappedServices = config.training_types.map((tt: any) => ({
          id: tt.id,
          name: tt.name,
          category: tt.category,
          price: tt.default_price
        }));
        setServices(mappedServices);

        const mappedLevels = config.levels.map((l: any) => ({
          id: l.id,
          name: l.name,
          rank_order: l.rank_order,
          badgeImage: l.icon_url,
          requirements: l.requirements.map((r: any) => ({
            id: r.id,
            training_type_id: r.training_type_id,
            required_count: r.required_count
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

  // --- API: DATEN SPEICHERN ---
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        school_name: schoolName,
        subdomain: subdomain,
        primary_color: customPrimaryColor || primaryColor,
        secondary_color: customSecondaryColor || secondaryColor,
        logo_url: previewLogo,
        level_term: levelTerm,
        vip_term: vipTerm,
        services: services,
        levels: levels.map(l => ({
          ...l,
          icon_url: l.badgeImage, // Map frontend 'badgeImage' to backend 'icon_url'
        }))
      };

      await saveSettings(payload);

      toast({
        title: "Gespeichert",
        description: "Deine Änderungen wurden erfolgreich übernommen."
      });

      // Reload um frische IDs für neue Items zu bekommen
      // Eine saubere Lösung wäre, die Response zu parsen, aber Reload ist robust.
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

  // --- HANDLERS (Frontend Logic) ---

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const { url } = await uploadImage(file);
        // Use full URL if relative returned (api endpoint returns /static/uploads/...)
        // We need to prepend API_BASE if it's separate, but usually static is on same domain or handled by proxy.
        // For development (localhost:8000), we might need full URL unless PROXY is set up.
        // Let's check api.ts base url. It is typically http://127.0.0.1:8000.
        // If frontend is 5173, we need full URL.
        const fullUrl = url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
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

  const handleLevelBadgeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadingLevelIndex === null || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    try {
      const { url } = await uploadImage(file);
      const fullUrl = url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;

      const newLevels = [...levels];
      newLevels[uploadingLevelIndex].badgeImage = fullUrl;
      setLevels(newLevels);
      setUploadingLevelIndex(null);
    } catch (err) {
      console.error("Upload failed", err);
      toast({ variant: "destructive", title: "Upload fehlgeschlagen" });
    }
  };

  const handleAddService = () => {
    if (editingService) {
      setServices(
        services.map((s) =>
          // Wir vergleichen hier Indizes oder temporäre IDs, falls echte ID fehlt
          s === editingService ? { ...editingService, ...serviceForm } : s
        )
      );
    } else {
      // Neue Services haben noch keine ID (undefined)
      setServices([...services, { ...serviceForm, id: -Date.now() }]);
    }
    setIsServiceDialogOpen(false);
    setEditingService(null);
    setServiceForm({ name: '', category: 'training', price: 0 });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      category: service.category,
      price: service.price,
    });
    setIsServiceDialogOpen(true);
  };

  const handleDeleteService = (index: number) => {
    if (confirm('Möchten Sie diese Leistung wirklich löschen?')) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const handleAddLevel = () => {
    const newLevel: Level = {
      // Keine ID = neu
      name: `${levelTerm} ${levels.length + 1}`,
      rank_order: levels.length + 1,
      badgeImage: undefined,
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

  const handleAddRequirement = () => {
    const newLevels = [...levels];
    const serviceId = parseInt(requirementForm.serviceId);

    newLevels[currentLevelIndex].requirements.push({
      training_type_id: serviceId,
      required_count: requirementForm.quantity,
    });

    setLevels(newLevels);
    setIsRequirementDialogOpen(false);
    setRequirementForm({ serviceId: '', quantity: 1 });
  };

  const handleUpdateRequirement = (
    levelIndex: number,
    reqIndex: number,
    quantity: number
  ) => {
    const newLevels = [...levels];
    newLevels[levelIndex].requirements[reqIndex].required_count = quantity;
    setLevels(newLevels);
  };

  const handleDeleteRequirement = (levelIndex: number, reqIndex: number) => {
    const newLevels = [...levels];
    newLevels[levelIndex].requirements.splice(reqIndex, 1);
    setLevels(newLevels);
  };

  // Helper
  const getServiceName = (id: number) => {
    return services.find((s) => s.id === id)?.name || 'Unbekannt';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      training: 'Training',
      workshop: 'Workshop',
      lecture: 'Vortrag',
      exam: 'Prüfung',
    };
    return labels[category] || category;
  };





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
    <main className="pt-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-sans font-bold text-foreground mb-2">
              Einstellungen
            </h1>
            <p className="text-lg text-muted-foreground font-body">
              Konfiguriere deine Hundeschule und passe die App an deine Bedürfnisse an.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Preview Toggle */}
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2">
              <Label htmlFor="preview-toggle" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                {showPreview ? (
                  <>
                    <Eye size={18} strokeWidth={1.5} className="text-primary" />
                    <span>Vorschau</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={18} strokeWidth={1.5} className="text-muted-foreground" />
                    <span>Vorschau</span>
                  </>
                )}
              </Label>
              <Switch
                id="preview-toggle"
                checked={showPreview}
                onCheckedChange={setShowPreview}
              />
            </div>
            <Button
              size="lg"
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
            >
              {saving ? <Loader2 className="mr-2 animate-spin" /> : <Save size={20} strokeWidth={1.5} className="mr-2" />}
              Speichern
            </Button>
          </div>
        </div>

        {/* Main Content with Preview */}
        <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Preview Panel */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="lg:sticky lg:top-24 lg:self-start order-1 lg:order-2"
              >
                <Card className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Smartphone size={20} strokeWidth={1.5} />
                          Live-Vorschau
                        </CardTitle>
                        <CardDescription>
                          Die App wird live im IFrame geladen
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getPreviewUrl(), '_blank')}
                        title="In neuem Tab öffnen"
                      >
                        <ExternalLink size={16} />
                      </Button>
                    </div>

                    {/* Preview Controls */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
                        <Button
                          variant={previewViewMode === 'app' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setPreviewViewMode('app')}
                        >App</Button>
                        <Button
                          variant={previewViewMode === 'login' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setPreviewViewMode('login')}
                        >Login</Button>
                      </div>
                      <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
                        <Button
                          variant={previewRole === 'customer' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setPreviewRole('customer')}
                        >Kunde</Button>
                        <Button
                          variant={previewRole === 'admin' ? 'secondary' : 'ghost'}
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setPreviewRole('admin')}
                        >Admin</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Smartphone Frame */}
                    <div className="flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-[380px] mx-auto aspect-[9/19] bg-gray-900 rounded-[3rem] shadow-2xl border-[8px] border-gray-800 overflow-hidden"
                      >
                        {/* Phone Notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />

                        {/* App Iframe */}
                        <iframe
                          ref={iframeRef}
                          src={PREVIEW_APP_URL}
                          title="App Preview"
                          className="w-full h-full bg-white border-0"
                          onLoad={() => setSyncTrigger(prev => prev + 1)} // Force sync on load
                        />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Content */}
          <div className={`order-2 lg:order-1 ${showPreview ? '' : 'col-span-1'}`}>
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className={`grid w-full gap-2 mb-8 h-auto p-2 ${showPreview
                ? 'grid-cols-1 xl:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-3'
                }`}>
                <TabsTrigger value="branding" className="text-sm md:text-base">
                  Branding & Erscheinungsbild
                </TabsTrigger>
                <TabsTrigger value="services" className="text-sm md:text-base">
                  Leistungen & Preise
                </TabsTrigger>
                <TabsTrigger value="levels" className="text-sm md:text-base">
                  Level-System
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Branding */}
              <TabsContent value="branding" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Basis-Daten */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basis-Daten</CardTitle>
                      <CardDescription>
                        Grundlegende Informationen über deine Hundeschule
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="schoolName">Name der Hundeschule</Label>
                        <Input
                          id="schoolName"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          placeholder="z.B. Hundeschule Mayer"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subdomain">Subdomain</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            id="subdomain"
                            value={subdomain}
                            disabled
                            className="bg-muted text-muted-foreground"
                          />
                          <span className="text-muted-foreground whitespace-nowrap">
                            .pfotencard.de
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          (Subdomain ist fest und kann nicht geändert werden)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Design */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Design</CardTitle>
                      <CardDescription>
                        Passe das Aussehen der App an deine Marke an
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Logo Upload */}
                      <div>
                        <Label>Logo</Label>
                        <input
                          type="file"
                          id="logo-upload-input"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                        />
                        <div
                          onClick={handleLogoUpload}
                          className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${hasLogo
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary hover:bg-muted'
                            }`}
                        >
                          {previewLogo || hasLogo ? (
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-24 h-24 bg-primary/20 rounded-lg flex items-center justify-center overflow-hidden">
                                <img
                                  src={previewLogo || "/paw.png"}
                                  alt="Logo Preview"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <p className="text-sm text-foreground font-medium">
                                Logo hochgeladen
                              </p>
                              <Button variant="outline" size="sm">
                                Ändern
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <Upload size={48} className="text-muted-foreground" />
                              <div>
                                <p className="text-sm text-foreground font-medium">
                                  Logo hochladen
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PNG, JPG oder SVG (max. 2MB)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Primary Color Picker */}
                      <div>
                        <Label>Primärfarbe</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Wähle die Hauptfarbe für Buttons und wichtige Elemente
                        </p>
                        <div className="flex gap-3 mb-3">
                          {colorPresets.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => {
                                setPrimaryColor(color.value);
                                setCustomPrimaryColor('');
                              }}
                              className={`w-12 h-12 rounded-lg transition-all ${primaryColor === color.value && !customPrimaryColor
                                ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                                : 'hover:scale-105'
                                }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                          <div className="relative">
                            <input
                              type="color"
                              value={customPrimaryColor || primaryColor}
                              onChange={(e) => {
                                setCustomPrimaryColor(e.target.value);
                                setPrimaryColor(e.target.value);
                              }}
                              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                              title="Eigene Farbe wählen"
                            />
                            <Palette
                              size={16}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded border border-border flex-shrink-0"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <div className="flex-1">
                            <span className="text-sm text-muted-foreground">
                              Ausgewählte Primärfarbe: <strong className="text-foreground">{primaryColor}</strong>
                            </span>
                            {customPrimaryColor && (
                              <p className="text-xs text-muted-foreground mt-1">
                                (Eigene Farbe)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Secondary Color Picker */}
                      <div>
                        <Label>Sekundärfarbe</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Wähle die Akzentfarbe für Hover-Effekte und sekundäre Elemente
                        </p>
                        <div className="flex gap-3 mb-3">
                          {colorPresets.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => {
                                setSecondaryColor(color.value);
                                setCustomSecondaryColor('');
                              }}
                              className={`w-12 h-12 rounded-lg transition-all ${secondaryColor === color.value && !customSecondaryColor
                                ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                                : 'hover:scale-105'
                                }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                          <div className="relative">
                            <input
                              type="color"
                              value={customSecondaryColor || secondaryColor}
                              onChange={(e) => {
                                setCustomSecondaryColor(e.target.value);
                                setSecondaryColor(e.target.value);
                              }}
                              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                              title="Eigene Farbe wählen"
                            />
                            <Palette
                              size={16}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded border border-border flex-shrink-0"
                            style={{ backgroundColor: secondaryColor }}
                          />
                          <div className="flex-1">
                            <span className="text-sm text-muted-foreground">
                              Ausgewählte Sekundärfarbe: <strong className="text-foreground">{secondaryColor}</strong>
                            </span>
                            {customSecondaryColor && (
                              <p className="text-xs text-muted-foreground mt-1">
                                (Eigene Farbe)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Color Preview */}
                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border border-border">
                        <Label className="mb-4 block">Farbvorschau</Label>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <Button
                              style={{
                                backgroundColor: primaryColor,
                                color: 'white'
                              }}
                              className="flex-1"
                            >
                              Primär-Button
                            </Button>
                            <Button
                              style={{
                                backgroundColor: secondaryColor,
                                color: 'white'
                              }}
                              className="flex-1"
                            >
                              Sekundär-Button
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            So werden deine Buttons in der App aussehen
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Wording */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Wording (Begriffe)</CardTitle>
                      <CardDescription>
                        Passe die Begriffe der App an deine Schule an
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="levelTerm">Begriff für "Level"</Label>
                        <Input
                          id="levelTerm"
                          value={levelTerm}
                          onChange={(e) => setLevelTerm(e.target.value)}
                          placeholder="z.B. Klasse, Modul, Baustein"
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Standard: Level
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="vipTerm">Begriff für "VIP"</Label>
                        <Input
                          id="vipTerm"
                          value={vipTerm}
                          onChange={(e) => setVipTerm(e.target.value)}
                          placeholder="z.B. Rudel-Chef, Premium-Pfote"
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Standard: VIP
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Tab 2: Services */}
              <TabsContent value="services">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Leistungen & Preise</CardTitle>
                          <CardDescription>
                            Definiere die Leistungen, die du anbietest
                          </CardDescription>
                        </div>
                        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => {
                                setEditingService(null);
                                setServiceForm({ name: '', category: 'training', price: 0 });
                              }}
                            >
                              <Plus size={20} strokeWidth={1.5} className="mr-2" />
                              Neue Leistung
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {editingService ? 'Leistung bearbeiten' : 'Neue Leistung'}
                              </DialogTitle>
                              <DialogDescription>
                                Füge eine neue Leistung hinzu oder bearbeite eine bestehende
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="serviceName">Name</Label>
                                <Input
                                  id="serviceName"
                                  value={serviceForm.name}
                                  onChange={(e) =>
                                    setServiceForm({ ...serviceForm, name: e.target.value })
                                  }
                                  placeholder="z.B. Gruppenstunde"
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label htmlFor="serviceCategory">Kategorie</Label>
                                <Select
                                  value={serviceForm.category}
                                  onValueChange={(value: any) =>
                                    setServiceForm({ ...serviceForm, category: value })
                                  }
                                >
                                  <SelectTrigger className="mt-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="training">Training</SelectItem>
                                    <SelectItem value="workshop">Workshop</SelectItem>
                                    <SelectItem value="lecture">Vortrag</SelectItem>
                                    <SelectItem value="exam">Prüfung</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="servicePrice">Preis (€)</Label>
                                <Input
                                  id="servicePrice"
                                  type="number"
                                  value={serviceForm.price}
                                  onChange={(e) =>
                                    setServiceForm({
                                      ...serviceForm,
                                      price: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  placeholder="15.00"
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsServiceDialogOpen(false)}
                              >
                                Abbrechen
                              </Button>
                              <Button onClick={handleAddService}>
                                {editingService ? 'Speichern' : 'Hinzufügen'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Kategorie</TableHead>
                            <TableHead>Preis</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {services.map((service, index) => (
                            <TableRow key={service.id || index}>
                              <TableCell className="font-medium">{service.name}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                  {getCategoryLabel(service.category)}
                                </span>
                              </TableCell>
                              <TableCell>{service.price.toFixed(2)} €</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditService(service)}
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteService(index)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Tab 3: Levels */}
              <TabsContent value="levels">
                <input
                  type="file"
                  id="level-badge-upload-input"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLevelBadgeFileChange}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Level-System</CardTitle>
                      <CardDescription>
                        Definiere die Aufstiegsleiter für deine Kunden
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {levels.map((level, index) => (
                          <div key={level.id || index} className="relative">
                            {/* Connector Line */}
                            {index < levels.length - 1 && (
                              <div className="absolute left-6 top-full h-6 w-0.5 bg-border" />
                            )}

                            <Card className="border-2">
                              <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <Label className="text-sm text-muted-foreground mb-2 block">
                                        {levelTerm}-Name
                                      </Label>
                                      <Input
                                        value={level.name}
                                        onChange={(e) =>
                                          handleUpdateLevelName(index, e.target.value)
                                        }
                                        placeholder={`${levelTerm} ${index + 1}`}
                                        className="text-lg font-semibold"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLevel(index)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {/* Badge Upload */}
                                  <div>
                                    <Label className="text-sm mb-2 block">
                                      {levelTerm}-Abzeichen
                                    </Label>
                                    <div
                                      onClick={() => handleUploadBadge(index)}
                                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${level.badgeImage
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary hover:bg-muted'
                                        }`}
                                    >
                                      {level.badgeImage ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <Award size={24} className="text-primary" />
                                          <span className="text-sm font-medium">Abzeichen hochgeladen</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center gap-2">
                                          <Upload size={20} className="text-muted-foreground" />
                                          <span className="text-sm text-muted-foreground">
                                            Abzeichen hochladen
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Requirements */}
                                  <div>
                                    <Label className="text-sm font-medium mb-3 block">
                                      Anforderungen
                                    </Label>
                                    {level.requirements.length === 0 ? (
                                      <p className="text-sm text-muted-foreground italic">
                                        Noch keine Anforderungen definiert
                                      </p>
                                    ) : (
                                      <div className="space-y-2">
                                        {level.requirements.map((req, reqIdx) => (
                                          <div
                                            key={req.id || reqIdx}
                                            className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                                          >
                                            <GripVertical
                                              size={16}
                                              className="text-muted-foreground"
                                            />
                                            <Input
                                              type="number"
                                              min="1"
                                              value={req.required_count}
                                              onChange={(e) =>
                                                handleUpdateRequirement(
                                                  index,
                                                  reqIdx,
                                                  parseInt(e.target.value) || 1
                                                )
                                              }
                                              className="w-16 h-8 text-center"
                                            />
                                            <span className="text-sm flex-1">
                                              x {getServiceName(req.training_type_id)}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteRequirement(index, reqIdx)
                                              }
                                            >
                                              <Trash2 size={14} />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <Dialog
                                    open={
                                      isRequirementDialogOpen && currentLevelIndex === index
                                    }
                                    onOpenChange={(open) => {
                                      setIsRequirementDialogOpen(open);
                                      if (open) setCurrentLevelIndex(index);
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                          setCurrentLevelIndex(index);
                                          setRequirementForm({ serviceId: '', quantity: 1 });
                                        }}
                                      >
                                        <Plus size={16} className="mr-2" />
                                        Anforderung hinzufügen
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Neue Anforderung</DialogTitle>
                                        <DialogDescription>
                                          Füge eine Anforderung für {level.name} hinzu
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div>
                                          <Label htmlFor="quantity">Anzahl</Label>
                                          <Input
                                            id="quantity"
                                            type="number"
                                            min="1"
                                            value={requirementForm.quantity}
                                            onChange={(e) =>
                                              setRequirementForm({
                                                ...requirementForm,
                                                quantity: parseInt(e.target.value) || 1,
                                              })
                                            }
                                            className="mt-2"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="service">Leistung</Label>
                                          <Select
                                            value={requirementForm.serviceId}
                                            onValueChange={(value) =>
                                              setRequirementForm({
                                                ...requirementForm,
                                                serviceId: value,
                                              })
                                            }
                                          >
                                            <SelectTrigger className="mt-2">
                                              <SelectValue placeholder="Leistung auswählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {services
                                                .filter(s => s.id !== undefined) // Nur gespeicherte Services können verknüpft werden
                                                .map((service) => (
                                                  <SelectItem
                                                    key={service.id}
                                                    value={String(service.id)}
                                                  >
                                                    {service.name} ({service.price.toFixed(2)} €)
                                                  </SelectItem>
                                                ))}
                                            </SelectContent>
                                          </Select>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Hinweis: Nur bereits gespeicherte Leistungen können ausgewählt werden.
                                          </p>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() => setIsRequirementDialogOpen(false)}
                                        >
                                          Abbrechen
                                        </Button>
                                        <Button
                                          onClick={handleAddRequirement}
                                          disabled={!requirementForm.serviceId}
                                        >
                                          Hinzufügen
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full border-2 border-dashed"
                          onClick={handleAddLevel}
                        >
                          <Plus size={20} className="mr-2" />
                          Neues {levelTerm} hinzufügen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}