import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, FileText, Server, CreditCard, Mail } from 'lucide-react';

export function DatenschutzPage() {
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
            <div className="flex items-center gap-4 mb-6">
              <Shield size={48} strokeWidth={1.5} className="text-primary" />
              <h1 className="text-3xl md:text-4xl font-sans font-bold text-foreground">
                Datenschutzerklärung für die Website / Landingpage
              </h1>
            </div>

            <p className="text-muted-foreground font-body mb-10">
              (Hinweis für den Anwalt: Diese Datenschutzerklärung richtet sich an Besucher der Vertriebs-Website und an Hundeschulen (B2B), die sich als Mandanten/Tenants für die SaaS-Software registrieren. Betreiber der Website ist der nachfolgend genannte Verantwortliche.)
            </p>

            <div className="space-y-8">
              {/* 1. Verantwortliche Stelle */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4">
                  <UserCheck size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">1. Verantwortliche Stelle</h2>
                    <p className="text-muted-foreground font-body mb-4">Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:</p>
                    <p className="text-muted-foreground font-body">
                      [Ihr Firmenname / Ihr Name]<br />
                      [Straße, Hausnummer]<br />
                      [PLZ, Ort]<br />
                      [E-Mail-Adresse für Support/Datenschutz]<br />
                      [Telefonnummer, falls gewünscht]
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Erhebung und Speicherung personenbezogener Daten sowie Art und Zweck der Verwendung */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4">
                  <Server size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">2. Erhebung und Speicherung personenbezogener Daten sowie Art und Zweck der Verwendung</h2>
                    <h3 className="text-lg font-sans font-semibold text-foreground mb-2">a) Beim Besuch der Website (Hosting & Logfiles)</h3>
                    <p className="text-muted-foreground font-body mb-4">
                      Wenn Sie unsere Website aufrufen, werden durch unseren Hosting-Provider automatisch Informationen in sogenannten Server-Logfiles gespeichert, die Ihr Browser automatisch an uns übermittelt. Wir nutzen für das Hosting unserer Website den Dienstleister Vercel Inc. (mit Serverstandort in der EU/Frankfurt).
                    </p>
                    <p className="text-muted-foreground font-body mb-2">Zu den erhobenen Daten gehören unter anderem:</p>
                    <div className="text-muted-foreground font-body space-y-1 mb-4">
                      <p>IP-Adresse des anfragenden Rechners</p>
                      <p>Datum und Uhrzeit des Zugriffs</p>
                      <p>Name und URL der abgerufenen Datei</p>
                      <p>Verwendeter Browser und Betriebssystem</p>
                    </div>
                    <p className="text-muted-foreground font-body mb-6">
                      Die Rechtsgrundlage für diese Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse folgt aus den Zwecken der Gewährleistung eines reibungslosen Verbindungsaufbaus, der Systemsicherheit und -stabilität sowie der Fehleranalyse. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
                    </p>

                    <h3 className="text-lg font-sans font-semibold text-foreground mb-2">b) Bei der Registrierung und Vertragsabwicklung (Hundeschulen)</h3>
                    <p className="text-muted-foreground font-body mb-2">Wenn Sie als Hundeschule unsere Software (SaaS) abonnieren und ein Nutzerkonto (Tenant) anlegen, erheben wir folgende Daten:</p>
                    <div className="text-muted-foreground font-body space-y-1 mb-4">
                      <p>Name der Hundeschule / Unternehmensname</p>
                      <p>Vor- und Nachname des Ansprechpartners</p>
                      <p>E-Mail-Adresse und verschlüsseltes Passwort (Auth-Daten)</p>
                      <p>Rechnungsanschrift und ggf. Umsatzsteuer-ID</p>
                    </div>
                    <p className="text-muted-foreground font-body mb-6">
                      Diese Daten werden zur Anbahnung, Durchführung und Verwaltung des Software-Nutzungsvertrags erhoben. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Die Daten werden in unserer sicheren Datenbankinfrastruktur beim Anbieter Supabase (Serverstandort Frankfurt am Main, Deutschland) gehostet.
                    </p>

                    <h3 className="text-lg font-sans font-semibold text-foreground mb-2">c) Bei Nutzung unseres Kontaktformulars oder per E-Mail</h3>
                    <p className="text-muted-foreground font-body">
                      Bei Fragen jeglicher Art bieten wir Ihnen die Möglichkeit, uns über ein Formular auf der Website oder per E-Mail zu kontaktieren. Dabei ist die Angabe einer gültigen E-Mail-Adresse erforderlich, damit wir wissen, von wem die Anfrage stammt und um diese beantworten zu können. Die Datenverarbeitung zum Zwecke der Kontaktaufnahme mit uns erfolgt nach Art. 6 Abs. 1 lit. b DSGVO (sofern es um vertragliche Fragen geht) oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Zahlungsabwicklung (Stripe) */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4">
                  <CreditCard size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">3. Zahlungsabwicklung (Stripe)</h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Für die Abwicklung von kostenpflichtigen Abonnements (SaaS-Plänen) nutzen wir den Zahlungsdienstleister Stripe (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland).
                    </p>
                    <p className="text-muted-foreground font-body mb-4">
                      Ihre Zahlungsdaten (z. B. Kreditkartendaten, Kontoverbindungen) werden nicht auf unseren eigenen Servern gespeichert, sondern direkt über eine verschlüsselte Verbindung von Stripe verarbeitet. Wir erhalten lediglich Statusmeldungen über erfolgreiche oder fehlgeschlagene Zahlungen sowie Rechnungsreferenzen.
                    </p>
                    <p className="text-muted-foreground font-body mb-4">
                      Die Rechtsgrundlage für die Weitergabe der Daten ist die Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
                    </p>
                    <p className="text-muted-foreground font-body">
                      Hinweis zum Drittlandtransfer: Stripe kann Daten in die USA übertragen. Dies ist durch EU-Standardvertragsklauseln (SCC) rechtlich abgesichert.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. E-Mail-Kommunikation und Newsletter */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4">
                  <Mail size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">4. E-Mail-Kommunikation und Newsletter</h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Für den automatisierten Versand von Transaktions-E-Mails (z. B. Registrierungsbestätigungen, Rechnungen, Passwort-Resets) nutzen wir den Dienstleister Resend (Resend, Inc.).
                    </p>
                    <p className="text-muted-foreground font-body">
                      Sofern Sie sich ausdrücklich für unseren Newsletter für Hundeschulen angemeldet haben (Art. 6 Abs. 1 lit. a DSGVO), verwenden wir Ihre E-Mail-Adresse, um Ihnen regelmäßig Informationen zu neuen App-Funktionen zu senden. Die Abmeldung ist jederzeit möglich, z. B. über einen Link am Ende jedes Newsletters.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Cookies, Analyse-Tools und Tracking */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4">
                  <Eye size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">5. Cookies, Analyse-Tools und Tracking</h2>
                    <p className="text-muted-foreground font-body mb-4">
                      <strong>Technisch notwendige Cookies:</strong> Wir setzen auf unserer Website technisch notwendige Cookies ein (z. B. Session-Cookies für den Login-Bereich), um die Kernfunktionen der Website bereitzustellen. Die Rechtsgrundlage hierfür ist unser berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO) bzw. § 25 Abs. 2 TTDSG.
                    </p>
                    <p className="text-muted-foreground font-body">
                      <strong>Analyse und Tracking (Vorsorglicher Hinweis):</strong> Derzeit verzichten wir auf den Einsatz umfassender Tracking- oder Analyse-Tools (wie Google Analytics). Soweit wir in Zukunft Werkzeuge zur statistischen Auswertung des Nutzerverhaltens einsetzen, um unsere Website und Angebote zu optimieren, werden diese Dienste erst nach Ihrer ausdrücklichen und informierten Einwilligung (über ein Cookie-Banner) geladen. Die Rechtsgrundlage ist in diesem Fall Art. 6 Abs. 1 lit. a DSGVO. Sie können eine einmal erteilte Einwilligung jederzeit widerrufen.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Weitergabe von Daten */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4">
                  <Database size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">6. Weitergabe von Daten</h2>
                    <p className="text-muted-foreground font-body">
                      Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen als den in dieser Datenschutzerklärung aufgeführten Zwecken (z.B. Hosting, Zahlungsabwicklung, E-Mail-Versand) findet nicht statt.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7. Speicherdauer */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4">
                  <Server size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">7. Speicherdauer</h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung der jeweiligen Zwecke erforderlich ist. Daten aus Vertragsverhältnissen (Rechnungen, Abonnements) speichern wir gemäß den gesetzlichen steuer- und handelsrechtlichen Aufbewahrungsfristen (in der Regel 6 bis 10 Jahre).
                    </p>
                  </div>
                </div>
              </div>

              {/* 8. Betroffenenrechte */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4">
                  <FileText size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">8. Betroffenenrechte</h2>
                    <p className="text-muted-foreground font-body mb-4">Sie haben das Recht:</p>
                    <div className="text-muted-foreground font-body space-y-1 mb-4">
                      <p>Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten zu verlangen (Art. 15 DSGVO).</p>
                      <p>Unverzüglich die Berichtigung unrichtiger oder Vervollständigung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen (Art. 16 DSGVO).</p>
                      <p>Die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen, soweit nicht die Verarbeitung zur Erfüllung einer rechtlichen Verpflichtung oder zur Geltendmachung von Rechtsansprüchen erforderlich ist (Art. 17 DSGVO).</p>
                      <p>Die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen (Art. 18 DSGVO).</p>
                      <p>Ihre Daten in einem strukturierten, gängigen und maschinenlesebaren Format zu erhalten (Art. 20 DSGVO).</p>
                      <p>Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO), sofern Ihre Daten auf Grundlage von berechtigten Interessen verarbeitet werden.</p>
                      <p>Ihre einmal erteilte Einwilligung jederzeit gegenüber uns zu widerrufen (Art. 7 Abs. 3 DSGVO).</p>
                    </div>
                    <p className="text-muted-foreground font-body">
                      Möchten Sie von Ihren Rechten Gebrauch machen, genügt eine E-Mail an: [Ihre E-Mail-Adresse].
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