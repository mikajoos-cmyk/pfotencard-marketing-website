import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, ExternalLink, ArrowLeft, Smartphone, Copy, Check, Info, Plus, Trash2, Calendar, Award } from 'lucide-react';
import React from 'react';
import { HomeworkSection } from './HomeworkSection';
import { CertificatesSection } from './CertificatesSection';

interface AppModule {
  id: string;
  name: string;
  description: string;
  premiumOnly: boolean;
  comingSoon?: boolean;
  icon: React.ElementType;
}

interface ColorRule {
  service_id: string;
  color: string;
}

interface ModuleHubProps {
  currentView: 'overview' | 'module-settings';
  setCurrentView: (view: 'overview' | 'module-settings') => void;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  activeModules: string[];
  setActiveModules: (modules: string[]) => void;
  AVAILABLE_MODULES: AppModule[];
  isInvoiceDataComplete: () => boolean;
  widgetType: string;
  setWidgetType: (val: string) => void;
  widgetLayout: string;
  setWidgetLayout: (val: string) => void;
  widgetLimit: number;
  setWidgetLimit: (val: number) => void;
  widgetHeight: number;
  setWidgetHeight: (val: number) => void;
  subdomain: string;
  copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null;
  defaultDuration: number;
  setDefaultDuration: (val: number) => void;
  defaultMaxParticipants: number;
  setDefaultMaxParticipants: (val: number) => void;
  cancelationPeriodHours: number;
  setCancelationPeriodHours: (val: number) => void;
  colorRules: ColorRule[];
  setColorRules: (rules: ColorRule[]) => void;
  services: any[];
  certificateTemplates: any[];
  levels: any[];
  levelTerm: string;
  deleteCertificateTemplate: (id: number) => void;
  setShowCertificateModal: (show: boolean) => void;
}

