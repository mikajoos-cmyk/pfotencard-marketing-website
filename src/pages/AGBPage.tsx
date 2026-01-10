import { useEffect } from 'react';
import { motion } from 'framer-motion';

export function AGBPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">Allgemeine Geschäftsbedingungen</h1>
          <p className="text-muted-foreground mb-8">Stand: Januar 2026 | B2B Software-as-a-Service</p>

          <div className="space-y-8 text-foreground/90 leading-relaxed">

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 1 Geltungsbereich & Vertragspartner</h2>
              <p>
                (1) Diese AGB gelten für alle Verträge zwischen <strong>[DEIN FIRMENNAME]</strong> ("Anbieter") und dem Kunden ("Kunde") über die Nutzung der Software "Pfotencard".
                <br />
                (2) Das Angebot richtet sich <strong>ausschließlich an Unternehmer</strong> (§ 14 BGB). Ein Vertragsschluss mit Verbrauchern ist ausgeschlossen.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 2 Leistungsgegenstand & Verfügbarkeit</h2>
              <p>
                (1) Der Anbieter stellt dem Kunden die Software als SaaS-Lösung zur Verwaltung von Hundeschulen bereit.
                <br />
                (2) <strong>Verfügbarkeit:</strong> Der Anbieter gewährleistet eine Verfügbarkeit von 99,0% im Jahresmittel am Übergabepunkt zum Internet. Wartungsarbeiten werden soweit möglich nachts durchgeführt.
                <br />
                (3) Der Anbieter ist berechtigt, die Software weiterzuentwickeln und Funktionen zu ändern, soweit dies die wesentliche Leistungsfähigkeit nicht beeinträchtigt.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 3 Vertragsschluss & Testphase</h2>
              <p>
                (1) Der Vertrag kommt durch Online-Registrierung zustande.
                <br />
                (2) <strong>14 Tage Testphase:</strong> Jeder Neukunde erhält eine kostenlose Testphase. Diese endet automatisch, ohne dass es einer Kündigung bedarf. Für eine Weiternutzung muss ein kostenpflichtiges Abo gebucht werden.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 4 Preise & Zahlungsbedingungen</h2>
              <p>
                (1) Es gelten die vereinbarten Nettopreise zzgl. gesetzlicher USt.
                <br />
                (2) Die Zahlung erfolgt via Stripe (Kreditkarte/Lastschrift) im Voraus für die jeweilige Laufzeit.
                <br />
                (3) Gerät der Kunde in Verzug, darf der Anbieter den Zugang zur Software nach vorheriger Androhung vorübergehend sperren ("Zurückbehaltungsrecht").
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 5 Laufzeit & Kündigung</h2>
              <p>
                (1) <strong>Monatsabo:</strong> Laufzeit 1 Monat. Kündbar jederzeit zum Ende des aktuellen Zeitraums.
                <br />
                (2) <strong>Jahresabo:</strong> Laufzeit 12 Monate. Automatische Verlängerung um weitere 12 Monate, wenn nicht 1 Monat vor Ablauf gekündigt wird.
                <br />
                (3) Die Kündigung kann per Klick im Dashboard erfolgen.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 6 Datenschutz & Auftragsverarbeitung</h2>
              <p>
                Soweit der Kunde personenbezogene Daten Dritter (Endkunden) in der Software verarbeitet, schließen die Parteien einen <strong>Auftragsverarbeitungsvertrag (AVV)</strong> gemäß Art. 28 DSGVO. Dieser wird dem Kunden im Dashboard bereitgestellt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">§ 7 Haftung</h2>
              <p>
                (1) Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit.
                <br />
                (2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), begrenzt auf den vertragstypischen Schaden.
                <br />
                (3) Für den Verlust von Daten haftet der Anbieter nur, soweit der Schaden auch bei ordnungsgemäßer Datensicherung durch den Kunden (Export-Funktion) entstanden wäre.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </main>
  );
}