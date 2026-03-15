import { motion, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import React from 'react';

interface Service {
  id?: number;
  name: string;
  category: string;
  price: number;
  rank_order: number;
}

interface ServicesSectionProps {
  services: Service[];
  setServices: (services: Service[]) => void;
  getCategoryLabel: (category: string) => string;
  setEditingService: (service: Service | null) => void;
  setServiceForm: (form: { name: string; category: string; price: number; rank_order: number }) => void;
  setIsServiceDialogOpen: (open: boolean) => void;
  handleDeleteService: (index: number) => void;
}

export const ServicesSection = React.memo(({
  services,
  setServices,
  getCategoryLabel,
  setEditingService,
  setServiceForm,
  setIsServiceDialogOpen,
  handleDeleteService
}: ServicesSectionProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Leistungen</CardTitle>
            <CardDescription>Definiere alle Trainingsarten, die du anbietest.</CardDescription>
          </div>
          <Button onClick={() => { setEditingService(null); setServiceForm({ name: '', category: 'training', price: 0, rank_order: 0 }); setIsServiceDialogOpen(true); }} size="sm" className="h-9">
            <Plus size={16} className="mr-2" /> Leistung hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          <Reorder.Group axis="y" values={services} onReorder={setServices} className="space-y-2">
            {services.map((service, index) => (
              <Reorder.Item key={service.id || index} value={service} className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors group">
                <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"><GripVertical size={20} /></div>
                <div className="flex-1">
                  <span className="font-semibold block">{service.name}</span>
                  <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded inline-block mt-1">{getCategoryLabel(service.category)}</span>
                </div>
                <div className="font-mono text-sm font-semibold">{service.price.toFixed(2)}€</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setEditingService(service); setServiceForm({ name: service.name, category: service.category, price: service.price, rank_order: service.rank_order }); setIsServiceDialogOpen(true); }}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteService(index)}><Trash2 size={14} /></Button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </CardContent>
      </Card>
    </motion.div>
  );
});