import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Upload, 
  Palette, 
  Plus, 
  Pencil, 
  Trash2,
  GripVertical,
  CheckCircle2,
  Eye,
  EyeOff,
  Smartphone,
  ExternalLink,
  User,
  Home,
  List,
  Award,
  Lock
} from 'lucide-react';
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

// Types
interface Service {
  id: string;
  name: string;
  category: 'training' | 'workshop' | 'lecture' | 'exam';
  price: number;
}

interface LevelRequirement {
  id: string;
  serviceId: string;
  quantity: number;
}

interface Level {
  id: string;
  name: string;
  badgeImage: string | null;
  requirements: LevelRequirement[];
}

type PreviewScreen = 'login' | 'dashboard' | 'services' | 'profile';

// Mock Data
const initialServices: Service[] = [
  { id: '1', name: 'Gruppenstunde', category: 'training', price: 15 },
  { id: '2', name: 'Einzeltraining', category: 'training', price: 45 },
  { id: '3', name: 'Welpenspielstunde', category: 'training', price: 12 },
  { id: '4', name: 'Agility-Kurs', category: 'workshop', price: 120 },
  { id: '5', name: 'Erste-Hilfe-Seminar', category: 'lecture', price: 80 },
];

const initialLevels: Level[] = [
  {
    id: '1',
    name: 'Welpe',
    badgeImage: null,
    requirements: [
      { id: 'r1', serviceId: '1', quantity: 6 },
      { id: 'r2', serviceId: '3', quantity: 4 },
    ],
  },
  {
    id: '2',
    name: 'Grundlagen',
    badgeImage: null,
    requirements: [
      { id: 'r3', serviceId: '1', quantity: 10 },
      { id: 'r4', serviceId: '2', quantity: 2 },
    ],
  },
  {
    id: '3',
    name: 'Fortgeschritten',
    badgeImage: null,
    requirements: [
      { id: 'r5', serviceId: '1', quantity: 15 },
      { id: 'r6', serviceId: '4', quantity: 1 },
    ],
  },
];

