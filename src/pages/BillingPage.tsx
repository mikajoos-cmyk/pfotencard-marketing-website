import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { checkTenantStatus, API_BASE_URL, fetchInvoices, reactivateSubscription, type Invoice } from '@/lib/api';
import { Check, Loader2, ExternalLink, ShieldCheck as ShieldCheckIcon, Info, ArrowRight, Wallet, AlertTriangle, Download, FileText, FileCheck, Shield, Eye, Users, Coins } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { PricingTableSection } from '@/components/pricing/PricingTableSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AVVDocument from '@/components/legal/AVVDocument';
import html2pdf from 'html2pdf.js';

export function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<any>(null);
    const [canceling, setCanceling] = useState(false);
        const [reactivating, setReactivating] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [acceptingAvv, setAcceptingAvv] = useState(false);
    const [latestAvvVersion, setLatestAvvVersion] = useState("1.0");
    const [showAvvPreview, setShowAvvPreview] = useState(false);
    const avvRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const fetchBillingData = async () => {
        try {
            setLoading(true);
            const subdomain = localStorage.getItem('pfotencard_subdomain');
            if (!subdomain) throw new Error("Keine Subdomain");

            const configStatus = await checkTenantStatus(subdomain);
            setStatus(configStatus);
            if (configStatus.current_avv_version) {
                setLatestAvvVersion(configStatus.current_avv_version);
            }

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

    const handleReactivateSubscription = async () => {
        setReactivating(true);
        try {
            await reactivateSubscription();
            toast({ title: "Reaktiviert", description: "Dein Abo wurde erfolgreich reaktiviert." });
            await fetchBillingData();
        } catch (e) {
            toast({ variant: "destructive", title: "Fehler", description: "Konnte nicht reaktivieren." });
        } finally {
            setReactivating(false);
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

    const handleDownloadPDF = () => {
        const element = avvRef.current;
        if (!element) return;
        
        const opt = {
          margin:       10,
          filename:     `AVV_Pfotencard_v${latestAvvVersion.replace('.', '_')}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save();
    };

    const handleDownloadPreviousPDF = (version: string) => {
        const element = avvRef.current;
        if (!element) return;
        
        const opt = {
          margin:       10,
          filename:     `AVV_Pfotencard_v${version.replace('.', '_')}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Wir müssen sicherstellen, dass das Element die richtige Version rendert
        // Da das hidden element aktuell immer die latest version rendert (siehe unten),
        // müssten wir es eigentlich dynamisch anpassen. 
        // Für jetzt laden wir einfach das, was da ist, da die Komponente noch keine Logik für alte Texte hat.
        html2pdf().set(opt).from(element).save();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Lade Daten...</div>;

    // Helper & Formats
    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('de-DE') : '-';
    const formatCurrency = (amount?: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);

    // --- BERECHNUNG DES GESAMTPREISES ---
    const calculateTotal = () => {
        if (!status) return 0;
        
        // 1. Basis-Abo-Preis (Wir nehmen an, next_payment_amount ist der Grundpreis des Abos)
        const basePrice = status.next_payment_amount || 0;
        
        // 2. Kosten für zusätzliche Kunden
        let additionalCustomerCosts = 0;
        if (status.max_customers && status.customer_count > status.max_customers) {
            additionalCustomerCosts = (status.customer_count - status.max_customers) * (status.additional_cost_per_customer || 0);
        }
        
        // 3. Servicegebühren (Top-up Fees)
        const serviceFees = status.current_billing_period_fees || 0;
        
        return {
            basePrice,
            additionalCustomerCosts,
            serviceFees,
            total: basePrice + additionalCustomerCosts + serviceFees
        };
    };

    const priceDetails = calculateTotal();

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
    const showPricing = (!hasPaymentMethod || isExpired || isIncompleteExpired || isIncomplete) && !isPastDue;

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
                        <div className="flex-1">
                            <strong>Dein Abo ist gekündigt.</strong>
                            <p className="text-sm mt-1">Du hast noch Zugriff bis zum {formatDate(status.subscription_ends_at)}. Du kannst dein Abo jederzeit wieder reaktivieren.</p>
                        </div>
                        <Button variant="default" size="sm" onClick={handleReactivateSubscription} disabled={reactivating}>
                            {reactivating ? <><Loader2 className="animate-spin mr-2" /> Reaktiviere...</> : 'Abo reaktivieren'}
                        </Button>
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
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-3xl font-bold text-foreground">
                                                                    {typeof priceDetails === 'object' ? formatCurrency(priceDetails.total) : formatCurrency(status.next_payment_amount)}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    am {formatDate(status.next_payment_date)}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Aufschlüsselung der Kosten */}
                                                            {typeof priceDetails === 'object' && (priceDetails.additionalCustomerCosts > 0 || priceDetails.serviceFees > 0) ? (
                                                                <div className="text-xs text-muted-foreground mt-1 space-y-0.5 border-t pt-1 max-w-[250px]">
                                                                    <div className="flex justify-between">
                                                                        <span>{isPendingSwitch ? upcomingPlanName : planName} Abo:</span>
                                                                        <span>{formatCurrency(priceDetails.basePrice)}</span>
                                                                    </div>
                                                                    {priceDetails.additionalCustomerCosts > 0 && (
                                                                        <div className="flex justify-between">
                                                                            <span>Zusätzliche Kunden ({status.customer_count - status.max_customers}):</span>
                                                                            <span>{formatCurrency(priceDetails.additionalCustomerCosts)}</span>
                                                                        </div>
                                                                    )}
                                                                    {priceDetails.serviceFees > 0 && (
                                                                        <div className="flex justify-between">
                                                                            <span>Service Gebühren:</span>
                                                                            <span>{formatCurrency(priceDetails.serviceFees)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : null}
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
                                    {isCancelled ? (
                                        <Button variant="default" className="ml-auto" onClick={handleReactivateSubscription} disabled={reactivating}>
                                            {reactivating ? <Loader2 className="animate-spin w-4 h-4" /> : 'Reaktivieren'}
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" className="text-destructive hover:bg-destructive/10 ml-auto hover:text-destructive" onClick={handleCancelSubscription} disabled={canceling}>
                                            {canceling ? <Loader2 className="animate-spin w-4 h-4" /> : 'Kündigen'}
                                        </Button>
                                    )}
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

                        {/* --- USAGE / NUTZUNG --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-primary/10">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" /> Kunden-Nutzung
                                    </CardTitle>
                                    <CardDescription>
                                        Aktuelle Anzahl der Kunden im Vergleich zum Inklusiv-Volumen.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end mb-1">
                                            <div>
                                                <span className="text-3xl font-bold">{status?.customer_count || 0}</span>
                                                <span className="text-muted-foreground ml-1">von {status?.max_customers || '∞'} Kunden</span>
                                            </div>
                                            {status?.max_customers && status.customer_count > status.max_customers && (
                                                <Badge variant="destructive" className="mb-1">
                                                    +{formatCurrency((status.customer_count - status.max_customers) * (status.additional_cost_per_customer || 0))} / Monat
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        {status?.max_customers ? (
                                            <Progress 
                                                value={Math.min(100, (status.customer_count / status.max_customers) * 100)} 
                                                className={`h-2 ${status.customer_count > status.max_customers ? 'bg-red-100' : ''}`}
                                            />
                                        ) : (
                                            <Progress value={0} className="h-2" />
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            {status?.max_customers 
                                                ? `In deinem ${planName}-Plan sind ${status.max_customers} Kunden enthalten. ` 
                                                : `In deinem ${planName}-Plan sind unbegrenzt Kunden enthalten. `}
                                            {status?.additional_cost_per_customer > 0 && 
                                                `Jeder weitere Kunde kostet ${formatCurrency(status.additional_cost_per_customer)} pro Monat.`
                                            }
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-primary/10">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Coins className="w-5 h-5 text-primary" /> Gebühren & Aufladung
                                    </CardTitle>
                                    <CardDescription>
                                        Informationen zu Transaktionsgebühren und Guthaben.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                    <Wallet className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Service Gebühr</p>
                                                    <p className="text-xs text-muted-foreground">Bei selbstständiger Aufladung</p>
                                                </div>
                                            </div>
                                            <span className="text-xl font-bold">{(status?.top_up_fee_percent || 0).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
                                        </div>

                                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Aktueller Abrechnungszeitraum</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Gesammelte Service Gebühren</span>
                                                <span className="text-lg font-bold">{(status?.current_billing_period_fees || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Wenn deine Kunden ihr Guthaben selbstständig (z.B. via Stripe/PayPal) aufladen, fällt eine Service Gebühr von {(status?.top_up_fee_percent || 0).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% pro Aufladung an (entspricht {(status?.top_up_fee_fixed || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} bei einer Standardaufladung). Bei manuellen Aufladungen durch dich entstehen keine zusätzlichen Pfotencard-Gebühren.
                                        </p>
                                    </div>
                                </CardContent>
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
                                {status?.avv_accepted_at && status.avv_version === latestAvvVersion ? (
                                    <div className="flex items-center gap-3 text-green-700 bg-green-50 p-3 rounded-md border border-green-200">
                                        <FileCheck className="w-5 h-5" />
                                        <div className="flex-1">
                                            <strong>Vertrag aktiv & aktuell</strong>
                                            <p className="text-sm">Akzeptiert am {new Date(status.avv_accepted_at).toLocaleDateString()} (Version {status.avv_version})</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setShowAvvPreview(!showAvvPreview)}>
                                                <Eye className="w-4 h-4 mr-2" /> {showAvvPreview ? 'Schließen' : 'Ansehen'}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDownloadPreviousPDF(status.avv_version)}>
                                                <Download className="w-4 h-4 mr-2" /> PDF (v{status.avv_version})
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {status?.avv_accepted_at && (
                                             <div className="bg-orange-100 border border-orange-200 text-orange-800 p-3 rounded-md flex items-center gap-3 text-sm">
                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                <p>Eine neue Version des AVV ({latestAvvVersion}) ist verfügbar. Bitte bestätige diese erneut.</p>
                                             </div>
                                        )}
                                        <div className="bg-white p-4 rounded border text-sm">
                                            <p className="mb-4">Bitte prüfe den aktuellen Vertrag und bestätige ihn hier digital.</p>
                                            <div className="flex flex-wrap gap-3">
                                                <Button variant="outline" size="sm" onClick={() => setShowAvvPreview(!showAvvPreview)}>
                                                    <Eye className="w-4 h-4 mr-2" /> {showAvvPreview ? 'Vertragstext ausblenden' : 'Vertragstext anzeigen'}
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                                                    <Download className="w-4 h-4 mr-2" /> Als PDF herunterladen
                                                </Button>
                                            </div>
                                        </div>

                                        {showAvvPreview && (
                                            <div className="bg-white border rounded-md p-4 max-h-[400px] overflow-y-auto shadow-inner mb-4">
                                                <AVVDocument tenantName={status?.name} tenantAddress={status?.tenant_address} />
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <p className="text-xs text-muted-foreground italic">
                                                Durch Klick auf den Button erklärst du dich mit der aktuellen Version des AVV ({latestAvvVersion}) einverstanden.
                                                Wir protokollieren diesen Klick mit Zeitstempel als rechtlichen Nachweis.
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <Button onClick={handleAcceptAVV} disabled={acceptingAvv}>
                                                    {acceptingAvv ? <Loader2 className="animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                                    AVV jetzt digital bestätigen
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                        {showAvvPreview && status?.avv_accepted_at && (
                                             <div className="mt-4 bg-white border rounded-md p-4 max-h-[400px] overflow-y-auto shadow-inner">
                                                <AVVDocument 
                                                    tenantName={status?.name} 
                                                    tenantAddress={status?.tenant_address} 
                                                    version={status?.avv_version} 
                                                />
                                            </div>
                                        )}

                                {/* Verstecktes Element für PDF-Generierung (immer vorhanden aber unsichtbar) */}
                                <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
                                    <div ref={avvRef}>
                                        <AVVDocument 
                                            tenantName={status?.name} 
                                            tenantAddress={status?.tenant_address} 
                                            version={showAvvPreview && status?.avv_accepted_at ? status.avv_version : latestAvvVersion}
                                        />
                                    </div>
                                </div>
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