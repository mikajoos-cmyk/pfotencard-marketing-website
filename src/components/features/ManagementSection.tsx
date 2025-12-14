import { motion } from 'framer-motion';
import { Calculator, FileText, Download } from 'lucide-react';

export function ManagementSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 flex justify-center"
          >
            <img
              src="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_4.png"
              alt="branded app smartphone pair"
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-foreground mb-6">
              Verwaltung & Finanzen
            </h2>
            <p className="text-lg text-muted-foreground font-body mb-8">
              Behalte den Überblick über alle finanziellen Aspekte deiner Hundeschule. Von der Abrechnung bis zur Buchhaltung – alles an einem Ort.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Calculator size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Automatische Boni
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Definiere Regeln für automatische Gutschriften und Rabatte basierend auf Kundentreue.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <FileText size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Digitale Aufzeichnungen
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Alle Transaktionen und Kundendaten werden sicher und übersichtlich gespeichert.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Download size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Export-Optionen
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Exportiere Daten für deine Buchhaltung oder Steuerberater mit einem Klick.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