const colorPresets = [
  { name: 'Grün', value: '#22C55E' },
  { name: 'Blau', value: '#3B82F6' },
  { name: 'Lila', value: '#A855F7' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Rot', value: '#EF4444' },
];

export function EinstellungenPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State Management
  const [schoolName, setSchoolName] = useState('Meine Hundeschule');
  const [subdomain, setSubdomain] = useState('meine-hundeschule');
  const [primaryColor, setPrimaryColor] = useState(colorPresets[0].value);
  const [secondaryColor, setSecondaryColor] = useState(colorPresets[1].value);
  const [customPrimaryColor, setCustomPrimaryColor] = useState('');
  const [customSecondaryColor, setCustomSecondaryColor] = useState('');
  const [levelTerm, setLevelTerm] = useState('Level');
  const [vipTerm, setVipTerm] = useState('VIP');
  const [services, setServices] = useState<Service[]>(initialServices);
  const [levels, setLevels] = useState<Level[]>(initialLevels);
  const [hasLogo, setHasLogo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentView, setCurrentView] = useState<PreviewScreen>('dashboard');

  // Service Dialog State
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'training' as Service['category'],
    price: 0,
  });

  // Level Requirement Dialog State
  const [isRequirementDialogOpen, setIsRequirementDialogOpen] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState<string>('');
  const [requirementForm, setRequirementForm] = useState({
    serviceId: '',
    quantity: 1,
  });

  // Handlers
  const handleSaveSettings = () => {
    console.log('Saving settings...', {
      schoolName,
      subdomain,
      primaryColor,
      secondaryColor,
      levelTerm,
      vipTerm,
      services,
      levels,
    });
    alert('Einstellungen gespeichert!');
  };

  const handleLogoUpload = () => {
    setHasLogo(true);
  };

  const handleAddService = () => {
    if (editingService) {
      setServices(
        services.map((s) =>
          s.id === editingService.id ? { ...editingService, ...serviceForm } : s
        )
      );
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        ...serviceForm,
      };
      setServices([...services, newService]);
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

  const handleDeleteService = (id: string) => {
    if (confirm('Möchten Sie diese Leistung wirklich löschen?')) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  const handleAddLevel = () => {
    const newLevel: Level = {
      id: Date.now().toString(),
      name: `${levelTerm} ${levels.length + 1}`,
      badgeImage: null,
      requirements: [],
    };
    setLevels([...levels, newLevel]);
  };

  const handleUpdateLevelName = (levelId: string, name: string) => {
    setLevels(levels.map((l) => (l.id === levelId ? { ...l, name } : l)));
  };

  const handleUploadBadge = (levelId: string) => {
    setLevels(
      levels.map((l) => (l.id === levelId ? { ...l, badgeImage: 'uploaded' } : l))
    );
  };

  const handleDeleteLevel = (levelId: string) => {
    if (confirm('Möchten Sie dieses Level wirklich löschen?')) {
      setLevels(levels.filter((l) => l.id !== levelId));
    }
  };

  const handleAddRequirement = () => {
    const newRequirement: LevelRequirement = {
      id: Date.now().toString(),
      serviceId: requirementForm.serviceId,
      quantity: requirementForm.quantity,
    };

    setLevels(
      levels.map((l) =>
        l.id === currentLevelId
          ? { ...l, requirements: [...l.requirements, newRequirement] }
          : l
      )
    );

    setIsRequirementDialogOpen(false);
    setRequirementForm({ serviceId: '', quantity: 1 });
  };

  const handleUpdateRequirement = (
    levelId: string,
    requirementId: string,
    quantity: number
  ) => {
    setLevels(
      levels.map((l) =>
        l.id === levelId
          ? {
              ...l,
              requirements: l.requirements.map((r) =>
                r.id === requirementId ? { ...r, quantity } : r
              ),
            }
          : l
      )
    );
  };

  const handleDeleteRequirement = (levelId: string, requirementId: string) => {
    setLevels(
      levels.map((l) =>
        l.id === levelId
          ? { ...l, requirements: l.requirements.filter((r) => r.id !== requirementId) }
          : l
      )
    );
  };

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || 'Unbekannt';
  };

  const getCategoryLabel = (category: Service['category']) => {
    const labels = {
      training: 'Training',
      workshop: 'Workshop',
      lecture: 'Vortrag',
      exam: 'Prüfung',
    };
    return labels[category];
  };

  // Preview Screens
  const renderPreviewScreen = () => {
    switch (currentView) {
      case 'login':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-background">
            <div className="w-full max-w-sm space-y-6">
              {hasLogo ? (
                <div className="w-20 h-20 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-primary" />
                </div>
              ) : (
                <div className="w-20 h-20 mx-auto bg-muted rounded-2xl" />
              )}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {schoolName}
                </h2>
                <p className="text-sm text-muted-foreground">Willkommen zurück</p>
              </div>
              <div className="space-y-3">
                <Input placeholder="E-Mail" className="h-12" />
                <Input type="password" placeholder="Passwort" className="h-12" />
                <Button
                  className="w-full h-12 text-base"
                  style={{ backgroundColor: primaryColor, color: 'white' }}
                >
                  Anmelden
                </Button>
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="h-full bg-background overflow-y-auto">
            <div
              className="p-4 flex items-center justify-between border-b"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-3">
                {hasLogo ? (
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-white/20 rounded-lg" />
                )}
                <span className="text-lg font-bold text-white">{schoolName}</span>
              </div>
              <User size={24} className="text-white" />
            </div>

            <div className="p-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground mb-2">Willkommen zurück!</h3>
                  <p className="text-sm text-muted-foreground">
                    Dein aktuelles {levelTerm}: {levels[0]?.name || 'Welpe'}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold" style={{ color: primaryColor }}>
                      12
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Kurse besucht</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold" style={{ color: secondaryColor }}>
                      45€
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Guthaben</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{levelTerm}-Fortschritt</span>
                    <span className="text-xs text-muted-foreground">60%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: '60%', backgroundColor: primaryColor }}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  style={{ backgroundColor: primaryColor, color: 'white' }}
                >
                  Kurs buchen
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  style={{ 
                    borderColor: secondaryColor,
                    color: secondaryColor
                  }}
                >
                  Guthaben aufladen
                </Button>
              </div>

              {vipTerm && (
                <div 
                  className="rounded-lg p-2 text-center"
                  style={{ 
                    backgroundColor: `${primaryColor}15`,
                    borderColor: primaryColor,
                    borderWidth: '1px'
                  }}
                >
                  <span 
                    className="text-xs font-bold"
                    style={{ color: primaryColor }}
                  >
                    ⭐ {vipTerm}-Mitglied
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="h-full bg-background overflow-y-auto">
            <div
              className="p-4 flex items-center gap-3 border-b"
              style={{ backgroundColor: primaryColor }}
            >
              <List size={24} className="text-white" />
              <span className="text-lg font-bold text-white">Leistungen</span>
            </div>

            <div className="p-4 space-y-3">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{service.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryLabel(service.category)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: primaryColor }}>
                        {service.price.toFixed(2)}€
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-1"
                        style={{ 
                          borderColor: secondaryColor,
                          color: secondaryColor
                        }}
                      >
                        Buchen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="h-full bg-background overflow-y-auto">
            <div
              className="p-4 flex items-center gap-3 border-b"
              style={{ backgroundColor: primaryColor }}
            >
              <Award size={24} className="text-white" />
              <span className="text-lg font-bold text-white">Mein {levelTerm}</span>
            </div>

            <div className="p-4 space-y-4">
              {levels.map((level, index) => {
                const isCompleted = index === 0;
                const isCurrent = index === 1;
                const isLocked = index > 1;

                return (
                  <Card
                    key={level.id}
                    className={`${
                      isCurrent
                        ? 'border-2'
                        : isLocked
                        ? 'opacity-60'
                        : ''
                    }`}
                    style={isCurrent ? { borderColor: primaryColor } : {}}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {level.badgeImage ? (
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${primaryColor}20` }}
                            >
                              <Award size={32} style={{ color: primaryColor }} />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                              {isLocked ? (
                                <Lock size={24} className="text-muted-foreground" />
                              ) : (
                                <Award size={24} className="text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-foreground">{level.name}</h4>
                            {isCompleted && (
                              <CheckCircle2
                                size={20}
                                style={{ color: primaryColor }}
                              />
                            )}
                            {isCurrent && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${primaryColor}20`,
                                  color: primaryColor,
                                }}
                              >
                                Aktuell
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">
                              Anforderungen:
                            </p>
                            {level.requirements.map((req) => (
                              <div
                                key={req.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                {isCompleted ? (
                                  <CheckCircle2
                                    size={16}
                                    style={{ color: primaryColor }}
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                                )}
                                <span className="text-muted-foreground">
                                  {req.quantity}x {getServiceName(req.serviceId)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {isCurrent && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">
                                  Fortschritt
                                </span>
                                <span className="text-xs font-medium">4/10</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{
                                    width: '40%',
                                    backgroundColor: primaryColor,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
            >
              <Save size={20} strokeWidth={1.5} className="mr-2" />
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
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone size={20} strokeWidth={1.5} />
                      Live-Vorschau
                    </CardTitle>
                    <CardDescription>
                      So sieht deine App für Kunden aus
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {/* Preview Control Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground mb-2 block">
                            Ansicht simulieren
                          </Label>
                          <Select
                            value={currentView}
                            onValueChange={(value: PreviewScreen) => setCurrentView(value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="login">
                                <div className="flex items-center gap-2">
                                  <User size={16} />
                                  <span>Login Screen</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="dashboard">
                                <div className="flex items-center gap-2">
                                  <Home size={16} />
                                  <span>Dashboard</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="services">
                                <div className="flex items-center gap-2">
                                  <List size={16} />
                                  <span>Leistungs-Liste</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="profile">
                                <div className="flex items-center gap-2">
                                  <Award size={16} />
                                  <span>Profil / {levelTerm}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 mt-5">
                          <ExternalLink size={16} />
                          <span className="hidden sm:inline">Live-App</span>
                        </Button>
                      </div>
                    </div>

                    {/* Smartphone Frame */}
                    <div className="flex items-center justify-center">
                      <motion.div
                        key={currentView}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full max-w-[280px] mx-auto aspect-[9/19] bg-gray-900 rounded-[2.5rem] shadow-2xl border-[6px] border-gray-800 overflow-hidden"
                      >
                        {/* Phone Notch */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-gray-900 rounded-b-2xl z-10" />
                        
                        {/* App Content */}
                        <div className="h-full bg-background overflow-y-auto">
                          {renderPreviewScreen()}
                        </div>
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
              <TabsList className={`grid w-full gap-2 mb-8 h-auto p-2 ${
                showPreview 
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
                            onChange={(e) => setSubdomain(e.target.value)}
                            placeholder="meine-hundeschule"
                          />
                          <span className="text-muted-foreground whitespace-nowrap">
                            .pfotencard.de
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Deine Kunden erreichen die App unter: {subdomain}.pfotencard.de
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
                        <div
                          onClick={handleLogoUpload}
                          className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            hasLogo
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary hover:bg-muted'
                          }`}
                        >
                          {hasLogo ? (
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-24 h-24 bg-primary/20 rounded-lg flex items-center justify-center">
                                <CheckCircle2 size={48} className="text-primary" />
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
                              className={`w-12 h-12 rounded-lg transition-all ${
                                primaryColor === color.value && !customPrimaryColor
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
                              className={`w-12 h-12 rounded-lg transition-all ${
                                secondaryColor === color.value && !customSecondaryColor
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
                                  onValueChange={(value: Service['category']) =>
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
                          {services.map((service) => (
                            <TableRow key={service.id}>
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
                                    onClick={() => handleDeleteService(service.id)}
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
                          <div key={level.id} className="relative">
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
                                          handleUpdateLevelName(level.id, e.target.value)
                                        }
                                        placeholder={`${levelTerm} ${index + 1}`}
                                        className="text-lg font-semibold"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteLevel(level.id)}
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
                                      onClick={() => handleUploadBadge(level.id)}
                                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                        level.badgeImage
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
                                        {level.requirements.map((req) => (
                                          <div
                                            key={req.id}
                                            className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                                          >
                                            <GripVertical
                                              size={16}
                                              className="text-muted-foreground"
                                            />
                                            <Input
                                              type="number"
                                              min="1"
                                              value={req.quantity}
                                              onChange={(e) =>
                                                handleUpdateRequirement(
                                                  level.id,
                                                  req.id,
                                                  parseInt(e.target.value) || 1
                                                )
                                              }
                                              className="w-16 h-8 text-center"
                                            />
                                            <span className="text-sm flex-1">
                                              x {getServiceName(req.serviceId)}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleDeleteRequirement(level.id, req.id)
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
                                      isRequirementDialogOpen && currentLevelId === level.id
                                    }
                                    onOpenChange={(open) => {
                                      setIsRequirementDialogOpen(open);
                                      if (open) setCurrentLevelId(level.id);
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                          setCurrentLevelId(level.id);
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
                                              {services.map((service) => (
                                                <SelectItem
                                                  key={service.id}
                                                  value={service.id}
                                                >
                                                  {service.name} ({service.price.toFixed(2)} €)
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
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
