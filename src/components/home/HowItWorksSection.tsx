import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserPlus, Settings, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Registrieren',
    description: 'Erstelle dein Konto in wenigen Minuten und starte deine kostenlose Testphase.',
  },
  {
    number: 2,
    icon: Settings,
    title: 'Anpassen',
    description: 'Konfiguriere deine App mit deinem Logo, Farben und individuellen Einstellungen.',
  },
  {
    number: 3,
    icon: Rocket,
    title: 'Loslegen',
    description: 'Lade deine Kunden ein und starte mit der digitalen Verwaltung deiner Hundeschule.',
  },
];

export function HowItWorksSection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-4">
            So funktioniert's
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            In drei einfachen Schritten zu deiner eigenen Hundeschul-App
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative bg-card rounded-lg p-8 border border-border text-center"
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-sans font-bold">
                {step.number}
              </div>
              <motion.div
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                className="inline-block mb-6 mt-4"
              >
                <step.icon size={48} strokeWidth={1.5} className="text-accent" />
              </motion.div>
              <h3 className="text-xl font-sans font-medium text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-body">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
            onClick={() => navigate('/anmelden')}
          >
            Kostenlos starten
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
