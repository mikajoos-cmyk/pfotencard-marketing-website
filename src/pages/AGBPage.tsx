import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, AlertCircle } from 'lucide-react';

export function AGBPage() {
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
            <div className="flex items-center gap-4 mb-8">
              <Scale size={48} strokeWidth={1.5} className="text-primary" />
              <h1 className="text-4xl md:text-5xl font-sans font-bold text-foreground">
                Allgemeine Geschäftsbedingungen
              </h1>
            </div>

            <p className="text-lg text-muted-foreground font-body mb-12">
              Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Pfotencard-Plattform und -Services.
            </p>

            <div className="space-y-8">
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <FileText size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      § 1 Geltungsbereich
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") der Pfotencard GmbH (nachfolgend "Anbieter") gelten für alle Verträge über die Nutzung der Pfotencard-Plattform und der damit verbundenen Services.
                    </p>
                    <p className="text-muted-foreground font-body mb-4">
                      (2) Abweichende, entgegenstehende oder ergänzende Allgemeine Geschäftsbedingungen des Kunden werden nur dann und insoweit Vertragsbestandteil, als der Anbieter ihrer Geltung ausdrücklich schriftlich zugestimmt hat.
                    </p>
                    <p className="text-muted-foreground font-body">
                      (3) Diese AGB gelten auch für alle zukünftigen Geschäftsbeziehungen, auch wenn sie nicht nochmals ausdrücklich vereinbart werden.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 2 Vertragsgegenstand
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Der Anbieter stellt dem Kunden eine cloudbasierte Software-as-a-Service (SaaS) Lösung zur Verwaltung von Hundeschulen zur Verfügung. Die Leistungen umfassen insbesondere:
                </p>
                <ul className="list-disc list-inside text-muted-foreground font-body space-y-2 mb-4">
                  <li>Digitale Verwaltung von Wertkarten und Kundendaten</li>
                  <li>White-Label-App mit individuellem Branding</li>
                  <li>Level-System und Gamification-Features</li>
                  <li>Finanzverwaltung und Reporting-Tools</li>
                  <li>Technischer Support gemäß gewähltem Tarif</li>
                </ul>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Der konkrete Leistungsumfang ergibt sich aus dem vom Kunden gewählten Tarif (Starter, Pro oder Verband).
                </p>
                <p className="text-muted-foreground font-body">
                  (3) Der Anbieter ist berechtigt, die Services weiterzuentwickeln und zu verbessern. Wesentliche Änderungen, die den Funktionsumfang einschränken, werden dem Kunden rechtzeitig mitgeteilt.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 3 Vertragsschluss und Registrierung
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Der Vertragsschluss erfolgt durch Registrierung auf der Website des Anbieters und Auswahl eines Tarifs.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Mit der Registrierung gibt der Kunde ein verbindliches Angebot zum Abschluss eines Nutzungsvertrags ab. Der Anbieter nimmt dieses Angebot durch Freischaltung des Kundenkontos an.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (3) Der Kunde ist verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen und diese bei Änderungen unverzüglich zu aktualisieren.
                </p>
                <p className="text-muted-foreground font-body">
                  (4) Der Kunde ist für die Geheimhaltung seiner Zugangsdaten verantwortlich und hat diese vor dem Zugriff Dritter zu schützen.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 4 Kostenlose Testphase
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Neukunden erhalten eine 14-tägige kostenlose Testphase, in der sie die Services unverbindlich testen können.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Während der Testphase stehen alle Funktionen des gewählten Tarifs zur Verfügung.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (3) Die Testphase endet automatisch nach 14 Tagen. Eine Kündigung ist nicht erforderlich.
                </p>
                <p className="text-muted-foreground font-body">
                  (4) Nach Ende der Testphase kann der Kunde einen kostenpflichtigen Tarif wählen. Ohne Tarifwahl wird das Konto pausiert, die Daten bleiben jedoch für 30 Tage gespeichert.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 5 Preise und Zahlung
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Es gelten die zum Zeitpunkt der Bestellung auf der Website angegebenen Preise. Alle Preise verstehen sich zzgl. der gesetzlichen Umsatzsteuer.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Die Abrechnung erfolgt wahlweise monatlich oder jährlich im Voraus. Bei jährlicher Zahlung gewährt der Anbieter einen Rabatt von 2 Monaten.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (3) Die Zahlung erfolgt per Lastschrift, Kreditkarte oder Überweisung.
                </p>
                <p className="text-muted-foreground font-body">
                  (4) Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zu den Services zu sperren. Verzugszinsen werden gemäß gesetzlicher Regelung berechnet.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 6 Vertragslaufzeit und Kündigung
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Bei monatlicher Zahlung beträgt die Mindestvertragslaufzeit einen Monat. Der Vertrag verlängert sich automatisch um jeweils einen weiteren Monat, wenn er nicht mit einer Frist von 14 Tagen zum Monatsende gekündigt wird.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Bei jährlicher Zahlung beträgt die Mindestvertragslaufzeit ein Jahr. Der Vertrag verlängert sich automatisch um jeweils ein weiteres Jahr, wenn er nicht mit einer Frist von 30 Tagen zum Vertragsende gekündigt wird.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (3) Die Kündigung muss in Textform (z.B. per E-Mail) erfolgen.
                </p>
                <p className="text-muted-foreground font-body">
                  (4) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 7 Verfügbarkeit und Support
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Der Anbieter bemüht sich um eine Verfügbarkeit der Services von 99% im Jahresmittel. Hiervon ausgenommen sind Wartungsarbeiten und Zeiten, in denen die Services aufgrund von technischen oder sonstigen Problemen nicht erreichbar sind, die nicht im Einflussbereich des Anbieters liegen.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Geplante Wartungsarbeiten werden dem Kunden rechtzeitig angekündigt und nach Möglichkeit außerhalb der Geschäftszeiten durchgeführt.
                </p>
                <p className="text-muted-foreground font-body">
                  (3) Der Umfang des Supports richtet sich nach dem gewählten Tarif. Details sind auf der Preisseite ersichtlich.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 8 Pflichten des Kunden
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Der Kunde verpflichtet sich, die Services nur im Rahmen der geltenden Gesetze und dieser AGB zu nutzen.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Der Kunde ist insbesondere verpflichtet:
                </p>
                <ul className="list-disc list-inside text-muted-foreground font-body space-y-2 mb-4">
                  <li>Keine rechtswidrigen, beleidigenden oder diffamierenden Inhalte zu verbreiten</li>
                  <li>Keine Viren, Trojaner oder andere schädliche Software hochzuladen</li>
                  <li>Die Rechte Dritter (insbesondere Urheberrechte) zu beachten</li>
                  <li>Keine automatisierten Zugriffe (Bots, Crawler) ohne Zustimmung durchzuführen</li>
                </ul>
                <p className="text-muted-foreground font-body">
                  (3) Bei Verstößen gegen diese Pflichten ist der Anbieter berechtigt, den Zugang zu sperren und den Vertrag außerordentlich zu kündigen.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 9 Datenschutz und Datensicherheit
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Der Anbieter verarbeitet personenbezogene Daten des Kunden gemäß den geltenden Datenschutzbestimmungen, insbesondere der DSGVO.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Details zur Datenverarbeitung sind in der Datenschutzerklärung geregelt.
                </p>
                <p className="text-muted-foreground font-body">
                  (3) Der Kunde ist für die Rechtmäßigkeit der von ihm in die Plattform eingegebenen Daten selbst verantwortlich.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 10 Haftung
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). In diesem Fall ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt.
                </p>
                <p className="text-muted-foreground font-body">
                  (3) Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  § 11 Schlussbestimmungen
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (2) Erfüllungsort und ausschließlicher Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist der Sitz des Anbieters, sofern der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.
                </p>
                <p className="text-muted-foreground font-body mb-4">
                  (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt.
                </p>
                <p className="text-muted-foreground font-body">
                  (4) Der Anbieter ist berechtigt, diese AGB mit einer Ankündigungsfrist von 4 Wochen zu ändern. Widerspricht der Kunde der Änderung nicht innerhalb von 4 Wochen nach Zugang der Änderungsmitteilung, gelten die geänderten AGB als angenommen.
                </p>
              </div>

              <div className="bg-accent/10 rounded-lg border border-accent/20 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} strokeWidth={1.5} className="text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-foreground font-body font-medium mb-2">
                      Stand: Januar 2024
                    </p>
                    <p className="text-muted-foreground font-body text-sm">
                      Diese AGB können jederzeit auf unserer Website eingesehen und heruntergeladen werden. Bei Fragen zu den AGB kontaktieren Sie uns bitte unter{' '}
                      <a href="mailto:info@pfotencard.de" className="text-primary hover:underline">
                        info@pfotencard.de
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
