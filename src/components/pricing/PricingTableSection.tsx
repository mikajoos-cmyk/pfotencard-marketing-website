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
  Loader2 as LoaderIcon,
  Package as PackageIcon,
  Layers as LayersIcon
} from 'lucide-react';

interface DBPackage {
  id: number;
  plan_name: string;
  package_type: 'base' | 'addon';
  price_monthly: number;
  price_yearly: number;
  additional_cost_per_customer: number;
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
          const yearlyPrice = pkg.price_yearly || Math.round(monthlyPrice * 10);
          const isAddon = pkg.package_type === 'addon';

          // Features zusammenstellen
          const features = [];
          
          if (!isAddon) {
            features.push({ 
                name: pkg.max_customers ? `Bis zu ${pkg.max_customers} aktive Kunden` : 'Unbegrenzte Kunden', 
                included: true 
            });
          }

          features.push({ name: 'Dokumente Modul', included: pkg.allowed_modules.includes('documents') });
          
          if (!isAddon) {
            features.push({ 
                name: `Guthaben aufladen (${pkg.top_up_fee_percent}% Gebühr)`, 
                included: pkg.allowed_modules.includes('wallet_topup') 
            });
          }

          features.push({ name: 'Automatisierung (Abrechnung & Levelaufstieg)', included: pkg.features.automation });
          features.push({ name: 'Digitale Wertkarten', included: pkg.features.digital_vouchers });
          features.push({ name: 'White-Label (Dein Branding)', included: pkg.features.white_label });
          features.push({ name: 'Chat-System', included: pkg.allowed_modules.includes('chat') });
          features.push({ name: 'News & Updates', included: pkg.allowed_modules.includes('news') });
          features.push({ name: 'Terminbuchung & Kalender', included: pkg.allowed_modules.includes('calendar') });
          features.push({ name: 'Wartelisten-Funktion', included: pkg.features.waitlist });
          features.push({ name: 'Prioritäts-Support', included: pkg.features.priority_support });
          features.push({ name: 'Hausaufgaben & Trainingsplan', included: pkg.allowed_modules.includes('homework') });
          features.push({ name: 'Teilnahmebescheinigungen', included: pkg.allowed_modules.includes('certificates') });
          features.push({ name: 'Website-Widgets', included: pkg.allowed_modules.includes('widgets') });
          features.push({ name: 'Rechnungs-Download', included: pkg.allowed_modules.includes('invoice_download') });
          features.push({ name: 'Guthaben-Aufladung', included: pkg.allowed_modules.includes('balance_topup') });
          features.push({ name: 'Statusanzeige', included: pkg.allowed_modules.includes('status_display') });

