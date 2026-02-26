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
              <h2 className="text-xl font-semibold mb-2">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz):</h2>
              <p>
                [Ihr Firmenname, z. B. Max Mustermann Softwarelösungen oder Muster GmbH]<br />
                [Ihre Straße und Hausnummer]<br />
                [Ihre PLZ und Ort]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Vertreten durch:</h2>
              <p>
                [Vor- und Nachname des Inhabers bzw. der Geschäftsführer]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Kontakt:</h2>
              <p>
                Telefon: [Ihre Telefonnummer]<br />
                E-Mail: <a href="mailto:info@ihredomain.de" className="text-primary hover:underline">info@ihredomain.de</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Registereintrag:</h2>
              <p>
                Eintragung im Handelsregister.<br />
                Registergericht: [Name des Gerichts, z. B. Amtsgericht München]<br />
                Registernummer: [Ihre HRB/HRA Nummer]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Umsatzsteuer-ID:</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                [Ihre USt-IdNr., z. B. DE123456789]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Verbraucherstreitbeilegung/Universalschlichtungsstelle:</h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}