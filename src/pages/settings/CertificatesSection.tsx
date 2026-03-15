import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Award, Trash2, Layers, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

interface CertificatesSectionProps {
  certificateTemplates: any[];
  levels: any[];
  services: any[];
  levelTerm: string;
  deleteCertificateTemplate: (id: number) => void;
  setShowCertificateModal: (show: boolean) => void;
}

export const CertificatesSection = ({
  certificateTemplates,
  levels,
  services,
  levelTerm,
  deleteCertificateTemplate,
  setShowCertificateModal
}: CertificatesSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Teilnahmebescheinigungen</h3>
          <p className="text-sm text-muted-foreground">
            Erstelle automatische Zertifikate für Kursabschlüsse oder das Erreichen von neuen {levelTerm}en.
          </p>
        </div>
        <Button onClick={() => setShowCertificateModal(true)}>
          <Plus size={16} className="mr-2" /> Neue Vorlage
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificateTemplates.map((tpl) => (
          <Card key={tpl.id} className="group hover:border-primary transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Award className="text-primary" size={18} />
                  {tpl.name}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteCertificateTemplate(tpl.id)}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </CardTitle>
              <CardDescription className="flex items-center gap-1 text-xs">
                {tpl.trigger_type === 'level_achieved' ? (
                  <>
                    <Layers size={12} />
                    {levelTerm}: {levels.find(l => l.id === tpl.target_id)?.name || 'Unbekannt'}
                  </>
                ) : (
                  <>
                    <Briefcase size={12} />
                    Leistung: {services.find(s => s.id === tpl.target_id)?.name || 'Unbekannte Leistung'}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/30 p-2 rounded">
                Layout: {tpl.layout_id.replace('layout_', '')}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {certificateTemplates.length === 0 && (
          <Card className="col-span-full border-2 border-dashed bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Award size={48} className="mb-4 text-muted/20" />
              <p className="font-medium text-foreground">Noch keine Zertifikats-Vorlagen vorhanden.</p>
              <p className="text-sm mt-1 max-w-xs">Erstelle deine erste Vorlage, um Kunden bei Kursabschluss oder Level-Aufstieg automatisch zu belohnen.</p>
              <Button variant="outline" className="mt-6" onClick={() => setShowCertificateModal(true)}>
                <Plus size={16} className="mr-2" /> Jetzt erste Vorlage erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
