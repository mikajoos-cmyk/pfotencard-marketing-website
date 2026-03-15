import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Video, 
  FileText, 
  ExternalLink, 
  Loader2, 
  Save, 
  X,
  Upload
} from 'lucide-react';
import { 
  fetchHomeworkTemplates, 
  createHomeworkTemplate, 
  updateHomeworkTemplate, 
  deleteHomeworkTemplate, 
  uploadHomeworkFiles 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ExerciseTemplate {
  id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  file_url: string | null;
  file_name: string | null;
  attachments: {
    file_url: string;
    file_name: string;
    type: string;
  }[];
}

export const HomeworkSection = () => {
  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Partial<ExerciseTemplate> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await fetchHomeworkTemplates();
      setTemplates(data);
    } catch (error: any) {
      toast({
        title: "Fehler beim Laden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: ExerciseTemplate) => {
    setEditingTemplate({ ...template });
  };

  const handleCreate = () => {
    setEditingTemplate({
      title: '',
      description: '',
      video_url: '',
      file_url: '',
      file_name: '',
    });
  };

  const handleSave = async () => {
    if (!editingTemplate || !editingTemplate.title) return;
    
    try {
      setIsSaving(true);
      if (editingTemplate.id) {
        await updateHomeworkTemplate(editingTemplate.id, editingTemplate);
        toast({ title: "Vorlage aktualisiert" });
      } else {
        await createHomeworkTemplate(editingTemplate);
        toast({ title: "Vorlage erstellt" });
      }
      setEditingTemplate(null);
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Fehler beim Speichern",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Möchtest du diese Vorlage wirklich löschen?")) return;
    
    try {
      await deleteHomeworkTemplate(id);
      toast({ title: "Vorlage gelöscht" });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setUploadingFile(true);
      const filesArray = Array.from(selectedFiles);
      const res = await uploadHomeworkFiles(filesArray);
      
      const newAttachments = res.all_files.map((f: any) => ({
        file_url: f.file_url,
        file_name: f.file_name,
        type: f.type
      }));

      setEditingTemplate(prev => ({
        ...prev,
        attachments: [...(prev?.attachments || []), ...newAttachments]
      }));
      toast({ title: `${newAttachments.length} Datei(en) erfolgreich hochgeladen` });
    } catch (error: any) {
      toast({
        title: "Upload fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!editingTemplate ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Trainingskatalog</h2>
            <Button onClick={handleCreate} className="gap-2">
              <Plus size={16} /> Vorlage erstellen
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <FileText className="mx-auto text-muted-foreground/20 mb-2" size={48} />
                <p className="text-muted-foreground">Noch keine Vorlagen erstellt.</p>
              </div>
            )}
            {templates.map(template => (
              <Card key={template.id} className="group hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(template.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {template.description || "Keine Beschreibung hinterlegt."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.video_url && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                        <ExternalLink size={12} /> Video-Link
                      </span>
                    )}
                    {template.file_url && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                        <FileText size={12} /> {template.file_name || 'PDF'}
                      </span>
                    )}
                    {template.attachments?.map((att, idx) => (
                      <span key={idx} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${att.type === 'video' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {att.type === 'video' ? <Video size={12} /> : <FileText size={12} />}
                        {att.file_name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingTemplate.id ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingTemplate(null)}>
                <X size={20} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel der Übung</Label>
              <Input 
                id="title"
                placeholder="z.B. Rückruftraining"
                value={editingTemplate.title} 
                onChange={e => setEditingTemplate({...editingTemplate, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung / Anleitung</Label>
              <Textarea 
                id="description"
                placeholder="Schreibe hier die Schritte der Übung auf..."
                rows={4}
                value={editingTemplate.description || ''} 
                onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video-Link (YouTube / Vimeo)</Label>
              <div className="relative">
                <Video className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                <Input 
                  id="video_url"
                  className="pl-10"
                  placeholder="https://youtube.com/watch?v=..."
                  value={editingTemplate.video_url || ''} 
                  onChange={e => setEditingTemplate({...editingTemplate, video_url: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Datei-Anhänge (PDF / PowerPoint / Bilder / Video)</Label>
              <div className="grid grid-cols-1 gap-2">
                {editingTemplate.attachments?.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {file.type === 'video' ? <Video className="text-primary shrink-0" size={18} /> : <FileText className="text-primary shrink-0" size={18} />}
                      <span className="text-sm truncate">{file.file_name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive h-8 w-8" 
                      onClick={() => setEditingTemplate({
                        ...editingTemplate, 
                        attachments: editingTemplate.attachments?.filter((_, i) => i !== index)
                      })}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-20 border-dashed border-2 flex flex-col gap-2 relative"
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Upload size={20} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Dateien oder Videos hinzufügen</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                      accept="image/*,.pdf,.pptx,.ppt,.docx,video/*"
                      multiple
                    />
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button onClick={handleSave} className="flex-1 gap-2" disabled={isSaving || !editingTemplate.title}>
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Speichern
              </Button>
              <Button variant="outline" onClick={() => setEditingTemplate(null)} disabled={isSaving}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