export const ModuleHub = React.memo(({
  currentView,
  setCurrentView,
  selectedModuleId,
  setSelectedModuleId,
  activeModules,
  setActiveModules,
  AVAILABLE_MODULES,
  isInvoiceDataComplete,
  widgetType,
  setWidgetType,
  widgetLayout,
  setWidgetLayout,
  widgetLimit,
  setWidgetLimit,
  widgetHeight,
  setWidgetHeight,
  subdomain,
  copyToClipboard,
  copiedId,
  defaultDuration,
  setDefaultDuration,
  defaultMaxParticipants,
  setDefaultMaxParticipants,
  cancelationPeriodHours,
  setCancelationPeriodHours,
  colorRules,
  setColorRules,
  services,
  certificateTemplates,
  levels,
  levelTerm,
  deleteCertificateTemplate,
  setShowCertificateModal
}: ModuleHubProps) => {
  return (
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
                          disabled={
                            module.comingSoon ||
                            (module.id === 'invoice_download' && !isInvoiceDataComplete())
                          }
                          onCheckedChange={(val) => {
                            if (val) setActiveModules([...activeModules, module.id]);
                            else setActiveModules(activeModules.filter(id => id !== module.id));
                          }}
                        />
                        {module.comingSoon && <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Coming Soon</span>}
                        {module.id === 'invoice_download' && !isInvoiceDataComplete() && !isActive && (
                          <span className="text-[10px] text-destructive font-medium">Daten unvollständig</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <CardTitle className="text-base">{module.name}</CardTitle>
                      <CardDescription className="text-xs mt-1 leading-relaxed">{module.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {(isActive || module.id === 'invoice_download') && (
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Module Detail Settings */
        <div className="space-y-6">
          {selectedModuleId === 'widgets' && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ExternalLink size={20} />
                        Website-Integration (Widgets)
                      </CardTitle>
                      <CardDescription>
                        Binde Status- oder Termin-Widgets über ein Iframe in deine Website ein.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Widget-Typ</Label>
                        <Tabs value={widgetType} onValueChange={setWidgetType} className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="status">Status-Widget</TabsTrigger>
                            <TabsTrigger value="appointments">Termin-Widget</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {widgetType === 'appointments' && (
                        <>
                          <div className="space-y-2">
                            <Label>Layout</Label>
                            <Select value={widgetLayout} onValueChange={setWidgetLayout}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="compact">Kompakt (Liste)</SelectItem>
                                <SelectItem value="detailed">Detailliert (Karten)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Anzahl Termine (Limit)</Label>
                            <Input type="number" value={widgetLimit} onChange={(e) => setWidgetLimit(parseInt(e.target.value))} />
                          </div>
                        </>
                      )}
                      <div className="space-y-2">
                        <Label>Iframe-Höhe (Pixel)</Label>
                        <Input type="number" value={widgetHeight} onChange={(e) => setWidgetHeight(parseInt(e.target.value))} />
                        <p className="text-[10px] text-muted-foreground">Standard: 200px (Status) / 600px (Termine)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Vorschau & Code</Label>
                      <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
                        <div className="aspect-[4/3] bg-white rounded border shadow-inner flex items-center justify-center overflow-hidden">
                          <div className="text-center p-4">
                            <Smartphone className="mx-auto text-muted-foreground/30 mb-2" size={32} />
                            <p className="text-[10px] text-muted-foreground">Hier würde das {widgetType === 'status' ? 'Status' : 'Termin'}-Widget geladen werden.</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">HTML Iframe Code</p>
                          <div className="relative">
                            <pre className="text-[9px] bg-slate-950 text-slate-50 p-3 rounded-md overflow-x-auto font-mono leading-relaxed">
                              {`<iframe \n  src="https://app.pfotencard.de/widget/${widgetType}?subdomain=${subdomain}${widgetType === 'appointments' ? `&layout=${widgetLayout}&limit=${widgetLimit}` : ''}" \n  width="100%" \n  height="${widgetHeight}px" \n  style="border:none; border-radius:12px;"\n></iframe>`}
                            </pre>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-2 right-2 h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
                              onClick={() => copyToClipboard(`<iframe src="https://app.pfotencard.de/widget/${widgetType}?subdomain=${subdomain}${widgetType === 'appointments' ? `&layout=${widgetLayout}&limit=${widgetLimit}` : ''}" width="100%" height="${widgetHeight}px" style="border:none; border-radius:12px;"></iframe>`, 'widget-code')}
                            >
                              {copiedId === 'widget-code' ? <Check size={14} /> : <Copy size={14} />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedModuleId === 'calendar' && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={20} />
                    Terminbuchung & Kalender
                  </CardTitle>
                  <CardDescription>Standardwerte für deine Kurs- und Terminplanung.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Standard-Dauer (Minuten)</Label>
                      <Input type="number" value={defaultDuration} onChange={(e) => setDefaultDuration(parseInt(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max. Teilnehmer</Label>
                      <Input type="number" value={defaultMaxParticipants} onChange={(e) => setDefaultMaxParticipants(parseInt(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Storno-Frist (Stunden)</Label>
                      <Input type="number" value={cancelationPeriodHours} onChange={(e) => setCancelationPeriodHours(parseInt(e.target.value))} />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base">Farben im Kalender</Label>
                        <p className="text-xs text-muted-foreground">Ordne deinen Leistungen spezifische Farben zu, um den Kalender übersichtlicher zu gestalten.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setColorRules([...colorRules, { service_id: '', color: '#3B82F6' }])}>
                        <Plus size={14} className="mr-1" /> Regel hinzufügen
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {colorRules.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                          <Info className="mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-xs text-muted-foreground">Noch keine Farbregeln definiert. Termine nutzen die Standardfarbe.</p>
                        </div>
                      )}
                      {colorRules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-card border rounded-lg group">
                          <div className="flex-1">
                            <Select value={rule.service_id} onValueChange={(val) => {
                              const newRules = [...colorRules];
                              newRules[index].service_id = val;
                              setColorRules(newRules);
                            }}>
                              <SelectTrigger><SelectValue placeholder="Leistung wählen..." /></SelectTrigger>
                              <SelectContent>
                                {services.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input type="color" value={rule.color} onChange={(e) => {
                              const newRules = [...colorRules];
                              newRules[index].color = e.target.value;
                              setColorRules(newRules);
                            }} className="w-10 h-10 p-1 cursor-pointer rounded-md shrink-0" />
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setColorRules(colorRules.filter((_, i) => i !== index))}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedModuleId === 'balance_topup' && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guthaben-Aufladung</CardTitle>
                  <CardDescription>Hinweise zur Zahlungsabwicklung.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-500/10 text-blue-700 rounded-lg text-sm flex gap-3 border border-blue-200">
                    <Info className="shrink-0" size={20} />
                    <div>
                      <p className="font-semibold">Stripe-Anbindung erforderlich</p>
                      <p className="mt-1 leading-relaxed">
                        Damit deine Kunden ihr Guthaben aufladen können, musst du ein Stripe-Konto verknüpfen. 
                        Die Auszahlungen erfolgen direkt auf dein Bankkonto.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full h-12" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
                    Zum Stripe Dashboard <ExternalLink className="ml-2" size={16} />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedModuleId === 'homework' && (
            <div className="grid gap-6">
              <Card>
                <CardHeader className="pb-3 border-b mb-6">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={20} />
                    Hausaufgaben & Trainingsplan
                  </CardTitle>
                  <CardDescription>Erstelle hier Vorlagen für Übungen, die du deinen Kunden zuweisen kannst.</CardDescription>
                </CardHeader>
                <CardContent>
                  <HomeworkSection />
                </CardContent>
              </Card>
            </div>
          )}

          {selectedModuleId === 'invoice_download' && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rechnungs-Download</CardTitle>
                  <CardDescription>Konfiguriere, wie Rechnungen für deine Kunden generiert werden.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg border text-sm">
                    <p className="font-medium mb-2">Wie es funktioniert:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Kunden erhalten nach jeder Aufladung automatisch eine Rechnung.</li>
                      <li>Die Rechnung wird als PDF generiert und kann in der App geladen werden.</li>
                      <li>Deine rechtlichen Angaben werden aus den Stammdaten übernommen.</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setSelectedModuleId(null);
                    setCurrentView('overview');
                    // navigate('/einstellungen/legal');
                  }}>
                    Zu den rechtlichen Angaben (Adresse, IBAN...)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedModuleId === 'certificates' && (
            <div className="grid gap-6">
              <Card>
                <CardHeader className="pb-3 border-b mb-6">
                  <CardTitle className="flex items-center gap-2">
                    <Award size={20} />
                    Teilnahmebescheinigungen
                  </CardTitle>
                  <CardDescription>Automatische Zertifikate verwalten.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CertificatesSection 
                    certificateTemplates={certificateTemplates}
                    levels={levels}
                    services={services}
                    levelTerm={levelTerm}
                    deleteCertificateTemplate={deleteCertificateTemplateAction}
                    setShowCertificateModal={setShowCertificateModal}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});