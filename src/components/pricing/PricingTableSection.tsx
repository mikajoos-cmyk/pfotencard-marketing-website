import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Info } from 'lucide-react'; // Info Icon hinzugefügt
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Tooltip für Details

const plans = [
  {
    name: 'Starter',
    description: 'Der Einstieg in die Digitalisierung.',
    monthlyPrice: 29,
    yearlyPrice: 290,
    additionalCost: '0,50€ pro weiterem Kunden/Monat',
    features: [
      { name: 'Bis zu 50 aktive Kunden', included: true },
      { name: 'News & Dokumente Modul', included: true },
      { name: 'Digitale Wertkarten', included: true },
      { name: 'Standard "Pfotencard" Design', included: true },
      { name: 'E-Mail Support', included: true },
      { name: 'White-Label (Dein Branding)', included: false },
      { name: 'Chat & Shop System', included: false },
      { name: 'Terminbuchung & Kalender', included: false },
    ],
  },
  {
    name: 'Pro',
    description: 'Für wachsende Hundeschulen.',
    monthlyPrice: 79,
    yearlyPrice: 790,
    featured: true,
    additionalCost: '0,40€ pro weiterem Kunden/Monat',
    features: [
      { name: 'Bis zu 200 aktive Kunden', included: true },
      { name: 'Alle Starter-Funktionen', included: true },
      { name: 'White-Label (Dein Logo & Farben)', included: true },
      { name: 'Chat-System mit Kunden', included: true },
      { name: 'Online-Shop Modul', included: true },
      { name: 'Prioritäts-Support', included: true },
      { name: 'Terminbuchung & Kalender', included: false },
      { name: 'API-Zugang', included: false },
    ],
  },
  {
    name: 'Enterprise', // Umbenannt von Verband
    description: 'Die Komplettlösung ohne Limits.',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    additionalCost: 'Keine Zusatzkosten für Kunden',
    features: [
      { name: 'Unbegrenzte Kunden', included: true },
      { name: 'Alle Pro-Funktionen', included: true },
      { name: 'Terminbuchung & Kalender', included: true },
      { name: 'Wartelisten-Funktion', included: true },
      { name: 'API-Zugang & Webhooks', included: true },
      { name: 'Dedizierter Ansprechpartner', included: true },
      { name: 'Individuelle Vertragsanpassung', included: true },
      { name: 'Multi-Standort fähig', included: true },
    ],
  },
];

interface PricingTableSectionProps {
  billingCycle: 'monthly' | 'yearly';
  onSelectPlan?: (planName: string) => void;
  isUpgradeMode?: boolean;
  currentPlan?: string | null;
}

export function PricingTableSection({
  billingCycle,
  onSelectPlan,
  isUpgradeMode = false,
  currentPlan
}: PricingTableSectionProps) {

  const navigate = useNavigate();

  const handleAction = (planName: string) => {
    if (onSelectPlan) {
      onSelectPlan(planName);
    } else {
      navigate('/anmelden?register=true');
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlan && plan.name.toLowerCase() === currentPlan.toLowerCase();

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-card rounded-lg border p-8 flex flex-col ${isCurrentPlan
                    ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                    : plan.featured
                      ? 'border-primary shadow-lg scale-105 md:scale-110 z-10'
                      : 'border-border'
                  }`}
              >
                {plan.featured && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-body font-medium">
                    Empfohlen
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-body font-medium shadow-md flex items-center gap-2">
                    <Check size={14} /> Aktuelles Abo
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

                {/* Zusatzkosten Hinweis */}
                <div className="mb-6 text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-2">
                  <Info size={14} />
                  {plan.additionalCost}
                </div>

                <Button
                  disabled={!!isCurrentPlan}
                  className={`w-full mb-6 font-normal ${isCurrentPlan
                      ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                      : plan.featured
                        ? 'bg-primary text-primary-foreground hover:bg-secondary'
                        : 'bg-background text-foreground border border-border hover:bg-muted'
                    }`}
                  onClick={() => handleAction(plan.name)}
                >
                  {isCurrentPlan ? 'Aktives Abo' : isUpgradeMode ? 'Jetzt wechseln' : 'Jetzt starten'}
                </Button>

                <div className="space-y-3 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check size={20} strokeWidth={2} className="text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <X size={20} strokeWidth={2} className="text-muted-foreground/40 flex-shrink-0 mt-0.5" />
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