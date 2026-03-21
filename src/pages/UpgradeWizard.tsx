import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkTenantStatus, fetchPackages } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, ArrowRight, ArrowLeft, Package, Layers, CreditCard, Info, AlertCircle, Clock, Tag, Building2, MapPin, Wallet, XCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PLAN_MODULES, PLAN_FEATURES } from '@/lib/planConfig';
import { useAuth } from "@/context/AuthContext";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { VatIdInput } from "@/components/ui/VatIdInput";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { getCountryCode } from "@/lib/country-mapping";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

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

function UpgradeStep3Form({
  previewData,
  selectedPlan,
  selectedAddons,
  billingCycle,
  packages,
  hasActiveSub,
  tenantStatus,
  isFullyReverting,
  isAnyPartialRevert,
  isNewActionInWizard,
  isImmediate,
  isMakingNewDowngrade,
  isDiffFromActive,
  isRevertingPlan,
  isRevertingAddonRemoval,
  isRevertingAddonActivation,
  isLoadingPreview,
  isProcessing,
  handleFinalUpgrade,
  promoCode,
  setPromoCode,
  promoDetails,
  setPromoDetails,
  promoError,
  isValidatingPromo,
  handleValidatePromo,
  address,
  setAddress,
  addressSearchValue,
  setAddressSearchValue,
  vatId,
  setVatId,
  isSavingAddress,
  intentType,
  onBack,
  stripe,
  elements,
  savedMethods = [],
  selectedMethodId,
  setSelectedMethodId,
  isLoadingMethods
}: any) {
  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 space-y-6">
        {/* 1. Posten-Zusammenfassung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewData && previewData.lines && previewData.lines.length > 0 ? (
              <div className="space-y-6">
                {/* --- UNIFIED NOTIFICATION BLOCK --- */}
                {(() => {
                  if (isFullyReverting) {
                    return (
                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                         <div className="flex justify-center mb-2">
                           <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                             <Check className="h-4 w-4" />
                           </div>
                         </div>
                         <p className="text-blue-600 font-bold text-base">Rückkehr zum aktuellen Paket</p>
                         <p className="text-[11px] text-blue-700 mt-1 leading-tight">
                           Alle vorgemerkten Änderungen wurden widerrufen. Dein Abonnement läuft <strong>wie gehabt</strong> weiter.
                         </p>
                       </div>
                    );
                  }

                  if (isAnyPartialRevert) {
                    return (
                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                         <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                           <Info className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
                           Du widerrufst hiermit bereits vorgemerkte Änderungen: 
                           {isRevertingPlan && ' Dein aktuelles Basis-Paket bleibt bestehen.'}
                           {(isRevertingAddonRemoval || isRevertingAddonActivation) && ' Deine Modul-Auswahl wird auf den aktuellen Stand zurückgesetzt.'}
                         </p>
                       </div>
                    );
                  }

                  if (isNewActionInWizard && isImmediate) {
                    return (
                       <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                         <div className="flex justify-center mb-2">
                           <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                             <CreditCard className="h-4 w-4" />
                           </div>
                         </div>
                         <p className="text-green-600 font-bold text-base">Sofortige Aktivierung</p>
                         <p className="text-[11px] text-green-700 mt-1 leading-tight">
                           Deine Änderungen werden <strong>sofort</strong> wirksam. 
                           {previewData?.amountDueToday > 0 ? (
                              <>Heute wird ein Betrag von <strong>{previewData.amountDueToday.toFixed(2)} {previewData.currency?.toUpperCase() || '€'}</strong> (inkl. MwSt.) verrechnet.</>
                           ) : (
                              <>Es ist heute keine zusätzliche Zahlung fällig (z.B. durch Gutschriften).</>
                           )}
                         </p>
                       </div>
                    );
                  }

                  if (isNewActionInWizard) {
                    return (
                       <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                         <div className="flex justify-center mb-2">
                           <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                             <Clock className="h-4 w-4" />
                           </div>
                         </div>
                         <p className="text-orange-600 font-bold text-base">Änderung vorgemerkt</p>
                         <p className="text-[11px] text-orange-700 mt-1 leading-tight">
                           {isMakingNewDowngrade ? (
                             <>Deine Änderungen beinhalten einen Downgrade. Dieser wird heute <strong>vorgemerkt</strong> und erst zum nächsten Abrechnungsdatum am <strong>{previewData?.nextBillingDate ? new Date(previewData.nextBillingDate * 1000).toLocaleDateString() : 'Ende der Laufzeit'}</strong> wirksam.</>
                           ) : (
                             <>Die Auswahl wird heute <strong>vorgemerkt</strong> und zum nächsten Abrechnungsdatum am <strong>{previewData?.nextBillingDate ? new Date(previewData.nextBillingDate * 1000).toLocaleDateString() : 'Ende der Laufzeit'}</strong> wirksam.</>
                           )}
                         </p>
                       </div>
                    );
                  }

                  if (!isNewActionInWizard && isDiffFromActive) {
                    return (
                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                         <p className="text-[11px] text-gray-600 font-medium italic">
                           <Info className="h-3.5 w-3.5 inline-block mr-1.5 -mt-0.5" />
                           Hier sind deine bereits geplanten Änderungen für die nächste Periode. Du hast keine weiteren Änderungen im Wizard vorgenommen.
                         </p>
                       </div>
                    );
                  }

                  return null;
                })()}

                {/* 1. Einmalige Verrechnung (Heute) */}
                {previewData.lines.some((line: any) => line.proration && (line.amount > 0 || (line.amount < 0 && line.package_type !== 'addon'))) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                       <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Einmalige Verrechnung (Heute fällig)</p>
                    </div>
                    <div className="space-y-2 pl-3 border-l border-orange-200">
                      {previewData.lines
                        .filter((line: any) => line.proration && (line.amount > 0 || (line.amount < 0 && line.package_type !== 'addon')))
                        .map((line: any, index: number) => (
                          <div key={index} className="flex justify-between text-muted-foreground text-xs leading-relaxed">
                            <span className="pr-4">{line.description}</span>
                            <span className={`whitespace-nowrap ${line.amount < 0 ? "text-green-600" : ""}`}>
                              {(line.amount / 100).toFixed(2)} €
                            </span>
                          </div>
                        ))
                      }
                      <div className="pt-1 flex justify-between font-medium text-xs text-orange-700">
                        <span>Zwischensumme Heute (Netto)</span>
                        <span>{previewData.netDueToday?.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between font-bold text-xs text-orange-700 border-t border-orange-200/50 pt-1">
                        <span>Zwischensumme Heute (Brutto)</span>
                        <span>{previewData.amountDueToday?.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Zukünftige Abo-Gebühren */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                     <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                     <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                       {hasActiveSub ? "Reguläre Abo-Posten (ab nächster Periode)" : "Abo-Posten (ab sofort)"}
                     </p>
                  </div>
                  <div className="space-y-2 pl-3 border-l border-primary/20">
                    {previewData.lines
                      .filter((line: any) => !line.proration && line.amount !== 0)
                      .map((line: any, index: number) => (
                        <div key={index} className="flex justify-between text-muted-foreground text-xs leading-relaxed">
                          <span className="pr-4">{line.description}</span>
                          <span className="whitespace-nowrap">{(line.amount / 100).toFixed(2)} €</span>
                        </div>
                      ))
                    }
                    <div className="pt-1 flex justify-between font-medium text-xs">
                        <span>Zukünftiger Paketpreis (Netto)</span>
                        <span>{previewData.netDueNextMonth?.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 space-y-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zukünftige MwSt.</span>
                    <span>{previewData.taxDueNextMonth?.toFixed(2) || '0.00'} €</span>
                  </div>
                  <div className="pt-2 flex justify-between font-bold text-lg border-t text-primary">
                    <span>
                       {hasActiveSub 
                         ? `Ab ${previewData?.nextBillingDate ? new Date(previewData.nextBillingDate * 1000).toLocaleDateString() : 'nächstem Monat'} zu zahlen` 
                         : "Künftiger Paketpreis (pro Periode)"}
                    </span>
                    <span>{previewData.amountDueNextMonth?.toFixed(2) || '0.00'} €</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Berechne Zusammenfassung...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Gutscheincode */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> Gutscheincode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Code eingeben"
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
            {promoError && <p className="text-xs text-destructive mt-2">{promoError}</p>}
            {promoDetails && (
              <div className="bg-primary/10 border border-primary/20 rounded-md p-3 flex items-start gap-3 mt-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Gutschein "{promoDetails.name}" aktiv</p>
                  <p className="text-muted-foreground text-xs">
                    Rabatt: {promoDetails.percent_off ? `${promoDetails.percent_off}%` : promoDetails.amount_off ? `${(promoDetails.amount_off / 100).toFixed(2)} €` : 'Gültig'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Rechnungsadresse */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Rechnungsadresse
            </CardTitle>
            {isSavingAddress ? (
              <span className="text-[10px] text-muted-foreground animate-pulse">Speichere...</span>
            ) : (
              <span className="text-[10px] text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Gespeichert
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Adresse suchen</Label>
              <AddressAutocomplete
                value={addressSearchValue}
                onChange={setAddressSearchValue}
                onAddressSelect={(selectedAddress: any) => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs">Straße *</Label>
                <Input value={address.street} readOnly className="bg-muted/50 cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">PLZ *</Label>
                <Input value={address.postcode} readOnly className="bg-muted/50 cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Ort *</Label>
                <Input value={address.city} readOnly className="bg-muted/50 cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs">Land *</Label>
                <Input value={address.country} readOnly className="bg-muted/50 cursor-not-allowed text-sm" />
              </div>
            </div>
            <div className="pt-2">
              <VatIdInput
                value={vatId}
                onChange={setVatId}
                label="USt-IdNr. (optional)"
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* 4. Zahlungsmethode */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Zahlungsmethode
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMethods ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Zahlungsmethoden werden geladen...</p>
              </div>
            ) : (
              <div className="space-y-4">
                 {savedMethods.length > 0 && (
                   <div className="space-y-3 mb-6">
                     <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hinterlegte Zahlungsmethoden</Label>
                     <RadioGroup value={selectedMethodId} onValueChange={setSelectedMethodId} className="grid gap-2">
                       {savedMethods.map((method: any) => (
                         <Label
                           key={method.id}
                           htmlFor={method.id}
                           className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer transition-colors ${selectedMethodId === method.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                         >
                           <RadioGroupItem value={method.id} id={method.id} />
                           <div className="flex-1 flex items-center justify-between">
                             <div className="flex items-center gap-2 text-sm">
                               <CreditCard className="w-4 h-4 text-muted-foreground" />
                               <span className="uppercase font-medium">{method.card?.brand} •••• {method.card?.last4}</span>
                             </div>
                             <span className="text-muted-foreground text-[10px]">
                               Exp: {method.card?.exp_month}/{method.card?.exp_year}
                             </span>
                           </div>
                         </Label>
                       ))}
                       <Label
                         htmlFor="new"
                         className={`flex items-center space-x-3 border p-3 rounded-lg cursor-pointer transition-colors ${selectedMethodId === 'new' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                       >
                         <RadioGroupItem value="new" id="new" />
                         <span className="font-medium text-sm">Neue Zahlungsmethode hinzufügen</span>
                       </Label>
                     </RadioGroup>
                   </div>
                 )}

                 {selectedMethodId === 'new' ? (
                   <div className="space-y-4">
                     {stripe && elements ? (
                       <>
                         <PaymentElement options={{ layout: 'tabs' }} />
                         <p className="text-[10px] text-muted-foreground italic mt-2">
                           Deine Zahlungsdaten werden sicher bei Stripe gespeichert.
                         </p>
                       </>
                     ) : (
                       <div className="p-8 bg-muted/30 rounded-lg border border-dashed flex flex-col items-center gap-3">
                         <Loader2 className="h-6 w-6 animate-spin text-primary" />
                         <p className="text-xs text-muted-foreground text-center">
                           Bezahlmodul wird vorbereitet...<br/>
                           <span className="text-[10px]">(Nur erforderlich bei neuen Zahlungsdaten)</span>
                         </p>
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                     <CheckCircle2 className="w-5 h-5 text-primary" />
                     <div className="text-sm">
                       <p className="font-medium">Ausgewählte Karte wird genutzt</p>
                       <p className="text-xs text-muted-foreground">Wir verwenden diese Karte für dein Abonnement.</p>
                     </div>
                   </div>
                 )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-start mt-8">
          <Button variant="outline" onClick={onBack} size="lg" disabled={isProcessing}>
            <ArrowLeft className="mr-2 h-5 w-5" /> Zurück zu Modulen
          </Button>
        </div>
      </div>

      {/* RECHTE SPALTE (Sticky Sidebar) */}
      <div className="md:sticky md:top-24 space-y-6">
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
                {previewData && previewData.amountDueToday === 0 && hasActiveSub && (
                   <div className="text-[10px] text-muted-foreground font-medium mb-1 uppercase tracking-wider">
                      {isFullyReverting ? "Keine Änderung heute" : "Keine Zahlung heute (Vorgemerkt)"}
                   </div>
                )}
                {hasActiveSub && previewData && previewData.amountDueToday > 0 && (
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
              onClick={() => handleFinalUpgrade(stripe, elements)}
              disabled={isLoadingPreview || isProcessing || !tenantStatus?.tenant_id || (selectedMethodId === 'new' && (!stripe || !elements) && (!hasActiveSub || (previewData && previewData.amountDueToday > 0)))}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                  Wird verarbeitet...
                </>
              ) : isFullyReverting ? (
                "Änderungen verwerfen"
              ) : (
                hasActiveSub ? "Jetzt zahlungspflichtig upgraden" : "Kostenpflichtig abonnieren"
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="text-[10px] text-muted-foreground text-center px-2">
          Durch Klicken auf den Button stimmst du der sofortigen Ausführung der Dienstleistung und den geltenden Bedingungen zu.
        </div>
      </div>
    </div>
  );
}

// Wrapper für UpgradeStep3Form, um Stripe-Hooks sicher zu verwenden
function UpgradeStep3FormWithStripe(props: any) {
  const stripe = useStripe();
  const elements = useElements();
  return <UpgradeStep3Form {...props} stripe={stripe} elements={elements} />;
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

  const { hotelProfile, isLoading: authLoading } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'payment' | 'setup'>('payment');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    postcode: '',
    country: 'DE',
    countryCode: 'DE',
  });
  const [addressSearchValue, setAddressSearchValue] = useState('');
  const [vatId, setVatId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDetails, setPromoDetails] = useState<any>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [savedMethods, setSavedMethods] = useState<any[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('new');
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const hasActiveSub = !!(tenantStatus?.stripe_subscription_id &&
                       tenantStatus?.stripe_subscription_status &&
                       !['canceled', 'incomplete_expired'].includes(tenantStatus.stripe_subscription_status));

  useEffect(() => {
    if (hotelProfile) {
      setAddress({
        street: hotelProfile.street || '',
        city: hotelProfile.city || '',
        postcode: (hotelProfile as any).postcode || '',
        country: hotelProfile.country || 'DE',
        countryCode: getCountryCode(hotelProfile.country || 'DE'),
      });
      setVatId(hotelProfile.vat_id || '');
    }
  }, [hotelProfile]);

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
        
        // Initialen Plan setzen: Bevorzuge vorgemerkten Plan
        const initialPlan = status.upcoming_plan || status.plan;
        if (initialPlan) {
            setSelectedPlan(initialPlan);
        }
        
        // Addons vorbesetzen: 
        // 1. Wenn ein kompletter neuer "Zukunfts-Satz" (upcoming_addons) da ist, nimm diesen.
        // 2. Sonst nimm die aktuell aktiven, aber FILTERE die bereits gekündigten (removes_at_period_end) raus.
        const activeAddons = status.active_addons || [];
        const cancelledAddons = status.cancelled_addons || [];
        const activeButNotDropped = activeAddons.filter((a: string) => !cancelledAddons.includes(a));

        const initialAddons = (status.upcoming_addons && status.upcoming_addons.length > 0) 
          ? status.upcoming_addons 
          : activeButNotDropped;
        
        setSelectedAddons(initialAddons);

        setLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden der Upgrade-Daten", err);
        toast({ variant: "destructive", title: "Fehler", description: "Daten konnten nicht geladen werden." });
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadPricePreview = async (promoCodeIdOverride?: string) => {
    if (!tenantStatus?.tenant_id) return;
    setIsLoadingPreview(true);
    try {
      const token = localStorage.getItem('pfotencard_token');
      console.log("Starte Preisvorschau...", { selectedPlan, selectedAddons, billingCycle });
      
      // 1. Hole die normale Preisvorschau
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          action: 'preview_upgrade',
          tenantId: tenantStatus.tenant_id,
          newPlan: selectedPlan,
          newAddons: selectedAddons,
          cycle: billingCycle,
          promoCodeId: promoCodeIdOverride || promoDetails?.id,
          address,
          vatId
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

      // 2. Falls Neukunde oder falls wir eine neue Karte brauchen: Intent erstellen
      if (!hasActiveSub || !clientSecret) {
          const { data: intentData, error: intentError } = await supabase.functions.invoke('create-subscription-intent', {
              headers: {
                  'x-tenant-subdomain': localStorage.getItem('pfotencard_subdomain') || '',
                  'Authorization': `Bearer ${token}`
              },
              body: {
                  action: 'create_intent',
                  plan: selectedPlan,
                  addons: selectedAddons,
                  billingCycle: billingCycle,
                  address,
                  vatId,
                  promoCodeId: promoCodeIdOverride || promoDetails?.id
              }
          });

          if (!intentError && intentData?.clientSecret) {
              setClientSecret(intentData.clientSecret);
              setIntentType(intentData.intentType || 'payment');
          }
      }
    } catch (err: any) {
      console.error("Fehler bei Preisvorschau", err);
      toast({ variant: "destructive", title: "Vorschau fehlgeschlagen", description: err.message || "Stripe konnte die Vorschau nicht berechnen." });
      setCurrentStep(2); // Zurück zum Modul-Schritt falls Fehler
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const loadPaymentMethods = async () => {
    if (!tenantStatus?.tenant_id || !hasActiveSub) return;
    setIsLoadingMethods(true);
    try {
      const token = localStorage.getItem('pfotencard_token');
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        headers: { Authorization: `Bearer ${token}` },
        body: {
          action: 'get_payment_methods',
          tenantId: tenantStatus.tenant_id
        }
      });
      if (!error && data?.paymentMethods) {
        setSavedMethods(data.paymentMethods);
        if (data.paymentMethods.length > 0) {
          setSelectedMethodId(data.paymentMethods[0].id);
        }
      }
    } catch (err) {
      console.error("Fehler beim Laden der Zahlungsmethoden", err);
    } finally {
      setIsLoadingMethods(false);
    }
  };

  useEffect(() => {
    if (currentStep === 3) {
      loadPricePreview();
      loadPaymentMethods();
    }
  }, [currentStep]);

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
          plan: selectedPlan
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
        loadPricePreview(data.id);
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

  const handleFinalUpgrade = async (stripe?: any, elements?: any) => {
    if (!tenantStatus?.tenant_id) {
      console.error("Keine Tenant ID vorhanden");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("🔍 Checking upgrade path:", {
        hasActiveSub,
        clientSecret: !!clientSecret,
        intentType,
        selectedMethodId
      });

      // 1. NEUKUNDE ODER REAKTIVIERUNG (Zahlung erforderlich)
      if (!hasActiveSub) {
        if (selectedMethodId === 'new') {
          if (!stripe || !elements || !clientSecret) {
            throw new Error("Zahlungsmodul nicht bereit.");
          }

          const returnUrl = `${window.location.origin}/billing`;
          const { error: submitError } = await elements.submit();
          if (submitError) throw submitError;

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

          if (confirmError) throw confirmError;

          // Falls Succeeded (Kreditkarte meistens ohne Redirect)
          if ((setupIntent?.status === 'succeeded') || (paymentIntent?.status === 'succeeded')) {
             const paymentMethodId = setupIntent?.payment_method || paymentIntent?.payment_method;
             
             const token = localStorage.getItem('pfotencard_token');
             const { data, error: finalizeError } = await supabase.functions.invoke('create-subscription-intent', {
               headers: {
                 'x-tenant-subdomain': localStorage.getItem('pfotencard_subdomain') || '',
                 'Authorization': `Bearer ${token}`
               },
               body: {
                 action: 'finalize_subscription',
                 plan: selectedPlan,
                 addons: selectedAddons,
                 billingCycle: billingCycle,
                 address,
                 vatId,
                 promoCodeId: promoDetails?.id || promoDetails?.promoCodeId,
                 paymentMethodId
               }
             });

             if (finalizeError) throw finalizeError;
             if (data?.error) throw new Error(data.error);

             toast({ title: "Erfolg", description: "Abonnement erfolgreich abgeschlossen!" });
             navigate('/billing');
             return;
          }
        } else {
          // Bestehende Karte für Neukunde (unwahrscheinlich aber möglich bei Reaktivierung)
          const token = localStorage.getItem('pfotencard_token');
          const { data, error: finalizeError } = await supabase.functions.invoke('create-subscription-intent', {
            headers: {
              'x-tenant-subdomain': localStorage.getItem('pfotencard_subdomain') || '',
              'Authorization': `Bearer ${token}`
            },
            body: {
              action: 'finalize_subscription',
              plan: selectedPlan,
              addons: selectedAddons,
              billingCycle: billingCycle,
              address,
              vatId,
              promoCodeId: promoDetails?.id || promoDetails?.promoCodeId,
              paymentMethodId: selectedMethodId
            }
          });

          if (finalizeError) throw finalizeError;
          if (data?.error) throw new Error(data.error);

          toast({ title: "Erfolg", description: "Abonnement erfolgreich abgeschlossen!" });
          navigate('/billing');
          return;
        }
        
        // Bei Redirect-Methoden (PayPal etc) passiert der Rest nach dem Redirect
        return;
      }

      // 2. BESTANDSKUNDE (Upgrade/Downgrade)
      console.log("Führe Upgrade für Bestandskunde aus...");
      
      // Falls eine neue Karte eingegeben wurde (optional für Bestandskunden)
      let finalPaymentMethodId = selectedMethodId === 'new' ? undefined : selectedMethodId;
      
      if (selectedMethodId === 'new' && stripe && elements) {
          const { error: submitError } = await elements.submit();
          if (submitError) throw submitError;

          const returnUrl = `${window.location.origin}/billing`;
          
          if (clientSecret) {
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

            if (confirmError) throw confirmError;

            if ((setupIntent?.status === 'succeeded') || (paymentIntent?.status === 'succeeded')) {
              finalPaymentMethodId = setupIntent?.payment_method || paymentIntent?.payment_method;
            }
          }
      }

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
          cycle: billingCycle,
          address,
          vatId,
          promoCodeId: promoDetails?.id || promoDetails?.promoCodeId,
          paymentMethodId: finalPaymentMethodId
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Upgrade erfolgreich!", description: "Dein Abo wurde aktualisiert." });
      navigate('/billing');
    } catch (err: any) {
      console.error("Fehler beim Upgrade", err);
      toast({ variant: "destructive", title: "Aktion fehlgeschlagen", description: err.message || "Die Zahlung konnte nicht verarbeitet werden." });
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

  const currentPlan = tenantStatus?.plan;
  const currentAddons = tenantStatus?.active_addons || [];
  const cancelledAddons = tenantStatus?.cancelled_addons || [];
  const scheduledPlan = tenantStatus?.upcoming_plan || currentPlan;
  
  // Der "Soll-Zustand" (was laut DB passieren wird, wenn man nichts tut)
  const scheduledAddons = (tenantStatus?.upcoming_addons && tenantStatus.upcoming_addons.length > 0)
    ? tenantStatus.upcoming_addons
    : currentAddons.filter(a => !cancelledAddons.includes(a));

  // Check if anything was changed in THIS session
  const planChangedFromActive = selectedPlan !== currentPlan;
  const addonsChangedFromActive = JSON.stringify([...selectedAddons].sort()) !== JSON.stringify([...currentAddons].sort());
  const isDiffFromActive = planChangedFromActive || addonsChangedFromActive;

  // Check if selection differs from what was ALREADY in the database/pending
  const planChangedFromScheduled = selectedPlan !== scheduledPlan;
  const addonsChangedFromScheduled = JSON.stringify([...selectedAddons].sort()) !== JSON.stringify([...scheduledAddons].sort());
  const isNewActionInWizard = planChangedFromScheduled || addonsChangedFromScheduled;

  // Revert Detection (Heading back to active state)
  const dbHasPending = !!tenantStatus?.upcoming_plan || (tenantStatus?.upcoming_addons && tenantStatus.upcoming_addons.length > 0) || (cancelledAddons.length > 0);
  const isFullyReverting = !isDiffFromActive && dbHasPending;
  
  const isRevertingPlan = (tenantStatus?.upcoming_plan && tenantStatus.upcoming_plan !== currentPlan) && selectedPlan === currentPlan;
  const isRevertingAddonRemoval = cancelledAddons.some((a: string) => selectedAddons.includes(a));
  const isRevertingAddonActivation = (tenantStatus?.upcoming_addons || []).some((a: string) => !currentAddons.includes(a) && !selectedAddons.includes(a));
  
  const isAnyPartialRevert = (isRevertingPlan || isRevertingAddonRemoval || isRevertingAddonActivation) && !isFullyReverting;

  const isImmediate = !!previewData?.isBaseUpgrade || selectedAddons.some(a => !currentAddons.includes(a));

  const isMakingNewDowngrade = (planChangedFromActive && selectedPlan !== scheduledPlan && !previewData?.isBaseUpgrade) || 
                               (currentAddons.some((a: string) => !selectedAddons.includes(a) && scheduledAddons.includes(a)));

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
                  onClick={() => {
                    if (selectedPlan !== plan.plan_name) {
                      const currentPkg = packages.find(p => p.plan_name === tenantStatus.plan);
                      const isDowngrade = currentPkg && (billingCycle === 'yearly' ? plan.price_yearly < currentPkg.price_yearly : plan.price_monthly < currentPkg.price_monthly);
                      
                      if (isDowngrade) {
                        toast({
                          title: "Downgrade vorgemerkt",
                          description: `Der Wechsel zu ${plan.plan_name} erfolgt zum Ende der aktuellen Laufzeit. Heute wird keine Erstattung fällig.`,
                        });
                      }
                      setSelectedPlan(plan.plan_name);
                    }
                  }}
                >
                  {tenantStatus.plan === plan.plan_name && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground hover:bg-primary z-10 shadow-sm border-none">
                       {tenantStatus.upcoming_plan && tenantStatus.upcoming_plan !== tenantStatus.plan ? "Noch aktiv" : "Dein Paket"}
                    </Badge>
                  )}
                  {tenantStatus.upcoming_plan === plan.plan_name && tenantStatus.upcoming_plan !== tenantStatus.plan && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white hover:bg-orange-600 z-10 shadow-sm border-none">Wechsel vorgemerkt</Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center justify-between gap-2">
                      {plan.plan_name}
                      {(() => {
                        const currentPkg = packages.find(p => p.plan_name === tenantStatus.plan);
                        const isDowngrade = currentPkg && (billingCycle === 'yearly' ? plan.price_yearly < currentPkg.price_yearly : plan.price_monthly < currentPkg.price_monthly);
                        
                        // Wenn es das aktuell ausgewählte ist UND ein Downgrade zum tatsächlichen Status ist
                        if (selectedPlan === plan.plan_name && isDowngrade && plan.plan_name !== tenantStatus.plan) {
                           return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-[10px] py-0 h-4">Wechsel vorgemerkt</Badge>
                        }
                        return null;
                      })()}
                    </CardTitle>
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold capitalize">{addon.plan_name}</h3>
                          {tenantStatus.active_addons?.includes(addon.plan_name) && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px] py-0 h-4">
                               {tenantStatus.upcoming_addons && tenantStatus.upcoming_addons.length > 0 && !tenantStatus.upcoming_addons.includes(addon.plan_name) ? "Noch aktiv" : "Aktuell aktiv"}
                            </Badge>
                          )}
                          {tenantStatus.upcoming_addons?.includes(addon.plan_name) && !tenantStatus.active_addons?.includes(addon.plan_name) && (
                            <Badge className="bg-orange-500 text-white hover:bg-orange-600 border-none text-[10px] py-0 h-4">Zukünftig aktiv</Badge>
                          )}
                          {tenantStatus.active_addons?.includes(addon.plan_name) && !selectedAddons.includes(addon.plan_name) && !tenantStatus.cancelled_addons?.includes(addon.plan_name) && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-[10px] py-0 h-4">Abwahl vorgemerkt</Badge>
                          )}
                          {tenantStatus.cancelled_addons?.includes(addon.plan_name) && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-[10px] py-0 h-4">Änderung vorgemerkt</Badge>
                          )}
                          {!tenantStatus.active_addons?.includes(addon.plan_name) && tenantStatus.upcoming_addons?.includes(addon.plan_name) && !selectedAddons.includes(addon.plan_name) && (
                            <Badge variant="outline" className="text-gray-400 border-gray-200 bg-gray-50 text-[10px] py-0 h-4">Auswahl aufgehoben</Badge>
                          )}
                        </div>
                        {(tenantStatus.active_addons?.includes(addon.plan_name) && !selectedAddons.includes(addon.plan_name) || tenantStatus.cancelled_addons?.includes(addon.plan_name) && !selectedAddons.includes(addon.plan_name)) && (
                           <p className="text-[10px] text-orange-600 mt-0.5 font-medium italic">Behältst du bis zum Ende der aktuellen Laufzeit</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          +{billingCycle === 'yearly' ? addon.price_yearly.toFixed(2) : addon.price_monthly.toFixed(2)} € / {billingCycle === 'yearly' ? 'Jahr' : 'Monat'}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={selectedAddons.includes(addon.plan_name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAddons([...selectedAddons, addon.plan_name]);
                        } else {
                          setSelectedAddons(selectedAddons.filter(a => a !== addon.plan_name));
                          // Hinweis bei Abwahl eines aktiven Moduls
                          if (tenantStatus.active_addons?.includes(addon.plan_name)) {
                            toast({
                              title: "Abwahl vorgemerkt",
                              description: `${addon.plan_name} bleibt bis zum Ende der aktuellen Laufzeit aktiv. Es erfolgt heute keine Erstattung.`,
                              variant: "default"
                            });
                          }
                        }
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
            <h2 className="text-xl font-semibold mb-4 text-center">Checkout & Bestätigung</h2>
            
            {(!hasActiveSub || (previewData && previewData.amountDueToday > 0)) && !clientSecret ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Bezahlmodul wird geladen...</p>
              </div>
            ) : (clientSecret ? (
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret, 
                  appearance: { theme: 'stripe' }, 
                  locale: 'de' 
                }}
              >
                <UpgradeStep3FormWithStripe
                  previewData={previewData}
                  selectedPlan={selectedPlan}
                  selectedAddons={selectedAddons}
                  billingCycle={billingCycle}
                  packages={packages}
                  hasActiveSub={hasActiveSub}
                  tenantStatus={tenantStatus}
                  isFullyReverting={isFullyReverting}
                  isAnyPartialRevert={isAnyPartialRevert}
                  isNewActionInWizard={isNewActionInWizard}
                  isImmediate={isImmediate}
                  isMakingNewDowngrade={isMakingNewDowngrade}
                  isDiffFromActive={isDiffFromActive}
                  isRevertingPlan={isRevertingPlan}
                  isRevertingAddonRemoval={isRevertingAddonRemoval}
                  isRevertingAddonActivation={isRevertingAddonActivation}
                  isLoadingPreview={isLoadingPreview}
                  isProcessing={isProcessing}
                  handleFinalUpgrade={handleFinalUpgrade}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  promoDetails={promoDetails}
                  setPromoDetails={setPromoDetails}
                  promoError={promoError}
                  isValidatingPromo={isValidatingPromo}
                  handleValidatePromo={handleValidatePromo}
                  address={address}
                  setAddress={setAddress}
                  addressSearchValue={addressSearchValue}
                  setAddressSearchValue={setAddressSearchValue}
                  vatId={vatId}
                  setVatId={setVatId}
                  isSavingAddress={isSavingAddress}
                  intentType={intentType}
                  onBack={() => setCurrentStep(2)}
                  savedMethods={savedMethods}
                  selectedMethodId={selectedMethodId}
                  setSelectedMethodId={setSelectedMethodId}
                  isLoadingMethods={isLoadingMethods}
                />
              </Elements>
            ) : (
              <UpgradeStep3Form
                previewData={previewData}
                selectedPlan={selectedPlan}
                selectedAddons={selectedAddons}
                billingCycle={billingCycle}
                packages={packages}
                hasActiveSub={hasActiveSub}
                tenantStatus={tenantStatus}
                isFullyReverting={isFullyReverting}
                isAnyPartialRevert={isAnyPartialRevert}
                isNewActionInWizard={isNewActionInWizard}
                isImmediate={isImmediate}
                isMakingNewDowngrade={isMakingNewDowngrade}
                isDiffFromActive={isDiffFromActive}
                isRevertingPlan={isRevertingPlan}
                isRevertingAddonRemoval={isRevertingAddonRemoval}
                isRevertingAddonActivation={isRevertingAddonActivation}
                isLoadingPreview={isLoadingPreview}
                isProcessing={isProcessing}
                handleFinalUpgrade={handleFinalUpgrade}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                promoDetails={promoDetails}
                setPromoDetails={setPromoDetails}
                promoError={promoError}
                isValidatingPromo={isValidatingPromo}
                handleValidatePromo={handleValidatePromo}
                address={address}
                setAddress={setAddress}
                addressSearchValue={addressSearchValue}
                setAddressSearchValue={setAddressSearchValue}
                vatId={vatId}
                setVatId={setVatId}
                isSavingAddress={isSavingAddress}
                intentType={intentType}
                onBack={() => setCurrentStep(2)}
                stripe={null}
                elements={null}
                savedMethods={savedMethods}
                selectedMethodId={selectedMethodId}
                setSelectedMethodId={setSelectedMethodId}
                isLoadingMethods={isLoadingMethods}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </main>
  );
}
