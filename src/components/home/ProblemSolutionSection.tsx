import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';

const problems = [
  {
    icon: AlertCircle,
    problem: 'Zeitaufwändige manuelle Verwaltung',
    solution: 'Automatisierte digitale Prozesse sparen Zeit und reduzieren Fehler',
  },
  {
    icon: CheckCircle,
    problem: 'Keine Kundenbindung nach dem Kurs',
    solution: 'Gamification und Level-System halten Kunden langfristig engagiert',
  },
  {
    icon: Zap,
    problem: 'Komplizierte Abrechnungen',
    solution: 'Integrierte Finanzverwaltung mit automatischen Boni und Exporten',
  },
];

export function ProblemSolutionSection() {
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
            Von der Herausforderung zur Lösung
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Wir verstehen die täglichen Herausforderungen von Hundeschulen und bieten maßgeschneiderte Lösungen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card rounded-lg p-8 border border-border"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="inline-block mb-6"
              >
                <item.icon size={48} strokeWidth={1.5} className="text-accent" />
              </motion.div>
              <h3 className="text-xl font-sans font-medium text-foreground mb-3">
                Problem
              </h3>
              <p className="text-muted-foreground font-body mb-6">
                {item.problem}
              </p>
              <h3 className="text-xl font-sans font-medium text-primary mb-3">
                Lösung
              </h3>
              <p className="text-foreground font-body">
                {item.solution}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <img
            src="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_3.png"
            alt="dog problem solution grid"
            className="max-w-full h-auto rounded-lg"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
