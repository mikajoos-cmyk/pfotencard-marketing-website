import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Save, 
  Upload, 
  Plus, 
  Pencil, 
  Trash2,
  ExternalLink,
  Smartphone,
  CheckCircle2,
  User,
  Home,
  List,
  Award,
  ChevronRight,
  Star,
  Lock
} from 'lucide-react';

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

interface Config {
  schoolName: string;
  subdomain: string;
  primaryColor: string;
  levelTerm: string;
  services: Service[];
  levels: Level[];
}

// Mock Data
const initialConfig: Config = {
  schoolName: 'Meine Hundeschule',
  subdomain: 'meine-hundeschule',
  primaryColor: '#22C55E',
  levelTerm: 'Level',
  services: [
    { id: '1', name: 'Gruppenstunde', category: 'training', price: 15 },
    { id: '2', name: 'Einzeltraining', category: 'training', price: 45 },
    { id: '3', name: 'Welpenspielstunde', category: 'training', price: 12 },
    { id: '4', name: 'Agility-Kurs', category: 'workshop', price: 120 },
  ],
  levels: [
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
  ],
};

type PreviewScreen = 'login' | 'dashboard' | 'services' | 'profile';

export function KonfigurationPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [config, setConfig] = useState<Config>(initialConfig);
  const [currentView, setCurrentView] = useState<PreviewScreen>('dashboard');
  const [hasLogo, setHasLogo] = useState(false);

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
    console.log('Saving settings...', config);
    alert('Einstellungen gespeichert!');
  };

  const updateConfig = (updates: Partial<Config>) => {
    setConfig({ ...config, ...updates });
  };

  const handleLogoUpload = () => {
    setHasLogo(true);
  };

  const handleAddService = () => {
    if (editingService) {
      updateConfig({
        services: config.services.map((s) =>
          s.id === editingService.id ? { ...editingService, ...serviceForm } : s
        ),
      });
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        ...serviceForm,
      };
      updateConfig({ services: [...config.services, newService] });
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
      updateConfig({ services: config.services.filter((s) => s.id !== id) });
    }
  };

  const handleAddLevel = () => {
    const newLevel: Level = {
      id: Date.now().toString(),
      name: `${config.levelTerm} ${config.levels.length + 1}`,
      badgeImage: null,
      requirements: [],
    };
    updateConfig({ levels: [...config.levels, newLevel] });
  };

  const handleUpdateLevel = (levelId: string, updates: Partial<Level>) => {
    updateConfig({
      levels: config.levels.map((l) => (l.id === levelId ? { ...l, ...updates } : l)),
    });
  };

  const handleDeleteLevel = (levelId: string) => {
    if (confirm('Möchten Sie dieses Level wirklich löschen?')) {
      updateConfig({ levels: config.levels.filter((l) => l.id !== levelId) });
    }
  };

  const handleUploadBadge = (levelId: string) => {
    // Mock upload - in real app would handle file upload
    handleUpdateLevel(levelId, { badgeImage: 'uploaded' });
  };

  const handleAddRequirement = () => {
    const newRequirement: LevelRequirement = {
      id: Date.now().toString(),
      serviceId: requirementForm.serviceId,
      quantity: requirementForm.quantity,
    };

    updateConfig({
      levels: config.levels.map((l) =>
        l.id === currentLevelId
          ? { ...l, requirements: [...l.requirements, newRequirement] }
          : l
      ),
    });

    setIsRequirementDialogOpen(false);
    setRequirementForm({ serviceId: '', quantity: 1 });
  };

  const handleUpdateRequirement = (
    levelId: string,
    requirementId: string,
    quantity: number
  ) => {
    updateConfig({
      levels: config.levels.map((l) =>
        l.id === levelId
          ? {
              ...l,
              requirements: l.requirements.map((r) =>
                r.id === requirementId ? { ...r, quantity } : r
              ),
            }
          : l
      ),
    });
  };

  const handleDeleteRequirement = (levelId: string, requirementId: string) => {
    updateConfig({
      levels: config.levels.map((l) =>
        l.id === levelId
          ? { ...l, requirements: l.requirements.filter((r) => r.id !== requirementId) }
          : l
      ),
    });
  };

  const getServiceName = (serviceId: string) => {
    return config.services.find((s) => s.id === serviceId)?.name || 'Unbekannt';
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
                  {config.schoolName}
                </h2>
                <p className="text-sm text-muted-foreground">Willkommen zurück</p>
              </div>
              <div className="space-y-3">
                <Input placeholder="E-Mail" className="h-12" />
                <Input type="password" placeholder="Passwort" className="h-12" />
                <Button
                  className="w-full h-12 text-base"
                  style={{ backgroundColor: config.primaryColor, color: 'white' }}
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
              style={{ backgroundColor: config.primaryColor }}
            >
              <div className="flex items-center gap-3">
                {hasLogo ? (
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-white/20 rounded-lg" />
                )}
                <span className="text-lg font-bold text-white">{config.schoolName}</span>
              </div>
              <User size={24} className="text-white" />
            </div>

            <div className="p-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground mb-2">Willkommen zurück!</h3>
                  <p className="text-sm text-muted-foreground">
                    Dein aktuelles {config.levelTerm}: {config.levels[0]?.name || 'Welpe'}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold" style={{ color: config.primaryColor }}>
                      12
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Kurse besucht</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-foreground">45€</div>
                    <div className="text-xs text-muted-foreground mt-1">Guthaben</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{config.levelTerm}-Fortschritt</span>
                    <span className="text-xs text-muted-foreground">60%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: '60%', backgroundColor: config.primaryColor }}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  style={{ backgroundColor: config.primaryColor, color: 'white' }}
                >
                  Kurs buchen
                </Button>
                <Button variant="outline" className="w-full">
                  Guthaben aufladen
                </Button>
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="h-full bg-background overflow-y-auto">
            <div
              className="p-4 flex items-center gap-3 border-b"
              style={{ backgroundColor: config.primaryColor }}
            >
              <List size={24} className="text-white" />
              <span className="text-lg font-bold text-white">Leistungen</span>
            </div>

            <div className="p-4 space-y-3">
              {config.services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">{service.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryLabel(service.category)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: config.primaryColor }}>
                        {service.price.toFixed(2)}€
                      </div>
                      <Button size="sm" variant="outline" className="mt-1">
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
              style={{ backgroundColor: config.primaryColor }}
            >
              <Award size={24} className="text-white" />
              <span className="text-lg font-bold text-white">Mein {config.levelTerm}</span>
            </div>

            <div className="p-4 space-y-4">
              {config.levels.map((level, index) => {
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
                    style={isCurrent ? { borderColor: config.primaryColor } : {}}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {level.badgeImage ? (
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${config.primaryColor}20` }}
                            >
                              <Award size={32} style={{ color: config.primaryColor }} />
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
                                style={{ color: config.primaryColor }}
                              />
                            )}
                            {isCurrent && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${config.primaryColor}20`,
                                  color: config.primaryColor,
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
                                    style={{ color: config.primaryColor }}
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
                                    backgroundColor: config.primaryColor,
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-sans font-bold text-foreground mb-2">
              Konfiguration & Live-Preview
            </h1>
            <p className="text-lg text-muted-foreground font-body">
              Bearbeite deine Einstellungen und sieh die Änderungen in Echtzeit
            </p>
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

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Editor (40%) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="services">Leistungen</TabsTrigger>
                <TabsTrigger value="levels">{config.levelTerm}e</TabsTrigger>
              </TabsList>

              {/* Tab A: Branding */}
              <TabsContent value="branding" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basis-Daten</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="schoolName">Name der Hundeschule</Label>
                      <Input
                        id="schoolName"
                        value={config.schoolName}
                        onChange={(e) => updateConfig({ schoolName: e.target.value })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subdomain">Subdomain</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          id="subdomain"
                          value={config.subdomain}
                          onChange={(e) => updateConfig({ subdomain: e.target.value })}
                        />
                        <span className="text-muted-foreground whitespace-nowrap text-sm">
                          .pfotencard.de
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Design</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Logo</Label>
                      <div
                        onClick={handleLogoUpload}
                        className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          hasLogo
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary hover:bg-muted'
                        }`}
                      >
                        {hasLogo ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 size={32} className="text-primary" />
                            <p className="text-sm text-foreground font-medium">
                              Logo hochgeladen
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={32} className="text-muted-foreground" />
                            <p className="text-sm text-foreground">Logo hochladen</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="primaryColor">Primärfarbe</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={config.primaryColor}
                          onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-border"
                        />
                        <Input
                          value={config.primaryColor}
                          onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                          placeholder="#22C55E"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Wording</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="levelTerm">Begriff für "Level"</Label>
                      <Input
                        id="levelTerm"
                        value={config.levelTerm}
                        onChange={(e) => updateConfig({ levelTerm: e.target.value })}
                        placeholder="z.B. Klasse, Modul"
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab B: Services */}
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Leistungen</CardTitle>
                      <Dialog
                        open={isServiceDialogOpen}
                        onOpenChange={setIsServiceDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingService(null);
                              setServiceForm({ name: '', category: 'training', price: 0 });
                            }}
                          >
                            <Plus size={16} className="mr-2" />
                            Leistung
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {editingService ? 'Bearbeiten' : 'Neue Leistung'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={serviceForm.name}
                                onChange={(e) =>
                                  setServiceForm({ ...serviceForm, name: e.target.value })
                                }
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>Kategorie</Label>
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
                              <Label>Preis (€)</Label>
                              <Input
                                type="number"
                                value={serviceForm.price}
                                onChange={(e) =>
                                  setServiceForm({
                                    ...serviceForm,
                                    price: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsServiceDialogOpen(false)}>
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
                          <TableHead>Preis</TableHead>
                          <TableHead className="text-right">Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {config.services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{service.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {getCategoryLabel(service.category)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{service.price.toFixed(2)} €</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditService(service)}
                                >
                                  <Pencil size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteService(service.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab C: Levels */}
              <TabsContent value="levels" className="space-y-4">
                {config.levels.map((level, index) => (
                  <Card key={level.id} className="border-2">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold"
                            style={{ backgroundColor: config.primaryColor }}
                          >
                            {index + 1}
                          </div>
                          <Input
                            value={level.name}
                            onChange={(e) =>
                              handleUpdateLevel(level.id, { name: e.target.value })
                            }
                            className="font-semibold"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLevel(level.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Badge Upload */}
                      <div>
                        <Label className="text-sm mb-2 block">
                          {config.levelTerm}-Abzeichen
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
                              <Award size={24} style={{ color: config.primaryColor }} />
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
                        <Label className="text-sm mb-3 block">Anforderungen</Label>
                        {level.requirements.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            Noch keine Anforderungen
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {level.requirements.map((req) => (
                              <div
                                key={req.id}
                                className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                              >
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
                                  onClick={() => handleDeleteRequirement(level.id, req.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Dialog
                        open={isRequirementDialogOpen && currentLevelId === level.id}
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
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Anzahl</Label>
                              <Input
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
                              <Label>Leistung</Label>
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
                                  {config.services.map((service) => (
                                    <SelectItem key={service.id} value={service.id}>
                                      {service.name}
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
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-dashed"
                  onClick={handleAddLevel}
                >
                  <Plus size={20} className="mr-2" />
                  Neues {config.levelTerm} hinzufügen
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Preview (60%) */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="bg-muted/30 rounded-xl p-6">
                {/* Preview Control Bar */}
                <Card className="mb-6">
                  <CardContent className="p-4">
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
                                <span>Profil / {config.levelTerm}</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <ExternalLink size={16} />
                        <span className="hidden sm:inline">Live-App öffnen</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Smartphone Frame */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full max-w-[380px] aspect-[9/19] bg-gray-900 rounded-[3rem] shadow-2xl border-[8px] border-gray-800 overflow-hidden"
                  >
                    {/* Phone Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-900 rounded-b-3xl z-10" />

                    {/* Screen Content */}
                    <motion.div
                      key={currentView}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full bg-background overflow-hidden"
                    >
                      {renderPreviewScreen()}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
