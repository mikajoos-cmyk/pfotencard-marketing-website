import { useEffect } from 'react';
import { motion } from 'framer-motion';

export function ImpressumPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-8">Impressum</h1>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-2">Angaben gemäß § 5 TMG</h2>
              <p>
                [DEIN FIRMENNAME / EINGETRAGENER KAUFMANN]<br />
                [STRASSE UND HAUSNUMMER]<br />
                [PLZ UND ORT]<br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Kontakt</h2>
              <p>
                Telefon: [DEINE TELEFONNUMMER]<br />
                E-Mail: <a href="mailto:info@pfotencard.de" className="text-primary hover:underline">info@pfotencard.de</a>
              </p>
            </section>

            {/* Falls du eine USt-ID hast: */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Umsatzsteuer-ID</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                [DEINE UST-ID, z.B. DE123456789]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p>
                [DEIN VORNAME NACHNAME]<br />
                [ADRESSE WIE OBEN]
              </p>
            </section>

            <section className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground border border-border">
              <h2 className="text-base font-semibold mb-2 text-foreground">Haftungsausschluss (Disclaimer)</h2>
              <p className="mb-2">
                <strong>Haftung für Inhalte:</strong> Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
              </p>
              <p>
                <strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
            </section>

            {/* WICHTIG: KEIN LINK ZUR OS-PLATTFORM MEHR! Das wurde laut Gutachten entfernt. */}
          </div>
        </motion.div>
      </div>
    </main>
  );
}