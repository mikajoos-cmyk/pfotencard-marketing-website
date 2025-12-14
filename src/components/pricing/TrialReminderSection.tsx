import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function TrialReminderSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
            Teste Pfotencard 14 Tage kostenlos.
          </h2>
          <p className="text-lg text-muted-foreground font-body mb-8">
            Keine Kreditkarte erforderlich. Keine versteckten Kosten. Starte noch heute und überzeuge dich selbst von den Vorteilen.
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
            onClick={() => window.location.href = '/anmelden'}
          >
            Kostenlose Testversion starten
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
