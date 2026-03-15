import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Wallet, Trash2, Plus } from 'lucide-react';
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
}

export const TopupSection = React.memo(({
  allowCustomTopUp,
  setAllowCustomTopUp,
  topUpOptions,
  setTopUpOptions
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

          <div className="space-y-4">
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