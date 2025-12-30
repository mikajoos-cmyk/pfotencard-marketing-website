import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/api';
import { Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const plan = searchParams.get('plan') || 'pro';
    const cycle = searchParams.get('cycle') || 'monthly';
    const subdomain = localStorage.getItem('pfotencard_subdomain');

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

                if (!res.ok) throw new Error("Konnte Checkout-Session nicht erstellen");

                const data = await res.json();

                if (data.url) {
                    // Weiterleitung zu Stripe Checkout
                    window.location.href = data.url;
                } else {
                    throw new Error("Keine Checkout-URL erhalten");
                }
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Ein Fehler ist aufgetreten.");
            }
        }
        initPayment();
    }, [plan, cycle, subdomain, navigate]);

    return (
        <main className="pt-24 pb-12 bg-background min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b text-center">
                            <CardTitle>Sicherer Checkout</CardTitle>
                            <CardDescription>
                                Du wirst jetzt zu Stripe weitergeleitet...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-12 pb-12">
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
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-6">
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
