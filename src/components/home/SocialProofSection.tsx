import { motion } from 'framer-motion';

export function SocialProofSection() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-lg md:text-xl text-muted-foreground font-body mb-8">
            Vertraut von über 900 Trainern.
          </p>
          <div className="flex justify-center">
            <img
              src="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_2.png"
              alt="dog trainer logos line"
              className="max-w-full h-auto"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
