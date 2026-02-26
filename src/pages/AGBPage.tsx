import { useEffect } from 'react';
import { motion } from 'framer-motion';

export function AGBPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">Allgemeine Geschäftsbedingungen (SaaS-AGB)</h1>
          <p className="text-muted-foreground mb-8">(Für die Landingpage / Registrierung der Hundeschulen)</p>

          <div className="space-y-8 text-foreground/90 leading-relaxed">

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 1 Geltungsbereich und Vertragspartner</h2>
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB“) gelten für alle Verträge über die Nutzung der Software-as-a-Service-Dienste (nachfolgend „Software“), die zwischen [Ihr Firmenname / Ihr Name, Adresse, ggf. Handelsregister] (nachfolgend „Anbieter“) und dem Kunden (nachfolgend „Kunde“ oder „Hundeschule“) geschlossen werden.
                <br />
                (2) Das Angebot richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB, also an juristische und natürliche Personen, die bei Abschluss des Rechtsgeschäfts in Ausübung ihrer gewerblichen oder selbständigen beruflichen Tätigkeit handeln. Ein Vertragsabschluss mit Verbrauchern (§ 13 BGB) ist ausgeschlossen.
                <br />
                (3) Abweichende AGB des Kunden werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 2 Vertragsgegenstand und Leistungen</h2>
              <p>
                (1) Der Anbieter stellt dem Kunden eine cloudbasierte Software zur Verwaltung von Hundeschulen (inkl. Kundenverwaltung, Terminbuchung, Chat-System und Abrechnungsfunktionen) zur Nutzung über das Internet zur Verfügung (Software-as-a-Service).
                <br />
                (2) Der Funktionsumfang der Software ergibt sich aus der zum Zeitpunkt des Vertragsschlusses aktuellen Leistungsbeschreibung auf der Website des Anbieters.
                <br />
                (3) Der Anbieter schuldet nicht die Herstellung einer bestimmten Datenverbindung oder die Erreichbarkeit der Software zu 100 %. Der Anbieter gewährleistet jedoch eine Verfügbarkeit der Software von 99 % im Jahresmittel. Ausgenommen hiervon sind Ausfallzeiten durch Wartung und Software-Updates sowie Zeiten, in denen der Dienst aufgrund von technischen oder sonstigen Problemen, die nicht im Einflussbereich des Anbieters liegen (z. B. höhere Gewalt, Verschulden Dritter), nicht über das Internet zu erreichen ist.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 3 Vertragsschluss und Testphase</h2>
              <p>
                (1) Die Präsentation der Software auf der Website stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Abgabe einer Bestellung dar.
                <br />
                (2) Der Vertrag kommt zustande, indem der Kunde den Registrierungsprozess abschließt und ein Abonnement (Plan) auswählt.
                <br />
                (3) Bietet der Anbieter eine kostenlose Testphase an, geht diese nach Ablauf der vereinbarten Zeit automatisch in ein kostenpflichtiges Abonnement über, sofern der Kunde nicht vorab kündigt oder keine Zahlungsdaten (Kreditkarte/SEPA) hinterlegt hat.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 4 Pflichten des Kunden (Hundeschule)</h2>
              <p>
                (1) Der Kunde ist verpflichtet, die bei der Registrierung abgefragten Daten (insb. Firmenname, Rechnungsadresse, E-Mail) vollständig und korrekt anzugeben und bei Änderungen unverzüglich zu aktualisieren.
                <br />
                (2) Der Kunde ist für die Geheimhaltung seiner Zugangsdaten (sowie die seiner Trainer) verantwortlich. Er wird den Anbieter unverzüglich informieren, wenn der Verdacht besteht, dass Dritte unberechtigt Zugriff erlangt haben.
                <br />
                (3) Der Kunde verpflichtet sich, die Software nicht missbräuchlich zu nutzen. Insbesondere dürfen keine rechtswidrigen, beleidigenden oder urheberrechtlich geschützten Inhalte (ohne entsprechende Rechte) hochgeladen werden.
                <br />
                (4) Wichtig: Der Kunde ist allein verantwortlich für die rechtliche Beziehung zu seinen Endkunden (Hundehaltern). Der Kunde stellt sicher, dass er über alle erforderlichen Einwilligungen seiner Endkunden verfügt, um deren Daten (insb. für Push-Benachrichtigungen und E-Mails) in der Software verarbeiten zu dürfen. Der Kunde ist verpflichtet, eigene rechtskonforme AGB und Datenschutzerklärungen in der App gegenüber seinen Endkunden bereitzustellen.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 5 Preise, Abrechnung und Zahlungsbedingungen</h2>
              <p>
                (1) Es gelten die zum Zeitpunkt des Vertragsschlusses auf der Website ausgewiesenen Preise. Alle Preise verstehen sich netto zzgl. der jeweils geltenden gesetzlichen Umsatzsteuer.
                <br />
                (2) Die Nutzungsgebühr wird im Voraus für den jeweiligen Abrechnungszeitraum (z. B. monatlich oder jährlich) abgerechnet.
                <br />
                (3) Die Zahlungsabwicklung erfolgt über den Zahlungsdienstleister Stripe. Der Kunde ermächtigt den Anbieter bzw. Stripe, die fälligen Beträge vom angegebenen Zahlungsmittel (z. B. Kreditkarte, SEPA-Lastschrift) einzuziehen.
                <br />
                (4) Kommt der Kunde mit der Zahlung in Verzug, ist der Anbieter berechtigt, den Zugang zur Software bis zur vollständigen Begleichung der offenen Forderungen zu sperren (Zurückbehaltungsrecht). Die Zahlungspflicht des Kunden bleibt hiervon unberührt.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 6 Laufzeit und Kündigung</h2>
              <p>
                (1) Der Vertrag wird auf unbestimmte Zeit, mindestens jedoch für den gebuchten Abrechnungszeitraum (Monat oder Jahr), geschlossen.
                <br />
                (2) Der Vertrag kann von beiden Parteien jederzeit zum Ende des aktuellen Abrechnungszeitraums gekündigt werden. Die Kündigung kann elektronisch im Kundenbereich (Dashboard) der Software oder per E-Mail erfolgen.
                <br />
                (3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Ein wichtiger Grund liegt für den Anbieter insbesondere vor, wenn der Kunde für zwei aufeinanderfolgende Monate mit der Zahlung in Verzug ist oder grundlegende Vertragspflichten (z. B. nach § 4) schwerwiegend verletzt.
                <br />
                (4) Nach Vertragsbeendigung hat der Kunde keinen Zugriff mehr auf seine Daten. Der Anbieter wird die Daten des Kunden nach Ablauf von 30 Tagen unwiderruflich löschen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Der Kunde ist selbst dafür verantwortlich, seine Daten vor Vertragsende zu exportieren.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 7 Haftung</h2>
              <p>
                (1) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.
                <br />
                (2) Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht). Eine wesentliche Vertragspflicht ist eine Pflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht und auf deren Einhaltung der Kunde regelmäßig vertrauen darf. In diesem Fall ist die Haftung auf den bei Vertragsschluss vorhersehbaren, vertragstypischen Schaden begrenzt.
                <br />
                (3) Die Haftung für Datenverlust ist auf den typischen Wiederherstellungsaufwand beschränkt, der bei regelmäßiger und gefahrentsprechender Anfertigung von Sicherungskopien durch den Kunden eingetreten wäre.
                <br />
                (4) Die vorstehenden Haftungsbeschränkungen gelten auch zugunsten der Erfüllungsgehilfen des Anbieters.
              </p>
            </section>

            <section className="border-b border-border pb-6">
              <h2 className="text-xl font-bold mb-3">§ 8 Datenschutz und Auftragsverarbeitung</h2>
              <p>
                (1) Die Parteien werden die jeweils auf sie anwendbaren datenschutzrechtlichen Bestimmungen (insb. DSGVO) einhalten.
                <br />
                (2) Da der Anbieter personenbezogene Daten im Auftrag des Kunden verarbeitet, schließen die Parteien ergänzend einen Vertrag zur Auftragsverarbeitung (AVV) gemäß Art. 28 DSGVO ab. Dieser AVV ist Bestandteil des Hauptvertrages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">§ 9 Schlussbestimmungen</h2>
              <p>
                (1) Änderungen oder Ergänzungen dieser AGB bedürfen der Textform.
                <br />
                (2) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
                <br />
                (3) Ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist der Sitz des Anbieters, sofern der Kunde Kaufmann, eine juristische Person des öffentlichen Rechts oder ein öffentlich-rechtliches Sondervermögen ist.
                <br />
                (4) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, so wird die Wirksamkeit der übrigen Bestimmungen dadurch nicht berührt.
              </p>
            </section>

          </div>
        </motion.div>
      </div>
    </main>
  );
}