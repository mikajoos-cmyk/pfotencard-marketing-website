import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Award, Trash2, Layers, Briefcase, Upload, User, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchEmployees, fetchSignatures, saveSignatures, uploadImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface CertificatesSectionProps {
  certificateTemplates: any[];
  levels: any[];
  services: any[];
  levelTerm: string;
  deleteCertificateTemplate: (id: number) => void;
  setShowCertificateModal: (show: boolean) => void;
  onEditCertificateTemplate: (template: any) => void; // NEU
}

export const CertificatesSection = ({
  certificateTemplates,
  levels,
  services,
  levelTerm,
  deleteCertificateTemplate,
  setShowCertificateModal,
  onEditCertificateTemplate // NEU
}: CertificatesSectionProps) => {
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([]);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [uploadingSig, setUploadingSig] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees().then(setEmployees).catch(console.error);
    fetchSignatures().then(setSignatures).catch(console.error);
  }, []);

  const handleUploadSignature = async (employeeName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingSig(employeeName);
    try {
      // Nutze die vorhandene uploadImage Funktion aus der API
      const res = await uploadImage(file);
      
      const newSignatures = { ...signatures, [employeeName]: res.url };
      setSignatures(newSignatures);
      
      // Speichere in DB
      await saveSignatures(newSignatures);
      
      toast({ title: "Unterschrift gespeichert", description: `Unterschrift für ${employeeName} wurde erfolgreich hinterlegt.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Fehler", description: "Upload fehlgeschlagen.", variant: "destructive" });
    } finally {
      setUploadingSig(null);
    }
  };

  const handleDeleteSignature = async (employeeName: string) => {
    const newSignatures = { ...signatures };
    delete newSignatures[employeeName];
    setSignatures(newSignatures);
    await saveSignatures(newSignatures);
    toast({ title: "Unterschrift entfernt" });
  };

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
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditCertificateTemplate(tpl)}>
                    <Pencil size={14} className="text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteCertificateTemplate(tpl.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
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

      {/* --- NEUER BEREICH: MITARBEITER UNTERSCHRIFTEN --- */}
      <div className="mt-12 bg-card rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Mitarbeiter Unterschriften</h3>
          <p className="text-sm text-slate-500 mt-1">
            Hinterlege Unterschriften (als transparentes PNG) für deine Mitarbeiter. Wenn ein Mitarbeiter ein Zertifikat ausstellt, wird seine Unterschrift automatisch auf dem Dokument platziert.
          </p>
        </div>
        
        <div className="p-6 divide-y">
          {employees.map((emp) => (
            <div key={emp.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-700">{emp.name}</div>
                  <div className="text-xs text-slate-400">ID: {String(emp.id).substring(0,8)}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {signatures[emp.name] ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={signatures[emp.name]} 
                      alt="Unterschrift" 
                      className="h-12 w-auto max-w-[150px] object-contain border bg-white rounded p-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteSignature(emp.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id={`sig-upload-${emp.id}`}
                      className="hidden"
                      accept="image/png, image/jpeg"
                      onChange={(e) => handleUploadSignature(emp.name, e)}
                    />
                    <Label 
                      htmlFor={`sig-upload-${emp.id}`}
                      className={`flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer text-sm font-medium transition-colors ${uploadingSig === emp.name ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {uploadingSig === emp.name ? (
                        <span className="animate-pulse">Lädt...</span>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Unterschrift hochladen
                        </>
                      )}
                    </Label>
                  </div>
                )}
              </div>
            </div>
          ))}

          {employees.length === 0 && (
            <div className="text-center py-8 text-slate-500 italic text-sm">
              Keine Mitarbeiter gefunden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
