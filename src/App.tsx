import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FunktionenPage } from './pages/FunktionenPage';
import { PreisePage } from './pages/PreisePage';
import { KontaktPage } from './pages/KontaktPage';
import { FAQPage } from './pages/FAQPage';
import { AnmeldenPage } from './pages/AnmeldenPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { ImpressumPage } from './pages/ImpressumPage';
import { DatenschutzPage } from './pages/DatenschutzPage';
import { AGBPage } from './pages/AGBPage';
import { EinstellungenPage } from './pages/EinstellungenPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BillingPage } from './pages/BillingPage';
import { UpgradeWizard } from './pages/UpgradeWizard';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminTenantUsers from './pages/superadmin/SuperAdminTenantUsers';
import SuperAdminPackages from './pages/superadmin/SuperAdminPackages';
import SuperAdminPromoCodes from './pages/superadmin/SuperAdminPromoCodes';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import { checkTenantStatus } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { CookieBanner } from '@/components/ui/CookieBanner';

// Erweiterte ProtectedRoute mit Abo-Check
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading, subdomain } = useAuth();
  const location = useLocation();
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [subscriptionValid, setSubscriptionValid] = useState(false);

  useEffect(() => {
    async function verifySubscription() {
      // Wenn wir nicht eingeloggt sind oder keine Subdomain haben, bricht der Auth-Check eh gleich ab
      if (!isAuthenticated || !subdomain) {
        setIsCheckingSubscription(false);
        return;
      }

      try {
        const status = await checkTenantStatus(subdomain);
        // Wir lassen den User rein, wenn:uhuhuhu
        // 1. Das Abo gültig ist (subscription_valid)
        // 2. ODER wenn er gerade auf dem Weg zum Checkout oder zur Billing Page ist (um das Problem zu lösen)
        setSubscriptionValid(status.subscription_valid);
      } catch (error) {
        console.error("Subscription check failed", error);
        setSubscriptionValid(false); // Im Zweifel sperren
      } finally {
        setIsCheckingSubscription(false);
      }
    }

    if (!isLoading) {
      verifySubscription();
    }
  }, [isAuthenticated, isLoading, subdomain]);

  // 1. Ladezustand (Auth oder Subscription Check)
  if (isLoading || (isAuthenticated && isCheckingSubscription)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Prüfe Berechtigungen...</p>
      </div>
    );
  }

  // 2. Nicht eingeloggt -> Login
  if (!isAuthenticated) {
    return <Navigate to="/anmelden" state={{ from: location }} replace />;
  }

  // 3. Eingeloggt, aber Abo abgelaufen/ungültig
  // Ausnahme: Wir sind schon auf der Checkout-, Billing- oder Upgrade-Seite (sonst Endlosschleife)
  const isPaymentPage = location.pathname.startsWith('/checkout') || location.pathname.startsWith('/billing') || location.pathname.startsWith('/preise') || location.pathname.startsWith('/upgrade');

  if (!subscriptionValid && !isPaymentPage) {
    // Wenn ein "Pending Plan" im Storage ist (vom Login Flow), schicken wir ihn zum Checkout
    const pendingPlan = localStorage.getItem('pfotencard_pending_plan');
    if (pendingPlan) {
      return <Navigate to={`/checkout?plan=${pendingPlan}`} replace />;
    }

    // Ansonsten zur Billing Page, damit er sieht was los ist
    return <Navigate to="/billing" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/funktionen" element={<FunktionenPage />} />
          <Route path="/preise" element={<PreisePage />} />
          <Route path="/kontakt" element={<KontaktPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/anmelden" element={<AnmeldenPage />} />
          <Route path="/email-verifizierung" element={<EmailVerificationPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/agb" element={<AGBPage />} />

          {/* Super-Admin Routen */}
          <Route path="/admin" element={<SuperAdminLogin />} />
          <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/admin/tenants/:tenantId/users" element={<SuperAdminTenantUsers />} />
          <Route path="/admin/packages" element={<SuperAdminPackages />} />
          <Route path="/admin/promo-codes" element={<SuperAdminPromoCodes />} />

          {/* Geschützte Routen */}
          <Route
            path="/einstellungen/:section?/:moduleId?"
            element={
              <ProtectedRoute>
                <EinstellungenPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upgrade"
            element={
              <ProtectedRoute>
                <UpgradeWizard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
      <Toaster />
      <CookieBanner />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;