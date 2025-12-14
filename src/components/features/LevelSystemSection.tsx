import { motion } from 'framer-motion';
import { Award, TrendingUp, Users } from 'lucide-react';

export function LevelSystemSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
              Das Level-System
            </h2>
            <p className="text-lg text-muted-foreground font-body mb-8">
              Motiviere deine Kunden mit einem spielerischen Fortschrittssystem. Jeder Hund sammelt Punkte und erreicht neue Level – das steigert die Bindung und macht Training zum Erlebnis.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Award size={32} strokeWidth={1.5} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Abzeichen & Belohnungen
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Vergib digitale Abzeichen für erreichte Meilensteine und halte die Motivation hoch.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp size={32} strokeWidth={1.5} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Fortschritts-Tracking
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Kunden sehen jederzeit ihren aktuellen Stand und die nächsten Ziele.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Users size={32} strokeWidth={1.5} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Kundenbindung
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Gamification sorgt für langfristige Bindung und wiederkehrende Kunden.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <img
              src="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_5.png"
              alt="dog level progress illustration"
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
