import { useEffect } from 'react';
import { FeaturesIntroSection } from '../components/features/FeaturesIntroSection';
import { LevelSystemSection } from '../components/features/LevelSystemSection';
import { ManagementSection } from '../components/features/ManagementSection';
import { CustomerAppSection } from '../components/features/CustomerAppSection';

export function FunktionenPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20">
      <FeaturesIntroSection />
      <LevelSystemSection />
      <ManagementSection />
      <CustomerAppSection />
    </main>
  );
}
