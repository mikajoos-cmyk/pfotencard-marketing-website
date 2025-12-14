import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

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
            <div className="flex items-center gap-4 mb-8">
              <Shield size={48} strokeWidth={1.5} className="text-primary" />
              <h1 className="text-4xl md:text-5xl font-sans font-bold text-foreground">
                Datenschutzerklärung
              </h1>
            </div>

            <p className="text-lg text-muted-foreground font-body mb-12">
              Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten auf unserer Website.
            </p>

            <div className="space-y-8">
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <UserCheck size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      1. Verantwortliche Stelle
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Verantwortlich für die Datenverarbeitung auf dieser Website ist:
                    </p>
                    <p className="text-muted-foreground font-body">
                      Pfotencard GmbH<br />
                      Musterstraße 123<br />
                      12345 Musterstadt<br />
                      Deutschland<br />
                      <br />
                      E-Mail: <a href="mailto:datenschutz@pfotencard.de" className="text-primary hover:underline">datenschutz@pfotencard.de</a><br />
                      Telefon: <a href="tel:+491234567890" className="text-primary hover:underline">+49 123 456 7890</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Database size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      2. Erhebung und Speicherung personenbezogener Daten
                    </h2>
                    
                    <h3 className="text-lg font-sans font-medium text-foreground mb-3 mt-6">
                      2.1 Beim Besuch der Website
                    </h3>
                    <p className="text-muted-foreground font-body mb-4">
                      Bei der bloß informatorischen Nutzung der Website, also wenn Sie sich nicht registrieren oder uns anderweitig Informationen übermitteln, erheben wir nur die personenbezogenen Daten, die Ihr Browser an unseren Server übermittelt:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground font-body space-y-2 mb-4">
                      <li>IP-Adresse</li>
                      <li>Datum und Uhrzeit der Anfrage</li>
                      <li>Zeitzonendifferenz zur Greenwich Mean Time (GMT)</li>
                      <li>Inhalt der Anforderung (konkrete Seite)</li>
                      <li>Zugriffsstatus/HTTP-Statuscode</li>
                      <li>Jeweils übertragene Datenmenge</li>
                      <li>Website, von der die Anforderung kommt</li>
                      <li>Browser und Betriebssystem</li>
                    </ul>

                    <h3 className="text-lg font-sans font-medium text-foreground mb-3 mt-6">
                      2.2 Bei Registrierung
                    </h3>
                    <p className="text-muted-foreground font-body mb-4">
                      Bei der Registrierung für unseren Service erheben wir folgende Daten:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground font-body space-y-2">
                      <li>Name und Vorname</li>
                      <li>E-Mail-Adresse</li>
                      <li>Name der Hundeschule</li>
                      <li>Telefonnummer (optional)</li>
                      <li>Passwort (verschlüsselt gespeichert)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Lock size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      3. Zweck der Datenverarbeitung
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Die Verarbeitung Ihrer personenbezogenen Daten erfolgt zu folgenden Zwecken:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground font-body space-y-2">
                      <li>Bereitstellung und Betrieb unserer Website und Services</li>
                      <li>Verwaltung Ihres Benutzerkontos</li>
                      <li>Kommunikation mit Ihnen (Support, Updates, Newsletter)</li>
                      <li>Verbesserung unserer Dienstleistungen</li>
                      <li>Erfüllung gesetzlicher Verpflichtungen</li>
                      <li>Schutz vor Missbrauch und Betrug</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Eye size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      4. Weitergabe von Daten
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Eine Übermittlung Ihrer persönlichen Daten an Dritte zu anderen als den im Folgenden aufgeführten Zwecken findet nicht statt. Wir geben Ihre persönlichen Daten nur an Dritte weiter, wenn:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground font-body space-y-2">
                      <li>Sie Ihre ausdrückliche Einwilligung dazu erteilt haben</li>
                      <li>Die Weitergabe zur Erfüllung unserer vertraglichen Pflichten erforderlich ist</li>
                      <li>Eine gesetzliche Verpflichtung zur Weitergabe besteht</li>
                      <li>Die Weitergabe zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen erforderlich ist</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <FileText size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      5. Ihre Rechte
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground font-body space-y-2 mb-4">
                      <li><strong>Recht auf Auskunft:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
                      <li><strong>Recht auf Berichtigung:</strong> Sie können die Berichtigung unrichtiger Daten verlangen</li>
                      <li><strong>Recht auf Löschung:</strong> Sie können die Löschung Ihrer Daten verlangen</li>
                      <li><strong>Recht auf Einschränkung:</strong> Sie können die Einschränkung der Verarbeitung verlangen</li>
                      <li><strong>Recht auf Datenübertragbarkeit:</strong> Sie können Ihre Daten in einem strukturierten Format erhalten</li>
                      <li><strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen</li>
                    </ul>
                    <p className="text-muted-foreground font-body">
                      Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
                      <a href="mailto:datenschutz@pfotencard.de" className="text-primary hover:underline">
                        datenschutz@pfotencard.de
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  6. Cookies
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Wir verwenden sowohl Session-Cookies (werden nach Ende Ihrer Browser-Sitzung gelöscht) als auch persistente Cookies (bleiben gespeichert).
                </p>
                <p className="text-muted-foreground font-body">
                  Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und einzeln über deren Annahme entscheiden oder die Annahme von Cookies generell ausschließen.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  7. Datensicherheit
                </h2>
                <p className="text-muted-foreground font-body mb-4">
                  Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird.
                </p>
                <p className="text-muted-foreground font-body">
                  Alle Daten werden auf Servern in Deutschland gespeichert und verarbeitet. Wir treffen technische und organisatorische Sicherheitsmaßnahmen, um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu schützen.
                </p>
              </div>

              <div className="bg-card rounded-lg border border-border p-8">
                <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                  8. Aktualität und Änderung dieser Datenschutzerklärung
                </h2>
                <p className="text-muted-foreground font-body">
                  Diese Datenschutzerklärung ist aktuell gültig und hat den Stand: Januar 2024.
                </p>
                <p className="text-muted-foreground font-body mt-4">
                  Durch die Weiterentwicklung unserer Website oder aufgrund geänderter gesetzlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern. Die jeweils aktuelle Datenschutzerklärung kann jederzeit auf der Website abgerufen werden.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
