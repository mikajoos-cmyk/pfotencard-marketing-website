import React from 'react';

export default function AVVDocument({ tenantName, tenantAddress }) {
  return (
    <div id="avv-document" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', padding: '40px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff' }}>
      
      <h1 style={{ textAlign: 'center', fontSize: '24px' }}>Vertrag zur Auftragsverarbeitung (AVV)</h1>
      <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '40px' }}>gemäß Art. 28 der Datenschutz-Grundverordnung (DSGVO)</p>

      <p><strong>Zwischen</strong><br />
      {tenantName || '[Name der Hundeschule]'}<br />
      {tenantAddress || '[Adresse der Hundeschule]'}<br />
      – nachfolgend „Verantwortlicher“ genannt –</p>

      <p style={{ marginTop: '20px', marginBottom: '40px' }}><strong>und</strong><br />
      [Deien Firma]<br />
      [Deien Addresse]<br />
      – nachfolgend „Auftragsverarbeiter“ genannt –</p>

      <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>1. Gegenstand und Dauer des Vertrages</h2>
      <p>(1) Der Auftragsverarbeiter erbringt für den Verantwortlichen Dienstleistungen im Bereich Software-as-a-Service (SaaS). Gegenstand dieses Vertrages ist die Bereitstellung einer App zur Verwaltung von Hundeschulen, Kunden, Terminen und der In-App-Kommunikation (Chat) gemäß dem geschlossenen Hauptvertrag (z. B. den AGB der App-Nutzung).</p>
      <p>(2) Die Dauer dieses Vertrages richtet sich nach der Laufzeit des Hauptvertrages.</p>

      <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>2. Art und Zweck der Verarbeitung</h2>
      <p>(1) Art der Verarbeitung: Die Verarbeitung umfasst das Erheben, Speichern, Auslesen, Abfragen, Verwenden, Übermitteln und Löschen von Daten durch die vom Auftragsverarbeiter bereitgestellte Cloud-Infrastruktur.</p>
      <p>(2) Zweck der Verarbeitung: Bereitstellung der Software-Funktionalitäten (Terminbuchung, Kundenverwaltung, Zahlungsabwicklung, Chat-Kommunikation) für die Kunden und Trainer des Verantwortlichen.</p>

      <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>3. Art der personenbezogenen Daten und Kategorien Betroffener</h2>
      <p><strong>(1) Art der Daten:</strong></p>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Stammdaten (Vorname, Nachname, E-Mail-Adresse, Telefonnummer, verschlüsselte Passwörter/Auth-IDs)</li>
        <li>Hundedaten (Name, Rasse, Geburtsdatum, Chipnummer, Trainingslevel, Bilder)</li>
        <li>Vertrags- und Buchungsdaten (gebuchte Kurse, Termine, Anwesenheiten, Trainingsstände/Achievements)</li>
        <li>Kommunikationsdaten (Inhalte von Chat-Nachrichten zwischen Trainern und Kunden)</li>
        <li>Finanzdaten (Transaktionshistorie, Guthaben, Rechnungsnummern, Stripe-IDs)</li>
        <li>Technische Daten (Geräte-IDs/Push-Tokens, IP-Adressen für System-Logs)</li>
      </ul>
      <p><strong>(2) Kategorien betroffener Personen:</strong></p>
      <ul style={{ paddingLeft: '20px' }}>
        <li>Kunden des Verantwortlichen (Hundehalter)</li>
        <li>Mitarbeiter/Trainer des Verantwortlichen</li>
      </ul>

      <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>4. Pflichten des Auftragsverarbeiters</h2>
      <p>(1) Der Auftragsverarbeiter verarbeitet personenbezogene Daten ausschließlich im Rahmen der getroffenen Vereinbarungen und nach den dokumentierten Weisungen des Verantwortlichen.</p>
      <p>(2) Der Auftragsverarbeiter bestätigt, dass er die Vorgaben der Art. 28 bis 33 DSGVO einhält. Er gewährleistet insbesondere die Umsetzung angemessener technischer und organisatorischer Maßnahmen (TOMs) gemäß Art. 32 DSGVO (siehe Anlage 1).</p>
      <p>(3) Der Auftragsverarbeiter unterstützt den Verantwortlichen nach Möglichkeit mit geeigneten technischen und organisatorischen Maßnahmen bei der Erfüllung von Betroffenenrechten (z. B. Auskunft, Berichtigung, Löschung). (Hinweis: Durch die App-Funktionalität ist die Löschung/Bearbeitung von Nutzerdaten direkt durch den Verantwortlichen oder Betroffenen gewährleistet).</p>

      <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>5. Einschaltung von Unterauftragsverarbeitern (Sub-Dienstleister)</h2>
      <p>(1) Der Verantwortliche stimmt der Einschaltung der nachfolgend aufgeführten Unterauftragsverarbeiter zu. Der Auftragsverarbeiter stellt sicher, dass die Unterauftragsverarbeiter dieselben datenschutzrechtlichen Verpflichtungen einhalten.</p>
      <p><strong>Aktuell eingesetzte Unterauftragsverarbeiter:</strong></p>
      <ul style={{ paddingLeft: '20px' }}>
        <li><strong>Supabase</strong> (Backend as a Service, Datenbank-Hosting, Authentifizierung) – Serverstandort: Frankfurt am Main, Deutschland (AWS EU).</li>
        <li><strong>Vercel Inc.</strong> (Frontend/App-Hosting, API-Routing) – Serverstandort: Frankfurt am Main, Deutschland (EU-Region).</li>
        <li><strong>Resend Inc.</strong> (E-Mail-Versand für System-Mails) – Datenverarbeitung ggf. in Drittländern (USA), abgesichert durch EU-Standardvertragsklauseln.</li>
        <li><strong>Stripe Payments Europe, Ltd.</strong> (Zahlungsabwicklung) – Datenverarbeitung ggf. in Drittländern (USA), abgesichert durch EU-Standardvertragsklauseln.</li>
      </ul>
      <p>(2) Wechselt der Auftragsverarbeiter einen Unterauftragsverarbeiter oder fügt einen neuen hinzu, wird er den Verantwortlichen vorab (z. B. per E-Mail oder im Admin-Dashboard) informieren. Der Verantwortliche kann aus wichtigem datenschutzrechtlichen Grund widersprechen.</p>

      <h2 style={{ fontSize: '18px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>6. Rückgabe und Löschung der Daten</h2>
      <p>Nach Abschluss der vertraglichen Arbeiten oder nach Kündigung des Hauptvertrages hat der Auftragsverarbeiter sämtliche in seinen Besitz gelangten personenbezogenen Daten, Dokumente und Verarbeitungs- und Nutzungsergebnisse, die im Zusammenhang mit dem Auftragsverhältnis stehen, nach Wahl des Verantwortlichen datenschutzgerecht zu löschen oder zurückzugeben, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</p>

      <div style={{ pageBreakBefore: 'always', marginTop: '40px' }}></div>

      <h1 style={{ textAlign: 'center', fontSize: '20px' }}>Anlage 1: Technisch-organisatorische Maßnahmen (TOMs) gemäß Art. 32 DSGVO</h1>
      <p>Der Auftragsverarbeiter hat folgende Maßnahmen zur Datensicherheit implementiert:</p>

      <h3 style={{ fontSize: '16px' }}>1. Pseudonymisierung und Verschlüsselung (Art. 32 Abs. 1 lit. a DSGVO)</h3>
      <p><strong>Transportverschlüsselung:</strong> Sämtliche Datenübertragungen zwischen der App (Frontend) und den Servern (Backend) erfolgen zwingend TLS/SSL-verschlüsselt (HTTPS / WSS).<br />
      <strong>Verschlüsselung at Rest:</strong> Die Datenbanken auf den Supabase-Servern (AWS) sind auf Speicherebene (Festplattenverschlüsselung) standardmäßig verschlüsselt. Passwörter werden niemals im Klartext, sondern durch starke Hashing-Algorithmen gesichert verarbeitet.</p>

      <h3 style={{ fontSize: '16px' }}>2. Vertraulichkeit (Art. 32 Abs. 1 lit. b DSGVO)</h3>
      <p><strong>Zutrittskontrolle:</strong> Die Server werden in hochgesicherten Rechenzentren in Frankfurt betrieben (ISO 27001 zertifiziert).<br />
      <strong>Zugangskontrolle:</strong> Administratoren des Auftragsverarbeiters nutzen starke Passwörter und Zwei-Faktor-Authentifizierung (2FA) für den Zugriff auf die Hosting-Dashboards (Supabase/Vercel).<br />
      <strong>Zugriffskontrolle (Mandantentrennung):</strong> Die Datenbankarchitektur verwendet strikte Row Level Security (RLS) Policies (Sicherheitsregeln auf Zeilenebene). Es ist technisch durch Datenbankregeln (Verifizierung der tenant_id) ausgeschlossen, dass ein Nutzer oder Trainer des Verantwortlichen auf Daten eines anderen Mandanten (einer anderen Hundeschule) zugreifen kann.</p>

      <h3 style={{ fontSize: '16px' }}>3. Integrität (Art. 32 Abs. 1 lit. b DSGVO)</h3>
      <p><strong>Eingabekontrolle:</strong> Es wird durch relationale Datenbank-Strukturen und Logging-Tabellen (z. B. transactions) lückenlos nachvollziehbar gemacht, wann und durch wen Daten (z. B. Zahlungen, Buchungen) eingegeben oder verändert wurden.</p>

      <h3 style={{ fontSize: '16px' }}>4. Verfügbarkeit und Belastbarkeit (Art. 32 Abs. 1 lit. b und c DSGVO)</h3>
      <p>Durch die Nutzung moderner Cloud-Architekturen (Vercel, Supabase) ist eine hohe Verfügbarkeit und Skalierbarkeit gewährleistet.<br />
      Regelmäßige automatisierte Backups der Datenbankstruktur durch den Hosting-Provider schützen vor versehentlichem Datenverlust.</p>

    </div>
  );
}
