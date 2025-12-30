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
          setCurrentPlan(status.plan || 'starter');
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

  const handleSelectPlan = async (planName: string) => {
    if (!activeSubdomain) {
      // Normaler Modus: Zur Registrierung MIT Parametern
      navigate(`/anmelden?register=true&plan=${planName.toLowerCase()}&cycle=${billingCycle}`);
      return;
    }

    // ÄNDERUNG: Statt direkter API Call -> Weiterleitung zum Checkout
    navigate(`/checkout?plan=${planName.toLowerCase()}&cycle=${billingCycle}`);
  };

  return (
    <main className="pt-20">
      <PricingHeaderSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

      <PricingTableSection
        billingCycle={billingCycle}
        onSelectPlan={handleSelectPlan}
        isUpgradeMode={!!activeSubdomain}
        currentPlan={currentPlan}
      />

      {!activeSubdomain && <TrialReminderSection />}
    </main>
  );
}