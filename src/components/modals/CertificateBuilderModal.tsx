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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Award, Upload, Loader2, Download } from 'lucide-react';
import { uploadImage, previewCertificate, previewCertificateHtml, fetchCertificateLayouts } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CertificateBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
  levels: any[];
  trainingTypes: any[];
}

const HTMLPreview = ({ template, triggerUpdate }: { template: any, triggerUpdate: number }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const htmlContent = await previewCertificateHtml({
        ...template,
        target_id: template.target_id ? parseInt(template.target_id) : 0
      });
      setHtml(htmlContent);
    } catch (error) {
      console.error("HTML Preview failed", error);
    } finally {
      setLoading(false);
    }
  }, [template]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPreview();
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [loadPreview, triggerUpdate]);

  if (loading && !html) {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl border flex flex-col items-center justify-center w-full h-full">
        <Loader2 className="animate-spin text-primary mb-2" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Generiere Vorschau...</span>
      </div>
    );
  }

  return (
    <div className="aspect-[1/1.414] bg-white shadow-xl border relative overflow-hidden w-full h-full group">
      {html ? (
        <iframe 
          srcDoc={html} 
          className="w-full h-full border-0 origin-top" 
          style={{ 
            width: '210mm', 
            height: '297mm', 
            transform: 'scale(0.53)', // Scale down to fit the preview container
            transformOrigin: 'top left' 
          }}
          title="Vorschau" 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">
          Vorschau nicht verfügbar
        </div>
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
}: CertificateBuilderModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [downloadingPreview, setDownloadingPreview] = useState(false);
  const [layouts, setLayouts] = useState<any[]>([]);
  const [triggerUpdate, setTriggerUpdate] = useState(0);
  const { toast } = useToast();
  
  const [template, setTemplate] = useState({
    name: '',
    title: 'Teilnahmebescheinigung',
    layout_id: 'layout_professional',
    trigger_type: 'course_completed',
    target_id: '',
    images: {} as Record<string, string>,
  });

  useEffect(() => {
    if (isOpen) {
      fetchCertificateLayouts()
        .then(setLayouts)
        .catch(err => toast({ title: "Fehler", description: "Layouts konnten nicht geladen werden.", variant: "destructive" }));
    }
  }, [isOpen, toast]);

  const handleDownloadPreview = async () => {
    setDownloadingPreview(true);
    try {
      const blob = await previewCertificate({
        ...template,
        target_id: template.target_id ? parseInt(template.target_id) : 0
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
        target_id: parseInt(template.target_id)
      });
      onClose();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Die Vorlage konnte nicht gespeichert werden.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, slotId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(slotId);
    try {
      const { url } = await uploadImage(file);
      setTemplate(prev => ({
        ...prev,
        images: { ...prev.images, [slotId]: url }
      }));
      setTriggerUpdate(p => p + 1);
      toast({ title: 'Erfolg', description: 'Bild erfolgreich hochgeladen.' });
    } catch (error) {
      toast({ title: 'Upload fehlgeschlagen', description: 'Das Bild konnte nicht hochgeladen werden.', variant: 'destructive' });
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
                      setTemplate({ ...template, layout_id: layout.id });
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
                    onValueChange={(val) => setTemplate({ ...template, trigger_type: val, target_id: '' })}
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

              <div className="space-y-4">
                <Label>Bilder (Layout spezifisch)</Label>
                <div className="grid grid-cols-1 gap-3">
                  {selectedLayout?.image_slots.map((slot: any) => (
                    <div key={slot.id} className="flex flex-col gap-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">{slot.label}</Label>
                      <Button variant="outline" size="sm" className="relative h-9 justify-start gap-2 overflow-hidden" disabled={uploading === slot.id}>
                        {uploading === slot.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {template.images[slot.id] ? 'Ändern' : 'Hochladen'}
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, slot.id)}
                        />
                      </Button>
                      {template.images[slot.id] && (
                        <div className="text-[8px] truncate text-green-600">✓ Hochgeladen</div>
                      )}
                    </div>
                  ))}
                  {(!selectedLayout || selectedLayout.image_slots.length === 0) && (
                    <div className="text-xs text-muted-foreground italic">Keine Bilder für dieses Layout erforderlich.</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Label className="text-xs text-muted-foreground mb-2 block">Verfügbare Variablen im Layout:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedLayout?.placeholders.map((p: string) => (
                  <div key={p} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-[10px] font-mono">
                    {'{' + p + '}'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Preview */}
          <div className="bg-slate-100 p-8 flex flex-col items-center justify-center overflow-hidden border-l">
            <div className="w-full max-w-[420px] mb-4 flex justify-between items-center px-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live-Vorschau (Exakt)
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[10px] uppercase font-bold gap-2"
                onClick={handleDownloadPreview}
                disabled={downloadingPreview}
              >
                {downloadingPreview ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                Muster PDF
              </Button>
            </div>
            
            <div className="w-full max-w-[420px] shadow-2xl relative group bg-white h-[594px] overflow-hidden">
              <HTMLPreview template={template} triggerUpdate={triggerUpdate} />
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
