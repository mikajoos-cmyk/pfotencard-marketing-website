import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { checkTenantStatus, API_BASE_URL, fetchInvoices, type Invoice } from '@/lib/api';
import { Check, Loader2, ExternalLink, ShieldCheck as ShieldCheckIcon, Info, ArrowRight, Wallet, AlertTriangle, Download, FileText, FileCheck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingTableSection } from '@/components/pricing/PricingTableSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<any>(null);
    const [canceling, setCanceling] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [acceptingAvv, setAcceptingAvv] = useState(false);
    const [latestAvvVersion, setLatestAvvVersion] = useState("1.0");
    const navigate = useNavigate();
    const { toast } = useToast();

    const getAvvFilename = (version: string) => {
        if (!version || typeof version !== 'string') return '/AVV_Pfotencard_v1_0.pdf';
        // Formatiert "1.0" zu "1_0" für den Dateinamen
        const vPart = version.replace('.', '_');
        return `/AVV_Pfotencard_v${vPart}.pdf`;
    };

    // Sucht automatisch nach der neuesten Version (probt v1.0, v1.1, v1.2...)
    const detectLatestAvv = async () => {
        let major = 1;
        let minor = 0;
        let lastValid = "1.0";

        // Wir proben bis zu 10 Minor-Versionen in die Zukunft
        try {
            for (let i = 0; i < 10; i++) {
                const version = `${major}.${minor + i}`;
                const url = getAvvFilename(version);
                const res = await fetch(url, { method: 'HEAD' });

                // WICHTIG: Prüfen ob es wirklich ein PDF ist (und nicht die index.html vom SPA Fallback)
                const contentType = res.headers.get('content-type');
                const isPdf = contentType && contentType.includes('application/pdf');

                if (res.ok && isPdf) {
                    lastValid = version;
                } else if (i > 0) {
                    // Wenn wir eine Lücke finden, hören wir auf (v1.0 exists, v1.1 exists, v1.2 doesn't -> 1.1 is latest)
                    break;
                }
            }
            setLatestAvvVersion(lastValid);
        } catch (e) {
            console.error("Fehler bei AVV Erkennung", e);
        }
    };

    const fetchBillingData = async () => {
        try {
            setLoading(true);
            const subdomain = localStorage.getItem('pfotencard_subdomain');
            if (!subdomain) throw new Error("Keine Subdomain");

            // AVV Check parallel starten, damit latestAvvVersion frühzeitig gesetzt wird
            const avvPromise = detectLatestAvv();
            const statusPromise = checkTenantStatus(subdomain);

            const [_, configStatus] = await Promise.all([avvPromise, statusPromise]);
            setStatus(configStatus);

            // Rechnungen laden...
            if (configStatus.has_payment_method || configStatus.stripe_subscription_status) {
                try {
                    const invoiceData = await fetchInvoices();
                    setInvoices(invoiceData);
                } catch (err) {
                    console.error("Konnte Rechnungen nicht laden", err);
                }
            }
        } catch (e) {
            console.error(e);
            navigate('/anmelden');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillingData();
    }, [navigate]);

    const handleCancelSubscription = async () => {
        if (!confirm("Möchtest du dein Abo wirklich zum Laufzeitende kündigen?")) return;
        setCanceling(true);
        try {
            const token = localStorage.getItem('pfotencard_token');
            const subdomain = localStorage.getItem('pfotencard_subdomain');
            const res = await fetch(`${API_BASE_URL}/api/stripe/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-subdomain': subdomain || '' }
            });
            if (!res.ok) throw new Error("Fehler");
            toast({ title: "Gekündigt", description: "Dein Abo läuft zum Ende des Zeitraums aus." });
            await fetchBillingData();
        } catch (e) {
            toast({ variant: "destructive", title: "Fehler", description: "Konnte nicht kündigen." });
        } finally {
            setCanceling(false);
        }
    };

    const openCustomerPortal = async () => {
        const token = localStorage.getItem('pfotencard_token');
        const subdomain = localStorage.getItem('pfotencard_subdomain');
        try {
            const res = await fetch(`${API_BASE_URL}/api/stripe/portal?return_url=${window.location.href}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-subdomain': subdomain || '' }
            });
            if (!res.ok) throw new Error("Portal Fehler");
            const data = await res.json();
            if (data.url) window.open(data.url, '_blank');
        } catch (e) {
            toast({ variant: "destructive", title: "Fehler", description: "Portal konnte nicht geöffnet werden." });
        }
    };

    const handleAcceptAVV = async () => {
        if (!confirm("Hiermit schließen Sie den Vertrag zur Auftragsverarbeitung (AVV) verbindlich ab.")) return;
        setAcceptingAvv(true);
        try {
            const token = localStorage.getItem('pfotencard_token');
            const subdomain = localStorage.getItem('pfotencard_subdomain');
            const res = await fetch(`${API_BASE_URL}/api/legal/avv/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-subdomain': subdomain || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ version: latestAvvVersion })
            });
            if (!res.ok) throw new Error("Fehler beim Speichern");

            toast({ title: "AVV unterzeichnet", description: "Der Status wurde erfolgreich gespeichert." });
            await fetchBillingData(); // Status neu laden
        } catch (e) {
            toast({ variant: "destructive", title: "Fehler", description: "Konnte AVV nicht speichern." });
        } finally {
            setAcceptingAvv(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Lade Daten...</div>;

    // Helper & Formats
    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('de-DE') : '-';
    const formatCurrency = (amount?: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);

    // --- STATUS FLAGS ---
    const isExpired = status && !status.subscription_valid;
    const isCancelled = status?.cancel_at_period_end === true || status?.stripe_subscription_status === 'canceled';
    const isStripeTrial = status?.stripe_subscription_status === 'trialing';
    const hasPaymentMethod = status?.has_payment_method;
    // Wenn abgelaufen und KEIN Zahlungsmittel hinterlegt ist, war es wohl das 14-Tage Testabo
    const isTrialExpired = isExpired && !hasPaymentMethod;
    const isRegistrationTrial = status?.in_trial && !hasPaymentMethod;

    const isPendingSwitch = !!status?.upcoming_plan && status.upcoming_plan !== status.plan;

    // --- NEUE FEHLER-STATI ---
    const isIncompleteExpired = status?.stripe_subscription_status === 'incomplete_expired';
    const isPastDue = status?.stripe_subscription_status === 'past_due' || status?.stripe_subscription_status === 'unpaid';
    const isIncomplete = status?.stripe_subscription_status === 'incomplete';

    // Logik: Zeige Preise (Buchen) WENN:
    // 1. Kein Zahlungsmittel (Reg Trial)
    // 2. Gekündigt (Um Reaktivierung zu ermöglichen)
    // 3. Abgelaufen ODER Abgebrochen (incomplete_expired)
    // 4. Ausstehend (incomplete) -> Damit der Kunde nochmal auf den Plan klicken und das Fenster öffnen kann
    // WICHTIG: Bei past_due zeigen wir KEINE neuen Pläne, da der User ins Portal muss.
    const showPricing = (!hasPaymentMethod || isCancelled || isExpired || isIncompleteExpired || isIncomplete) && !isPastDue;

    const planName = status?.plan ? status.plan.charAt(0).toUpperCase() + status.plan.slice(1) : 'Starter';
    const upcomingPlanName = status?.upcoming_plan ? status.upcoming_plan.charAt(0).toUpperCase() + status.upcoming_plan.slice(1) : '';

    // --- BADGE FARBEN LOGIK ---
    let badgeText = 'AKTIV';
    let badgeClass = 'bg-primary hover:bg-primary text-primary-foreground border-transparent';

    if (isStripeTrial) {
        badgeText = 'TESTPHASE';
        badgeClass = 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-transparent';
    } else if (isPastDue) {
        badgeText = 'FEHLGESCHLAGEN';
        badgeClass = 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200';
    } else if (isIncomplete) {
        badgeText = 'AUSSTEHEND';
        badgeClass = 'bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200';
    }

    return (
        <main className="pt-24 pb-12 bg-background min-h-screen">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-sans font-bold text-foreground mb-2">Abo & Zahlungen</h1>
                        <p className="text-muted-foreground">Verwalte dein Abonnement und lade Rechnungen herunter.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/einstellungen')}>Zurück zu Einstellungen</Button>
                </div>

                {/* --- INFO BANNER --- */}

                {/* 1. Zahlung abgebrochen / abgelaufen (incomplete_expired) */}
                {isIncompleteExpired && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <strong>Zahlungsversuch abgelaufen</strong>
                            <p className="text-sm mt-1">Dein letzter Bezahlvorgang wurde nicht abgeschlossen (z.B. weil das Browserfenster geschlossen wurde) und ist bei Stripe abgelaufen. Bitte wähle unten deinen gewünschten Plan einfach noch einmal aus, um die Buchung durchzuführen.</p>
                        </div>
                    </div>
                )}

                {/* 2. Zahlung fehlgeschlagen (past_due / unpaid) */}
                {isPastDue && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <strong>Automatische Zahlung fehlgeschlagen</strong>
                            <p className="text-sm mt-1">Wir konnten deine letzte Rechnung nicht abbuchen. Bitte aktualisiere deine Zahlungsmethode im Kundenportal, um deinen Zugang nicht zu verlieren.</p>
                            <Button variant="outline" size="sm" className="mt-3 bg-white text-red-800 border-red-200 hover:bg-red-50" onClick={openCustomerPortal}>
                                <ExternalLink className="w-4 h-4 mr-2" /> Zahlungsmethode prüfen & bezahlen
                            </Button>
                        </div>
                    </div>
                )}

                {/* 3. Zahlung ausstehend (incomplete) */}
                {isIncomplete && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <strong>Zahlung noch nicht bestätigt</strong>
                            <p className="text-sm mt-1">Es steht noch eine Bestätigung deiner Zahlung aus. Klicke unten einfach nochmal auf deinen gewählten Plan, um das Zahlungsfenster wieder zu öffnen.</p>
                            <Button variant="outline" size="sm" className="mt-3 bg-white text-orange-800 border-orange-200 hover:bg-orange-50" onClick={openCustomerPortal}>
                                <ExternalLink className="w-4 h-4 mr-2" /> Alternativ: Zum Kundenportal
                            </Button>
                        </div>
                    </div>
                )}

                {/* 4. Normal abgelaufen (Höchste Priorität, aber nur wenn nicht schon ein Stripe-Fehler vorliegt) */}
                {isExpired && !isIncompleteExpired && !isPastDue && !isIncomplete && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <strong>{isTrialExpired ? "Test-Abo abgelaufen" : "Abo abgelaufen"}</strong>
                            <p className="text-sm mt-1">Bitte wähle unten einen Plan, um Pfotencard weiterhin zu nutzen.</p>
                        </div>
                    </div>
                )}

                {/* 5. Kündigung (Nur anzeigen, wenn NICHT abgelaufen) */}
                {isCancelled && status?.subscription_ends_at && !isExpired && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div>
                            <strong>Dein Abo ist gekündigt.</strong>
                            <p className="text-sm mt-1">Du hast noch Zugriff bis zum {formatDate(status.subscription_ends_at)}. Wähle unten einen Plan, um dein Abo zu reaktivieren.</p>
                        </div>
                    </div>
                )}

                {/* 6. Plan Wechsel (Nur wenn nicht abgelaufen) */}
                {isPendingSwitch && !isCancelled && !isExpired && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <Info className="w-5 h-5 mt-0.5" />
                        <div>
                            <strong>Plan-Wechsel vorgemerkt</strong>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                                <span>Aktuell: <b>{planName}</b></span>
                                <ArrowRight className="w-4 h-4" />
                                <span>Ab {formatDate(status.next_payment_date)}: <b>{upcomingPlanName}</b></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Trial (Stripe) (Nur wenn nicht abgelaufen) */}
                {isStripeTrial && !isCancelled && !isPendingSwitch && !isExpired && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <Info className="w-5 h-5 mt-0.5" />
                        <div>
                            <strong>Kostenlose Testphase aktiv.</strong>
                            <p className="text-sm mt-1">
                                Deine erste reguläre Abbuchung über <b>{formatCurrency(status?.next_payment_amount)}</b> erfolgt am <b>{formatDate(status?.next_payment_date)}</b>.
                            </p>
                        </div>
                    </div>
                )}


                {showPricing ? (
                    // --- PREISTABELLE (Neu, Gekündigt oder Abgelaufen) ---
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {isRegistrationTrial && !isExpired && (
                            <div className="text-center mb-4 p-4 bg-muted/30 rounded-lg">
                                <p className="font-medium">Deine 14-tägige Testphase läuft.</p>
                                <p className="text-sm text-muted-foreground">Wähle jetzt einen Plan, um Pfotencard danach weiterzunutzen.</p>
                            </div>
                        )}
                        <div className="flex justify-center">
                            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)} className="w-full max-w-[400px]">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="monthly">Monatlich</TabsTrigger>
                                    <TabsTrigger value="yearly">Jährlich (-10%)</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <PricingTableSection
                            billingCycle={billingCycle}
                            onSelectPlan={(p) => navigate(`/checkout?plan=${p.toLowerCase()}&cycle=${billingCycle}`)}
                            isUpgradeMode={true}
                            // WICHTIG: Wenn abgelaufen, keinen aktuellen Plan anzeigen
                            currentPlan={isExpired ? null : status?.plan}
                        />
                        {hasPaymentMethod && (
                            <div className="flex justify-center mt-4">
                                <Button variant="ghost" onClick={openCustomerPortal}>
                                    <ExternalLink className="w-4 h-4 mr-2" /> Rechnungen verwalten
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    // --- AKTIVES ABO ANSICHT ---
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Hauptkarte Abo */}
                            <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-md overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4">
                                    <Badge variant="outline" className={badgeClass}>
                                        {badgeText}
                                    </Badge>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mein Abonnement</CardTitle>
                                    <div className="flex items-center gap-3 mt-1">
                                        <h2 className="text-4xl font-bold text-foreground">{planName}</h2>
                                    </div>
                                </CardHeader>

                                <CardContent className="mt-4">
                                    {/* DETAIL BOX: Nächste Zahlung */}
                                    <div className="bg-white/80 border border-primary/10 rounded-lg p-4 mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-green-100 rounded-full text-green-700">
                                                <Wallet className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                                    {isPendingSwitch ? 'Nächste Zahlung & Wechsel' : 'Nächste Zahlung'}
                                                </p>

                                                {status?.next_payment_date ? (
                                                    <div>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-bold text-foreground">
                                                                {formatCurrency(status.next_payment_amount)}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground">
                                                                am {formatDate(status.next_payment_date)}
                                                            </span>
                                                        </div>

                                                        {isPendingSwitch && (
                                                            <div className="mt-2 text-sm text-blue-600 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded w-fit">
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                                Wechsel auf <strong>{upcomingPlanName}</strong>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-foreground font-medium">Wird berechnet...</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                                        <span>Zahlungsmethode sicher hinterlegt</span>
                                    </div>
                                </CardContent>

                                <CardFooter className="gap-2 border-t pt-4 bg-muted/20">
                                    <Button variant="default" className="gap-2" onClick={openCustomerPortal}>
                                        <ExternalLink className="w-4 h-4" /> Rechnungen
                                    </Button>
                                    <Button variant="outline" className="bg-background" onClick={() => navigate('/preise')}>
                                        Plan ändern
                                    </Button>
                                    <Button variant="ghost" className="text-destructive hover:bg-destructive/10 ml-auto hover:text-destructive" onClick={handleCancelSubscription} disabled={canceling}>
                                        {canceling ? <Loader2 className="animate-spin w-4 h-4" /> : 'Kündigen'}
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Hilfe Karte */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hilfe</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-4">
                                    <p>Fragen zur Abrechnung? Wir helfen dir gerne weiter.</p>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span>Support: <strong>{status?.plan === 'enterprise' ? 'Priority' : 'Standard'}</strong></span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" variant="secondary" onClick={() => navigate('/kontakt')}>Kontakt aufnehmen</Button>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* --- AVV / DATENSCHUTZ KARTE --- */}
                        <Card className="mb-8 border-blue-100 bg-blue-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-900">
                                    <Shield className="w-5 h-5" /> Auftragsverarbeitung (AVV)
                                </CardTitle>
                                <CardDescription>
                                    Als Hundeschule verarbeitest du personenbezogene Daten. Nach Art. 28 DSGVO benötigst du hierfür einen Vertrag mit uns.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {status?.avv_accepted_at ? (
                                    <div className="flex items-center gap-3 text-green-700 bg-green-50 p-3 rounded-md border border-green-200">
                                        <FileCheck className="w-5 h-5" />
                                        <div>
                                            <strong>Vertrag aktiv</strong>
                                            <p className="text-sm">Akzeptiert am {new Date(status.avv_accepted_at).toLocaleDateString()} (Version {status.avv_version})</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="ml-auto text-green-800 hover:text-green-900 hover:bg-green-100" asChild>
                                            <a href={getAvvFilename(status.avv_version || "1.0")} target="_blank">Auftragsverarbeitungsvertrag (AVV) v{status.avv_version || "1.0"} ansehen</a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded border text-sm">
                                            <p className="mb-2">Bitte lade den Vertrag herunter, lies ihn durch und bestätige ihn hier digital.</p>
                                            <a href={getAvvFilename(latestAvvVersion)} target="_blank" className="text-primary hover:underline font-medium flex items-center gap-1">
                                                <Download className="w-4 h-4" /> Auftragsverarbeitungsvertrag (AVV) v{latestAvvVersion} herunterladen
                                            </a>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-xs text-muted-foreground italic">
                                                Durch Klick auf den Button erklärst du dich mit dem oben verlinkten AVV einverstanden.
                                                Wir protokollieren diesen Klick mit Zeitstempel als rechtlichen Nachweis.
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <Button onClick={handleAcceptAVV} disabled={acceptingAvv}>
                                                    {acceptingAvv ? <Loader2 className="animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                                    AVV jetzt digital abschließen
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* --- RECHNUNGSHISTORIE --- */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" /> Rechnungshistorie
                                </CardTitle>
                                <CardDescription>Die letzten 12 Rechnungen zum Download.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {invoices.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Datum</TableHead>
                                                <TableHead>Betrag</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Rechnung</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoices.map((inv) => (
                                                <TableRow key={inv.id}>
                                                    <TableCell>{formatDate(inv.created)}</TableCell>
                                                    <TableCell className="font-medium">{formatCurrency(inv.amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100'
                                                        }>
                                                            {inv.status === 'paid' ? 'Bezahlt' : inv.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {/* Bevorzugt Hosted URL nutzen, da diese den aktuellen Status "Bezahlt" zeigt */}
                                                        {inv.hosted_url ? (
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <a href={inv.hosted_url} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="w-4 h-4 mr-2" /> Ansehen
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            inv.pdf_url && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer">
                                                                        <Download className="w-4 h-4 mr-2" /> PDF
                                                                    </a>
                                                                </Button>
                                                            )
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Keine Rechnungen gefunden.</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="border-t bg-muted/20 py-3">
                                <Button variant="link" size="sm" className="ml-auto text-muted-foreground" onClick={openCustomerPortal}>
                                    Alle Rechnungen im Stripe Portal ansehen <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </main>
    );
}