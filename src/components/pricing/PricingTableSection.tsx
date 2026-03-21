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
import { PLAN_MODULES, PLAN_FEATURES } from '@/lib/planConfig';

interface DBPackage {
  id: number;
  plan_name: string;
  package_type: 'base' | 'addon';
  price_monthly: number;
  price_yearly: number;
  additional_cost_per_customer: number;
  allowed_modules: string[];
  included_customers: number;
  top_up_fee_percent: number;
  features: Record<string, boolean>;
}

export function PricingTableSection({
  billingCycle,
  onSelectPlan,
  isUpgradeMode = false,
  currentPlan,
  upcomingPlan,
  activeAddons = [],
  upcomingAddons = []
}: {
  billingCycle: 'monthly' | 'yearly';
  onSelectPlan?: (planName: string) => void;
  isUpgradeMode?: boolean;
  currentPlan?: string | null;
  upcomingPlan?: string | null;
  activeAddons?: string[];
  upcomingAddons?: string[];
}) {

  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPackages() {
      try {
        const dbPackages: DBPackage[] = await fetchPackages();
        
        const uiPlans = dbPackages.map(pkg => {
          const isAddon = pkg.package_type === 'addon';
          
          // 1. Vererbung prüfen
          let inheritedPlanName = null;
          let inheritedModules: string[] = [];
          let inheritedFeatures: Record<string, boolean> = {};

          const inheritsKey = Object.keys(pkg.features || {}).find(k => k.startsWith('inherits_') && pkg.features[k]);
          if (inheritsKey) {
              const parentName = inheritsKey.replace('inherits_', '');
              const parentPkg = dbPackages.find((p: any) => p.plan_name.toLowerCase() === parentName.toLowerCase());
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

          if (!isAddon) {
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

          return {
            name: pkg.plan_name.charAt(0).toUpperCase() + pkg.plan_name.slice(1),
            dbName: pkg.plan_name,
            packageType: pkg.package_type,
            monthlyPrice: pkg.price_monthly,
            yearlyPrice: pkg.price_yearly || Math.round(pkg.price_monthly * 10),
            featured: pkg.plan_name.toLowerCase() === 'pro',
            additionalCost: isAddon ? null : pkg.additional_cost_per_customer > 0 
              ? `${pkg.additional_cost_per_customer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} pro weiterem Kunden/Monat`
              : null,
            features: featuresToDisplay
          };
        });

        // Sortieren
        uiPlans.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
        setPlans(uiPlans);
      } catch (error) { console.error("Fehler beim Laden der Pakete:", error); } finally { setIsLoading(false); }
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
              <PlanCard key={index} plan={plan} index={index} billingCycle={billingCycle} currentPlan={currentPlan} upcomingPlan={upcomingPlan} activeAddons={activeAddons} upcomingAddons={upcomingAddons} isUpgradeMode={isUpgradeMode} handleAction={handleAction} />
            ))}
          </div>
        </div>

        {/* Sektion 2: Add-ons */}
        {plans.some(p => p.packageType === 'addon') && (
          <div>
            <h2 className="text-2xl font-sans font-bold text-slate-900 mb-8 text-center">Zusatz-Module (Add-ons)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.filter(p => p.packageType === 'addon').map((plan, index) => (
                <PlanCard key={index} plan={plan} index={index} billingCycle={billingCycle} currentPlan={currentPlan} upcomingPlan={upcomingPlan} activeAddons={activeAddons} upcomingAddons={upcomingAddons} isUpgradeMode={isUpgradeMode} handleAction={handleAction} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PlanCard({ plan, index, billingCycle, currentPlan, upcomingPlan, activeAddons = [], upcomingAddons = [], isUpgradeMode, handleAction }: any) {
  const isAddon = plan.packageType === 'addon';
  
  // Status-Checks
  const isBasePlanActive = currentPlan && plan.dbName.toLowerCase() === currentPlan.toLowerCase();
  const isAddonActive = isAddon && activeAddons.some((a: string) => a.toLowerCase() === plan.dbName.toLowerCase());
  const isCurrentPlan = isBasePlanActive || isAddonActive;
  
  const isBasePlanUpcoming = upcomingPlan && plan.dbName.toLowerCase() === upcomingPlan.toLowerCase();
  const isAddonUpcoming = isAddon && upcomingAddons.some((a: string) => a.toLowerCase() === plan.dbName.toLowerCase());
  const isUpcomingPlan = isBasePlanUpcoming || isAddonUpcoming;

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
          <div key={featureIndex} className={`flex items-start gap-3 ${feature.isHighlight ? 'bg-amber-50 text-amber-800 p-2 rounded-md font-medium border border-amber-200 mt-4 mb-2' : ''}`}>
            {!feature.isHighlight && <CheckIcon size={20} strokeWidth={2} className={`${isAddon ? 'text-indigo-600' : 'text-primary'} flex-shrink-0 mt-0.5`} />}
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