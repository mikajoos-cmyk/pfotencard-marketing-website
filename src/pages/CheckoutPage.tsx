// src/pages/CheckoutPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, Building2, Wallet, Tag, CheckCircle2, XCircle, MapPin, Clock, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchPackages } from '@/lib/api';
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { VatIdInput } from "@/components/ui/VatIdInput";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

import { getCountryCode } from "@/lib/country-mapping";

export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise';

export interface DBPackage {
  id: number;
  plan_name: string;
  package_type: 'base' | 'addon';
  price_monthly: number;
  price_yearly: number;
  allowed_modules: string[];
  included_customers: number;
  additional_cost_per_customer: number;
  features: Record<string, boolean>;
}

export const PLAN_DETAILS: Record<SubscriptionPlan, { name: string; price: number }> = {
    starter: { name: 'Starter', price: 29 },
    pro: { name: 'Pro', price: 59 },
    enterprise: { name: 'Enterprise', price: 99 },
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

export function CheckoutPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const planId = searchParams.get('plan') || 'starter';
    const billingCycle = searchParams.get('cycle') || 'monthly';
    const addonsParam = searchParams.get('addons');
    const addons = addonsParam ? addonsParam.split(',') : [];
    
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [intentType, setIntentType] = useState<'payment' | 'setup'>('payment');
    const [preview, setPreview] = useState<any>(null);
    const [packages, setPackages] = useState<DBPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { hotelProfile, isLoading: authLoading } = useAuth();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const pkgs = await fetchPackages();
                setPackages(pkgs);
            } catch (err) {
                console.error('Error fetching packages:', err);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const createIntent = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('pfotencard_token');
                const { data, error: functionError } = await supabase.functions.invoke('create-subscription-intent', {
                    headers: {
                        'x-tenant-subdomain': hotelProfile?.subdomain || '',
                        'Authorization': `Bearer ${token}`
                    },
                    body: {
                        plan: planId,
                        addons: addons,
                        billingCycle: billingCycle,
                        action: 'create_intent'
                        // Adresse wird hier noch nicht gesendet, da sie im Initial-Load noch nicht vom User geändert wurde
                        // Falls sie schon da ist, wird sie vom Backend aus der DB geladen
                    }
                });

                if (functionError) throw functionError;
                if (data.error) throw new Error(data.error);

                setClientSecret(data.clientSecret);
                setIntentType(data.intentType || 'payment');
                setPreview(data.preview);
            } catch (err: any) {
                console.error('Error creating intent:', err);
                setError(err.message || 'Fehler beim Initialisieren der Zahlung.');
            } finally {
                setLoading(false);
            }
        };

        if (hotelProfile) {
            createIntent();
        } else if (!authLoading) {
            // Wenn Auth fertig geladen ist aber kein Profil da ist
            setLoading(false);
            setError("Profil konnte nicht geladen werden. Bitte melden Sie sich erneut an.");
        }
    }, [planId, billingCycle, hotelProfile?.subdomain, authLoading]);

    if (authLoading || (loading && !error)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Lade Bezahlmodul...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <XCircle className="h-12 w-12 text-destructive mb-4" />
                <h1 className="text-xl font-bold mb-2">Hoppla!</h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => navigate('/billing')}>Zurück zur Übersicht</Button>
            </div>
        );
    }

    if (!clientSecret) return null;

    const planName = PLAN_DETAILS[planId as SubscriptionPlan]?.name || planId;

    return (
        <main className="pt-24 pb-12 bg-background min-h-screen">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-sans font-bold text-foreground mb-2">Checkout</h1>
                        <p className="text-muted-foreground">Sichere Bezahlung via Stripe</p>
                    </div>
                    <div className="flex gap-2">
                        {searchParams.get('from') === 'upgrade' && (
                            <Button variant="outline" onClick={() => navigate(`/upgrade`)}>Zurück zur Auswahl</Button>
                        )}
                        <Button variant="ghost" onClick={() => navigate('/billing')}>Abbrechen</Button>
                    </div>
                </div>

                <div className="bg-card border rounded-xl shadow-sm p-6 md:p-8">
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: { theme: 'stripe' },
                            locale: 'de'
                        }}
                    >
                        <CheckoutForm
                            planId={planId}
                            planName={planName}
                            intentType={intentType}
                            clientSecret={clientSecret}
                            initialPreview={preview}
                            addons={addons}
                            billingCycle={billingCycle}
                            packages={packages}
                        />
                    </Elements>
                </div>

                <p className="mt-8 text-center text-xs text-muted-foreground px-4">
                    Ihre Daten werden verschlüsselt übertragen. Durch den Abschluss des Abonnements akzeptieren Sie unsere AGB und Datenschutzbestimmungen.
                </p>
            </div>
        </main>
    );
}

