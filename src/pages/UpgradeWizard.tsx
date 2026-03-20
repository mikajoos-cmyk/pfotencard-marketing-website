import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkTenantStatus, fetchPackages } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, ArrowRight, ArrowLeft, Package, Layers, CreditCard, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PLAN_MODULES, PLAN_FEATURES } from '@/lib/planConfig';

interface DBPackage {
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

export function UpgradeWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tenantStatus, setTenantStatus] = useState<any>(null);
  const [packages, setPackages] = useState<DBPackage[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Zustand für die Auswahl
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Für Schritt 3 (Vorschau)
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const subdomain = localStorage.getItem('pfotencard_subdomain');
        if (!subdomain) {
          navigate('/anmelden');
          return;
        }

        const [status, pkgs] = await Promise.all([
          checkTenantStatus(subdomain),
          fetchPackages()
        ]);

        setTenantStatus(status);
        setPackages(pkgs);
        setSelectedPlan(status.plan || 'starter');
        
        // Aktive Addons vorbesetzen (falls wir sie identifizieren können)
        // In diesem Setup gehen wir davon aus, dass wir neue Addons hinzufügen wollen.
        // Wenn der User schon Addons hat, sollten diese in selectedAddons sein, aber als "aktiv" markiert.
        // Das Backend-Handling von existing items ist wichtig.
        
        if (status.stripe_subscription_items) {
           // Wir könnten hier versuchen, die Addons aus den Items zu extrahieren.
           // Da wir aber in Schritt 2 die Addons wählen lassen, 
           // laden wir sie im Backend sowieso basierend auf der Auswahl neu.
        }

        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden der Upgrade-Daten", err);
        toast({ variant: "destructive", title: "Fehler", description: "Daten konnten nicht geladen werden." });
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadPricePreview = async () => {
    if (!tenantStatus?.tenant_id) return;
    setIsLoadingPreview(true);
    try {
      const token = localStorage.getItem('pfotencard_token');
      console.log("Starte Preisvorschau...", { selectedPlan, selectedAddons, billingCycle });
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          action: 'preview_upgrade',
          tenantId: tenantStatus.tenant_id,
          newPlan: selectedPlan,
          newAddons: selectedAddons,
          cycle: billingCycle
        }
      });
      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      console.log("Preisvorschau empfangen:", data);
      setPreviewData(data);
      if (data?.error) {
        toast({ title: "Hinweis", description: "Standardpreise werden angezeigt (Vorschau eingeschränkt)." });
      }
    } catch (err: any) {
      console.error("Fehler bei Preisvorschau", err);
      toast({ variant: "destructive", title: "Vorschau fehlgeschlagen", description: err.message || "Stripe konnte die Vorschau nicht berechnen." });
      setCurrentStep(2); // Zurück zum Modul-Schritt falls Fehler
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (currentStep === 3) {
      loadPricePreview();
    }
  }, [currentStep]);

  const handleFinalUpgrade = async () => {
    if (!tenantStatus?.tenant_id) {
      console.error("Keine Tenant ID vorhanden");
      return;
    }
    
    setIsProcessing(true);
    try {
      const hasActiveSub = !!(tenantStatus?.stripe_subscription_id && 
                           tenantStatus?.stripe_subscription_status && 
                           !['canceled', 'incomplete_expired'].includes(tenantStatus.stripe_subscription_status));

      if (!hasActiveSub) {
        // NEUKUNDE oder REAKTIVIERUNG: Zum Checkout weiterleiten
        console.log("Navigiere zum Checkout für Neukunde / Reaktivierung...");
        const params = new URLSearchParams({
          plan: selectedPlan,
          cycle: billingCycle
        });
        if (selectedAddons.length > 0) {
          params.set('addons', selectedAddons.join(','));
        }
        
        const checkoutUrl = `/checkout?${params.toString()}`;
        console.log("Navigiere zu:", checkoutUrl);
        navigate(checkoutUrl);
        return;
      }

      console.log("Führe Upgrade für Bestandskunde aus...");
      const token = localStorage.getItem('pfotencard_token');
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          action: 'update_subscription',
          tenantId: tenantStatus.tenant_id,
          newPlan: selectedPlan,
          newAddons: selectedAddons,
          cycle: billingCycle
        }
      });
      if (error) throw error;

      toast({ title: "Upgrade erfolgreich!", description: "Dein Abo wurde aktualisiert." });
      navigate('/einstellungen/billing'); // Zurück zur Billing Seite
    } catch (err: any) {
      console.error("Fehler beim Upgrade", err);
      toast({ variant: "destructive", title: "Upgrade fehlgeschlagen", description: err.message || "Die Zahlung konnte nicht verarbeitet werden." });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Lade Optionen...</p>
      </div>
    );
  }

  const basePlans = packages.filter(p => p.package_type === 'base').sort((a, b) => a.price_monthly - b.price_monthly);
  const addonPlans = packages.filter(p => p.package_type === 'addon').sort((a, b) => a.price_monthly - b.price_monthly);

  const getFeaturesToDisplay = (pkg: DBPackage) => {
    // 1. Vererbung prüfen
    let inheritedPlanName = null;
    let inheritedModules: string[] = [];
    let inheritedFeatures: Record<string, boolean> = {};

    const inheritsKey = Object.keys(pkg.features || {}).find(k => k.startsWith('inherits_') && pkg.features[k]);
    if (inheritsKey) {
        const parentName = inheritsKey.replace('inherits_', '');
        const parentPkg = packages.find((p: any) => p.plan_name.toLowerCase() === parentName.toLowerCase());
        if (parentPkg) {
            inheritedPlanName = parentPkg.plan_name;
            inheritedModules = parentPkg.allowed_modules || [];
            inheritedFeatures = parentPkg.features || {};
        }
    }

    // 2. Delta berechnen (Nur das anzeigen, was neu ist)
    const featuresToDisplay = [];
    
    if (inheritedPlanName) {
        featuresToDisplay.push({ 
            name: `Alles aus ${inheritedPlanName.charAt(0).toUpperCase() + inheritedPlanName.slice(1)}, plus:`, 
            included: true, 
            isHighlight: true 
        });
    }

    if (pkg.package_type !== 'addon') {
      if (pkg.included_customers && pkg.included_customers > 0) {
        featuresToDisplay.push({ name: `${pkg.included_customers} Kunden inklusive`, included: true });
      } else if (pkg.plan_name.toLowerCase() === 'enterprise') {
        featuresToDisplay.push({ name: 'Unbegrenzte Kunden', included: true });
      }
    }

    // Neue Module finden
    const myNewModules = (pkg.allowed_modules || []).filter((m: string) => !inheritedModules.includes(m));
    myNewModules.forEach((mId: string) => {
        const def = PLAN_MODULES.find(m => m.id === mId);
        if (def) featuresToDisplay.push({ name: def.label, included: true });
    });

    // Neue Features finden
    const myNewFeatures = Object.keys(pkg.features || {}).filter(k => pkg.features[k] && !k.startsWith('inherits_') && !inheritedFeatures[k]);
    myNewFeatures.forEach(fId => {
        const def = PLAN_FEATURES.find(f => f.id === fId);
        if (def) featuresToDisplay.push({ name: def.label, included: true });
    });

    return featuresToDisplay;
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upgrade-Center</h1>
        <p className="text-muted-foreground">Passe dein Pfotencard Paket flexibel an deine Bedürfnisse an.</p>
      </div>

      {/* Fortschrittsbalken */}
      <div className="relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />
        <div className="relative z-10 flex justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                  currentStep >= step ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted text-muted-foreground"
                }`}
              >
                {currentStep > step ? <Check className="h-5 w-5" /> : step}
              </div>
              <span className={`text-xs font-medium ${currentStep >= step ? "text-primary" : "text-muted-foreground"}`}>
                {step === 1 ? "Paket" : step === 2 ? "Module" : "Kasse"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
               <h2 className="text-xl font-semibold">Schritt 1: Basis-Paket wählen</h2>
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="flex bg-muted p-1 rounded-md text-sm shrink-0">
                    <button 
                      className={`px-3 py-1 rounded-sm transition-all ${billingCycle === 'monthly' ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                      onClick={() => setBillingCycle('monthly')}
                    >
                      Monatlich
                    </button>
                    <button 
                      className={`px-3 py-1 rounded-sm transition-all ${billingCycle === 'yearly' ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                      onClick={() => setBillingCycle('yearly')}
                    >
                      Jährlich (-10%)
                    </button>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)} className="text-primary hover:text-primary/80 shrink-0">
                    Plan behalten <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              {basePlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative cursor-pointer transition-all hover:shadow-md flex flex-col ${selectedPlan === plan.plan_name ? "ring-2 ring-primary border-primary" : ""}`}
                  onClick={() => setSelectedPlan(plan.plan_name)}
                >
                  {tenantStatus.plan === plan.plan_name && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground hover:bg-secondary">Dein aktuelles Paket</Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="capitalize">{plan.plan_name}</CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">
                        {billingCycle === 'yearly' ? plan.price_yearly.toFixed(2) : plan.price_monthly.toFixed(2)} €
                      </span>
                      <span className="text-sm ml-1">/ {billingCycle === 'yearly' ? 'Jahr' : 'Monat'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="text-xs space-y-2">
                      {getFeaturesToDisplay(plan).map((feat, idx) => (
                        <li key={idx} className={`flex items-start gap-2 ${feat.isHighlight ? "font-bold text-primary" : ""}`}>
                          <Check className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${feat.isHighlight ? "text-primary" : "text-green-500"}`} />
                          <span>{feat.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div className={`w-full h-2 rounded-full ${selectedPlan === plan.plan_name ? "bg-primary" : "bg-muted"}`} />
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="flex justify-end mt-8">
              <Button onClick={() => setCurrentStep(2)} size="lg">
                Weiter zu Modulen <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold">Schritt 2: Module (Add-ons) wählen</h2>
               <Badge variant="outline" className="text-primary border-primary">Plan: {selectedPlan}</Badge>
            </div>

            <div className="grid gap-4">
              {addonPlans.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                  Keine zusätzlichen Module für dieses Paket verfügbar.
                </div>
              )}
              {addonPlans.map((addon) => (
                <Card key={addon.id} className="overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{addon.plan_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          +{billingCycle === 'yearly' ? addon.price_yearly.toFixed(2) : addon.price_monthly.toFixed(2)} € / {billingCycle === 'yearly' ? 'Jahr' : 'Monat'}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={selectedAddons.includes(addon.plan_name)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedAddons([...selectedAddons, addon.plan_name]);
                        else setSelectedAddons(selectedAddons.filter(a => a !== addon.plan_name));
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setCurrentStep(1)} size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" /> Zurück
              </Button>
              <Button onClick={() => setCurrentStep(3)} size="lg">
                Weiter zur Kasse <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold mb-4">Schritt 3: Checkout & Preisvorschau</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Zusammenfassung</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {previewData && previewData.lines && previewData.lines.length > 0 ? (
                      <>
                        <div className="space-y-2 pb-2">
                          {previewData.lines
                            .filter((line: any) => !line.proration && line.amount !== 0)
                            .map((line: any, index: number) => (
                              <div key={index} className="flex justify-between text-muted-foreground text-xs leading-relaxed">
                                <span className="pr-4">{line.description}</span>
                                <span className="whitespace-nowrap">{(line.amount / 100).toFixed(2)} €</span>
                              </div>
                            ))
                          }
                        </div>
                        
                        <div className="pt-4 space-y-2 border-t">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Netto-Betrag</span>
                            <span>{previewData.netDueNextMonth?.toFixed(2) || '0.00'} €</span>
                          </div>
                          {previewData.taxDueNextMonth > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">MwSt.</span>
                              <span>{previewData.taxDueNextMonth?.toFixed(2) || '0.00'} €</span>
                            </div>
                          )}
                          <div className="pt-2 flex justify-between font-bold text-lg border-t text-primary">
                            <span>Zu zahlen ({billingCycle === 'yearly' ? 'pro Jahr' : 'pro Monat'})</span>
                            <span>{previewData.amountDueNextMonth?.toFixed(2) || '0.00'} €</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center pb-2 border-b">
                          <span>Basis-Paket: <span className="font-medium capitalize">{selectedPlan}</span></span>
                          <span className="text-muted-foreground">
                            {(() => {
                              const p = packages.find(pkg => pkg.plan_name === selectedPlan);
                              if (!p) return '0.00 €';
                              return (billingCycle === 'yearly' ? p.price_yearly : p.price_monthly).toFixed(2) + ' €';
                            })()}
                          </span>
                        </div>
                        {selectedAddons
                          .filter(addonName => {
                            const p = packages.find(pkg => pkg.plan_name === addonName);
                            const price = p ? (billingCycle === 'yearly' ? p.price_yearly : p.price_monthly) : 0;
                            return price > 0;
                          })
                          .map(addonName => (
                            <div key={addonName} className="flex justify-between items-center pb-2 border-b">
                              <span>Modul: <span className="font-medium capitalize">{addonName}</span></span>
                              <span className="text-muted-foreground">
                                {(() => {
                                  const p = packages.find(pkg => pkg.plan_name === addonName);
                                  if (!p) return '0.00 €';
                                  return (billingCycle === 'yearly' ? p.price_yearly : p.price_monthly).toFixed(2) + ' €';
                                })()}
                              </span>
                            </div>
                          ))
                        }
                        <div className="pt-4 space-y-2">
                          {/* Fallback-Berechnung für Netto/MwSt */}
                          {(() => {
                            const base = packages.find(p => p.plan_name === selectedPlan);
                            const basePrice = base ? (billingCycle === 'yearly' ? base.price_yearly : base.price_monthly) : 0;
                            const addonsPrice = selectedAddons.reduce((sum, addonName) => {
                              const p = packages.find(pkg => pkg.plan_name === addonName);
                              return sum + (p ? (billingCycle === 'yearly' ? p.price_yearly : p.price_monthly) : 0);
                            }, 0);
                            const total = basePrice + addonsPrice;
                            const net = total / 1.19;
                            const tax = total - net;

                            return (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Netto-Betrag</span>
                                  <span>{net.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">MwSt. (19%)</span>
                                  <span>{tax.toFixed(2)} €</span>
                                </div>
                                <div className="pt-2 flex justify-between font-bold text-lg border-t text-primary">
                                  <span>Zu zahlen ({billingCycle === 'yearly' ? 'pro Jahr' : 'pro Monat'})</span>
                                  <span>{total.toFixed(2)} €</span>
                                </div>
                              </>
                            );
                          })()}
                          <p className="text-[10px] text-muted-foreground italic text-right">Preise inkl. MwSt.</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-4">
                  <Info className="h-6 w-6 text-primary shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-primary">Wie funktioniert die anteilige Berechnung?</p>
                    <p className="text-muted-foreground">Wir berechnen nur die Differenz für die verbleibenden Tage des aktuellen Monats. Die volle Gebühr wird erst ab der nächsten regulären Rechnung fällig.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="border-primary ring-1 ring-primary/20 shadow-lg">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="text-base flex items-center gap-2">
                       <CreditCard className="h-5 w-5" /> Heute fällig
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoadingPreview ? (
                      <div className="flex flex-col items-center py-6 gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground text-center">Stripe berechnet den besten Preis...</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-1">
                          {previewData ? `${previewData.amountDueToday.toFixed(2)} €` : '0.00 €'}
                        </div>
                        {(() => {
                           const hasActiveSub = !!(tenantStatus?.stripe_subscription_id && 
                                                tenantStatus?.stripe_subscription_status && 
                                                !['canceled', 'incomplete_expired'].includes(tenantStatus.stripe_subscription_status));
                           return hasActiveSub && previewData && previewData.amountDueToday > 0;
                        })() && (
                          <div className="text-[10px] text-orange-600 font-medium mb-1 uppercase tracking-wider">
                            Anteilige Kosten (einmalig)
                          </div>
                        )}
                        {previewData && previewData.taxDueToday > 0 && (
                          <p className="text-[10px] text-muted-foreground">
                            (davon {previewData.taxDueToday.toFixed(2)} € MwSt.)
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">inkl. MwSt.</p>
                        
                        <div className="mt-6 text-left space-y-3">
                           <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-green-500 mt-0.5" />
                              <span>Sofortiger Zugriff auf alle Funktionen</span>
                           </div>
                           <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-green-500 mt-0.5" />
                              <span>Nächste Abrechnung am {previewData?.nextBillingDate ? new Date(previewData.nextBillingDate * 1000).toLocaleDateString() : '01. des Monats'}</span>
                           </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={() => {
                        console.log("Button clicked!");
                        handleFinalUpgrade();
                      }}
                      disabled={isLoadingPreview || isProcessing || !tenantStatus?.tenant_id}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                          Wird verarbeitet...
                        </>
                      ) : (
                        (() => {
                          const hasActiveSub = !!(tenantStatus?.stripe_subscription_id && 
                                               tenantStatus?.stripe_subscription_status && 
                                               !['canceled', 'incomplete_expired'].includes(tenantStatus.stripe_subscription_status));
                          return hasActiveSub ? "Jetzt zahlungspflichtig upgraden" : "Weiter zur Kasse";
                        })()
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <div className="text-[10px] text-muted-foreground text-center px-2">
                  Durch Klicken auf "Jetzt zahlungspflichtig upgraden" stimmst du der sofortigen Ausführung der Dienstleistung und den geltenden Bedingungen zu.
                </div>
              </div>
            </div>

            <div className="flex justify-start mt-8">
              <Button variant="outline" onClick={() => setCurrentStep(2)} size="lg" disabled={isProcessing}>
                <ArrowLeft className="mr-2 h-5 w-5" /> Zurück zu Modulen
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </main>
  );
}
