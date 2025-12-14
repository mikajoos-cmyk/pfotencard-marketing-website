import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Palette, Smartphone, Star } from 'lucide-react';

export function WhiteLabelSection() {
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
              Deine Marke, deine App – komplett individualisiert
            </h2>
            <p className="text-lg text-muted-foreground font-body mb-8">
              Mit unserem White-Label-System erhältst du eine vollständig anpassbare App in deinem Corporate Design. Logo, Farben, Schriften – alles nach deinen Wünschen.
            </p>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Palette size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Vollständige Markenanpassung
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Logo, Farben, Schriften und Design-Elemente komplett nach deinen Vorgaben.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Smartphone size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Native App-Erlebnis
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Professionelle App für iOS und Android, die deine Kunden lieben werden.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Star size={32} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-medium text-foreground mb-2">
                    Professioneller Auftritt
                  </h3>
                  <p className="text-muted-foreground font-body">
                    Stärke deine Marke und hebe dich von der Konkurrenz ab.
                  </p>
                </div>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-secondary font-normal">
              Mehr erfahren zur Markenanpassung
            </Button>
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
