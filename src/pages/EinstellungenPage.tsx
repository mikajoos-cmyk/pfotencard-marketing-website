import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL, fetchAppConfig, saveSettings, uploadImage } from '@/lib/api';
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
  id?: number;
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

// Preview URL
// Preview URL - Nutzt die Env-Variable oder Fallback auf deine echte App-URL
const PREVIEW_APP_URL = import.meta.env.VITE_PREVIEW_APP_URL || 'https://preview.pfotencard.de/?mode=preview';

const colorPresets = [
  { name: 'Grün', value: '#22C55E' },
  { name: 'Blau', value: '#3B82F6' },
  { name: 'Lila', value: '#A855F7' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Rot', value: '#EF4444' },
];

const toRelativeUrl = (url: string | undefined) => {
  if (!url) return undefined;
  // Entfernt die API_BASE_URL, falls sie im String enthalten ist
  return url.replace(API_BASE_URL, '');
};

export function EinstellungenPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const [hasLogo, setHasLogo] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const [previewViewMode, setPreviewViewMode] = useState<'app' | 'login'>('app');
  const [previewRole, setPreviewRole] = useState<'customer' | 'admin'>('customer');
  const [syncTrigger, setSyncTrigger] = useState(0);

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
        required: r.required_count
      }))
    }));

    const configPayload = {
      primary_color: customPrimaryColor || primaryColor,
      secondary_color: customSecondaryColor || secondaryColor,
      school_name: schoolName,
      logo: previewLogo || (hasLogo ? '/paw.png' : undefined), // App.tsx erwartet "logo"
      levels: mappedLevels,
      services: services,
      view_mode: previewViewMode,
      role: previewRole
    };

    const message = {
      type: 'UPDATE_CONFIG',
      payload: configPayload
    };

    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(message, '*');
    }, 100);

    return () => clearTimeout(timer);
  }, [showPreview, primaryColor, secondaryColor, customPrimaryColor, customSecondaryColor, schoolName, syncTrigger, levels, services, hasLogo, previewLogo, previewViewMode, previewRole]);

  // Funktion für "In neuem Tab öffnen"
  const getPreviewUrl = () => {
    const mappedLevels = levels.map((l, index) => ({
      ...l,
      id: index + 1,
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
      logo: previewLogo || (hasLogo ? '/paw.png' : undefined),
      levels: mappedLevels,
      services: services,
      view_mode: previewViewMode,
      role: previewRole
    };

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
    return `${PREVIEW_APP_URL}#config=${encoded}`;
  };

  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', category: 'training', price: 0 });

  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false);
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
        setSubdomain(t.subdomain);

        const branding = t.config?.branding || {};
        const wording = t.config?.wording || {};

        setPrimaryColor(branding.primary_color || '#22C55E');
        setSecondaryColor(branding.secondary_color || '#3B82F6');
        setLevelTerm(wording.level || 'Level');
        setVipTerm(wording.vip || 'VIP');

        if (branding.logo_url) {
          // Wenn es eine absolute URL ist (z.B. extern), lass sie so.
          // Wenn es relativ ist (startet mit /), hänge die API URL davor.
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
          price: tt.default_price
        }));
        setServices(mappedServices);

        const mappedLevels = config.levels.map((l: any) => ({
          id: l.id,
          name: l.name,
          rank_order: l.rank_order,
          // In useEffect -> loadData -> mappedLevels:
badgeImage: l.icon_url ? (l.icon_url.startsWith('http') ? l.icon_url : `${API_BASE_URL}${l.icon_url}`) : undefined,
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

  // --- DATEN SPEICHERN ---
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Levels normalisieren (1,2,3...)
      const normalizedLevels = levels.map((l, index) => ({
        ...l,
        rank_order: index + 1,
        badge_image: l.badgeImage,
      }));

      const payload = {
        school_name: schoolName,
        subdomain: subdomain,
        primary_color: customPrimaryColor || primaryColor,
        secondary_color: customSecondaryColor || secondaryColor,
        logo_url: previewLogo, // Das gespeicherte Logo verwenden
        level_term: levelTerm,
        vip_term: vipTerm,
        services: services,
        levels: normalizedLevels
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
        // Volle URL für Preview bauen
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        setPreviewLogo(fullUrl);
        setHasLogo(true);
      } catch (err) {
        console.error("Upload failed", err);
        // Fehler wird schon in api.ts geworfen/behandelt, aber Toast hier schadet nicht
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
      setServices([...services, { ...serviceForm, id: -Date.now() }]); // Temp ID
    }
    setIsServiceDialogOpen(false);
    setEditingService(null);
    setServiceForm({ name: '', category: 'training', price: 0 });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({ name: service.name, category: service.category, price: service.price });
    setIsServiceDialogOpen(true);
  };

  const handleDeleteService = (index: number) => {
    if (confirm('Möchten Sie diese Leistung wirklich löschen?')) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  // --- LEVEL LOGIC ---
  const handleAddLevel = () => {
    // Richtige Nummerierung: Max Rank + 1
    const maxRank = levels.length > 0 ? Math.max(...levels.map(l => l.rank_order || 0)) : 0;
    const nextRank = maxRank + 1;

    const newLevel: Level = {
      name: `${levelTerm} ${nextRank}`,
      rank_order: nextRank,
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

  // --- REQUIREMENTS LOGIC ---
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-sans font-bold text-foreground mb-2">Einstellungen</h1>
            <p className="text-lg text-muted-foreground font-body">Konfiguriere deine Hundeschule.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2">
              <Label htmlFor="preview-toggle" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                {showPreview ? <><Eye size={18} className="text-primary" /><span>Vorschau</span></> : <><EyeOff size={18} className="text-muted-foreground" /><span>Vorschau</span></>}
              </Label>
              <Switch id="preview-toggle" checked={showPreview} onCheckedChange={setShowPreview} />
            </div>
            <Button size="lg" onClick={handleSaveSettings} disabled={saving} className="bg-primary text-primary-foreground hover:bg-secondary font-normal">
              {saving ? <Loader2 className="mr-2 animate-spin" /> : <Save size={20} className="mr-2" />} Speichern
            </Button>
          </div>
        </div>

        <div className={`grid gap-8 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          <AnimatePresence>
            {showPreview && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="lg:sticky lg:top-24 lg:self-start order-1 lg:order-2">
                <Card className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2"><Smartphone size={20} /> Live-Vorschau</CardTitle>
                        <CardDescription>Die App wird live im IFrame geladen</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(getPreviewUrl(), '_blank')} title="In neuem Tab öffnen"><ExternalLink size={16} /></Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
                        <Button variant={previewViewMode === 'app' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setPreviewViewMode('app')}>App</Button>
                        <Button variant={previewViewMode === 'login' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setPreviewViewMode('login')}>Login</Button>
                      </div>
                      <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
                        <Button variant={previewRole === 'customer' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setPreviewRole('customer')}>Kunde</Button>
                        <Button variant={previewRole === 'admin' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-xs" onClick={() => setPreviewRole('admin')}>Admin</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center">
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-[380px] mx-auto aspect-[9/19] bg-gray-900 rounded-[3rem] shadow-2xl border-[8px] border-gray-800 overflow-hidden">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
                        <iframe ref={iframeRef} src={PREVIEW_APP_URL} title="App Preview" className="w-full h-full bg-white border-0" onLoad={() => setSyncTrigger(prev => prev + 1)} />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`order-2 lg:order-1 ${showPreview ? '' : 'col-span-1'}`}>
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className={`grid w-full gap-2 mb-8 h-auto p-2 ${showPreview ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="services">Leistungen</TabsTrigger>
                <TabsTrigger value="levels">Level-System</TabsTrigger>
              </TabsList>

              <TabsContent value="branding" className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Card>
                    <CardHeader><CardTitle>Basis-Daten</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Name der Hundeschule</Label><Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="mt-2" /></div>
                      <div><Label>Subdomain</Label><div className="flex items-center gap-2 mt-2"><Input value={subdomain} disabled className="bg-muted text-muted-foreground" /><span className="text-muted-foreground text-sm">.pfotencard.de</span></div></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Design</CardTitle></CardHeader>
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
                        <Label>Primärfarbe</Label>
                        <div className="flex gap-3 mb-3 mt-2">{colorPresets.map(c => <button key={c.value} onClick={() => { setPrimaryColor(c.value); setCustomPrimaryColor(''); }} className="w-12 h-12 rounded-lg" style={{ backgroundColor: c.value }} />)}<div className="relative"><input type="color" value={customPrimaryColor || primaryColor} onChange={e => { setCustomPrimaryColor(e.target.value); setPrimaryColor(e.target.value); }} className="w-12 h-12 rounded-lg cursor-pointer border-2" /><Palette size={16} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" /></div></div>
                      </div>
                      <div>
                        <Label>Sekundärfarbe</Label>
                        <div className="flex gap-3 mb-3 mt-2">{colorPresets.map(c => <button key={c.value} onClick={() => { setSecondaryColor(c.value); setCustomSecondaryColor(''); }} className="w-12 h-12 rounded-lg" style={{ backgroundColor: c.value }} />)}<div className="relative"><input type="color" value={customSecondaryColor || secondaryColor} onChange={e => { setCustomSecondaryColor(e.target.value); setSecondaryColor(e.target.value); }} className="w-12 h-12 rounded-lg cursor-pointer border-2" /><Palette size={16} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" /></div></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Wording</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Begriff für "Level"</Label><Input value={levelTerm} onChange={(e) => setLevelTerm(e.target.value)} placeholder="z.B. Klasse" className="mt-2" /></div>
                      <div><Label>Begriff für "VIP"</Label><Input value={vipTerm} onChange={(e) => setVipTerm(e.target.value)} placeholder="z.B. Profi" className="mt-2" /></div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="services">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center"><CardTitle>Leistungen & Preise</CardTitle>
                        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                          <DialogTrigger asChild><Button onClick={() => { setEditingService(null); setServiceForm({ name: '', category: 'training', price: 0 }); }}><Plus size={20} className="mr-2" />Neue Leistung</Button></DialogTrigger>
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
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Kategorie</TableHead><TableHead>Preis</TableHead><TableHead className="text-right">Aktionen</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {services.map((service, index) => (
                            <TableRow key={service.id || index}>
                              <TableCell className="font-medium">{service.name}</TableCell>
                              <TableCell><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{getCategoryLabel(service.category)}</span></TableCell>
                              <TableCell>{service.price.toFixed(2)} €</TableCell>
                              <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => handleEditService(service)}><Pencil size={16} /></Button><Button variant="ghost" size="sm" onClick={() => handleDeleteService(index)}><Trash2 size={16} /></Button></div></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="levels">
                <input type="file" id="level-badge-upload-input" className="hidden" accept="image/*" onChange={handleLevelBadgeFileChange} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
                  <Card>
                    <CardHeader><CardTitle>Level-System</CardTitle><CardDescription>Definiere die Aufstiegsleiter</CardDescription></CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {levels.map((level, index) => (
                          <div key={level.id || index} className="relative">
                            {index < levels.length - 1 && <div className="absolute left-6 top-full h-6 w-0.5 bg-border" />}
                            <Card className="border-2">
                              <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">{index + 1}</div>
                                    <div className="flex-1"><Label className="text-sm text-muted-foreground mb-2 block">{levelTerm}-Name</Label><Input value={level.name} onChange={(e) => handleUpdateLevelName(index, e.target.value)} className="text-lg font-semibold" /></div>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteLevel(index)} className="text-destructive hover:text-destructive"><Trash2 size={16} /></Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm mb-2 block">{levelTerm}-Abzeichen</Label>
                                    <div onClick={() => handleUploadBadge(index)} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${level.badgeImage ? 'border-primary bg-primary/5' : 'border-border hover:border-primary hover:bg-muted'}`}>
                                      {level.badgeImage ? <div className="flex items-center justify-center gap-2"><Award size={24} className="text-primary" /><span className="text-sm font-medium">Abzeichen hochgeladen</span></div> : <div className="flex items-center justify-center gap-2"><Upload size={20} className="text-muted-foreground" /><span className="text-sm text-muted-foreground">Abzeichen hochladen</span></div>}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium mb-3 block">Anforderungen</Label>
                                    {level.requirements.length === 0 ? <p className="text-sm text-muted-foreground italic">Noch keine Anforderungen definiert</p> : (
                                      <div className="space-y-2">{level.requirements.map((req, reqIdx) => (
                                        <div key={req.id || reqIdx} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                          <GripVertical size={16} className="text-muted-foreground" />
                                          <Input type="number" min="1" value={req.required_count} onChange={(e) => handleUpdateRequirement(index, reqIdx, parseInt(e.target.value) || 1)} className="w-16 h-8 text-center" />
                                          <span className="text-sm flex-1">x {getServiceName(req.training_type_id)}</span>
                                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRequirement(index, reqIdx)}><Trash2 size={14} /></Button>
                                        </div>
                                      ))}</div>
                                    )}
                                  </div>
                                  <Dialog open={isRequirementDialogOpen && currentLevelIndex === index} onOpenChange={(open) => { setIsRequirementDialogOpen(open); if (open) setCurrentLevelIndex(index); }}>
                                    <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full" onClick={() => { setCurrentLevelIndex(index); setRequirementForm({ serviceId: '', quantity: 1 }); }}><Plus size={16} className="mr-2" />Anforderung hinzufügen</Button></DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader><DialogTitle>Neue Anforderung</DialogTitle></DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div><Label>Anzahl</Label><Input type="number" min="1" value={requirementForm.quantity} onChange={(e) => setRequirementForm({ ...requirementForm, quantity: parseInt(e.target.value) || 1 })} className="mt-2" /></div>
                                        <div><Label>Leistung</Label><Select value={requirementForm.serviceId} onValueChange={(v) => setRequirementForm({ ...requirementForm, serviceId: v })}><SelectTrigger className="mt-2"><SelectValue placeholder="Leistung auswählen" /></SelectTrigger><SelectContent>{services.filter(s => s.id !== undefined).map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.price.toFixed(2)} €)</SelectItem>)}</SelectContent></Select></div>
                                      </div>
                                      <DialogFooter><Button variant="outline" onClick={() => setIsRequirementDialogOpen(false)}>Abbrechen</Button><Button onClick={handleAddRequirement} disabled={!requirementForm.serviceId}>Hinzufügen</Button></DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                        <Button variant="outline" size="lg" className="w-full border-2 border-dashed" onClick={handleAddLevel}><Plus size={20} className="mr-2" />Neues {levelTerm} hinzufügen</Button>
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