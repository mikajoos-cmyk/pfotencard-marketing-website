// src/pages/CheckoutPage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';
import { Loader2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const returnUrl = `${window.location.origin}/einstellungen?subscription_success=true`;

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: returnUrl,
            },
        });

        if (error) {
            setErrorMessage(error.message || "Ein Fehler ist aufgetreten.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {errorMessage && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-100">
                    {errorMessage}
                </div>
            )}
            <Button
                disabled={isProcessing || !stripe || !elements}
                className="w-full h-12 text-base shadow-lg"
            >
                {isProcessing ? (
                    <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Verarbeitung...</>
                ) : (
                    "Zahlung bestätigen"
                )}
            </Button>
        </form>
    );
}

export function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const plan = searchParams.get('plan') || 'pro';
    const cycle = searchParams.get('cycle') || 'monthly';
    const subdomain = localStorage.getItem('pfotencard_subdomain');

    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'payment_needed'>('loading');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || "Konnte Checkout-Session nicht erstellen");
                }

                const data = await res.json();

                // Fall 1: Zahlung erforderlich (Client Secret vorhanden)
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                    setStatus('payment_needed');
                }
                // Fall 2: Keine Zahlung erforderlich (z.B. hinterlegte Karte erfolgreich belastet oder 0€)
                else if (data.status === 'updated' || data.status === 'created') {
                    setStatus('success');
                } else {
                    throw new Error("Unerwarteter Status von Stripe");
                }
            } catch (e: any) {
                console.error(e);
                setStatus('error');
                setErrorMsg(e.message || "Ein Fehler ist aufgetreten.");
            }
        }
        initPayment();
    }, [plan, cycle, subdomain, navigate]);

    const appearance = {
        theme: 'stripe' as const,
        variables: { colorPrimary: '#22c55e' },
    };

    return (
        <main className="pt-24 pb-12 bg-background min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b text-center">
                            <CardTitle>
                                {status === 'success' ? "Erfolgreich!" : "Checkout"}
                            </CardTitle>
                            <CardDescription>
                                {status === 'success'
                                    ? "Dein Abo wurde aktualisiert."
                                    : `Pfotencard ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-8 pb-8">
                            {status === 'loading' && (
                                <div className="flex flex-col items-center justify-center gap-6 py-8">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="text-muted-foreground text-sm">Verbindung zu Stripe...</p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="text-center space-y-4">
                                    <p className="text-red-500 font-medium">{errorMsg}</p>
                                    <Button variant="outline" onClick={() => window.location.reload()}>
                                        Erneut versuchen
                                    </Button>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">Alles erledigt!</h3>
                                        <p className="text-muted-foreground text-sm mt-2">
                                            Vielen Dank. Dein Abo ist jetzt aktiv.
                                        </p>
                                    </div>
                                    <Button
                                        className="w-full gap-2"
                                        onClick={() => navigate('/einstellungen')}
                                    >
                                        Zu den Einstellungen <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            {status === 'payment_needed' && clientSecret && (
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance, locale: 'de' }}>
                                    <CheckoutForm clientSecret={clientSecret} />
                                </Elements>
                            )}
                        </CardContent>

                        {status === 'payment_needed' && (
                            <CardFooter className="bg-muted/10 border-t py-4 justify-center">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="w-4 h-4 text-green-600" />
                                    <span>Verschlüsselte Zahlung via Stripe</span>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}