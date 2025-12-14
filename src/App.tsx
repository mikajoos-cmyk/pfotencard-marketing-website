import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
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
          <Route path="/einstellungen" element={<EinstellungenPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
