import { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_BASE_URL } from '@/lib/api';
import { Loader2, ShieldCheck, CheckCircle2, ArrowRight, Building, MapPin, User } from 'lucide-react';
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

        let result;
        if (clientSecret.startsWith('seti_')) {
            result = await stripe.confirmSetup({ elements, confirmParams: { return_url: returnUrl } });
        } else {
            result = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
        }

        if (result.error) {
            setErrorMessage(result.error.message || "Ein Fehler ist aufgetreten.");
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
            <Button disabled={isProcessing || !stripe || !elements} className="w-full h-12 text-base shadow-lg">
                {isProcessing ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Verarbeitung...</> : "Zahlungspflichtig bestellen"}
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

    const [step, setStep] = useState<'billing' | 'payment' | 'success'>('billing');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Form State für Rechnungsdaten
    const [billingData, setBillingData] = useState({
        company_name: '',
        name: '',
        address_line1: '',
        postal_code: '',
        city: '',
        country: 'DE',
        vat_id: ''
    });

    const handleBillingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg(null);

        try {
            const token = localStorage.getItem('pfotencard_token');
            const res = await fetch(`${API_BASE_URL}/api/stripe/create-subscription?cycle=${cycle}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-subdomain': subdomain || ''
                },
                body: JSON.stringify({
                    subdomain,
                    plan: plan.toLowerCase(),
                    billing_details: billingData
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Konnte Checkout-Session nicht erstellen");
            }

            const data = await res.json();

            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setStep('payment');
                setStatus('idle');
            } else if (data.status === 'updated' || data.status === 'created' || data.status === 'success') {
                setStep('success');
            } else {
                throw new Error(`Unerwarteter Status: ${data.status}`);
            }
        } catch (e: any) {
            setStatus('error');
            setErrorMsg(e.message || "Ein unerwarteter Fehler ist aufgetreten.");
        }
    };

    const appearance = { theme: 'stripe' as const, variables: { colorPrimary: '#22c55e' } };

    return (
        <main className="pt-24 pb-12 bg-background min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-lg">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b text-center">
                            <CardTitle>
                                {step === 'success' ? "Erfolgreich!" : "Checkout"}
                            </CardTitle>
                            <CardDescription>
                                {step === 'success'
                                    ? "Dein Abo wurde aktualisiert."
                                    : `Pfotencard ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-8 pb-8">
                            {/* ERROR MELDUNG */}
                            {status === 'error' && (
                                <div className="text-center space-y-4 mb-6">
                                    <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded border border-red-200">{errorMsg}</div>
                                </div>
                            )}

                            {/* SCHRITT 1: RECHNUNGSDATEN */}
                            {step === 'billing' && (
                                <form onSubmit={handleBillingSubmit} className="space-y-4 animate-in fade-in">
                                    <h3 className="font-semibold flex items-center gap-2 mb-4"><Building size={18}/> Rechnungsdetails</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <Label>Vor- & Nachname *</Label>
                                            <Input required value={billingData.name} onChange={e => setBillingData({...billingData, name: e.target.value})} placeholder="Max Mustermann" />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <Label>Firmenname (Optional)</Label>
                                            <Input value={billingData.company_name} onChange={e => setBillingData({...billingData, company_name: e.target.value})} placeholder="Hundeschule Mustermann" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Straße & Hausnummer *</Label>
                                        <Input required value={billingData.address_line1} onChange={e => setBillingData({...billingData, address_line1: e.target.value})} placeholder="Musterstraße 1" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2 col-span-1">
                                            <Label>PLZ *</Label>
                                            <Input required value={billingData.postal_code} onChange={e => setBillingData({...billingData, postal_code: e.target.value})} placeholder="12345" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label>Ort *</Label>
                                            <Input required value={billingData.city} onChange={e => setBillingData({...billingData, city: e.target.value})} placeholder="Musterstadt" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Umsatzsteuer-ID (Optional)</Label>
                                        <Input value={billingData.vat_id} onChange={e => setBillingData({...billingData, vat_id: e.target.value})} placeholder="DE123456789" />
                                        <p className="text-xs text-muted-foreground">Relevant für B2B-Kunden (Reverse-Charge Verfahren)</p>
                                    </div>

                                    <Button type="submit" disabled={status === 'loading'} className="w-full mt-6 h-12">
                                        {status === 'loading' ? <><Loader2 className="animate-spin mr-2"/> Speichere Daten...</> : 'Weiter zur Zahlung'}
                                    </Button>
                                </form>
                            )}

                            {/* SCHRITT 2: STRIPE ZAHLUNG */}
                            {step === 'payment' && clientSecret && (
                                <div className="animate-in slide-in-from-right-8 duration-300">
                                    <div className="mb-6 flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-bold">Rechnung an</p>
                                            <p className="text-sm font-medium">{billingData.company_name || billingData.name}</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setStep('billing')}>Ändern</Button>
                                    </div>

                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance, locale: 'de' }}>
                                        <CheckoutForm clientSecret={clientSecret} />
                                    </Elements>
                                </div>
                            )}

                            {/* SCHRITT 3: ERFOLG */}
                            {step === 'success' && (
                                <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">Alles erledigt!</h3>
                                        <p className="text-muted-foreground text-sm mt-2">Vielen Dank. Dein Abo ist jetzt aktiv.</p>
                                    </div>
                                    <Button className="w-full gap-2" onClick={() => navigate('/einstellungen')}>
                                        Zu den Einstellungen <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="bg-muted/10 border-t py-4 justify-center">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span>100% Sichere SSL-Verschlüsselung via Stripe</span>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </main>
    );
}