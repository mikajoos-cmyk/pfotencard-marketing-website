import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRepoDemoUrl } from '@/lib/utils';

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <motion.video
          alt="smartphone app video"
          src="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_1.mp4"
          poster="https://c.animaapp.com/mj4h8vfeISPmry/img/ai_1-poster.png"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/90" />
      </div>

      {/* Geometric Accent Shapes */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-gray-800 mb-6 max-w-4xl mx-auto">
            Deine eigene App für deine Hundeschule – ohne Programmieren.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-2xl mx-auto font-body font-light">
            Digitalisiere deine Hundeschule mit einer individuellen White-Label-App. Einfach, effizient und komplett auf deine Marke zugeschnitten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal min-w-[200px]"
              onClick={() => navigate('/anmelden')}
            >
              14 Tage kostenlos testen
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-background text-tertiary border-tertiary hover:bg-tertiary hover:text-tertiary-foreground font-normal min-w-[200px]"
              onClick={() => window.open(getRepoDemoUrl(), '_blank')}
            >
              <Play size={20} strokeWidth={1.5} className="mr-2" />
              Demo ansehen
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
