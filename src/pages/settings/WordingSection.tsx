import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Type } from 'lucide-react';
import React from 'react';

interface WordingSectionProps {
  levelTerm: string;
  setLevelTerm: (val: string) => void;
  vipTerm: string;
  setVipTerm: (val: string) => void;
}

export const WordingSection = React.memo(({
  levelTerm,
  setLevelTerm,
  vipTerm,
  setVipTerm
}: WordingSectionProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Type className="w-5 h-5" /> Bezeichnungen</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Level-Begriff</Label><Input value={levelTerm} onChange={(e) => setLevelTerm(e.target.value)} placeholder="z.B. Level, Klasse, Rang" className="mt-2" /></div>
            <div><Label>VIP-Begriff</Label><Input value={vipTerm} onChange={(e) => setVipTerm(e.target.value)} placeholder="z.B. VIP, Gold-Status" className="mt-2" /></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});