import { useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { SocialProofSection } from '../components/home/SocialProofSection';
import { ProblemSolutionSection } from '../components/home/ProblemSolutionSection';
import { WhiteLabelSection } from '../components/home/WhiteLabelSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';

export function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <HeroSection />
      <SocialProofSection />
      <ProblemSolutionSection />
      <WhiteLabelSection />
      <HowItWorksSection />
    </main>
  );
}
