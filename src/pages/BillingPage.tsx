// src/pages/BillingPage.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fetchAppConfig, API_BASE_URL } from '@/lib/api';
import { CreditCard, Calendar, Download, FileText, Check, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState<any>(null);
    const [canceling, setCanceling] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        async function loadData() {
            try {
                const config = await fetchAppConfig();
                setTenant(config.tenant);
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

    const today = new Date();
    const subscriptionEnd = tenant?.subscription_ends_at ? new Date(tenant.subscription_ends_at) : new Date();
    const nextBillingDate = subscriptionEnd.toLocaleDateString('de-DE');
    const isTrial = subscriptionEnd > today && tenant?.plan === 'starter';
    const planName = tenant?.plan ? tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1) : 'Starter';

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Aktueller Plan */}
                    <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle>Mein Abonnement</CardTitle>
                                <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                    {isTrial ? 'Testphase' : 'Aktiv'}
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
                                    <span className="text-muted-foreground">Läuft bis / Nächste Zahlung:</span>
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
                            <Button variant="outline" onClick={() => navigate(`/preise?subdomain=${tenant.subdomain}`)}>Plan ändern</Button>
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

                    {/* Zusammenfassung */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hilfe & Support</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">Fragen zur Abrechnung? Unser Team hilft dir gerne weiter.</p>
                            <div className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>Support-Level: {tenant?.plan === 'enterprise' ? 'Priority' : 'Standard'}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="secondary" onClick={() => navigate('/kontakt')}>Support kontaktieren</Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Hinweis auf Stripe */}
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="py-6 flex flex-col items-center text-center gap-2">
                        <ShieldCheck className="w-10 h-10 text-primary/40" />
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

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}