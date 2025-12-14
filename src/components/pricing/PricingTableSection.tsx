import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfekt für kleine Hundeschulen',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      { name: 'Bis zu 50 aktive Kunden', included: true },
      { name: 'White-Label App', included: true },
      { name: 'Level-System & Gamification', included: true },
      { name: 'Basis-Verwaltung', included: true },
      { name: 'E-Mail Support', included: true },
      { name: 'Erweiterte Finanzverwaltung', included: false },
      { name: 'Prioritäts-Support', included: false },
      { name: 'API-Zugang', included: false },
    ],
  },
  {
    name: 'Pro',
    description: 'Für wachsende Hundeschulen',
    monthlyPrice: 79,
    yearlyPrice: 790,
    featured: true,
    features: [
      { name: 'Bis zu 200 aktive Kunden', included: true },
      { name: 'White-Label App', included: true },
      { name: 'Level-System & Gamification', included: true },
      { name: 'Erweiterte Verwaltung', included: true },
      { name: 'Prioritäts-Support', included: true },
      { name: 'Erweiterte Finanzverwaltung', included: true },
      { name: 'Automatische Boni', included: true },
      { name: 'API-Zugang', included: false },
    ],
  },
  {
    name: 'Verband',
    description: 'Für Verbände und große Organisationen',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      { name: 'Unbegrenzte Kunden', included: true },
      { name: 'White-Label App', included: true },
      { name: 'Level-System & Gamification', included: true },
      { name: 'Vollständige Verwaltung', included: true },
      { name: 'Dedizierter Support', included: true },
      { name: 'Erweiterte Finanzverwaltung', included: true },
      { name: 'Automatische Boni', included: true },
      { name: 'API-Zugang', included: true },
    ],
  },
];

interface PricingTableSectionProps {
  billingCycle: 'monthly' | 'yearly';
}

export function PricingTableSection({ billingCycle }: PricingTableSectionProps) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-card rounded-lg border p-8 flex flex-col ${
                plan.featured
                  ? 'border-primary shadow-lg scale-105 md:scale-110'
                  : 'border-border'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-body font-medium">
                  Beliebt
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-sans font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  {plan.description}
                </p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-sans font-bold text-foreground">
                    €{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="ml-2 text-muted-foreground font-body">
                    /{billingCycle === 'monthly' ? 'Monat' : 'Jahr'}
                  </span>
                </div>
              </div>
              <Button
                className={`w-full mb-6 font-normal ${
                  plan.featured
                    ? 'bg-primary text-primary-foreground hover:bg-secondary'
                    : 'bg-background text-foreground border border-border hover:bg-muted'
                }`}
                onClick={() => window.location.href = '/anmelden?register=true'}
              >
                Jetzt starten
              </Button>
              <div className="space-y-3 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check size={20} strokeWidth={2} className="text-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <X size={20} strokeWidth={2} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm font-body ${
                        feature.included ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
