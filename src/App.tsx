import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FunktionenPage } from './pages/FunktionenPage';
import { PreisePage } from './pages/PreisePage';
import { KontaktPage } from './pages/KontaktPage';
import { FAQPage } from './pages/FAQPage';
import { AnmeldenPage } from './pages/AnmeldenPage';
import { ImpressumPage } from './pages/ImpressumPage';
import { DatenschutzPage } from './pages/DatenschutzPage';
import { AGBPage } from './pages/AGBPage';
import { EinstellungenPage } from './pages/EinstellungenPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';

// Komponente für geschützte Routen2
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Lade...</div>;
  }

  if (!isAuthenticated) {
    // Redirect zum Login, aber merke dir, wo der User hinwollte
    return <Navigate to="/anmelden" state={{ from: location }} replace />;
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
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/agb" element={<AGBPage />} />

          {/* Geschützte Route: Nur für eingeloggte User */}
          <Route
            path="/einstellungen"
            element={
              <ProtectedRoute>
                <EinstellungenPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
      <Toaster />
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