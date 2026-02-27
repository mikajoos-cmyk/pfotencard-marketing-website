import React from 'react';

export default function AVVDocument({ tenantName, tenantAddress, version = "1.0" }) {

    // Falls wir zukünftige Versionen haben, könnten wir hier den Content weichen lassen
    // In diesem Beispiel haben wir nur Version 1.0, aber die Struktur ist bereit.

    // Zentrale Styles für ein einheitliches Design
    const h2Style = {
        fontSize: '20px',
        fontWeight: '900',
        marginTop: '40px',
        marginBottom: '15px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '8px'
    };

    const h3Style = {
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '30px',
        marginBottom: '10px',
        color: '#222'
    };

    const pStyle: React.CSSProperties = {
        marginBottom: '12px',
        textAlign: 'justify',
        pageBreakInside: 'avoid'
    };

    // Sichert die Einrückung für Listen und Aufzählungen
    const listStyle: React.CSSProperties = {
        paddingLeft: '30px',
        marginBottom: '15px',
        textAlign: 'justify'
    };

    const liStyle: React.CSSProperties = {
        marginBottom: '5px',
        pageBreakInside: 'avoid'
    };

    return (
        <div id="avv-document" style={{ fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: '1.6', color: '#333', padding: '40px', maxWidth: '800px', margin: '0 auto', fontSize: '14px' }}>

            {/* Kopfbereich */}
            <h1 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '900', marginBottom: '5px', pageBreakInside: 'avoid' }}>Vertrag zur Auftragsverarbeitung (AVV)</h1>
            <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '50px', pageBreakInside: 'avoid' }}>gemäß Art. 28 der Datenschutz-Grundverordnung (DSGVO)</p>

            <p style={pStyle}><strong>Zwischen</strong><br />
                {tenantName}<br />
                {tenantAddress}<br />
                – nachfolgend „Verantwortlicher“ genannt –</p>

            <p style={{ ...pStyle, marginTop: '20px', marginBottom: '50px' }}><strong>und</strong><br />
                Pfotencard GmbH<br />
                [Deine Addresse]<br />
                – nachfolgend „Auftragsverarbeiter“ genannt –</p>

            {/* Vertragsinhalte */}
            <h2 style={{ ...h2Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>1. Gegenstand und Dauer des Vertrages</h2>
            <p style={pStyle}>(1) Der Auftragsverarbeiter erbringt für den Verantwortlichen Dienstleistungen im Bereich Software-as-a-Service (SaaS). Gegenstand dieses Vertrages ist die Bereitstellung einer App zur Verwaltung von Hundeschulen, Kunden, Terminen und der In-App-Kommunikation (Chat) gemäß dem geschlossenen Hauptvertrag (z. B. den AGB der App-Nutzung).</p>
            <p style={pStyle}>(2) Die Dauer dieses Vertrages richtet sich nach der Laufzeit des Hauptvertrages.</p>

            <h2 style={{ ...h2Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>2. Art und Zweck der Verarbeitung</h2>
            <p style={pStyle}>(1) Art der Verarbeitung: Die Verarbeitung umfasst das Erheben, Speichern, Auslesen, Abfragen, Verwenden, Übermitteln und Löschen von Daten durch die vom Auftragsverarbeiter bereitgestellte Cloud-Infrastruktur.</p>
            <p style={pStyle}>(2) Zweck der Verarbeitung: Bereitstellung der Software-Funktionalitäten (Terminbuchung, Kundenverwaltung, Zahlungsabwicklung, Chat-Kommunikation) für die Kunden und Trainer des Verantwortlichen.</p>

            <h2 style={{ ...h2Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>3. Art der personenbezogenen Daten und Kategorien Betroffener</h2>
            <p style={pStyle}><strong>(1) Art der Daten:</strong></p>
            <ul style={listStyle}>
                <li style={liStyle}>Stammdaten (Vorname, Nachname, E-Mail-Adresse, Telefonnummer, verschlüsselte Passwörter/Auth-IDs)</li>
                <li style={liStyle}>Hundedaten (Name, Rasse, Geburtsdatum, Chipnummer, Trainingslevel, Bilder)</li>
                <li style={liStyle}>Vertrags- und Buchungsdaten (gebuchte Kurse, Termine, Anwesenheiten, Trainingsstände/Achievements)</li>
                <li style={liStyle}>Kommunikationsdaten (Inhalte von Chat-Nachrichten zwischen Trainern und Kunden)</li>
                <li style={liStyle}>Finanzdaten (Transaktionshistorie, Guthaben, Rechnungsnummern, Stripe-IDs)</li>
                <li style={liStyle}>Technische Daten (Geräte-IDs/Push-Tokens, IP-Adressen für System-Logs)</li>
            </ul>
            <p style={pStyle}><strong>(2) Kategorien betroffener Personen:</strong></p>
            <ul style={listStyle}>
                <li style={liStyle}>Kunden des Verantwortlichen (Hundehalter)</li>
                <li style={liStyle}>Mitarbeiter/Trainer des Verantwortlichen</li>
            </ul>

            <h2 style={{ ...h2Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>4. Pflichten des Auftragsverarbeiters</h2>
            <p style={pStyle}>(1) Der Auftragsverarbeiter verarbeitet personenbezogene Daten ausschließlich im Rahmen der getroffenen Vereinbarungen und nach den dokumentierten Weisungen des Verantwortlichen.</p>
            <p style={pStyle}>(2) Der Auftragsverarbeiter bestätigt, dass er die Vorgaben der Art. 28 bis 33 DSGVO einhält. Er gewährleistet insbesondere die Umsetzung angemessener technischer und organisatorischer Maßnahmen (TOMs) gemäß Art. 32 DSGVO (siehe Anlage 1).</p>
            <p style={pStyle}>(3) Der Auftragsverarbeiter unterstützt den Verantwortlichen nach Möglichkeit mit geeigneten technischen und organisatorischen Maßnahmen bei der Erfüllung von Betroffenenrechten (z. B. Auskunft, Berichtigung, Löschung). (Hinweis: Durch die App-Funktionalität ist die Löschung/Bearbeitung von Nutzerdaten direkt durch den Verantwortlichen oder Betroffenen gewährleistet).</p>

            <h2 style={{ ...h2Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>5. Einschaltung von Unterauftragsverarbeitern (Sub-Dienstleister)</h2>
            <p style={pStyle}>(1) Der Verantwortliche stimmt der Einschaltung der nachfolgend aufgeführten Unterauftragsverarbeiter zu. Der Auftragsverarbeiter stellt sicher, dass die Unterauftragsverarbeiter dieselben datenschutzrechtlichen Verpflichtungen einhalten.</p>
            <p style={pStyle}><strong>Aktuell eingesetzte Unterauftragsverarbeiter:</strong></p>
            <ul style={listStyle}>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Supabase</strong> (Backend as a Service, Datenbank-Hosting, Authentifizierung) – Serverstandort: Frankfurt am Main, Deutschland (AWS EU).</li>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Vercel Inc.</strong> (Frontend/App-Hosting, API-Routing) – Serverstandort: Frankfurt am Main, Deutschland (EU-Region).</li>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Resend Inc.</strong> (E-Mail-Versand für System-Mails) – Datenverarbeitung ggf. in Drittländern (USA), abgesichert durch EU-Standardvertragsklauseln.</li>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Stripe Payments Europe, Ltd.</strong> (Zahlungsabwicklung) – Datenverarbeitung ggf. in Drittländern (USA), abgesichert durch EU-Standardvertragsklauseln.</li>
            </ul>
            <p style={pStyle}>(2) Wechselt der Auftragsverarbeiter einen Unterauftragsverarbeiter oder fügt einen neuen hinzu, wird er den Verantwortlichen vorab (z. B. per E-Mail oder im Admin-Dashboard) informieren. Der Verantwortliche kann aus wichtigem datenschutzrechtlichen Grund widersprechen.</p>

            <h2 style={{ ...h2Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>6. Rückgabe und Löschung der Daten</h2>
            <p style={pStyle}>Nach Abschluss der vertraglichen Arbeiten oder nach Kündigung des Hauptvertrages hat der Auftragsverarbeiter sämtliche in seinen Besitz gelangten personenbezogenen Daten, Dokumente und Verarbeitungs- und Nutzungsergebnisse, die im Zusammenhang mit dem Auftragsverhältnis stehen, nach Wahl des Verantwortlichen datenschutzgerecht zu löschen oder zurückzugeben, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</p>

            {/* Seitenumbruch für Anlage 1 erzwingen */}
            <div className="html2pdf__page-break" style={{ pageBreakBefore: 'always' }}></div>
            <div style={{ marginTop: '50px' }}></div>

            <h1 style={{ textAlign: 'center', fontSize: '22px', fontWeight: '900', marginBottom: '30px', pageBreakInside: 'avoid' }}>Anlage 1: Technisch-organisatorische Maßnahmen (TOMs)</h1>
            <p style={pStyle}>Der Auftragsverarbeiter hat folgende Maßnahmen zur Datensicherheit implementiert gemäß Art. 32 DSGVO:</p>

            <h3 style={{ ...h3Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>1. Pseudonymisierung und Verschlüsselung (Art. 32 Abs. 1 lit. a DSGVO)</h3>
            <ul style={listStyle}>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Transportverschlüsselung:</strong> Sämtliche Datenübertragungen zwischen der App (Frontend) und den Servern (Backend) erfolgen zwingend TLS/SSL-verschlüsselt (HTTPS / WSS).</li>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Verschlüsselung at Rest:</strong> Die Datenbanken auf den Supabase-Servern (AWS) sind auf Speicherebene (Festplattenverschlüsselung) standardmäßig verschlüsselt. Passwörter werden niemals im Klartext, sondern durch starke Hashing-Algorithmen gesichert verarbeitet.</li>
            </ul>

            <h3 style={{ ...h3Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>2. Vertraulichkeit (Art. 32 Abs. 1 lit. b DSGVO)</h3>
            <ul style={listStyle}>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Zutrittskontrolle:</strong> Die Server werden in hochgesicherten Rechenzentren in Frankfurt betrieben (ISO 27001 zertifiziert).</li>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Zugangskontrolle:</strong> Administratoren des Auftragsverarbeiters nutzen starke Passwörter und Zwei-Faktor-Authentifizierung (2FA) für den Zugriff auf die Hosting-Dashboards (Supabase/Vercel).</li>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Zugriffskontrolle (Mandantentrennung):</strong> Die Datenbankarchitektur verwendet strikte Row Level Security (RLS) Policies (Sicherheitsregeln auf Zeilenebene). Es ist technisch durch Datenbankregeln (Verifizierung der tenant_id) ausgeschlossen, dass ein Nutzer oder Trainer des Verantwortlichen auf Daten eines anderen Mandanten (einer anderen Hundeschule) zugreifen kann.</li>
            </ul>

            <h3 style={{ ...h3Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>3. Integrität (Art. 32 Abs. 1 lit. b DSGVO)</h3>
            <ul style={listStyle}>
                <li style={{ ...liStyle, marginBottom: '8px' }}><strong>Eingabekontrolle:</strong> Es wird durch relationale Datenbank-Strukturen und Logging-Tabellen (z. B. transactions) lückenlos nachvollziehbar gemacht, wann und durch wen Daten (z. B. Zahlungen, Buchungen) eingegeben oder verändert wurden.</li>
            </ul>

            <h3 style={{ ...h3Style, pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>4. Verfügbarkeit und Belastbarkeit (Art. 32 Abs. 1 lit. b und c DSGVO)</h3>
            <ul style={listStyle}>
                <li style={{ ...liStyle, marginBottom: '8px' }}>Durch die Nutzung moderner Cloud-Architekturen (Vercel, Supabase) ist eine hohe Verfügbarkeit und Skalierbarkeit gewährleistet.</li>
                <li style={{ ...liStyle, marginBottom: '8px' }}>Regelmäßige automatisierte Backups der Datenbankstruktur durch den Hosting-Provider schützen vor versehentlichem Datenverlust.</li>
            </ul>

        </div>
    );
}