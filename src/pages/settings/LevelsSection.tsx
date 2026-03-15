import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Award, GripVertical, Pencil, Trash2, Plus, Upload, Check } from 'lucide-react';
import React from 'react';

interface LevelRequirement {
  id?: number;
  training_type_id: number;
  required_count: number;
  is_additional?: boolean;
}

interface Level {
  id?: number;
  name: string;
  rank_order: number;
  badgeImage?: string;
  color?: string;
  has_additional_requirements?: boolean;
  requirements: LevelRequirement[];
}

interface LevelsSectionProps {
  levels: Level[];
  setLevels: (levels: Level[]) => void;
  levelTerm: string;
  handleDeleteLevel: (index: number) => void;
  handleToggleAdditional: (index: number, val: boolean) => void;
  handleDeleteRequirement: (levelIndex: number, reqIndex: number) => void;
  getServiceName: (id: number) => string;
  handleUpdateRequirement: (levelIndex: number, reqIndex: number, quantity: number) => void;
  setCurrentLevelIndex: (index: number) => void;
  setIsRequirementDialogOpen: (open: boolean) => void;
  setIsAdditionalDialogOpen: (open: boolean) => void;
  setUploadingLevelIndex: (index: number | null) => void;
  uploadingLevelIndex: number | null;
  handleLevelBadgeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LevelsSection = React.memo(({
  levels,
  setLevels,
  levelTerm,
  handleDeleteLevel,
  handleToggleAdditional,
  handleDeleteRequirement,
  getServiceName,
  handleUpdateRequirement,
  setCurrentLevelIndex,
  setIsRequirementDialogOpen,
  setIsAdditionalDialogOpen,
  setUploadingLevelIndex,
  uploadingLevelIndex,
  handleLevelBadgeChange
}: LevelsSectionProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5" /> {levelTerm}-System</CardTitle>
            <CardDescription>Definiere die Hierarchie deiner {levelTerm} und deren Anforderungen.</CardDescription>
          </div>
          <Button onClick={() => setLevels([...levels, { name: 'Neues ' + levelTerm, rank_order: levels.length + 1, requirements: [] }])} size="sm" className="h-9">
            <Plus size={16} className="mr-2" /> {levelTerm} hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          <Reorder.Group axis="y" values={levels} onReorder={setLevels} className="space-y-4">
            {levels.map((level, lIndex) => (
              <Reorder.Item key={level.id || lIndex} value={level} className="p-5 bg-card border rounded-xl hover:border-primary/50 transition-all shadow-sm group relative">
                <div className="flex items-start gap-4">
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-2"><GripVertical size={20} /></div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="relative group/badge cursor-pointer" onClick={() => { setUploadingLevelIndex(lIndex); document.getElementById('level-badge-input')?.click(); }}>
                          <div className={`w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all bg-muted/50 group-hover/badge:border-primary/50 group-hover/badge:bg-primary/5 ${level.badgeImage ? 'border-primary/30' : 'border-border'}`}>
                            {level.badgeImage ? <img src={level.badgeImage} className="w-10 h-10 object-contain" alt="Badge" /> : <Upload size={18} className="text-muted-foreground" />}
                          </div>
                          <div className="absolute -top-1 -right-1 opacity-0 group-hover/badge:opacity-100 transition-opacity"><div className="bg-primary text-white p-1 rounded-full shadow-sm"><Pencil size={8} /></div></div>
                        </div>
                        <div className="flex-1">
                          <Input value={level.name} onChange={(e) => { const newLevels = [...levels]; newLevels[lIndex].name = e.target.value; setLevels(newLevels); }} className="font-bold text-lg h-10 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/20 px-0" />
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Rang {lIndex + 1}</span>
                            <div className="flex items-center gap-1.5 ml-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color || '#94a3b8' }} /><Input type="color" value={level.color || '#94a3b8'} onChange={(e) => { const newLevels = [...levels]; newLevels[lIndex].color = e.target.value; setLevels(newLevels); }} className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer" /></div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4" onClick={() => handleDeleteLevel(lIndex)}><Trash2 size={16} /></Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between"><Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Basis-Anforderungen</Label></div>
                        <div className="space-y-2">
                          <AnimatePresence>
                            {level.requirements.filter(r => !r.is_additional).map((req, rIndex) => (
                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={req.id || rIndex} className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg group/req border border-transparent hover:border-primary/20 transition-all">
                                <div className="p-1 bg-primary/10 rounded-md"><Check size={12} className="text-primary" /></div>
                                <span className="text-sm flex-1 font-medium">{getServiceName(req.training_type_id)}</span>
                                <Input type="number" value={req.required_count} onChange={(e) => handleUpdateRequirement(lIndex, level.requirements.indexOf(req), parseInt(e.target.value))} className="w-14 h-8 text-center text-xs font-bold bg-background" />
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover/req:opacity-100 transition-opacity" onClick={() => handleDeleteRequirement(lIndex, level.requirements.indexOf(req))}><Trash2 size={12} /></Button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <Button variant="outline" size="sm" className="w-full border-dashed border-2 h-9 text-xs font-medium hover:bg-primary/5 hover:border-primary/50" onClick={() => { setCurrentLevelIndex(lIndex); setIsRequirementDialogOpen(true); }}><Plus size={14} className="mr-2" /> Anforderung</Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Optionale Module</Label><Switch checked={level.has_additional_requirements} onCheckedChange={(val) => handleToggleAdditional(lIndex, val)} className="scale-75 origin-left" /></div>
                        </div>
                        <div className={`space-y-2 transition-opacity duration-300 ${!level.has_additional_requirements ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                          <AnimatePresence>
                            {level.requirements.filter(r => r.is_additional).map((req, rIndex) => (
                              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={req.id || rIndex} className="flex items-center gap-2 bg-blue-500/5 p-2 rounded-lg group/req border border-transparent hover:border-blue-500/20 transition-all">
                                <div className="p-1 bg-blue-500/10 rounded-md text-blue-600 font-bold text-[10px]">ALT</div>
                                <span className="text-sm flex-1 font-medium">{getServiceName(req.training_type_id)}</span>
                                <Input type="number" value={req.required_count} onChange={(e) => handleUpdateRequirement(lIndex, level.requirements.indexOf(req), parseInt(e.target.value))} className="w-14 h-8 text-center text-xs font-bold bg-background" />
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover/req:opacity-100 transition-opacity" onClick={() => handleDeleteRequirement(lIndex, level.requirements.indexOf(req))}><Trash2 size={12} /></Button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <Button variant="outline" size="sm" className="w-full border-dashed border-2 h-9 text-xs font-medium hover:bg-blue-500/5 hover:border-blue-500/50" onClick={() => { setCurrentLevelIndex(lIndex); setIsAdditionalDialogOpen(true); }}><Plus size={14} className="mr-2" /> Wahlmodul</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <input type="file" id="level-badge-input" className="hidden" accept="image/*" onChange={handleLevelBadgeChange} />
        </CardContent>
      </Card>
    </motion.div>
  );
});