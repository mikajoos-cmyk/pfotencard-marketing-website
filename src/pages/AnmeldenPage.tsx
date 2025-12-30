import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { registerTenant, checkTenantStatus, loginUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext'; // NEU

export function AnmeldenPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shouldRegister = searchParams.get('register') === 'true';
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth(); // NEU: Login Funktion aus Context

  useEffect(() => {
    window.scrollTo(0, 0);

    // NEU: Beim Laden prüfen, ob ein Plan in der URL ist und speichern
    const plan = searchParams.get('plan');
    const cycle = searchParams.get('cycle');
    const isRegister = searchParams.get('register') === 'true';

    if (isRegister && plan) {
      localStorage.setItem('pfotencard_pending_plan', plan);
      if (cycle) localStorage.setItem('pfotencard_pending_cycle', cycle);
    }

    // Wenn bereits eingeloggt, direkt weiterleiten
    if (isAuthenticated) {
      navigate('/einstellungen');
    }
  }, [isAuthenticated, navigate, searchParams]);

  const [isLogin, setIsLogin] = useState(!shouldRegister);
  const [isLoading, setIsLoading] = useState(false);

  // Login State
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [loginSubdomain, setLoginSubdomain] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [verifiedTenant, setVerifiedTenant] = useState<{ name: string, subscription_valid: boolean } | null>(null);

  // Register Form Data
  const [regData, setRegData] = useState({
    email: '',
    password: '',
    name: '',
    schoolName: '',
    subdomain: '',
    phone: '',
  });

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (e.target.name === 'subdomain') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
    setRegData({ ...regData, [e.target.name]: value });
  };

  const handleSubdomainCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginSubdomain) return;
    setIsLoading(true);

    try {
      const status = await checkTenantStatus(loginSubdomain);

      if (!status.exists) {
        toast({
          variant: "destructive",
          title: "Nicht gefunden",
          description: "Unter dieser Subdomain existiert keine Hundeschule.",
        });
      } else {
        setVerifiedTenant(status);
        setLoginStep(2);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Status konnte nicht geprüft werden.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginUser(loginSubdomain, loginEmail, loginPassword);

      // NEU: Auth Context nutzen statt manuell LocalStorage
      login(response.access_token, loginSubdomain);

      // NEU: Prüfen ob ein Kauf "ausstehend" ist
      const pendingPlan = localStorage.getItem('pfotencard_pending_plan');
      const pendingCycle = localStorage.getItem('pfotencard_pending_cycle') || 'monthly';

      if (pendingPlan) {
        // Aufräumen
        localStorage.removeItem('pfotencard_pending_plan');
        localStorage.removeItem('pfotencard_pending_cycle');

        toast({
          title: "Anmeldung erfolgreich",
          description: "Bitte schließe deine Buchung ab.",
        });

        // WICHTIG: Weiterleitung zum Checkout statt zu Einstellungen
        navigate(`/checkout?plan=${pendingPlan}&cycle=${pendingCycle}`);
        return;
      }

      if (verifiedTenant && !verifiedTenant.subscription_valid) {
        toast({
          title: "Abo abgelaufen",
          description: "Bitte wähle einen Plan, um fortzufahren.",
        });
        navigate(`/preise?subdomain=${loginSubdomain}`);
      } else {
        toast({
          title: "Erfolgreich angemeldet",
          description: "Weiterleitung zu den Einstellungen...",
        });
        navigate('/einstellungen');
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Anmeldung fehlgeschlagen",
        description: error.message || "E-Mail oder Passwort falsch.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Plan aus URL holen für die API
    const planFromUrl = searchParams.get('plan') || 'starter';

    try {
      await registerTenant({
        schoolName: regData.schoolName,
        subdomain: regData.subdomain,
        adminName: regData.name,
        email: regData.email,
        password: regData.password,
        phone: regData.phone,
        plan: planFromUrl // NEU: Plan an API übergeben
      });

      toast({
        title: "Registrierung erfolgreich!",
        description: "Bitte überprüfe deine E-Mails, um dein Konto zu aktivieren.",
      });

      // Weiterleitung zur Email-Verifikationsseite
      navigate(`/email-verifizierung?email=${encodeURIComponent(regData.email)}`);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler bei der Registrierung",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... (JSX Render Teil bleibt im Wesentlichen gleich, wie im vorherigen Snippet) ...
  // Ich gebe hier den vollen JSX Block nochmal zurück, damit du die Datei komplett ersetzen kannst.

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg border border-border shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src="/logo.png" alt="Pfotencard Logo" className="w-12 h-12" />
                <span className="text-3xl font-sans font-bold text-primary">Pfotencard</span>
              </Link>
            </div>

            <div className="flex gap-2 mb-8 bg-muted rounded-lg p-1">
              <button
                onClick={() => { setIsLogin(true); setLoginStep(1); }}
                className={`flex-1 py-2 rounded-md text-sm font-body font-medium transition-colors ${isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md text-sm font-body font-medium transition-colors ${!isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Registrieren
              </button>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-sans font-bold text-foreground mb-2">
                {isLogin ? (loginStep === 1 ? 'Schule finden' : verifiedTenant?.name) : 'Kostenlos starten'}
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                {isLogin
                  ? (loginStep === 1 ? 'Gib deine Subdomain ein.' : 'Melde dich mit deinem Admin-Konto an.')
                  : '14 Tage kostenlos testen.'}
              </p>
            </div>

            {isLogin ? (
              loginStep === 1 ? (
                <form onSubmit={handleSubdomainCheck} className="space-y-4">
                  <div>
                    <Label>Deine Subdomain</Label>
                    <div className="flex items-center mt-2">
                      <span className="text-muted-foreground bg-muted h-10 px-3 flex items-center rounded-l-md border border-r-0 border-input text-sm">https://</span>
                      <Input
                        value={loginSubdomain}
                        onChange={(e) => setLoginSubdomain(e.target.value.toLowerCase())}
                        placeholder="deine-schule"
                        className="rounded-l-none rounded-r-md border-l-0"
                        required
                        autoFocus
                      />
                      <span className="text-muted-foreground bg-muted h-10 px-3 flex items-center rounded-r-md border border-l-0 border-input text-sm">.pfotencard.de</span>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Weiter
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <Label>E-Mail</Label>
                    <Input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required autoFocus />
                  </div>
                  <div>
                    <Label>Passwort</Label>
                    <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setLoginStep(1)}><ArrowLeft className="h-4 w-4" /></Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Anmelden'}
                    </Button>
                  </div>
                </form>
              )
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Name</Label><Input name="name" required value={regData.name} onChange={handleRegChange} placeholder="Max" /></div>
                  <div><Label>Telefon</Label><Input name="phone" value={regData.phone} onChange={handleRegChange} placeholder="Optional" /></div>
                </div>
                <div><Label>Name der Hundeschule</Label><Input name="schoolName" required value={regData.schoolName} onChange={handleRegChange} /></div>
                <div>
                  <Label>Wunsch-Subdomain</Label>
                  <div className="flex items-center mt-1">
                    <Input name="subdomain" required value={regData.subdomain} onChange={handleRegChange} className="rounded-r-none" />
                    <div className="bg-muted px-3 py-2 border border-l-0 border-input rounded-r-md text-sm text-muted-foreground">.pfotencard.de</div>
                  </div>
                </div>
                <Separator />
                <div><Label>E-Mail</Label><Input type="email" name="email" required value={regData.email} onChange={handleRegChange} /></div>
                <div><Label>Passwort</Label><Input type="password" name="password" required value={regData.password} onChange={handleRegChange} /></div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : 'Kostenlos registrieren'}</Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}