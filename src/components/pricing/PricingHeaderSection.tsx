import { motion } from 'framer-motion';

interface PricingHeaderSectionProps {
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
}

export function PricingHeaderSection({ billingCycle, setBillingCycle }: PricingHeaderSectionProps) {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-6">
            Ein Preis für jede Größe deiner Hundeschule.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body mb-8">
            Wähle den Plan, der am besten zu deinem Geschäft passt. Alle Pläne beinhalten eine 14-tägige kostenlose Testphase.
          </p>

          <div className="inline-flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Jährlich
              <span className="ml-2 text-xs text-primary">(2 Monate gratis)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
