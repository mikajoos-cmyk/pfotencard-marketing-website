// src/pages/PreisePage.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PricingHeaderSection } from '../components/pricing/PricingHeaderSection';
import { PricingTableSection } from '../components/pricing/PricingTableSection';
import { TrialReminderSection } from '../components/pricing/TrialReminderSection';
import { checkTenantStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function PreisePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [upcomingPlan, setUpcomingPlan] = useState<string | null>(null); // NEU
  const [activeAddons, setActiveAddons] = useState<string[]>([]); // NEU
  const [upcomingAddons, setUpcomingAddons] = useState<string[]>([]); // NEU
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const urlSubdomain = searchParams.get('subdomain');
  const storedSubdomain = localStorage.getItem('pfotencard_subdomain');
  const activeSubdomain = urlSubdomain || storedSubdomain;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (activeSubdomain) {
      checkTenantStatus(activeSubdomain).then((status) => {
        if (status && status.exists) {
          setCurrentPlan(status.plan || null);
          setUpcomingPlan(status.upcoming_plan); // NEU: Upcoming Plan setzen
          setActiveAddons(status.active_addons || []); // NEU: Aktive Addons setzen
          setUpcomingAddons(status.upcoming_addons || []); // NEU: Vorgemerkte Addons setzen
        }
      }).catch(console.error);
    }

    if (urlSubdomain) {
      toast({
        title: "Abo erforderlich",
        description: `Bitte wähle einen Plan für "${urlSubdomain}", um fortzufahren.`,
      });
    }
  }, [activeSubdomain, urlSubdomain, toast]);

  const handleSelectPlan = async (planName: string, type?: 'base' | 'addon') => {
    if (!activeSubdomain) {
      navigate(`/anmelden?register=true&plan=${planName.toLowerCase()}&cycle=${billingCycle}`);
      return;
    }
    const step = type === 'addon' ? 2 : 1;
    const params = new URLSearchParams({
        step: step.toString(),
        cycle: billingCycle
    });
    if (type === 'addon') {
        params.set('addon', planName);
    } else {
        params.set('plan', planName);
    }
    navigate(`/upgrade?${params.toString()}`);
  };

  return (
    <main className="pt-20">
      <PricingHeaderSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

      <PricingTableSection
        billingCycle={billingCycle}
        onSelectPlan={handleSelectPlan}
        isUpgradeMode={!!activeSubdomain}
        currentPlan={currentPlan}
        upcomingPlan={upcomingPlan} // NEU: Prop übergeben
        activeAddons={activeAddons} // NEU: Aktive Addons übergeben
        upcomingAddons={upcomingAddons} // NEU: Vorgemerkte Addons übergeben
      />

      {!activeSubdomain && <TrialReminderSection />}
    </main>
  );
}