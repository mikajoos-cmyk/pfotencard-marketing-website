import { motion } from 'framer-motion';

export function FeaturesIntroSection() {
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
            Alles, was deine Hundeschule digital macht.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-body">
            Pfotencard bietet dir alle Werkzeuge, die du brauchst, um deine Hundeschule effizient zu verwalten, Kunden zu begeistern und dein Geschäft zu skalieren.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
