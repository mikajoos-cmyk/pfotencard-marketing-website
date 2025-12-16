import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const faqCategories = [
  {
    category: 'Allgemein',
    questions: [
      {
        question: 'Was ist Pfotencard?',
        answer: 'Pfotencard ist eine digitale Verwaltungslösung für Hundeschulen. Mit unserer White-Label-App können Sie Ihre Wertkarten digitalisieren, Kunden verwalten und durch ein innovatives Level-System langfristig binden.',
      },
      {
        question: 'Für wen ist Pfotencard geeignet?',
        answer: 'Pfotencard ist ideal für Hundeschulen jeder Größe – von Einzeltrainern bis zu großen Organisationen und Verbänden. Unsere verschiedenen Preispläne passen sich Ihren Bedürfnissen an.',
      },
      {
        question: 'Brauche ich technische Kenntnisse?',
        answer: 'Nein! Pfotencard ist so entwickelt, dass Sie keine Programmierkenntnisse benötigen. Die Einrichtung ist intuitiv und wir begleiten Sie bei jedem Schritt.',
      },
    ],
  },
  {
    category: 'Funktionen',
    questions: [
      {
        question: 'Was bedeutet White-Label?',
        answer: 'White-Label bedeutet, dass die App vollständig in Ihrem Branding erscheint. Ihr Logo, Ihre Farben, Ihre Subdomain – für Ihre Kunden sieht es aus wie Ihre eigene App.',
      },
      {
        question: 'Wie funktioniert das Level-System?',
        answer: 'Das Level-System ist ein Gamification-Feature, bei dem Hunde durch Teilnahme an Kursen Punkte sammeln und Level aufsteigen. Von "Welpe" bis "Hundeführerschein" – das motiviert Kunden und stärkt die Bindung.',
      },
      {
        question: 'Kann ich automatische Boni einrichten?',
        answer: 'Ja! Sie können Regeln definieren, z.B. "Bei 50€ Aufladung gibt es 5€ Bonus". Das System verwaltet dies automatisch und Ihre Buchhaltung bleibt korrekt.',
      },
      {
        question: 'Können Kunden Dokumente hochladen?',
        answer: 'Ja, Kunden können wichtige Dokumente wie Impfpässe, Versicherungsnachweise oder Gesundheitszeugnisse direkt in der App hochladen und verwalten.',
      },
    ],
  },
  {
    category: 'Preise & Abrechnung',
    questions: [
      {
        question: 'Gibt es eine kostenlose Testphase?',
        answer: 'Ja! Sie können Pfotencard 14 Tage lang kostenlos und unverbindlich testen. Keine Kreditkarte erforderlich.',
      },
      {
        question: 'Kann ich monatlich kündigen?',
        answer: 'Bei monatlicher Zahlung können Sie jederzeit zum Monatsende kündigen. Bei jährlicher Zahlung profitieren Sie von 2 Monaten gratis.',
      },
      {
        question: 'Gibt es versteckte Kosten?',
        answer: 'Nein! Der angegebene Preis ist alles, was Sie zahlen. Keine Setup-Gebühren, keine versteckten Kosten.',
      },
      {
        question: 'Was passiert nach der Testphase?',
        answer: 'Nach der Testphase wählen Sie einen Preisplan. Wenn Sie sich nicht entscheiden, wird Ihr Account pausiert – Ihre Daten bleiben aber erhalten.',
      },
    ],
  },
  {
    category: 'Technisches',
    questions: [
      {
        question: 'Auf welchen Geräten funktioniert Pfotencard?',
        answer: 'Pfotencard funktioniert auf allen modernen Smartphones (iOS und Android) sowie auf Desktop-Computern über den Webbrowser.',
      },
      {
        question: 'Sind meine Daten sicher?',
        answer: 'Ja! Wir verwenden modernste Verschlüsselung und hosten alle Daten in Deutschland gemäß DSGVO. Ihre Daten gehören Ihnen und werden niemals an Dritte weitergegeben.',
      },
      {
        question: 'Kann ich meine Daten exportieren?',
        answer: 'Ja, Sie können jederzeit alle Ihre Daten als CSV oder PDF exportieren – ideal für Ihre Buchhaltung oder bei einem Anbieterwechsel.',
      },
      {
        question: 'Gibt es eine API?',
        answer: 'Im Verband-Plan haben Sie Zugriff auf unsere API, um Pfotencard mit anderen Systemen zu verbinden.',
      },
    ],
  },
  {
    category: 'Support',
    questions: [
      {
        question: 'Welchen Support bietet ihr?',
        answer: 'Alle Pläne beinhalten E-Mail-Support. Pro-Kunden erhalten Prioritäts-Support, Verband-Kunden einen dedizierten Ansprechpartner.',
      },
      {
        question: 'Gibt es Schulungen?',
        answer: 'Ja! Wir bieten Video-Tutorials und auf Anfrage auch persönliche Onboarding-Sessions an.',
      },
      {
        question: 'Wie schnell bekomme ich Hilfe?',
        answer: 'Wir antworten in der Regel innerhalb von 24 Stunden. Prioritäts-Support-Kunden erhalten Antworten innerhalb von 4 Stunden.',
      },
    ],
  },
];

export function FAQPage() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(faqCategories);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(faqCategories);
    } else {
      const filtered = faqCategories
        .map((category) => ({
          ...category,
          questions: category.questions.filter(
            (q) =>
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.questions.length > 0);
      setFilteredCategories(filtered);
    }
  }, [searchQuery]);

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
              Häufig gestellte Fragen
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body mb-8">
              Hier findest du Antworten auf die wichtigsten Fragen zu Pfotencard. Solltest du weitere Fragen haben, kontaktiere uns gerne.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search
                size={20}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Frage durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-background text-foreground border-border h-12"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {filteredCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${categoryIndex}-${index}`}
                      className="bg-card rounded-lg border border-border px-6"
                    >
                      <AccordionTrigger className="text-left font-body font-medium text-foreground hover:text-primary">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground font-body">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}

            {filteredCategories.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground font-body text-lg">
                  Keine Ergebnisse für "{searchQuery}" gefunden.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
              Noch Fragen?
            </h2>
            <p className="text-lg text-muted-foreground font-body mb-8">
              Wir helfen dir gerne weiter! Kontaktiere unser Support-Team oder starte direkt deine kostenlose Testphase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
                onClick={() => navigate('/kontakt')}
              >
                Kontakt aufnehmen
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-background text-foreground border-border hover:bg-muted font-normal"
                onClick={() => navigate('/anmelden')}
              >
                Kostenlos testen
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