export function CheckoutForm({
                                 planId,
                                 planName,
                                 intentType,
                                 savedMethods = [],
                                 clientSecret,
                                 isEligibleForTrial = false,
                                 isContinuingTrial = false,
                                 initialPreview = null,
                                 addons = [],
                                 billingCycle = 'monthly',
                                 packages = [],
                             }: {
    planId: string;
    planName: string;
    intentType: string;
    savedMethods?: any[];
    clientSecret: string;
    isEligibleForTrial?: boolean;
    isContinuingTrial?: boolean;
    initialPreview?: any;
    addons?: string[];
    billingCycle?: string;
    packages?: DBPackage[];
}) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const { hotelProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<any>(initialPreview);

    const [selectedMethod, setSelectedMethod] = useState<string>(
        savedMethods.length > 0 ? savedMethods[0].id : 'new'
    );
    const [vatId, setVatId] = useState(hotelProfile?.vat_id || '');
    const [hasVatError, setHasVatError] = useState(false);
    const [isVatValidating, setIsVatValidating] = useState(false);

    // Address states
    const [addressSearchValue, setAddressSearchValue] = useState('');
    const [address, setAddress] = useState({
        street: hotelProfile?.street || '',
        city: hotelProfile?.city || '',
        postcode: (hotelProfile as any)?.postcode || '',
        country: hotelProfile?.country || 'DE',
        countryCode: getCountryCode(hotelProfile?.country || 'DE'),
    });

    const [promoCode, setPromoCode] = useState('');
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [promoDetails, setPromoDetails] = useState<any>(null);
    const [promoError, setPromoError] = useState<string | null>(null);

    const [isSavingAddress, setIsSavingAddress] = useState(false);

    // Automatisches Speichern der Adresse wenn sie sich ändert (Debounced)
    useEffect(() => {
        if (!hotelProfile) return;

        const timer = setTimeout(async () => {
            // Nur speichern wenn sich wirklich was geändert hat im Vergleich zum Profil
            const hasChanged =
                address.street !== (hotelProfile.street || '') ||
                address.city !== (hotelProfile.city || '') ||
                address.postcode !== ((hotelProfile as any).postcode || '') ||
                address.countryCode !== (getCountryCode(hotelProfile.country || 'DE')) ||
                vatId !== (hotelProfile.vat_id || '');

            if (hasChanged) {
                setIsSavingAddress(true);
                try {
                    const token = localStorage.getItem('pfotencard_token');
                    const { data } = await supabase.functions.invoke('create-subscription-intent', {
                        headers: { 
                            'x-tenant-subdomain': hotelProfile.subdomain || '',
                            'Authorization': `Bearer ${token}`
                        },
                        body: {
                            action: 'create_intent',
                            plan: planId,
                            addons: addons,
                            billingCycle: billingCycle,
                            address,
                            vatId,
                            promoCodeId: promoDetails?.id
                        }
                    });
                    if (data?.preview) {
                        setPreview(data.preview);
                    }
                } catch (e) {
                    console.error("Error updating preview:", e);
                } finally {
                    setIsSavingAddress(false);
                }
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [address, vatId, hotelProfile?.subdomain]);

    const planDetails = PLAN_DETAILS[planId as SubscriptionPlan];
    const basePrice = planDetails?.price || 0;

    const calculateFinalPrice = () => {
        if (preview && preview.amountDueToday !== undefined) {
            console.log("[CHECKOUT] Received Preview from Stripe:", preview);

            const hasActiveSub = !!(hotelProfile?.stripe_subscription_id && 
                                 hotelProfile?.stripe_subscription_status && 
                                 !['canceled', 'incomplete_expired'].includes(hotelProfile.stripe_subscription_status));

            const isGermany = address.countryCode === 'DE' || address.country === 'Germany' || address.country === 'Deutschland';

            return {
                lines: preview.lines || [],
                subtotal: preview.netDueToday,
                proration: preview.amountDueToday, // In diesem Kontext ist proration das was heute fällig ist
                discount: 0,
                netPrice: preview.netDueToday,
                taxAmount: preview.taxDueToday,
                totalPrice: preview.amountDueToday,
                isGermany,
                hasProration: (preview.lines || []).some((l: any) => l.proration),
                hasActiveSub
            };
        }

        // Fallback-Logik für den Fall, dass keine Vorschau da ist (z.B. Offline oder Fehler)
        const base = packages.find(p => p.plan_name === planId);
        const basePrice = base ? (billingCycle === 'yearly' ? base.price_yearly : base.price_monthly) : 0;
        
        const addonsPrice = (addons || []).reduce((sum, addonName) => {
            const pkg = packages.find(p => p.plan_name === addonName);
            if (!pkg) return sum;
            return sum + (billingCycle === 'yearly' ? pkg.price_yearly : pkg.price_monthly);
        }, 0);

        let netPrice = basePrice + addonsPrice;
        if (promoDetails) {
            if (promoDetails.percent_off) {
                netPrice = netPrice * (1 - promoDetails.percent_off / 100);
            } else if (promoDetails.amount_off) {
                netPrice = Math.max(0, netPrice - promoDetails.amount_off / 100);
            }
        }

        const hasActiveSub = !!(hotelProfile?.stripe_subscription_id && 
                             hotelProfile?.stripe_subscription_status && 
                             !['canceled', 'incomplete_expired'].includes(hotelProfile.stripe_subscription_status));

        const isGermany = address.countryCode === 'DE' || address.country === 'Germany' || address.country === 'Deutschland';
        const taxRate = isGermany ? 0.19 : 0;
        const taxAmount = netPrice * taxRate;
        const totalPrice = netPrice + taxAmount;

        return {
            lines: null,
            subtotal: basePrice + addonsPrice,
            proration: 0,
            discount: (basePrice + addonsPrice) - netPrice,
            netPrice: netPrice,
            taxAmount: taxAmount,
            totalPrice: totalPrice,
            isGermany,
            hasProration: false,
            hasActiveSub
        };
    };

    const priceBreakdown = calculateFinalPrice();

    const handleValidatePromo = async () => {
        if (!promoCode.trim()) return;

        setIsValidatingPromo(true);
        setPromoError(null);
        setPromoDetails(null);

        try {
            const token = localStorage.getItem('pfotencard_token');
            const { data, error: functionError } = await supabase.functions.invoke('validate-promo-code', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: {
                    code: promoCode.trim(),
                    plan: planId
                }
            });

            if (functionError) throw functionError;

            if (data?.valid) {
                setPromoDetails(data);
                toast({
                    title: "Erfolg",
                    description: `Gutschein "${data.name}" angewendet!`,
                });

                // Nach Gutschein-Anwendung Vorschau aktualisieren
                try {
                    const token = localStorage.getItem('pfotencard_token');
                    const { data: intentData } = await supabase.functions.invoke('create-subscription-intent', {
                        headers: { 
                            'x-tenant-subdomain': hotelProfile?.subdomain || '',
                            'Authorization': `Bearer ${token}`
                        },
                        body: {
                            action: 'create_intent',
                            plan: planId,
                            addons: addons,
                            billingCycle: billingCycle,
                            address,
                            vatId,
                            promoCodeId: data.id // Hier die ID des Gutscheins nutzen
                        }
                    });
                    if (intentData?.preview) {
                        setPreview(intentData.preview);
                    }
                } catch (e) {
                    console.error("Error updating preview after promo:", e);
                }
            } else {
                setPromoError(data?.message || 'Gutscheincode ungültig.');
            }
        } catch (err: any) {
            console.error('Promo validation error:', err);
            setPromoError('Fehler bei der Validierung.');
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);
        setError(null);
        const returnUrl = `${window.location.origin}/billing`;

        const { error: submitValidationError } = await elements.submit();
        if (submitValidationError) {
            setError(submitValidationError.message ?? 'Bitte füllen Sie alle Felder aus.');
            setIsLoading(false);
            return;
        }

        // =====================================
        // ROUTE A: BEREITS GESPEICHERTE KARTE
        // =====================================
        if (selectedMethod !== 'new') {
            try {
                const token = localStorage.getItem('pfotencard_token');
                const { data, error: finalizeError } = await supabase.functions.invoke('create-subscription-intent', {
                    headers: {
                        'x-tenant-subdomain': hotelProfile?.subdomain || '',
                        'Authorization': `Bearer ${token}`
                    },
                    body: {
                        action: 'finalize_subscription',
                        plan: planId,
                        addons: addons,
                        billingCycle: billingCycle,
                        paymentMethodId: selectedMethod,
                        vatId,
                        address,
                        promoCodeId: promoDetails?.promoCodeId
                    }
                });

                if (finalizeError) throw finalizeError;
                // NEU: Backend Fehler fangen
                if (data?.error) throw new Error(data.error);

                // Neu: Erst Erfolgsmeldung, dann Reload
                toast({
                    title: "Erfolg",
                    description: 'Abonnement erfolgreich abgeschlossen!',
                });

                setTimeout(() => {
                    window.location.href = returnUrl;
                    if (window.location.pathname === '/billing') {
                        window.location.reload();
                    }
                }, 1000);
            } catch (err: any) {
                setError(err.message || 'Fehler beim Aktualisieren des Abos mit gespeicherter Karte.');
                setIsLoading(false);
            }
            return;
        }

        // =====================================
        // ROUTE B: KOMPLETT NEUE KARTE EINGEGEBEN
        // =====================================

        // Daten für PayPal Redirect speichern
        localStorage.setItem('pending_subscription_checkout', JSON.stringify({
            planId,
            vatId,
            address,
            promoCodeId: promoDetails?.promoCodeId || null
        }));

        const { error: confirmError, setupIntent, paymentIntent } = await (intentType === 'setup'
                ? stripe.confirmSetup({
                    elements,
                    confirmParams: { return_url: returnUrl },
                    redirect: 'if_required',
                })
                : stripe.confirmPayment({
                    elements,
                    confirmParams: { return_url: returnUrl },
                    redirect: 'if_required',
                })
        );

        if (confirmError) {
            localStorage.removeItem('pending_subscription_checkout'); // Cleanup bei Fehler
            setError(confirmError.message ?? 'Zahlungsdetails konnten nicht geprüft werden.');
            setIsLoading(false);
            return;
        }

        // Block für Methoden ohne Redirect (z.B. Kreditkarte)
        if ((setupIntent && setupIntent.status === 'succeeded') || (paymentIntent && paymentIntent.status === 'succeeded')) {
            try {
                const paymentMethodId = setupIntent?.payment_method
                    ? (typeof setupIntent.payment_method === 'string' ? setupIntent.payment_method : setupIntent.payment_method.id)
                    : paymentIntent?.payment_method
                        ? (typeof paymentIntent.payment_method === 'string' ? paymentIntent.payment_method : paymentIntent.payment_method.id)
                        : undefined;

                const token = localStorage.getItem('pfotencard_token');
                const { data, error: finalizeError } = await supabase.functions.invoke('create-subscription-intent', {
                    headers: {
                        'x-tenant-subdomain': hotelProfile?.subdomain || '',
                        'Authorization': `Bearer ${token}`
                    },
                    body: {
                        action: 'finalize_subscription',
                        plan: planId,
                        addons: addons,
                        billingCycle: billingCycle,
                        vatId,
                        address,
                        promoCodeId: promoDetails?.promoCodeId,
                        paymentMethodId // <-- Auch hier mitsenden für Konsistenz
                    }
                });

                if (finalizeError) throw finalizeError;
                if (data?.error) throw new Error(data.error);

                // Aufräumen
                localStorage.removeItem('pending_subscription_checkout');
                window.location.href = returnUrl;
            } catch (err: any) {
                localStorage.removeItem('pending_subscription_checkout');
                setError(err.message || 'Das Abo konnte nicht final gestartet werden.');
                setIsLoading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-4">
                <h2 className="text-xl font-semibold">Zahlung für {planName}</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                    {promoDetails?.percent_off === 100
                        ? 'Durch Ihren Gutschein nutzen Sie den Plan dauerhaft oder zeitweise kostenlos.'
                        : isContinuingTrial
                            ? 'Ihr aktueller Testzeitraum bleibt bestehen und wird auf den neuen Plan angewendet.'
                            : isEligibleForTrial
                                ? 'Sie nutzen die Plattform 90 Tage völlig kostenlos. Erst danach wird abgebucht.'
                                : 'Bitte bestätigen Sie Ihre Zahlung für den kostenpflichtigen Plan.'}
                </p>
            </div>

            {/* GUTSCHEINCODE - Jetzt prominenter oben platziert */}
            <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                <h3 className="font-medium text-sm flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Haben Sie einen Gutscheincode?
                </h3>
                <div className="flex gap-2">
                    <Input
                        placeholder="Code eingeben (z.B. SAVE20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        disabled={isValidatingPromo || !!promoDetails}
                        className="flex-1 bg-background"
                    />
                    {promoDetails ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setPromoDetails(null);
                                setPromoCode('');
                            }}
                        >
                            Entfernen
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleValidatePromo}
                            disabled={isValidatingPromo || !promoCode.trim()}
                        >
                            {isValidatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Prüfen'}
                        </Button>
                    )}
                </div>

                {promoError && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <XCircle className="w-3 h-3" /> {promoError}
                    </p>
                )}

                {promoDetails && (
                    <div className="bg-primary/10 border border-primary/20 rounded-md p-3 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-primary">Gutschein "{promoDetails.name}" aktiv</p>
                            <p className="text-muted-foreground text-xs">
                                Rabatt: {promoDetails.percent_off ? `${promoDetails.percent_off}%` : promoDetails.amount_off ? `${(promoDetails.amount_off / 100).toFixed(2)} ${promoDetails.currency?.toUpperCase()}` : 'Gültig'}
                                {promoDetails.duration === 'repeating' && promoDetails.duration_in_months && (
                                    <span className="ml-1">• für {promoDetails.duration_in_months} Monate</span>
                                )}
                                {promoDetails.duration === 'once' && (
                                    <span className="ml-1">• einmalig</span>
                                )}
                                {promoDetails.duration === 'forever' && (
                                    <span className="ml-1">• dauerhaft</span>
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Rechnungsadresse</h3>
                    <div className="flex items-center space-x-2">
                        {isSavingAddress ? (
                            <div className="flex items-center text-xs text-muted-foreground animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Speichere...
                            </div>
                        ) : (
                            <div className="flex items-center text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Gespeichert
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Adresse suchen</Label>
                        <AddressAutocomplete
                            value={addressSearchValue}
                            onChange={setAddressSearchValue}
                            onAddressSelect={(selectedAddress) => {
                                setAddress({
                                    street: selectedAddress.street,
                                    city: selectedAddress.city,
                                    postcode: selectedAddress.postcode,
                                    country: selectedAddress.country,
                                    countryCode: selectedAddress.countryCode || getCountryCode(selectedAddress.country),
                                });
                                setAddressSearchValue('');
                            }}
                            placeholder="Adresse eingeben..."
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">Straße *</Label>
                            <Input
                                id="street"
                                value={address.street}
                                readOnly
                                className="bg-muted/50 cursor-not-allowed"
                                placeholder="Straße"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="postcode">PLZ *</Label>
                                <Input
                                    id="postcode"
                                    value={address.postcode}
                                    readOnly
                                    className="bg-muted/50 cursor-not-allowed"
                                    placeholder="PLZ"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Ort *</Label>
                                <Input
                                    id="city"
                                    value={address.city}
                                    readOnly
                                    className="bg-muted/50 cursor-not-allowed"
                                    placeholder="Ort"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Land *</Label>
                            <Input
                                id="country"
                                value={address.country}
                                readOnly
                                className="bg-muted/50 cursor-not-allowed"
                                placeholder="Land"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <VatIdInput
                        value={vatId}
                        onChange={setVatId}
                        label="USt-IdNr. (für Rechnungen)"
                        onErrorStateChange={setHasVatError}
                        onValidatingStateChange={setIsVatValidating}
                    />
                </div>
            </div>

            {savedMethods.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-medium text-sm">Zahlungsmethode wählen</h3>
                    <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="grid gap-2">

                        {savedMethods.map((method) => (
                            <Label
                                key={method.id}
                                htmlFor={method.id}
                                className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${selectedMethod === method.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                            >
                                <RadioGroupItem value={method.id} id={method.id} />
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {method.type === 'card' ? (
                                            <>
                                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                <span className="uppercase font-medium">{method.card?.brand || 'Karte'} •••• {method.card?.last4}</span>
                                            </>
                                        ) : method.type === 'sepa_debit' ? (
                                            <>
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">SEPA Lastschrift •••• {method.sepa_debit?.last4}</span>
                                            </>
                                        ) : method.type === 'paypal' ? (
                                            <>
                                                <Wallet className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">PayPal ({method.paypal?.email})</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Zahlungsmethode ({method.type})</span>
                                            </>
                                        )}
                                    </div>
                                    {method.type === 'card' && method.card && (
                                        <span className="text-muted-foreground text-xs font-normal">
                            Exp: {method.card.expMonth}/{method.card.expYear}
                          </span>
                                    )}
                                </div>
                            </Label>
                        ))}

                        <Label
                            htmlFor="new"
                            className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-colors ${selectedMethod === 'new' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                        >
                            <RadioGroupItem value="new" id="new" />
                            <span className="font-medium text-sm">Neue Zahlungsmethode hinzufügen</span>
                        </Label>

                    </RadioGroup>
                </div>
            )}

            {selectedMethod === 'new' && (
                <div className="space-y-3 mt-4 pt-4 border-t">
                    <h3 className="font-medium text-sm">Neue Kartendaten</h3>
                    <PaymentElement options={{ layout: 'tabs' }} />
                </div>
            )}

            {/* Preisaufschlüsselung */}
            <div className="mt-6 pt-6 border-t space-y-3">
                <h3 className="font-medium text-sm">Zusammenfassung</h3>
                <div className="space-y-4">

                    {preview && preview.lines ? (
                        <div className="space-y-4">
                            {/* FALL: Heute nichts fällig (Bestandskunde mit Vormerkung) */}
                            {preview.amountDueToday === 0 && hotelProfile?.stripe_subscription_id && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                                    <div className="flex justify-center mb-2">
                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <p className="text-orange-600 font-bold text-base">Keine Zahlung heute</p>
                                    <p className="text-[11px] text-orange-700 mt-1 leading-tight">
                                        Der Wechsel wird heute <strong>vorgemerkt</strong>, wird aber erst zum nächsten Abrechnungsdatum am <strong>{preview?.nextBillingDate ? new Date(preview.nextBillingDate * 1000).toLocaleDateString() : 'Ende der Laufzeit'}</strong> wirksam.
                                    </p>
                                </div>
                            )}

                            {/* Heute fällige Posten */}
                            <div className="space-y-2">
                                {preview.lines
                                    .filter((line: any) => {
                                        const hasProrations = preview.lines.some((l: any) => l.proration);
                                        if (hasProrations) {
                                            // Upgrade/Downgrade Case: Nur Prorations anzeigen, die heute den Preis beeinflussen
                                            return line.proration && (line.amount > 0 || (line.amount < 0 && line.package_type !== 'addon'));
                                        }
                                        // Neukunden Case: Alles anzeigen was einen Betrag hat
                                        return line.amount !== 0;
                                    })
                                    .map((line: any, index: number) => (
                                        <div key={index} className="flex justify-between text-muted-foreground text-sm leading-relaxed">
                                            <span className="pr-4">{line.description}</span>
                                            <span className={`whitespace-nowrap ${line.amount < 0 ? "text-green-600" : ""}`}>
                                                {(line.amount / 100).toFixed(2)} €
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>

                            {/* Hinweis zu vorgemerkten Downgrades (Plan oder Addons) */}
                            {((planId !== hotelProfile?.plan && !preview.isBaseUpgrade) || 
                              (hotelProfile?.config?.active_addons?.some((a: string) => !addons.includes(a)))) && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                                    <p className="text-[11px] text-orange-700 leading-relaxed">
                                        <Info className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
                                        Der Wechsel wird heute <strong>vorgemerkt</strong>, wird aber erst zum nächsten Abrechnungsdatum am <strong>{preview?.nextBillingDate ? new Date(preview.nextBillingDate * 1000).toLocaleDateString() : 'Ende der Laufzeit'}</strong> wirksam.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 space-y-2 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Zwischensumme (Netto)</span>
                                    <span className="font-medium">{preview.netDueToday?.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>MwSt. (19%)</span>
                                    <span>{preview.taxDueToday?.toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Fallback, falls die Stripe-Vorschau noch lädt / nicht verfügbar ist */
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground text-sm pb-1">
                                <span>Paket: {planName}</span>
                                <span>{basePrice.toFixed(2)} €</span>
                            </div>

                            {addons.map(addonName => {
                                const pkg = packages.find(p => p.plan_name === addonName);
                                const price = pkg ? (billingCycle === 'yearly' ? pkg.price_yearly : pkg.price_monthly) : 0;
                                if (price === 0) return null;
                                return (
                                    <div key={addonName} className="flex justify-between text-muted-foreground text-sm pb-1">
                                        <span className="capitalize">Modul: {addonName}</span>
                                        <span>{price.toFixed(2)} €</span>
                                    </div>
                                );
                            })}

                            {priceBreakdown.discount > 0 && (
                                <div className="flex justify-between text-primary">
                                    <span>Rabatt</span>
                                    <span>-{priceBreakdown.discount.toFixed(2)} €</span>
                                </div>
                            )}

                            <div className="flex justify-between font-medium pt-2 border-t">
                                <span>Netto-Betrag</span>
                                <span>{priceBreakdown.netPrice.toFixed(2)} €</span>
                            </div>

                            {priceBreakdown.isGermany && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>MwSt. (19%)</span>
                                    <span>{priceBreakdown.taxAmount.toFixed(2)} €</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between text-xl font-bold pt-4 border-t-2 text-primary">
                        <span>{preview && preview.lines && preview.lines.some((l: any) => l.proration) ? 'Heute fällig' : 'Zu zahlen'}</span>
                        <span>{priceBreakdown.totalPrice.toFixed(2)} €</span>
                    </div>

                    {priceBreakdown.isGermany && (
                        <p className="text-[10px] text-muted-foreground mt-2 italic">
                            Hinweis: Für Kunden aus Deutschland wird die gesetzliche Mehrwertsteuer von 19% erhoben.
                        </p>
                    )}
                    {!priceBreakdown.isGermany && address.countryCode && (
                        <p className="text-[10px] text-muted-foreground mt-2 italic">
                            Hinweis: Bei grenzüberschreitenden Leistungen innerhalb der EU kann das Reverse-Charge-Verfahren Anwendung finden.
                        </p>
                    )}
                </div>
            </div>

            {error && <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-md">{error}</div>}

            <Button
                type="submit"
                disabled={!stripe || isLoading || hasVatError || isVatValidating}
                className="w-full mt-8"
                size="lg"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird verarbeitet...
                    </>
                ) : (
                    promoDetails?.percent_off === 100
                        ? 'Kostenlos starten'
                        : isContinuingTrial
                            ? 'Testzeitraum fortsetzen'
                            : isEligibleForTrial
                                ? '14 Tage kostenlos starten'
                                : 'Kostenpflichtig abonnieren'
                )}
            </Button>
        </form>
    );
}