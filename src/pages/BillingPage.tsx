// src/pages/BillingPage.tsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { checkTenantStatus, API_BASE_URL } from '@/lib/api';
import { CreditCard, Calendar, Check, Loader2, ExternalLink, ShieldCheck as ShieldCheckIcon, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PricingTableSection } from '@/components/pricing/PricingTableSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

            // Status aus DB laden (enthält jetzt LIVE Daten nach Stripe-Update)
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

    const subscriptionEnd = status?.subscription_ends_at ? new Date(status.subscription_ends_at) : new Date();
    const nextBillingDate = subscriptionEnd.toLocaleDateString('de-DE');

    // --- STATUS FLAGS ---
    // Gekündigt: Entweder zum Periodenende vorgemerkt ODER Status ist 'canceled'
    const isCancelled = status?.cancel_at_period_end === true || status?.stripe_subscription_status === 'canceled';

    // Stripe Trial: Echtes Abo, aber noch im Testzeitraum
    const isStripeTrial = status?.stripe_subscription_status === 'trialing';

    // Registration Trial: Kein Stripe Abo, nur der 14-Tage Start
    const isRegistrationTrial = status?.in_trial && !status?.has_payment_method;

    // Zahlungsmethode vorhanden?
    const hasPaymentMethod = status?.has_payment_method;

    // Logik: Zeige Preise (Buchen) WENN:
    // 1. Kein Zahlungsmittel (Reg Trial)
    // 2. Gekündigt (Um Reaktivierung zu ermöglichen)
    const showPricing = !hasPaymentMethod || isCancelled;

    const planName = status?.plan ? status.plan.charAt(0).toUpperCase() + status.plan.slice(1) : 'Starter';

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

                {/* ALERTS */}
                {isCancelled && status?.subscription_ends_at && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg mb-6 flex items-center gap-3">
                        <Info className="w-5 h-5" />
                        <div>
                            <strong>Dein Abo ist gekündigt.</strong>
                            <p className="text-sm">Du hast noch Zugriff bis zum {new Date(status.subscription_ends_at).toLocaleDateString()}. Wähle unten einen Plan zur Reaktivierung.</p>
                        </div>
                    </div>
                )}

                {isStripeTrial && !isCancelled && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 flex items-center gap-3">
                        <Info className="w-5 h-5" />
                        <div>
                            <strong>Kostenlose Testphase aktiv.</strong>
                            <p className="text-sm">Erste Abbuchung ({status?.next_payment_amount?.toFixed(2)}€) erfolgt am {nextBillingDate}.</p>
                        </div>
                    </div>
                )}

                {showPricing ? (
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
                                    <TabsTrigger value="yearly">Jährlich</TabsTrigger>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle>Mein Abonnement</CardTitle>
                                    <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                        {status.stripe_subscription_status === 'trialing' ? 'Testphase' : 'Aktiv'}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-4xl font-bold text-foreground">{planName}</div>
                                </div>

                                {/* NÄCHSTE ZAHLUNG INFO */}
                                {status?.next_payment_date && (
                                    <div className="bg-white/60 p-4 rounded border border-border mb-4">
                                        <p className="text-sm text-muted-foreground font-medium mb-1">Nächste Abrechnung:</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-foreground">
                                                {status.next_payment_amount?.toFixed(2)} €
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                am {new Date(status.next_payment_date).toLocaleDateString('de-DE')}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Zahlungsmethode hinterlegt</span>
                                </div>
                            </CardContent>
                            <CardFooter className="gap-2 border-t pt-4">
                                <Button variant="default" className="gap-2" onClick={openCustomerPortal}>
                                    <ExternalLink className="w-4 h-4" /> Rechnungen
                                </Button>
                                <Button variant="outline" onClick={() => navigate(`/preise?subdomain=${status.subdomain}`)}>Plan ändern</Button>
                                <Button variant="ghost" className="text-destructive hover:bg-destructive/10 ml-auto" onClick={handleCancelSubscription} disabled={canceling}>
                                    {canceling ? <Loader2 className="animate-spin" /> : 'Kündigen'}
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Hilfe</CardTitle></CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-4">
                                <p>Fragen zur Abrechnung? Wir helfen dir gerne.</p>
                                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Support: {status?.plan === 'enterprise' ? 'Priority' : 'Standard'}</div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="secondary" onClick={() => navigate('/kontakt')}>Kontakt</Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </main>
    );
}