          return {
            name: pkg.plan_name.charAt(0).toUpperCase() + pkg.plan_name.slice(1),
            dbName: pkg.plan_name,
            packageType: pkg.package_type,
            description: getPlanDescription(pkg.plan_name, pkg.package_type),
            monthlyPrice,
            yearlyPrice,
            featured: pkg.plan_name.toLowerCase() === 'pro',
            additionalCost: isAddon ? null : (pkg.max_customers 
                ? `${pkg.additional_cost_per_customer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} pro weiterem Kunden/Monat`
                : 'Keine Zusatzkosten für Kunden'),
            features: features.filter(f => f.included) // Nur inkludierte Features zeigen
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

  const getPlanDescription = (name: string, type?: string) => {
    if (type === 'addon') return 'Erweiterung für Ihre Hundeschule.';
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
        {/* Sektion 1: Basis-Pakete */}
        <div className="mb-16">
          <h2 className="text-2xl font-sans font-bold text-slate-900 mb-8 text-center">Basis-Pakete</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.filter(p => p.packageType === 'base' || !p.packageType).map((plan, index) => (
              <PlanCard key={index} plan={plan} index={index} billingCycle={billingCycle} currentPlan={currentPlan} upcomingPlan={upcomingPlan} isUpgradeMode={isUpgradeMode} handleAction={handleAction} />
            ))}
          </div>
        </div>

        {/* Sektion 2: Add-ons */}
        {plans.some(p => p.packageType === 'addon') && (
          <div>
            <h2 className="text-2xl font-sans font-bold text-slate-900 mb-8 text-center">Zusatz-Module (Add-ons)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.filter(p => p.packageType === 'addon').map((plan, index) => (
                <PlanCard key={index} plan={plan} index={index} billingCycle={billingCycle} currentPlan={currentPlan} upcomingPlan={upcomingPlan} isUpgradeMode={isUpgradeMode} handleAction={handleAction} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PlanCard({ plan, index, billingCycle, currentPlan, upcomingPlan, isUpgradeMode, handleAction }: any) {
  const isAddon = plan.packageType === 'addon';
  
  // Status-Checks
  const isCurrentPlan = currentPlan && plan.dbName.toLowerCase() === currentPlan.toLowerCase();
  const isUpcomingPlan = upcomingPlan && plan.dbName.toLowerCase() === upcomingPlan.toLowerCase();

  // Ein Wechsel steht an, wenn ein Upcoming Plan existiert und dieser NICHT der aktuelle Plan ist
  const isSwitchPending = !!upcomingPlan && (upcomingPlan.toLowerCase() !== (currentPlan || '').toLowerCase());

  // Button Text Logik
  let buttonText = isAddon ? 'Modul wählen' : 'Jetzt starten';
  let buttonDisabled = false;
  let buttonVariant = 'default'; // 'default' | 'outline' | 'secondary'

  if (isCurrentPlan) {
    if (isSwitchPending) {
      buttonText = 'Wechsel abbrechen (Behalten)';
      buttonVariant = 'outline';
    } else if (isUpgradeMode) {
      buttonText = 'Aktiviert';
      buttonDisabled = true;
      buttonVariant = 'secondary';
    } else {
      buttonText = 'Aktiviert';
      buttonDisabled = true;
    }
  } else if (isUpcomingPlan) {
    buttonText = 'Wechsel vorgemerkt';
    buttonDisabled = true; 
    buttonVariant = 'secondary';
  } else {
    if (isUpgradeMode) {
      buttonText = isAddon ? 'Modul hinzufügen' : 'Jetzt wechseln';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative bg-card rounded-lg border p-8 flex flex-col ${isCurrentPlan
          ? 'border-primary ring-2 ring-primary/20 shadow-lg'
          : isUpcomingPlan
            ? 'border-blue-400 ring-2 ring-blue-100 shadow-md bg-blue-50/10' 
            : plan.featured
              ? 'border-primary shadow-lg scale-105 md:scale-110 z-10'
              : isAddon 
                ? 'border-indigo-100'
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
          {isSwitchPending ? <><ClockIcon size={14} /> Läuft aus</> : <><CheckIcon size={14} /> Aktiviert</>}
        </div>
      )}

      {/* Upcoming Abo Badge - Nur anzeigen, wenn NICHT aktuell */}
      {isUpcomingPlan && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-body font-medium shadow-md flex items-center gap-2">
          <ArrowRightIcon size={14} /> Kommt bald
        </div>
      )}

      {/* Add-on Badge */}
      {isAddon && !isCurrentPlan && !isUpcomingPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider shadow-md flex items-center gap-2">
          <LayersIcon size={12} /> Zusatz-Modul
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${isAddon ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/10 text-primary'}`}>
                {isAddon ? <LayersIcon size={20} /> : <PackageIcon size={20} />}
            </div>
            <h3 className="text-2xl font-sans font-bold text-foreground">
                {plan.name}
            </h3>
        </div>
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

      {plan.additionalCost && (
        <div className="mb-6 text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-2">
          <InfoIcon size={14} />
          {plan.additionalCost}
        </div>
      )}
      
      {!plan.additionalCost && <div className="mb-6 h-[32px]"></div>}

      <Button
        disabled={buttonDisabled}
        variant={buttonVariant as any}
        className={`w-full mb-6 font-normal ${isAddon && !buttonDisabled && buttonVariant === 'default' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
        onClick={() => handleAction(plan.dbName)}
      >
        {buttonText}
      </Button>

      <div className="space-y-3 flex-grow">
        <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
            {isAddon ? 'Enthaltene Features' : 'Highlights'}
        </div>
        {plan.features.map((feature: any, featureIndex: number) => (
          <div key={featureIndex} className="flex items-start gap-3">
            {feature.included ? (
              <CheckIcon size={20} strokeWidth={2} className={`${isAddon ? 'text-indigo-600' : 'text-primary'} flex-shrink-0 mt-0.5`} />
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
}