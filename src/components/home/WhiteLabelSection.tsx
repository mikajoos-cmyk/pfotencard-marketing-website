import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette, Smartphone, Star, Upload, Paintbrush, Globe, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function WhiteLabelSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
              Deine Marke, deine App – komplett individualisiert
            </h2>
            <p className="text-lg text-muted-foreground font-body mb-8">
              Mit unserem White-Label-System erhältst du eine vollständig anpassbare App in deinem Corporate Design. Logo, Farben, Schriften – alles nach deinen Wünschen.
            </p>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Palette size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Vollständige Markenanpassung
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Logo, Farben, Schriften und Design-Elemente komplett nach deinen Vorgaben.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Smartphone size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Native App-Erlebnis
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Professionelle App für iOS und Android, die deine Kunden lieben werden.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Star size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Professioneller Auftritt
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Stärke deine Marke und hebe dich von der Konkurrenz ab.
                  </p>
                </div>
              </div>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-secondary font-normal">
                  Mehr erfahren zur Markenanpassung
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-sans font-bold text-foreground mb-2">
                    Mach Pfotencard zu deiner App.
                  </DialogTitle>
                  <DialogDescription className="text-lg text-muted-foreground font-body">
                    Deine Kunden buchen bei dir, nicht bei uns. Deshalb tritt Pfotencard komplett in den Hintergrund und lässt deine Marke strahlen.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Logo Section */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Upload size={24} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-sans font-bold text-foreground mb-2">
                        1. Dein Logo, überall.
                      </h3>
                      <p className="text-muted-foreground font-body mb-3">
                        Lade einfach dein Firmenlogo hoch. Es erscheint nicht nur oben in der App, sondern auch:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground font-body space-y-1 ml-2">
                        <li>Auf dem Login-Screen für deine Kunden</li>
                        <li>In der Navigation (Header)</li>
                        <li>Auf den generierten PDFs und Berichten</li>
                        <li>Als App-Icon auf dem Homescreen (bei Installation als Web-App)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Colors Section */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Paintbrush size={24} strokeWidth={1.5} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-sans font-bold text-foreground mb-2">
                        2. Deine Farben (Corporate Identity)
                      </h3>
                      <p className="text-muted-foreground font-body mb-3">
                        Passt die App zu deiner Webseite? Ja! Wähle deine Primärfarbe (für Buttons und Wichtiges) und deine Akzentfarbe.
                      </p>
                      <p className="text-muted-foreground font-body italic">
                        <strong>Beispiel:</strong> Du nutzt ein dunkles Rot? Die ganze App färbt sich automatisch um – von den Ladebalken bis zu den "Jetzt buchen"-Buttons.
                      </p>
                    </div>
                  </div>

                  {/* Domain Section */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center">
                      <Globe size={24} strokeWidth={1.5} className="text-tertiary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-sans font-bold text-foreground mb-2">
                        3. Deine eigene Web-Adresse (Domain)
                      </h3>
                      <p className="text-muted-foreground font-body mb-3">
                        Deine Kunden müssen sich keine komplizierten Links merken. Du erhältst deine eigene Subdomain:
                      </p>
                      <div className="bg-muted rounded-lg p-3 mb-3 font-mono text-sm text-foreground">
                        <div>hundeschule-mayer.pfotencard.de</div>
                        <div>bello-akademie.pfotencard.de</div>
                      </div>
                      <p className="text-muted-foreground font-body text-sm">
                        <strong>Optional im Verband-Paket:</strong> Nutze komplett deine eigene Domain wie <span className="font-mono">app.deine-seite.de</span>
                      </p>
                    </div>
                  </div>

                  {/* Wording Section */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MessageSquare size={24} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-sans font-bold text-foreground mb-2">
                        4. Deine Sprache (Wording)
                      </h3>
                      <p className="text-muted-foreground font-body mb-3">
                        Jede Hundeschule ist anders. Passt der Begriff "Level" nicht zu deinem Konzept?
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground font-body space-y-1 ml-2 mb-3">
                        <li>Ändere "Level" zu "Klasse", "Modul" oder "Baustein"</li>
                        <li>Benenne den "VIP-Status" um in "Rudel-Chef" oder "Premium-Pfote"</li>
                      </ul>
                      <p className="text-muted-foreground font-body">
                        Die App übernimmt deine Begriffe in allen Menüs automatisch.
                      </p>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 text-center mt-8">
                    <h3 className="text-xl font-sans font-bold text-foreground mb-3">
                      Bereit für deinen professionellen Auftritt?
                    </h3>
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate('/anmelden');
                      }}
                    >
                      Jetzt Branding testen (14 Tage kostenlos)
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <img
              src="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_4.png"
              alt="branded app smartphone pair"
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
