import { useEffect } from 'react';
import { FeaturesIntroSection } from '../components/features/FeaturesIntroSection';
import { LevelSystemSection } from '../components/features/LevelSystemSection';
import { ManagementSection } from '../components/features/ManagementSection';
import { CustomerAppSection } from '../components/features/CustomerAppSection';
// Importiere die neuen Sections
import { CommunicationSection } from '../components/features/CommunicationSection';
import { OrganizationSection } from '../components/features/OrganizationSection';

export function FunktionenPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20">
      <FeaturesIntroSection />

      {/* 1. Core Feature: Gamification */}
      <LevelSystemSection />

      {/* 2. New: Communication (Chat/News) - Highlight for Pro Plan */}
      <CommunicationSection />

      {/* 3. New: Organization (Calendar/Docs) - Highlight for Enterprise */}
      <OrganizationSection />

      {/* 4. Core Feature: Finance */}
      <ManagementSection />

      {/* 5. Core Feature: The App itself */}
      <CustomerAppSection />
    </main>
  );
}