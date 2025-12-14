import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone } from 'lucide-react';

export function ImpressumPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20">
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-8">
              Impressum
            </h1>

            <div className="prose prose-lg max-w-none">
              <div className="bg-card rounded-lg border border-border p-8 mb-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Angaben gemäß § 5 TMG
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Building2 size={24} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                        Firmenanschrift
                      </h3>
                      <p className="text-muted-foreground font-body">
                        Pfotencard GmbH<br />
                        Musterstraße 123<br />
                        12345 Musterstadt<br />
                        Deutschland
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail size={24} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                        Kontakt
                      </h3>
                      <p className="text-muted-foreground font-body">
                        E-Mail: <a href="mailto:info@pfotencard.de" className="text-primary hover:underline">info@pfotencard.de</a><br />
                        Telefon: <a href="tel:+491234567890" className="text-primary hover:underline">+49 123 456 7890</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-8 mb-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Vertreten durch
                </h2>
                <p className="text-muted-foreground font-body">
                  Geschäftsführer: Max Mustermann
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8 mb-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Registereintrag
                </h2>
                <p className="text-muted-foreground font-body">
                  Eintragung im Handelsregister<br />
                  Registergericht: Amtsgericht Musterstadt<br />
                  Registernummer: HRB 12345
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8 mb-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Umsatzsteuer-ID
                </h2>
                <p className="text-muted-foreground font-body">
                  Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                  DE123456789
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8 mb-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
                </h2>
                <p className="text-muted-foreground font-body">
                  Max Mustermann<br />
                  Musterstraße 123<br />
                  12345 Musterstadt
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8 mb-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  EU-Streitschlichtung
                </h2>
                <p className="text-muted-foreground font-body">
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                  <a 
                    href="https://ec.europa.eu/consumers/odr/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr/
                  </a>
                  <br /><br />
                  Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8 mb-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Verbraucherstreitbeilegung / Universalschlichtungsstelle
                </h2>
                <p className="text-muted-foreground font-body">
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-6">
                  Haftungsausschluss
                </h2>
                
                <h3 className="text-lg font-sans font-medium text-foreground mb-3 mt-6">
                  Haftung für Inhalte
                </h3>
                <p className="text-muted-foreground font-body mb-4">
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                </p>

                <h3 className="text-lg font-sans font-medium text-foreground mb-3 mt-6">
                  Haftung für Links
                </h3>
                <p className="text-muted-foreground font-body mb-4">
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>

                <h3 className="text-lg font-sans font-medium text-foreground mb-3 mt-6">
                  Urheberrecht
                </h3>
                <p className="text-muted-foreground font-body">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
