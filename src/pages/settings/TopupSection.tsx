import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Wallet, Trash2, Plus, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import React from 'react';

interface TopUpOption {
  amount: number;
  bonus: number;
}

interface TopupSectionProps {
  allowCustomTopUp: boolean;
  setAllowCustomTopUp: (val: boolean) => void;
  topUpOptions: TopUpOption[];
  setTopUpOptions: (options: TopUpOption[]) => void;
  stripeAccountActive: boolean;
  stripeAccountId: string | null;
  onConnectStripe: () => void;
  isConnecting: boolean;
}

export const TopupSection = React.memo(({
  allowCustomTopUp,
  setAllowCustomTopUp,
  topUpOptions,
  setTopUpOptions,
  stripeAccountActive,
  stripeAccountId,
  onConnectStripe,
  isConnecting
}: TopupSectionProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5" /> Guthaben & Aufladung</CardTitle>
          <CardDescription>Konfiguriere, wie deine Kunden ihr Guthaben aufladen können.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="space-y-0.5">
              <Label className="text-base">Freie Beträge erlauben</Label>
              <p className="text-xs text-muted-foreground">Kunden können einen beliebigen Betrag (z.B. 25,50 €) aufladen.</p>
            </div>
            <Switch checked={allowCustomTopUp} onCheckedChange={setAllowCustomTopUp} />
          </div>

          <div className="pt-4 border-t border-border/50">
            <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground block mb-4">Auszahlungskonto (Stripe Connect)</Label>
            
            {stripeAccountActive ? (
              <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="bg-green-500/20 p-2 rounded-full text-green-600">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-green-700">Konto verifiziert</h4>
                  <p className="text-sm text-green-600/80">
                    Dein Konto ist für Online-Zahlungen verifiziert. Eingenommenes Guthaben wird automatisch an dein verknüpftes Bankkonto ausgezahlt.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="bg-amber-500/20 p-2 rounded-full text-amber-600 shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-amber-700">Auszahlungskonto einrichten</h4>
                    <p className="text-sm text-amber-600/80">
                      Um Online-Aufladungen von deinen Kunden empfangen zu können, musst du ein Empfängerkonto (IBAN) sicher mit Stripe Connect verknüpfen.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={onConnectStripe} 
                  disabled={isConnecting}
                  className="w-full sm:w-auto bg-[#635BFF] hover:bg-[#5851E0] text-white font-semibold py-6 px-8 h-auto text-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
                >
                  {isConnecting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  )}
                  {stripeAccountId ? "Einrichtung fortsetzen" : "Jetzt Bankkonto sicher mit Stripe verknüpfen"}
                </Button>
                <p className="text-[10px] text-muted-foreground text-center sm:text-left">
                  Sichere Abwicklung über Stripe. Du wirst kurzzeitig zu Stripe weitergeleitet, um deine Daten zu hinterlegen.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Vordefinierte Auflade-Optionen</Label>
              <Button variant="outline" size="sm" onClick={() => setTopUpOptions([...topUpOptions, { amount: 50, bonus: 0 }])} className="h-8 text-xs"><Plus size={14} className="mr-1" /> Option hinzufügen</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topUpOptions.map((option, index) => (
                <div key={index} className="flex flex-col gap-2 p-3 bg-card border rounded-lg hover:border-primary/30 transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Option {index + 1}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setTopUpOptions(topUpOptions.filter((_, i) => i !== index))}><Trash2 size={12} /></Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-[10px]">Betrag (€)</Label><Input type="number" value={option.amount} onChange={(e) => { const newOptions = [...topUpOptions]; newOptions[index].amount = parseInt(e.target.value); setTopUpOptions(newOptions); }} className="h-8 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-[10px]">Bonus (€)</Label><Input type="number" value={option.bonus} onChange={(e) => { const newOptions = [...topUpOptions]; newOptions[index].bonus = parseInt(e.target.value); setTopUpOptions(newOptions); }} className="h-8 text-xs" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});