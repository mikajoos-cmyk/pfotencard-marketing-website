import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Award, Upload, Loader2, Download, Trash2, Link } from 'lucide-react';
import { uploadImage, previewCertificate, previewCertificateHtml, fetchCertificateLayouts } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CertificateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
  levels: any[];
  trainingTypes: any[];
  initialTemplate?: any; // NEU: Für Bearbeitung
}

const HTMLPreview = ({ template, testData, triggerUpdate }: { template: any, testData: Record<string, string>, triggerUpdate: number }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  
  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const htmlContent = await previewCertificateHtml({
        ...template,
        target_id: template.target_id ? parseInt(template.target_id) : 0,
        preview_data: testData
      });
      setHtml(htmlContent);
    } catch (error) {
      console.error("HTML Preview failed", error);
    } finally {
      setLoading(false);
    }
  }, [template, testData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPreview();
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [loadPreview, triggerUpdate]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setScale(containerWidth / 794);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [html]);

  if (loading && !html) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white shadow-xl">
        <Loader2 className="animate-spin text-primary mb-2" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Generiere Vorschau...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-white">
      {html ? (
        <div style={{ 
          width: '794px', height: '1123px', transform: `scale(${scale})`, transformOrigin: 'top left',
          position: 'absolute', top: 0, left: 0
        }}>
          <iframe srcDoc={html} className="w-full h-full border-0 pointer-events-none" title="Vorschau" />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">Vorschau nicht verfügbar</div>
      )}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export function CertificateBuilderModal({
  isOpen,
  onClose,
  onSave,
  levels,
  trainingTypes,
  initialTemplate,
}: CertificateBuilderModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [downloadingPreview, setDownloadingPreview] = useState(false);
  const [layouts, setLayouts] = useState<any[]>([]);
  const [triggerUpdate, setTriggerUpdate] = useState(0);
  
  // NEU: State für die Testdaten
  const [testData, setTestData] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  
  const [template, setTemplate] = useState({
    name: '',
    title: 'Teilnahmebescheinigung',
    body_text: '',
    layout_id: 'layout_professional',
    trigger_type: 'course_completed',
    target_id: '',
    images: {} as Record<string, string>,
  });

  // Hilfsfunktion um Default-Referenzen aus dem Layout anzuwenden
  const applyLayoutDefaults = useCallback((layoutId: string, currentImages: Record<string, string>, allLayouts: any[]) => {
    const layout = allLayouts.find(l => l.id === layoutId);
    if (!layout || !layout.image_slots) return currentImages;

    const newImages = { ...currentImages };
    layout.image_slots.forEach((slot: any) => {
      // Wenn der Slot leer ist und ein Default existiert, wende ihn an
      if (!newImages[slot.id] && slot.default_ref) {
        newImages[slot.id] = `ref:${slot.default_ref}`;
      }
    });
    return newImages;
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialTemplate) {
        setTemplate({
          ...initialTemplate,
          target_id: initialTemplate.target_id?.toString() || '',
          images: initialTemplate.images || {},
          body_text: initialTemplate.body_text || '',
        });
        if (initialTemplate.preview_data) {
          setTestData(initialTemplate.preview_data);
        }
      } else {
        // Reset for NEW
        setTemplate({
          name: '',
          title: 'Teilnahmebescheinigung',
          body_text: '',
          layout_id: 'layout_professional',
          trigger_type: 'course_completed',
          target_id: '',
          images: {},
        });
        setTestData({});
      }

      fetchCertificateLayouts()
        .then(data => {
          setLayouts(data);
          // Falls wir ein NEUES Template erstellen, wende direkt die Defaults vom Standard-Layout an
          if (!initialTemplate && data.length > 0) {
            const defaultLayoutId = 'layout_professional';
            const defaultLayout = data.find(l => l.id === defaultLayoutId) || data[0];
            
            setTemplate(prev => ({
              ...prev,
              layout_id: defaultLayout.id,
              images: applyLayoutDefaults(defaultLayout.id, {}, data),
              body_text: defaultLayout.default_texts?.[prev.trigger_type] || ''
            }));
          }
        })
        .catch(err => toast({ title: "Fehler", description: "Layouts konnten nicht geladen werden.", variant: "destructive" }));
    }
  }, [isOpen, initialTemplate, toast, applyLayoutDefaults]);

  const handleDownloadPreview = async () => {
    setDownloadingPreview(true);
    try {
      const blob = await previewCertificate({
        ...template,
        target_id: template.target_id ? parseInt(template.target_id) : 0,
        preview_data: testData // NEU
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Muster_${template.name || 'Zertifikat'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Muster PDF konnte nicht erstellt werden.', variant: 'destructive' });
    } finally {
      setDownloadingPreview(false);
    }
  };

  const handleSave = async () => {
    if (!template.name || !template.target_id) return;
    setLoading(true);
    try {
      await onSave({
        ...template,
        target_id: parseInt(template.target_id),
        preview_data: testData // Testdaten mitspeichern für spätere Bearbeitung
      });
      onClose();
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (slotId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(slotId); // Setzt den Lade-Status gezielt für diesen Slot
    try {
      const { url } = await uploadImage(file);

      setTemplate(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [slotId]: url
        }
      }));
      setTriggerUpdate(prev => prev + 1);
    } catch (error) {
      console.error("Upload failed", error);
      toast({ title: "Fehler beim Upload", variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const selectedLayout = layouts.find(l => l.id === template.layout_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Award className="text-primary" />
            Zertifikats-Vorlage konfigurieren
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side: Form */}
          <div className="overflow-y-auto p-6 space-y-8 border-r">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Interner Name (z.B. Welpenabschluss)</Label>
                <Input
                  id="name"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  placeholder="Name für die Übersicht"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titel auf dem Zertifikat</Label>
                <Input
                  id="title"
                  value={template.title}
                  onChange={(e) => {
                    setTemplate({ ...template, title: e.target.value });
                    setTriggerUpdate(p => p + 1);
                  }}
                  placeholder="Teilnahmebescheinigung"
                />
              </div>
            </div>


            <div className="space-y-4">
              <Label>Layout auswählen</Label>
              <div className="grid grid-cols-4 gap-3">
                {layouts.map((layout) => (
                  <Button
                    key={layout.id}
                    variant={template.layout_id === layout.id ? 'default' : 'outline'}
                    type="button"
                    className={`h-auto py-3 px-2 flex flex-col gap-1 items-center justify-center text-[10px] uppercase tracking-wider font-bold transition-all ${
                      template.layout_id === layout.id ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    onClick={() => {
                      const newImages = applyLayoutDefaults(layout.id, template.images, layouts);
                      setTemplate({ ...template, layout_id: layout.id, images: newImages });
                      setTriggerUpdate(p => p + 1);
                    }}
                  >
                    <Award size={16} />
                    {layout.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-4">
                <Label>Automatischer Trigger</Label>
                <div className="space-y-3">
                  <Select
                    value={template.trigger_type}
                    onValueChange={(val) => {
                      setTemplate({ ...template, trigger_type: val, target_id: '' });
                      setTriggerUpdate(p => p + 1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Trigger wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course_completed">Wenn Leistung abgerechnet wird</SelectItem>
                      <SelectItem value="level_achieved">Wenn Level erreicht wird</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={template.target_id}
                    onValueChange={(val) => {
                      setTemplate({ ...template, target_id: val });
                      setTriggerUpdate(p => p + 1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={template.trigger_type === 'level_achieved' ? 'Level wählen' : 'Leistung wählen'} />
                    </SelectTrigger>
                    <SelectContent>
                      {template.trigger_type === 'level_achieved'
                        ? levels.map((l) => (
                            <SelectItem key={l.id} value={l.id.toString()}>
                              {l.name}
                            </SelectItem>
                          ))
                        : trainingTypes.map((tt) => (
                            <SelectItem key={tt.id} value={tt.id.toString()}>
                              {tt.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* DYNAMISCHER BEREICH: Bilder & Logos */}
            <div className="pt-6 border-t mt-4">
              <Label className="text-base font-bold text-foreground mb-4 block">Bilder & Logos</Label>
              <div className="grid grid-cols-1 gap-4">
                {selectedLayout?.image_slots?.map((slot: { id: string, label: string, allow_variables?: boolean }) => {
                  const imageValue = template.images?.[slot.id];
                  const isReference = typeof imageValue === 'string' && imageValue.startsWith('ref:');
                  const referenceVar = isReference ? imageValue.substring(4) : '';
                  const variablesAllowed = slot.allow_variables !== false; // Default true

                  return (
                    <div key={slot.id} className="flex flex-col gap-2 p-3 bg-muted/30 border rounded-lg">
                      <Label className="text-sm font-semibold">{slot.label}</Label>
                      
                      {imageValue ? (
                        <div className="flex items-center justify-between gap-4 bg-white p-2 rounded border">
                          {isReference ? (
                            <div className="flex items-center gap-2 text-primary font-medium text-sm px-2 py-1 bg-primary/5 rounded border border-primary/20 flex-1">
                              <Link size={14} />
                              Dynamisch: <span className="font-mono text-xs">{'{' + referenceVar + '}'}</span>
                            </div>
                          ) : (
                            <img 
                              src={imageValue} 
                              alt={slot.label} 
                              className="h-10 w-auto object-contain bg-slate-50 rounded" 
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              const newImages = { ...template.images };
                              delete newImages[slot.id];
                              setTemplate({ ...template, images: newImages });
                              setTriggerUpdate(prev => prev + 1);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Entfernen
                          </Button>
                        </div>
                      ) : (
                        <div className={`grid grid-cols-1 ${variablesAllowed ? 'md:grid-cols-2' : ''} gap-3 items-end`}>
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Bilddatei</span>
                            <input
                              type="file"
                              id={`upload-${slot.id}`}
                              className="hidden"
                              accept="image/png, image/jpeg"
                              onChange={(e) => handleImageUpload(slot.id, e)}
                            />
                            <Label
                              htmlFor={`upload-${slot.id}`}
                              className={`flex items-center justify-center gap-2 h-9 px-3 bg-white border hover:bg-slate-50 text-slate-700 rounded-md cursor-pointer text-xs font-medium transition-colors w-full ${uploading === slot.id ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              {uploading === slot.id ? (
                                <span className="animate-pulse flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/>...</span>
                              ) : (
                                <><Upload className="h-3 w-3" /> Upload</>
                              )}
                            </Label>
                          </div>

                          {variablesAllowed && (
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Oder Variable</span>
                              <Select
                                onValueChange={(val) => {
                                  if (val === "none") return;
                                  setTemplate(prev => ({
                                    ...prev,
                                    images: { ...prev.images, [slot.id]: `ref:${val}` }
                                  }));
                                  setTriggerUpdate(prev => prev + 1);
                                }}
                              >
                                <SelectTrigger className="h-9 text-xs bg-white w-full">
                                  <SelectValue placeholder="Verknüpfen..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kursleiter">Kursleiter (Unterschrift)</SelectItem>
                                  <SelectItem value="hundeschule_name">Hundeschule (Logo)</SelectItem>
                                  <SelectItem value="kundenname">Kunde</SelectItem>
                                  <SelectItem value="hundename">Hund</SelectItem>
                                  <SelectItem value="kursname">Kurs/Level</SelectItem>
                                  <SelectItem value="ort">Ort</SelectItem>
                                  <SelectItem value="datum">Datum</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {(!selectedLayout?.image_slots || selectedLayout.image_slots.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">Dieses Layout benötigt keine spezifischen Bilder.</p>
                )}
              </div>
            </div>
            
            {/* NEU: Beschreibungen für die Platzhalter */}
            {(() => {
              const placeholderDescriptions: Record<string, string> = {
                hundename: "aus Hunde-Profil",
                kundenname: "aus Kunden-Profil",
                datum: "Aktuelles Ausstellungsdatum",
                hundeschule_name: "aus Einstellungen (Basis-Daten)",
                kursname: "Name der Leistung / des Levels",
                ort: "aus Einstellungen (Rechnungsadresse)",
                kursleiter: "Name des bestätigenden Mitarbeiters"
              };

              return (
                <div className="pt-6 border-t mt-4">
                  <Label className="text-base font-bold text-foreground mb-1 block">Testdaten für die Vorschau</Label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Im echten Betrieb werden diese Variablen automatisch befüllt. Hier kannst du sie testen:
                  </p>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {selectedLayout?.placeholders.map((p: string) => (
                      <div key={p} className="flex flex-col gap-1.5 p-3 bg-muted/30 border rounded-lg">
                        <Label className="text-xs font-semibold flex items-center justify-between">
                          <span className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{'{' + p + '}'}</span>
                          <span className="text-[10px] text-muted-foreground font-normal italic ml-2 text-right">
                            {placeholderDescriptions[p] || "Automatischer Wert"}
                          </span>
                        </Label>
                        <Input 
                          type="text" 
                          className="h-8 text-xs bg-background" 
                          placeholder={`Musterwert für ${p}`}
                          value={testData[p] || ''}
                          onChange={(e) => {
                            setTestData({ ...testData, [p]: e.target.value });
                            setTriggerUpdate(prev => prev + 1);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Side: Preview */}
          <div className="bg-slate-100 p-8 flex flex-col items-center justify-center overflow-hidden border-l">
            <div className="w-full max-w-[420px] mb-4 flex justify-between items-center px-1">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Live-Vorschau</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-tight">DIN A4 Format (794 x 1123 px)</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-2 bg-white"
                onClick={handleDownloadPreview}
                disabled={downloadingPreview}
              >
                {downloadingPreview ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                Muster PDF
              </Button>
            </div>
            
            <div className="w-full max-w-[420px] shadow-2xl relative group bg-white h-[594px] overflow-hidden">
              <HTMLPreview template={template} testData={testData} triggerUpdate={triggerUpdate} />
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={loading || !template.name || !template.target_id}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vorlage speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
