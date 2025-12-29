import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PricingHeaderSection } from '../components/pricing/PricingHeaderSection';
import { PricingTableSection } from '../components/pricing/PricingTableSection';
import { TrialReminderSection } from '../components/pricing/TrialReminderSection';
import { checkTenantStatus, subscribeTenant } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function PreisePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subdomain = searchParams.get('subdomain'); // Prüfen, ob wir im "Kauf-Modus" sind
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (subdomain) {
      // Status laden um aktuellen Plan zu ermitteln
      checkTenantStatus(subdomain).then((status) => {
        if (status && status.exists) {
          setCurrentPlan(status.plan || 'starter');
        }
      }).catch(console.error);

      toast({
        title: "Abo erforderlich",
        description: `Bitte wähle einen Plan für "${subdomain}", um fortzufahren.`,
      });
    }
  }, [subdomain, toast]);

  const handleSelectPlan = async (planName: string) => {
    if (!subdomain) {
      // Normaler Modus: Zur Registrierung
      navigate('/anmelden?register=true');
      return;
    }

    // Kauf-Modus: Simuliere Zahlung & Abo-Update
    try {
      await subscribeTenant(subdomain, planName.toLowerCase());

      toast({
        title: "Zahlung erfolgreich!",
        description: "Dein Abo ist jetzt aktiv. Weiterleitung...",
      });

      setTimeout(() => {
        // Nach Zahlung direkt zur Personalisierung (Einstellungen)
        navigate('/einstellungen');
      }, 1500);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Konnte Abo nicht aktualisieren.",
      });
    }
  };

  return (
    <main className="pt-20">
      <PricingHeaderSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

      {/* Wenn 'subdomain' in der URL ist, aktivieren wir den Upgrade-Modus.
        Die Buttons zeigen dann "Jetzt buchen" statt "Jetzt starten".
      */}
      <PricingTableSection
        billingCycle={billingCycle}
        onSelectPlan={handleSelectPlan}
        isUpgradeMode={!!subdomain}
        currentPlan={currentPlan}
      />

      {/* Test-Hinweis nur anzeigen, wenn man nicht schon ein Konto hat */}
      {!subdomain && <TrialReminderSection />}
    </main>
  );
}