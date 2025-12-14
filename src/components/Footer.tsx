import { Mail, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer id="kontakt" className="bg-gray-50 text-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Logo className="w-10 h-10" />
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
            <form className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Ihre E-Mail"
                className="bg-background text-foreground border-border"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-secondary font-normal">
                Abonnieren
              </Button>
            </form>
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
