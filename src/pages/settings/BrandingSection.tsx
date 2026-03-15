import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Upload, Lock, Sun, Moon } from 'lucide-react';
import React from 'react';

interface BrandingSectionProps {
  isFeatureAllowed: (feature: string, type?: 'module' | 'setting') => boolean;
  subdomain: string;
  schoolName: string;
  setSchoolName: (val: string) => void;
  supportEmail: string;
  setSupportEmail: (val: string) => void;
  handleLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogoUpload: () => void;
  hasLogo: boolean;
  previewLogo?: string;
  setPrimaryColor: (val: string) => void;
  setCustomPrimaryColor: (val: string) => void;
  setBackgroundColor: (val: string) => void;
  setCustomBackgroundColor: (val: string) => void;
  setSidebarColor: (val: string) => void;
  setCustomSidebarColor: (val: string) => void;
  primaryColor: string;
  backgroundColor: string;
  sidebarColor: string;
  customPrimaryColor: string;
  customBackgroundColor: string;
  customSidebarColor: string;
  toast: any;
}

export const BrandingSection = React.memo(({
  isFeatureAllowed,
  subdomain,
  schoolName,
  setSchoolName,
  supportEmail,
  setSupportEmail,
  handleLogoFileChange,
  handleLogoUpload,
  hasLogo,
  previewLogo,
  setPrimaryColor,
  setCustomPrimaryColor,
  setBackgroundColor,
  setCustomBackgroundColor,
  setSidebarColor,
  setCustomSidebarColor,
  primaryColor,
  backgroundColor,
  sidebarColor,
  customPrimaryColor,
  customBackgroundColor,
  customSidebarColor,
  toast
}: BrandingSectionProps) => {
  return (
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="space-y-3">
                <Label>Primärfarbe (Buttons)</Label>
                <div className="flex gap-3">
                  <Input type="color" value={customPrimaryColor || primaryColor} onChange={(e) => { setPrimaryColor(e.target.value); setCustomPrimaryColor(e.target.value); }} className="w-12 h-12 p-1 cursor-pointer rounded-lg shrink-0" />
                  <Input value={customPrimaryColor || primaryColor} onChange={(e) => { setPrimaryColor(e.target.value); setCustomPrimaryColor(e.target.value); }} className="font-mono text-xs h-12" placeholder="#000000" />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Hintergrundfarbe</Label>
                <div className="flex gap-3">
                  <Input type="color" value={customBackgroundColor || backgroundColor} onChange={(e) => { setBackgroundColor(e.target.value); setCustomBackgroundColor(e.target.value); }} className="w-12 h-12 p-1 cursor-pointer rounded-lg shrink-0" />
                  <Input value={customBackgroundColor || backgroundColor} onChange={(e) => { setBackgroundColor(e.target.value); setCustomBackgroundColor(e.target.value); }} className="font-mono text-xs h-12" placeholder="#000000" />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Seitenleiste</Label>
                <div className="flex gap-3">
                  <Input type="color" value={customSidebarColor || sidebarColor} onChange={(e) => { setSidebarColor(e.target.value); setCustomSidebarColor(e.target.value); }} className="w-12 h-12 p-1 cursor-pointer rounded-lg shrink-0" />
                  <Input value={customSidebarColor || sidebarColor} onChange={(e) => { setSidebarColor(e.target.value); setCustomSidebarColor(e.target.value); }} className="font-mono text-xs h-12" placeholder="#000000" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
});