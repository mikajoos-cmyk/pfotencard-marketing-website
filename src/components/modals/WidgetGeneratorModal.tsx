import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getOrCreatePublicToken } from '@/lib/api';

interface WidgetGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSubdomain: string;
}

export function WidgetGeneratorModal({ isOpen, onClose, tenantSubdomain }: WidgetGeneratorModalProps) {
  const [widgetType, setWidgetType] = useState('status');
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('f97316');
  const [layout, setLayout] = useState('compact');
  const [limit, setLimit] = useState<number>(5);
  const [copied, setCopied] = useState(false);
  const [publicToken, setPublicToken] = useState<string>('');
  const [height, setHeight] = useState<number>(200);
  const { toast } = useToast();

  // Die Basis-URL der App (wo die Widgets gehostet werden)
  // Per ENV überschreibbar, sonst heuristisch abgeleitet
  const APP_BASE_URL = (import.meta as any).env?.VITE_WIDGET_APP_BASE_URL || window.location.origin.replace('marketing.', 'app.').replace('localhost:5173', 'localhost:5174');

  const generatedUrl = widgetType === 'status' 
    ? `${APP_BASE_URL}/widget/${widgetType}/${publicToken}`
    : `${APP_BASE_URL}/widget/${widgetType}/${publicToken}?layout=${layout}&limit=${limit}`;
  
  useEffect(() => {
    // Token laden/erzeugen sobald das Modal geöffnet wird
    if (isOpen) {
      getOrCreatePublicToken()
        .then(res => {
          setPublicToken(res.public_widget_token);
        })
        .catch(() => {
          toast({ title: 'Fehler', description: 'Konnte öffentliches Token nicht laden.' });
        });
    }
  }, [isOpen]);

  useEffect(() => {
    // Standardhöhe je nach Widget anpassen
    setHeight(widgetType === 'status' ? 200 : 400);
  }, [widgetType]);

  const widgetHeight = String(height);
  const iframeCode = `<iframe 
  src="${generatedUrl}" 
  width="100%" 
  height="${widgetHeight}" 
  style="border:none; border-radius: 8px; overflow: hidden;"
></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    toast({
      title: "Kopiert!",
      description: "Der Widget-Code wurde in die Zwischenablage kopiert.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Website-Integration</DialogTitle>
          <DialogDescription>
            Generiere hier den Code, um Pfotencard-Widgets direkt in deine eigene Website einzubinden.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Einstellungen */}
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
                  <Select value={layout} onValueChange={setLayout}>
                    <SelectTrigger>
                      <SelectValue placeholder="Layout wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Kompakt</SelectItem>
                      <SelectItem value="detailed">Detailliert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Anzahl Termine</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value || '1', 10))}
                    />
                    <span className="text-xs text-muted-foreground">Maximale Anzeige</span>
                  </div>
                </div>
              </>
            )}

            {widgetType === 'status' && (
              <div className="space-y-2">
                <Label>Höhe (px)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={120}
                    max={1200}
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value || '0', 10))}
                  />
                  <span className="text-xs text-muted-foreground">Standard: 200</span>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-4">
              <Label>HTML-Code zum Kopieren</Label>
              <div className="relative">
                <textarea
                  readOnly
                  className="w-full h-32 p-3 text-sm font-mono bg-muted rounded-md border resize-none"
                  value={iframeCode}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Kopiert" : "Kopieren"}
                </Button>
              </div>
            </div>
          </div>

          {/* Live-Vorschau */}
          <div className="flex flex-col space-y-4">
            <Label className="flex items-center gap-2">
              Live-Vorschau 
              <span className="text-xs font-normal text-muted-foreground">(Beispielhaftes Iframe)</span>
            </Label>
            <div className="flex-1 border rounded-lg bg-slate-50 overflow-hidden min-h-[300px] flex items-center justify-center relative">
              <iframe
                src={generatedUrl}
                width="100%"
                height="100%"
                className="border-none w-full h-full"
                title="Widget Preview"
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-primary/20 rounded-lg"></div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Hinweis: Die Vorschau lädt die Daten deines aktuellen Tenants.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
