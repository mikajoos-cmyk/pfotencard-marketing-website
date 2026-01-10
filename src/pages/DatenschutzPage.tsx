import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, FileText, Server, CreditCard } from 'lucide-react';

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
              Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten innerhalb unserer Anwendung "Pfotencard" und der zugehörigen Webseiten.
            </p>

            <div className="space-y-8">
              {/* 1. Verantwortliche Stelle */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <UserCheck size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      1. Verantwortliche Stelle
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Verantwortlich für die Datenverarbeitung im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
                    </p>
                    <p className="text-muted-foreground font-body">
                      <strong>[DEIN FIRMENNAME ODER VORNAME NACHNAME]</strong><br />
                      [DEINE STRAßE UND HAUSNUMMER]<br />
                      [PLZ UND ORT]<br />
                      Deutschland<br />
                      <br />
                      E-Mail: <a href="mailto:info@pfotencard.de" className="text-primary hover:underline">info@pfotencard.de</a><br />
                      Telefon: [DEINE TELEFONNUMMER]
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Hosting & Infrastruktur */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Server size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      2. Hosting und Backend-Infrastruktur
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Um unseren Dienst sicher und effizient bereitzustellen, nutzen wir Dienstleistungen von professionellen Cloud-Anbietern.
                    </p>

                    <h3 className="text-lg font-sans font-medium text-foreground mb-2 mt-4">Vercel</h3>
                    <p className="text-muted-foreground font-body mb-4">
                      Unsere Webanwendung wird gehostet bei <strong>Vercel Inc.</strong> (USA). Vercel verarbeitet technische Verbindungsdaten (IP-Adresse, Browser-Informationen), um die Auslieferung der Website zu ermöglichen und gegen Angriffe abzusichern.
                    </p>

                    <h3 className="text-lg font-sans font-medium text-foreground mb-2">Supabase</h3>
                    <p className="text-muted-foreground font-body mb-4">
                      Für die Datenbank, Benutzerauthentifizierung und Dateispeicherung nutzen wir <strong>Supabase</strong> (Supabase Inc.). Die Daten werden verschlüsselt übertragen und gespeichert. Supabase nutzt als Unterauftragsverarbeiter Amazon Web Services (AWS) mit Serverstandorten vorrangig in der EU (Frankfurt), kann aber technisch bedingt Daten auch in die USA übertragen.
                    </p>

                    <p className="text-sm text-muted-foreground mt-4">
                      Mit beiden Anbietern haben wir Verträge zur Auftragsverarbeitung (AVV) geschlossen, um den Schutz Ihrer Daten gemäß DSGVO zu gewährleisten. Soweit Daten in die USA übertragen werden, stützen wir uns auf das Data Privacy Framework (DPF) oder Standardvertragsklauseln (SCC).
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Registrierung & Auth */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Lock size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      3. Registrierung und Anmeldung
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Wenn Sie sich für Pfotencard registrieren, verarbeiten wir folgende Daten zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground font-body space-y-2">
                      <li>Name und Vorname</li>
                      <li>E-Mail-Adresse (als Benutzername)</li>
                      <li>Name der Hundeschule</li>
                      <li>Verschlüsseltes Passwort (wir kennen Ihr Passwort nicht im Klartext)</li>
                      <li>Zeitpunkt der Registrierung und letzter Login</li>
                    </ul>
                    <p className="text-muted-foreground font-body mt-4">
                      Die Authentifizierung erfolgt über den Dienst Supabase Auth. Dabei werden Ihre E-Mail und Sicherheits-Tokens verarbeitet, um Ihren sicheren Zugang zu gewährleisten.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Zahlungsabwicklung */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <CreditCard size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      4. Zahlungsabwicklung
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Für kostenpflichtige Abonnements nutzen wir den Zahlungsdienstleister <strong>Stripe Payments Europe, Ltd.</strong> (Irland).
                    </p>
                    <p className="text-muted-foreground font-body mb-4">
                      Wir selbst speichern keine vollständigen Kreditkartendaten oder Bankverbindungen. Diese werden direkt an Stripe übermittelt. Stripe verarbeitet Ihre Zahlungsdaten (z.B. Kreditkartennummer, Rechnungsbetrag), um die Transaktion durchzuführen.
                    </p>
                    <p className="text-muted-foreground font-body">
                      Rechtsgrundlage ist die Erfüllung des Vertrags (Art. 6 Abs. 1 lit. b DSGVO). Stripe setzt zudem Technologien zur Betrugsprävention und Sicherheit ein. Weitere Informationen finden Sie in der <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener" className="text-primary hover:underline">Datenschutzerklärung von Stripe</a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Endkundendaten (AVV) */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Database size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      5. Verarbeitung von Endkundendaten (Auftragsverarbeitung)
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Wenn Sie als Hundeschule Daten Ihrer Kunden (Hundehalter, Hundenamen, Trainingsfortschritte) in Pfotencard eingeben, agieren wir als <strong>Auftragsverarbeiter</strong> gemäß Art. 28 DSGVO.
                    </p>
                    <p className="text-muted-foreground font-body mb-4">
                      Sie bleiben "Verantwortlicher" für diese Daten. Wir verarbeiten diese Daten ausschließlich nach Ihren Weisungen und zum Zweck der Bereitstellung der Software.
                    </p>
                    <div className="bg-accent/10 border border-accent/20 rounded-md p-4 mt-4">
                      <p className="text-sm font-medium text-foreground">Hinweis für Hundeschulen:</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Wir stellen Ihnen in Ihrem Kundenkonto einen Vertrag zur Auftragsverarbeitung (AVV) zur Verfügung. Bitte schließen Sie diesen ab, um datenschutzkonform zu arbeiten.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Cookies */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <Eye size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      6. Cookies und LocalStorage
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Unsere Anwendung verwendet Cookies und den lokalen Browserspeicher (LocalStorage), um die Funktionalität zu gewährleisten.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground font-body space-y-2">
                      <li><strong>Authentifizierung:</strong> Um Sie eingeloggt zu halten (Supabase Token).</li>
                      <li><strong>Sicherheit:</strong> Zur Verhinderung von CSRF-Angriffen und Betrug (Stripe).</li>
                      <li><strong>Einstellungen:</strong> Um Ihre Präferenzen (z.B. Dark Mode) zu speichern.</li>
                    </ul>
                    <p className="text-muted-foreground font-body mt-4">
                      Wir setzen keine Werbe- oder Marketing-Cookies von Drittanbietern ein, die Ihr Verhalten über unsere Seite hinaus verfolgen.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7. Ihre Rechte */}
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start gap-4 mb-4">
                  <FileText size={32} strokeWidth={1.5} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-sans font-bold text-foreground mb-4">
                      7. Ihre Rechte als Betroffener
                    </h2>
                    <p className="text-muted-foreground font-body mb-4">
                      Sie haben jederzeit das Recht auf:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground font-body space-y-2 mb-4">
                      <li><strong>Auskunft</strong> über Ihre bei uns gespeicherten Daten.</li>
                      <li><strong>Berichtigung</strong> falscher Daten.</li>
                      <li><strong>Löschung</strong> Ihrer Daten, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</li>
                      <li><strong>Einschränkung</strong> der Verarbeitung.</li>
                      <li><strong>Datenübertragbarkeit</strong> (Export Ihrer Daten).</li>
                      <li><strong>Widerspruch</strong> gegen die Verarbeitung.</li>
                    </ul>
                    <p className="text-muted-foreground font-body">
                      Wenden Sie sich dazu bitte an die oben genannte verantwortliche Stelle. Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
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