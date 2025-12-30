// src/pages/BillingPage.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { checkTenantStatus, API_BASE_URL } from '@/lib/api';
import { CreditCard, Calendar, Download, FileText, Check, Loader2, ExternalLink, ShieldCheck as ShieldCheckIcon, Info } from 'lucide-react';
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

    useEffect(() => {
        async function loadData() {
            try {
                const subdomain = localStorage.getItem('pfotencard_subdomain');
                if (!subdomain) throw new Error("Keine Subdomain");

                const [configStatus] = await Promise.all([
                    checkTenantStatus(subdomain)
                ]);

                setStatus(configStatus);
            } catch (e) {
                navigate('/anmelden');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [navigate]);

    const handleCancelSubscription = async () => {
        if (!confirm("Möchtest du dein Abo wirklich zum Laufzeitende kündigen? Dein Zugang bleibt bis zum Ende des Zeitraums erhalten.")) return;

        setCanceling(true);
        const token = localStorage.getItem('pfotencard_token');
        const subdomain = localStorage.getItem('pfotencard_subdomain');

        try {
            const res = await fetch(`${API_BASE_URL}/api/stripe/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-subdomain': subdomain || ''
                }
            });
            if (!res.ok) throw new Error("Konnte Abo nicht kündigen");

            toast({ title: "Kündigung vorgemerkt", description: "Dein Abo läuft zum Ende des Zeitraums aus." });
            // UI aktualisieren via Reload
            window.location.reload();
        } catch (e) {
            toast({ variant: "destructive", title: "Fehler", description: "Die Kündigung konnte nicht verarbeitet werden." });
        } finally {
            setCanceling(false);
        }
    };

    const openCustomerPortal = async () => {
        const token = localStorage.getItem('pfotencard_token');
        const subdomain = localStorage.getItem('pfotencard_subdomain');

        try {
            // Wir fragen das Backend nach der Portal URL
            const res = await fetch(`${API_BASE_URL}/api/stripe/portal?return_url=${window.location.href}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-subdomain': subdomain || '' }
            });
            if (!res.ok) throw new Error("Portal konnte nicht geladen werden");

            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            toast({ variant: "destructive", title: "Fehler", description: "Kundenportal konnte nicht geöffnet werden." });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Lade Daten...</div>;

    const subscriptionEnd = status?.subscription_ends_at ? new Date(status.subscription_ends_at) : new Date();
    const nextBillingDate = subscriptionEnd.toLocaleDateString('de-DE');
    const isTrial = status?.in_trial;
    const hasPayment = status?.has_payment_method;
    const planName = status?.plan ? status.plan.charAt(0).toUpperCase() + status.plan.slice(1) : 'Starter';

    const handleSelectPlan = (plan: string) => {
        navigate(`/checkout?plan=${plan.toLowerCase()}&cycle=${billingCycle}`);
    };

    return (
        <main className="pt-24 pb-12 bg-background min-h-screen">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-sans font-bold text-foreground mb-2">Abo & Zahlungen</h1>
                        <p className="text-muted-foreground">Verwalte dein Abonnement und lade Rechnungen direkt via Stripe herunter.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/einstellungen')}>Zurück zu Einstellungen</Button>
                </div>

                {!hasPayment || isTrial ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {isTrial && (
                            <Card className="border-blue-200 bg-blue-50/50">
                                <CardHeader className="py-4">
                                    <div className="flex items-center gap-3 text-blue-800">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Kostenlose Testphase aktiv</CardTitle>
                                            <CardDescription className="text-blue-700/80">
                                                Du nutzt aktuell alle Enterprise-Features kostenlos. Hinterlege eine Zahlungsmethode, um PfotenCard nach dem {nextBillingDate} unterbrechungsfrei weiterzunutzen.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
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
                            onSelectPlan={handleSelectPlan}
                            isUpgradeMode={true}
                            currentPlan={status?.plan}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Aktueller Plan */}
                        <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-md">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle>Mein Abonnement</CardTitle>
                                    <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                        Aktiv
                                    </div>
                                </div>
                                <CardDescription>Aktueller Plan und Laufzeit</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-4xl font-bold text-foreground">{planName}</div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Nächste Zahlung:</span>
                                        <span className="font-medium">{nextBillingDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Zahlart:</span>
                                        <span className="font-medium">Verwaltung via Stripe</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="gap-2 border-t pt-4">
                                <Button variant="default" className="gap-2" onClick={openCustomerPortal}>
                                    <ExternalLink className="w-4 h-4" /> Zahlungsdaten & Rechnungen (Stripe)
                                </Button>
                                <Button variant="outline" onClick={() => navigate(`/preise?subdomain=${status.subdomain}`)}>Plan ändern</Button>
                                <Button
                                    variant="ghost"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive ml-auto"
                                    onClick={handleCancelSubscription}
                                    disabled={canceling}
                                >
                                    {canceling ? <Loader2 className="animate-spin mr-2" /> : 'Abo kündigen'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Support Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hilfe & Support</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Fragen zur Abrechnung? Unser Team hilft dir gerne weiter.</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <span>Support-Level: {status?.plan === 'enterprise' ? 'Priority' : 'Standard'}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="secondary" onClick={() => navigate('/kontakt')}>Support kontaktieren</Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* Hinweis auf Stripe */}
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="py-6 flex flex-col items-center text-center gap-2">
                        <ShieldCheckIcon className="w-10 h-10 text-primary/40" />
                        <h3 className="font-bold">Sicher & PCI-konform</h3>
                        <p className="text-sm text-muted-foreground max-w-lg">
                            Deine Zahlungsinformationen werden niemals auf unseren Servern gespeichert. Wir nutzen Stripe für die höchste Sicherheit deiner Daten.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}