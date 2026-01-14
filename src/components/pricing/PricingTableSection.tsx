// src/components/pricing/PricingTableSection.tsx
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Info, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    description: 'Der Einstieg in die Digitalisierung.',
    monthlyPrice: 29,
    yearlyPrice: 290,
    additionalCost: '0,50€ pro weiterem Kunden/Monat',
    features: [
      { name: 'Bis zu 50 aktive Kunden', included: true },
      { name: 'Dokumente Modul', included: true },
      { name: 'Digitale Wertkarten', included: true },
      { name: 'Standard "Pfotencard" Design', included: true },
      { name: 'E-Mail Support', included: true },
      { name: 'White-Label (Dein Branding)', included: false },
      { name: 'Chat-System', included: false },
      { name: 'News & Updates', included: false },
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
      { name: 'News & Updates Modul', included: true },

      { name: 'Terminbuchung & Kalender', included: false },
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
      { name: 'Prioritäts-Support', included: true },
    ],
  },
];

interface PricingTableSectionProps {
  billingCycle: 'monthly' | 'yearly';
  onSelectPlan?: (planName: string) => void;
  isUpgradeMode?: boolean;
  currentPlan?: string | null;
  upcomingPlan?: string | null;
}

export function PricingTableSection({
  billingCycle,
  onSelectPlan,
  isUpgradeMode = false,
  currentPlan,
  upcomingPlan
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
            // Status-Checks
            const isCurrentPlan = currentPlan && plan.name.toLowerCase() === currentPlan.toLowerCase();
            const isUpcomingPlan = upcomingPlan && plan.name.toLowerCase() === upcomingPlan.toLowerCase();

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
                    {isSwitchPending ? <><Clock size={14} /> Läuft aus</> : <><Check size={14} /> Aktuelles Abo</>}
                  </div>
                )}

                {/* Upcoming Abo Badge - Nur anzeigen, wenn NICHT aktuell */}
                {isUpcomingPlan && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-body font-medium shadow-md flex items-center gap-2">
                    <ArrowRight size={14} /> Kommt bald
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
                  <Info size={14} />
                  {plan.additionalCost}
                </div>

                <Button
                  disabled={buttonDisabled}
                  variant={buttonVariant as any}
                  className="w-full mb-6 font-normal"
                  onClick={() => handleAction(plan.name)}
                >
                  {buttonText}
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