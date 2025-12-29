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
  const { toast } = useToast();

  const urlSubdomain = searchParams.get('subdomain');
  const storedSubdomain = localStorage.getItem('pfotencard_subdomain');
  const activeSubdomain = urlSubdomain || storedSubdomain;

  useEffect(() => {
    window.scrollTo(0, 0);

    // Wenn eine Subdomain bekannt ist (URL oder LocalStorage), Plan laden
    if (activeSubdomain) {
      checkTenantStatus(activeSubdomain).then((status) => {
        if (status && status.exists) {
          setCurrentPlan(status.plan || 'starter');
        }
      }).catch(console.error);
    }

    // Nur wenn explizit via URL angefordert (Kauf-Modus), Warnung anzeigen
    if (urlSubdomain) {
      toast({
        title: "Abo erforderlich",
        description: `Bitte wähle einen Plan für "${urlSubdomain}", um fortzufahren.`,
      });
    }
  }, [activeSubdomain, urlSubdomain, toast]);

  const handleSelectPlan = async (planName: string) => {
    if (!activeSubdomain) {
      // Normaler Modus: Zur Registrierung
      navigate('/anmelden?register=true');
      return;
    }

    // Kauf-Modus: Simuliere Zahlung & Abo-Update
    try {
      await subscribeTenant(activeSubdomain, planName.toLowerCase());

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

      {/* Wenn 'activeSubdomain' bekannt ist, aktivieren wir den Upgrade-Modus.
        Die Buttons zeigen dann "Jetzt wechseln" statt "Jetzt starten",
        und der aktuelle Plan wird markiert.
      */}
      <PricingTableSection
        billingCycle={billingCycle}
        onSelectPlan={handleSelectPlan}
        isUpgradeMode={!!activeSubdomain}
        currentPlan={currentPlan}
      />

      {/* Test-Hinweis nur anzeigen, wenn man nicht schon ein Konto hat */}
      {!activeSubdomain && <TrialReminderSection />}
    </main>
  );
}