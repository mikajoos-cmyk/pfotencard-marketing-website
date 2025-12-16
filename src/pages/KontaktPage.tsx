import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export function KontaktPage() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="pt-20">
      {/* Header Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-6">
              Kontaktiere uns
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body">
              Hast du Fragen zu Pfotencard? Wir helfen dir gerne weiter. Fülle einfach das Formular aus oder kontaktiere uns direkt.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-card rounded-lg p-8 border border-border shadow-sm"
            >
              <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                Schreib uns eine Nachricht
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground font-body mb-2 block">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dein vollständiger Name"
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground font-body mb-2 block">
                    E-Mail *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="deine@email.de"
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-foreground font-body mb-2 block">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+49 123 456789"
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-foreground font-body mb-2 block">
                    Betreff *
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Worum geht es?"
                    className="bg-background text-foreground border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-foreground font-body mb-2 block">
                    Nachricht *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Deine Nachricht an uns..."
                    rows={6}
                    className="bg-background text-foreground border-border resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-secondary font-normal"
                >
                  <Send size={20} strokeWidth={1.5} className="mr-2" />
                  Nachricht senden
                </Button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Kontaktinformationen
                </h2>
                <p className="text-muted-foreground font-body mb-8">
                  Wir sind für dich da und beantworten gerne alle Fragen rund um Pfotencard. Kontaktiere uns über eine der folgenden Möglichkeiten.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail size={24} strokeWidth={1.5} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-sans font-medium text-foreground mb-1">
                      E-Mail
                    </h3>
                    <a
                      href="mailto:info@pfotencard.de"
                      className="text-muted-foreground hover:text-primary transition-colors font-body"
                    >
                      info@pfotencard.de
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Phone size={24} strokeWidth={1.5} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-sans font-medium text-foreground mb-1">
                      Telefon
                    </h3>
                    <a
                      href="tel:+491234567890"
                      className="text-muted-foreground hover:text-primary transition-colors font-body"
                    >
                      +49 123 456 7890
                    </a>
                    <p className="text-sm text-muted-foreground font-body mt-1">
                      Mo-Fr: 9:00 - 18:00 Uhr
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center">
                    <MapPin size={24} strokeWidth={1.5} className="text-tertiary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-sans font-medium text-foreground mb-1">
                      Adresse
                    </h3>
                    <p className="text-muted-foreground font-body">
                      Pfotencard GmbH<br />
                      Musterstraße 123<br />
                      12345 Musterstadt<br />
                      Deutschland
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border mt-8">
                <h3 className="text-lg font-sans font-medium text-foreground mb-3">
                  Häufig gestellte Fragen
                </h3>
                <p className="text-muted-foreground font-body mb-4">
                  Viele Antworten findest du bereits in unseren FAQs. Schau dort gerne zuerst vorbei!
                </p>
                <Button
                  variant="outline"
                  className="bg-background text-foreground border-border hover:bg-muted font-normal"
                  onClick={() => navigate('/faq')}
                >
                  Zu den FAQs
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section (Optional) */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MapPin size={48} strokeWidth={1.5} className="mx-auto mb-4 text-primary" />
                  <p className="font-body">Karte wird hier angezeigt</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
