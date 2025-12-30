import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/api';
import { Loader2, ShieldCheck } from 'lucide-react';
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

        const subdomain = localStorage.getItem('pfotencard_subdomain');
        const returnUrl = `https://${subdomain}.pfotencard.de/dashboard?subscription_success=true`;

        const isSetupIntent = clientSecret.startsWith('seti_');

        const { error } = isSetupIntent
            ? await stripe.confirmSetup({
                elements,
                confirmParams: {
                    return_url: returnUrl,
                },
            })
            : await stripe.confirmPayment({
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
            <button
                disabled={isProcessing || !stripe || !elements}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
                {isProcessing ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Verarbeitung...</>
                ) : (
                    "Abonnement starten"
                )}
            </button>
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
    const [error, setError] = useState<string | null>(null);

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
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    throw new Error("Kein Client Secret erhalten");
                }
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Ein Fehler ist aufgetreten.");
            }
        }
        initPayment();
    }, [plan, cycle, subdomain, navigate]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#22c55e',
        },
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
                            <CardTitle>Zahlungsinformationen</CardTitle>
                            <CardDescription>
                                {clientSecret ? "Sicherer Checkout via Stripe" : "Lade Checkout..."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 pb-8">
                            {error ? (
                                <div className="text-center space-y-4">
                                    <p className="text-red-500 font-medium">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="text-primary underline text-sm"
                                    >
                                        Erneut versuchen
                                    </button>
                                </div>
                            ) : clientSecret ? (
                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret,
                                        appearance,
                                        locale: 'de'
                                    }}
                                >
                                    <CheckoutForm clientSecret={clientSecret} />
                                </Elements>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-6 py-8">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                        <span>Sichere SSL-Verschlüsselung via Stripe.</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}
