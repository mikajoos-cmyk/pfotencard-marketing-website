import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { checkTenantStatus, API_BASE_URL } from '@/lib/api';
import { CreditCard, Calendar, Check, Loader2, ExternalLink, ShieldCheck as ShieldCheckIcon, Info, ArrowRight, Wallet, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingTableSection } from '@/components/pricing/PricingTableSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<any>(null);
    const [canceling, setCanceling] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const navigate = useNavigate();
    const { toast } = useToast();

    const fetchBillingData = async () => {
        try {
            setLoading(true);
            const subdomain = localStorage.getItem('pfotencard_subdomain');
            if (!subdomain) throw new Error("Keine Subdomain");

            const configStatus = await checkTenantStatus(subdomain);
            setStatus(configStatus);
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
            if (data.url) window.location.href = data.url;
        } catch (e) {
            toast({ variant: "destructive", title: "Fehler", description: "Portal konnte nicht geöffnet werden." });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Lade Daten...</div>;

    // Helper & Formats
    const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('de-DE') : '-';
    const formatCurrency = (amount?: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount || 0);

    // --- STATUS FLAGS ---
    const isCancelled = status?.cancel_at_period_end === true || status?.stripe_subscription_status === 'canceled';
    const isStripeTrial = status?.stripe_subscription_status === 'trialing';
    const isRegistrationTrial = status?.in_trial && !status?.has_payment_method;
    const hasPaymentMethod = status?.has_payment_method;
    const isPendingSwitch = !!status?.upcoming_plan && status.upcoming_plan !== status.plan;

    // Logik: Zeige Preise (Buchen) WENN:
    // 1. Kein Zahlungsmittel (Reg Trial)
    // 2. Gekündigt (Um Reaktivierung zu ermöglichen)
    const showPricing = !hasPaymentMethod || isCancelled;

    const planName = status?.plan ? status.plan.charAt(0).toUpperCase() + status.plan.slice(1) : 'Starter';
    const upcomingPlanName = status?.upcoming_plan ? status.upcoming_plan.charAt(0).toUpperCase() + status.upcoming_plan.slice(1) : '';

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

                {/* 1. Kündigung */}
                {isCancelled && status?.subscription_ends_at && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-5 h-5 mt-0.5" />
                        <div>
                            <strong>Dein Abo ist gekündigt.</strong>
                            <p className="text-sm mt-1">Du hast noch Zugriff bis zum {formatDate(status.subscription_ends_at)}. Wähle unten einen Plan, um dein Abo zu reaktivieren.</p>
                        </div>
                    </div>
                )}

                {/* 2. Plan Wechsel */}
                {isPendingSwitch && !isCancelled && (
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

                {/* 3. Trial */}
                {isStripeTrial && !isCancelled && !isPendingSwitch && (
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
                    // --- PREISTABELLE (Neu oder Gekündigt) ---
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {isRegistrationTrial && (
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
                            currentPlan={status?.plan}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                        {/* Hauptkarte Abo */}
                        <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-md overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant={isStripeTrial ? "secondary" : "default"} className={isStripeTrial ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : "bg-primary hover:bg-primary"}>
                                    {isStripeTrial ? 'TESTPHASE' : 'AKTIV'}
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
                                <Button variant="outline" className="bg-background" onClick={() => navigate(`/preise?subdomain=${status.subdomain}`)}>
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
                )}
            </div>
        </main>
    );
}