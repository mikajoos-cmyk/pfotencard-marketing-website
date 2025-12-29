import { Mail, Facebook, Instagram, Linkedin, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { newsletterSubscribe } from '@/lib/api';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      await newsletterSubscribe(email);
      setStatus('success');
      setEmail('');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage('Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <footer id="kontakt" className="bg-gray-50 text-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Pfotencard Logo" className="w-10 h-10" />
              <h3 className="text-2xl font-sans font-bold text-primary">Pfotencard</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Die digitale Lösung für moderne Hundeschulen. Einfach, effizient und individuell anpassbar.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-lg font-sans font-medium text-foreground mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/funktionen" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Funktionen
                </Link>
              </li>
              <li>
                <Link to="/preise" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Preise
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-lg font-sans font-medium text-foreground mb-4">Rechtliches</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/impressum" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/agb" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  AGB
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-lg font-sans font-medium text-foreground mb-4">Newsletter</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Bleiben Sie auf dem Laufenden mit unseren neuesten Updates.
            </p>

            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-green-800 font-medium text-sm">Vielen Dank für die Anmeldung!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <Input
                  type="email"
                  placeholder="Ihre E-Mail"
                  className="bg-background text-foreground border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird angemeldet...
                    </>
                  ) : (
                    'Abonnieren'
                  )}
                </Button>
                {status === 'error' && (
                  <p className="text-destructive text-xs mt-1">{errorMessage}</p>
                )}
              </form>
            )}
          </div>
        </div>

        <Separator className="mb-8 bg-border" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Mail size={20} strokeWidth={1.5} />
            <a href="mailto:info@pfotencard.de" className="hover:text-primary transition-colors">
              info@pfotencard.de
            </a>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={24} strokeWidth={1.5} />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={24} strokeWidth={1.5} />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={24} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div className="text-center mt-8 text-muted-foreground text-sm">
          © {new Date().getFullYear()} Pfotencard. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
