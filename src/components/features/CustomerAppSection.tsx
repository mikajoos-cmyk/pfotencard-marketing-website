import { motion } from 'framer-motion';
import { QrCode, Clock, History } from 'lucide-react';

export function CustomerAppSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-tertiary/5 to-tertiary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
              Kunden-App
            </h2>
            <p className="text-lg text-muted-foreground font-body mb-8">
              Deine Kunden erhalten eine intuitive App, mit der sie ihre Wertkarten verwalten, Fortschritte verfolgen und mit deiner Hundeschule interagieren können.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <QrCode size={32} strokeWidth={1.5} className="text-tertiary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    QR-Code Scanning
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Schnelles Einchecken bei Kursen durch einfaches Scannen – keine Wartezeiten mehr.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <History size={32} strokeWidth={1.5} className="text-tertiary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Verlaufsübersicht
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Kunden sehen alle vergangenen Besuche, Punkte und erreichte Level auf einen Blick.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Clock size={32} strokeWidth={1.5} className="text-tertiary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Echtzeit-Updates
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Benachrichtigungen über neue Abzeichen, Boni und wichtige Informationen.
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
              src="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_4.png"
              alt="branded app smartphone pair"
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
