// src/pages/CheckoutPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

// Dein Public Key aus dem Stripe Dashboard
// HINWEIS: In Production sollte dieser über die Config kommen
const stripePromise = loadStripe('pk_test_51QZk...', { locale: 'de' }); // Platzhalter, User muss diesen ersetzen

function CheckoutForm({ plan, cycle, amount, firstChargeDate }: { plan: string, cycle: string, amount: number, firstChargeDate: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/billing`,
            },
        });

        if (error) {
            const errorMsg = error.message || "Ein unerwarteter Fehler ist aufgetreten.";
            setMessage(errorMsg);
            toast({ variant: "destructive", title: "Fehler", description: errorMsg });
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {message && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md border border-red-100">{message}</div>}

            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200 flex gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div>
                    <p className="font-bold">Kein Risiko.</p>
                    <p>Erste Abbuchung erst am {firstChargeDate}. Jederzeit kündbar.</p>
                </div>
            </div>

            <Button
                disabled={isLoading || !stripe || !elements}
                className="w-full h-12 text-lg font-bold bg-primary hover:bg-secondary"
            >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : `Jetzt kostenlos testen (dann ${amount}€)`}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Sichere SSL-Verschlüsselung via Stripe.</span>
            </div>
        </form>
    );
}

export function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const plan = searchParams.get('plan') || 'pro';
    const cycle = searchParams.get('cycle') || 'monthly';
    const subdomain = localStorage.getItem('pfotencard_subdomain');

    const [clientSecret, setClientSecret] = useState('');
    const [initializing, setInitializing] = useState(true);

    const prices = {
        starter: { monthly: 29, yearly: 290 },
        pro: { monthly: 79, yearly: 790 },
        enterprise: { monthly: 199, yearly: 1990 },
    };
    // @ts-ignore
    const price = prices[plan.toLowerCase()]?.[cycle] || 0;
    const cycleLabel = cycle === 'monthly' ? 'pro Monat' : 'pro Jahr';

    const today = new Date();
    const trialEnd = new Date(today);
    trialEnd.setDate(today.getDate() + 14);
    const firstChargeDate = trialEnd.toLocaleDateString('de-DE');

    useEffect(() => {
        if (!subdomain) {
            navigate('/anmelden');
            return;
        }

        async function initPayment() {
            try {
                const token = localStorage.getItem('pfotencard_token');

                const res = await fetch(`${API_BASE_URL}/api/stripe/create-subscription?cycle=${cycle}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'x-tenant-subdomain': subdomain || ''
                    },
                    body: JSON.stringify({ subdomain, plan: plan.toLowerCase() })
                });

                if (!res.ok) throw new Error("Konnte Checkout-Session nicht erstellen");

                const data = await res.json();
                setClientSecret(data.clientSecret);
            } catch (e) {
                console.error(e);
            } finally {
                setInitializing(false);
            }
        }
        initPayment();
    }, [plan, cycle, subdomain, navigate]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#22C55E', // Pfotencard Green
        }
    };
    const options = { clientSecret, appearance };

    return (
        <main className="pt-24 pb-12 bg-background min-h-screen">
            <div className="container mx-auto px-4 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Linke Spalte: Stripe Elements */}
                    <div className="lg:col-span-2 space-y-6">
                        <h1 className="text-3xl font-sans font-bold text-foreground">Abschluss & Zahlung</h1>
                        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b">
                                <CardTitle>Zahlungsinformationen</CardTitle>
                                <CardDescription>
                                    Kartendetails werden sicher direkt an Stripe gesendet.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8">
                                {clientSecret ? (
                                    <Elements options={options} stripe={stripePromise}>
                                        <CheckoutForm plan={plan} cycle={cycle} amount={price} firstChargeDate={firstChargeDate} />
                                    </Elements>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        <p className="text-muted-foreground animate-pulse">Sichere Verbindung zu Stripe wird aufgebaut...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rechte Spalte: Zusammenfassung */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-2 border-primary/10 shadow-lg">
                                <CardHeader className="bg-primary/5 border-b border-primary/10">
                                    <CardTitle>Bestellübersicht</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg capitalize">{plan} Paket</h3>
                                            <p className="text-sm text-muted-foreground">Abrechnung {cycle === 'monthly' ? 'monatlich' : 'jährlich'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-xl">{price}€</span>
                                            <span className="text-sm text-muted-foreground block">{cycleLabel}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Zwischensumme</span>
                                            <span>{price}€</span>
                                        </div>
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>14 Tage Testphase</span>
                                            <span>- {price}€</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t mt-2">
                                            <span>Fällig heute</span>
                                            <span>0,00€</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col gap-4">
                                    <p className="text-xs text-center text-muted-foreground">
                                        Durch Abschluss des Abos akzeptierst du unsere <a href="/agb" className="underline">AGB</a> und <a href="/datenschutz" className="underline">Datenschutzerklärung</a>.
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}