import { useEffect, useState } from 'react';
import { PricingHeaderSection } from '../components/pricing/PricingHeaderSection';
import { PricingTableSection } from '../components/pricing/PricingTableSection';
import { TrialReminderSection } from '../components/pricing/TrialReminderSection';

export function PreisePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20">
      <PricingHeaderSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
      <PricingTableSection billingCycle={billingCycle} />
      <TrialReminderSection />
    </main>
  );
}
