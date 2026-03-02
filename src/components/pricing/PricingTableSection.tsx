import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { fetchPackages } from '@/lib/api';
import { 
  Check as CheckIcon, 
  X as XIcon, 
  Info as InfoIcon, 
  ArrowRight as ArrowRightIcon, 
  Clock as ClockIcon, 
  Loader2 as LoaderIcon 
} from 'lucide-react';

interface DBPackage {
  id: number;
  plan_name: string;
  price_monthly: number;
  allowed_modules: string[];
  max_customers: number | null;
  top_up_fee_percent: number;
  features: Record<string, boolean>;
}

export function PricingTableSection({
  billingCycle,
  onSelectPlan,
  isUpgradeMode = false,
  currentPlan,
  upcomingPlan
}: {
  billingCycle: 'monthly' | 'yearly';
  onSelectPlan?: (planName: string) => void;
  isUpgradeMode?: boolean;
  currentPlan?: string | null;
  upcomingPlan?: string | null;
}) {

  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPackages() {
      try {
        const dbPackages: DBPackage[] = await fetchPackages();
        
        // Mapping von DB-Struktur auf UI-Struktur
        const uiPlans = dbPackages.map(pkg => {
          const isYearly = billingCycle === 'yearly';
          const monthlyPrice = pkg.price_monthly;
          const yearlyPrice = Math.round(monthlyPrice * 10); // Beispiel: 10 Monate zahlen für ein Jahr

          // Features zusammenstellen
          const features = [
            { 
                name: pkg.max_customers ? `Bis zu ${pkg.max_customers} aktive Kunden` : 'Unbegrenzte Kunden', 
                included: true 
            },
            { name: 'Dokumente Modul', included: pkg.allowed_modules.includes('documents') },
            { 
                name: `Guthaben aufladen (${pkg.top_up_fee_percent}% Gebühr)`, 
                included: pkg.allowed_modules.includes('wallet_topup') 
            },
            { name: 'Digitale Wertkarten', included: pkg.features.digital_vouchers },
            { name: 'White-Label (Dein Branding)', included: pkg.features.white_label },
            { name: 'Chat-System', included: pkg.allowed_modules.includes('chat') },
            { name: 'News & Updates', included: pkg.allowed_modules.includes('news') },
            { name: 'Terminbuchung & Kalender', included: pkg.allowed_modules.includes('calendar') },
            { name: 'Wartelisten-Funktion', included: pkg.features.waitlist },
            { name: 'Prioritäts-Support', included: pkg.features.priority_support },
          ];

          return {
            name: pkg.plan_name.charAt(0).toUpperCase() + pkg.plan_name.slice(1),
            dbName: pkg.plan_name,
            description: getPlanDescription(pkg.plan_name),
            monthlyPrice,
            yearlyPrice,
            featured: pkg.plan_name.toLowerCase() === 'pro',
            additionalCost: pkg.max_customers 
                ? `${pkg.additional_cost_per_customer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} pro weiterem Kunden/Monat`
                : 'Keine Zusatzkosten für Kunden',
            features
          };
        });

        // Sortierung: starter, pro, enterprise
        const order = ['starter', 'pro', 'enterprise'];
        uiPlans.sort((a, b) => {
            const idxA = order.indexOf(a.dbName.toLowerCase());
            const idxB = order.indexOf(b.dbName.toLowerCase());
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });

        setPlans(uiPlans);
      } catch (error) {
        console.error("Fehler beim Laden der Pakete:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPackages();
  }, [billingCycle]);

  const getPlanDescription = (name: string) => {
    switch (name.toLowerCase()) {
      case 'starter': return 'Der Einstieg in die Digitalisierung.';
      case 'pro': return 'Für wachsende Hundeschulen.';
      case 'enterprise': return 'Die Komplettlösung ohne Limits.';
      default: return '';
    }
  };

  const getAdditionalCost = (pkg: DBPackage) => {
    if (pkg.plan_name.toLowerCase() === 'enterprise') return 'Keine Zusatzkosten für Kunden';
    if (pkg.plan_name.toLowerCase() === 'pro') return '0,40€ pro weiterem Kunden/Monat';
    return '0,50€ pro weiterem Kunden/Monat';
  };

  const handleAction = (planName: string) => {
    if (onSelectPlan) {
      onSelectPlan(planName);
    } else {
      navigate('/anmelden?register=true');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            // Status-Checks
            const isCurrentPlan = currentPlan && plan.dbName.toLowerCase() === currentPlan.toLowerCase();
            const isUpcomingPlan = upcomingPlan && plan.dbName.toLowerCase() === upcomingPlan.toLowerCase();

            // Ein Wechsel steht an, wenn ein Upcoming Plan existiert und dieser NICHT der aktuelle Plan ist
            const isSwitchPending = !!upcomingPlan && (upcomingPlan.toLowerCase() !== (currentPlan || '').toLowerCase());

            // Button Text Logik
            let buttonText = 'Jetzt starten';
            let buttonDisabled = false;
            let buttonVariant = 'default'; // 'default' | 'outline' | 'secondary'

            if (isCurrentPlan) {
              if (isSwitchPending) {
                // Wenn wir hier sind, ist dies der "alte" Plan, der ausläuft.
                // Der User soll klicken können, um den Wechsel abzubrechen (wieder diesen Plan wählen).
                buttonText = 'Wechsel abbrechen (Behalten)';
                buttonVariant = 'outline';
              } else if (isUpgradeMode) {
                buttonText = 'Aktives Abo';
                buttonDisabled = true;
                buttonVariant = 'secondary';
              } else {
                buttonText = 'Aktives Abo';
                buttonDisabled = true;
              }
            } else if (isUpcomingPlan) {
              buttonText = 'Wechsel vorgemerkt';
              buttonDisabled = true; // Man kann nicht "nochmal" hinwechseln
              buttonVariant = 'secondary';
            } else {
              // Fremder Plan
              if (isUpgradeMode) {
                buttonText = 'Jetzt wechseln';
              }
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-card rounded-lg border p-8 flex flex-col ${isCurrentPlan
                    ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                    : isUpcomingPlan
                      ? 'border-blue-400 ring-2 ring-blue-100 shadow-md bg-blue-50/10' // Style für Upcoming
                      : plan.featured
                        ? 'border-primary shadow-lg scale-105 md:scale-110 z-10'
                        : 'border-border'
                  }`}
              >
                {/* --- BADGES --- */}

                {/* Empfohlen Badge (nur wenn kein Status) */}
                {plan.featured && !isCurrentPlan && !isUpcomingPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-body font-medium">
                    Empfohlen
                  </div>
                )}

                {/* Aktuelles Abo Badge */}
                {isCurrentPlan && (
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-body font-medium shadow-md flex items-center gap-2 ${isSwitchPending ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-green-600 text-white'
                    }`}>
                    {isSwitchPending ? <><ClockIcon size={14} /> Läuft aus</> : <><CheckIcon size={14} /> Aktuelles Abo</>}
                  </div>
                )}

                {/* Upcoming Abo Badge - Nur anzeigen, wenn NICHT aktuell */}
                {isUpcomingPlan && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-body font-medium shadow-md flex items-center gap-2">
                    <ArrowRightIcon size={14} /> Kommt bald
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-2xl font-sans font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    {plan.description}
                  </p>
                </div>

                {/* Preis Anzeige */}
                <div className="mb-2">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-sans font-bold text-foreground">
                      €{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="ml-2 text-muted-foreground font-body">
                      /{billingCycle === 'monthly' ? 'Monat' : 'Jahr'}
                    </span>
                  </div>
                </div>

                <div className="mb-6 text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-2">
                  <InfoIcon size={14} />
                  {plan.additionalCost}
                </div>

                <Button
                  disabled={buttonDisabled}
                  variant={buttonVariant as any}
                  className="w-full mb-6 font-normal"
                  onClick={() => handleAction(plan.dbName)}
                >
                  {buttonText}
                </Button>

                <div className="space-y-3 flex-grow">
                  {plan.features.map((feature: any, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckIcon size={20} strokeWidth={2} className="text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <XIcon size={20} strokeWidth={2} className="text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm font-body ${feature.included ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}