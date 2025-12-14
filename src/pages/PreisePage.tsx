import { useEffect } from 'react';
import { PricingHeaderSection } from '../components/pricing/PricingHeaderSection';
import { PricingTableSection } from '../components/pricing/PricingTableSection';
import { TrialReminderSection } from '../components/pricing/TrialReminderSection';

export function PreisePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20">
      <PricingHeaderSection />
      <PricingTableSection />
      <TrialReminderSection />
    </main>
  );
}
