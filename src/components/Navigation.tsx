import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Settings, CreditCard } from 'lucide-react'; // CreditCard importieren
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { useAuth } from '@/context/AuthContext';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, subdomain } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background ${isScrolled ? 'h-16 shadow-sm' : 'h-20'
        }`}
    >
      <nav className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Pfotencard Logo" className="w-10 h-10" />
          <span className="text-2xl font-sans font-bold text-primary">Pfotencard</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-6">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    className={`text-base font-body transition-colors hover:text-primary cursor-pointer px-4 py-2 rounded-md ${isActive('/') ? 'text-primary font-medium bg-accent/50' : 'text-foreground'
                      }`}
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/funktionen"
                    className={`text-base font-body transition-colors hover:text-primary cursor-pointer px-4 py-2 rounded-md ${isActive('/funktionen') ? 'text-primary font-medium bg-accent/50' : 'text-foreground'
                      }`}
                  >
                    Funktionen
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/preise"
                    className={`text-base font-body transition-colors hover:text-primary cursor-pointer px-4 py-2 rounded-md ${isActive('/preise') ? 'text-primary font-medium bg-accent/50' : 'text-foreground'
                      }`}
                  >
                    Preise
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/kontakt"
                    className={`text-base font-body transition-colors hover:text-primary cursor-pointer px-4 py-2 rounded-md ${isActive('/kontakt') ? 'text-primary font-medium bg-accent/50' : 'text-foreground'
                      }`}
                  >
                    Kontakt
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground mr-2 hidden lg:inline-block">
                  <a
                    href={`https://${subdomain}.pfotencard.de`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {subdomain}.pfotencard.de
                  </a>
                </span>

                {/* NEU: Billing Link */}
                <Link to="/billing">
                  <Button
                    variant="ghost"
                    className={`gap-2 ${isActive('/billing') ? 'text-primary font-medium bg-accent/50' : ''}`}
                    title="Abo & Rechnungen"
                  >
                    <CreditCard size={18} />
                    <span className="hidden xl:inline">Abo</span>
                  </Button>
                </Link>

                <Link to="/einstellungen">
                  <Button
                    variant="ghost"
                    className={`gap-2 ${isActive('/einstellungen') ? 'text-primary font-medium bg-accent/50' : ''}`}
                  >
                    <Settings size={18} />
                    <span className="hidden xl:inline">Einstellungen</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                >
                  <LogOut size={18} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary font-normal"
                  onClick={() => navigate('/anmelden')}
                >
                  Login
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
                  onClick={() => navigate('/anmelden?register=true')}
                >
                  14 Tage kostenlos testen
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={32} strokeWidth={1.5} /> : <Menu size={32} strokeWidth={1.5} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border absolute w-full left-0 top-full shadow-lg h-[calc(100vh-80px)] overflow-y-auto pb-8">
          <NavigationMenu className="w-full">
            <NavigationMenuList className="flex flex-col w-full p-4 gap-4">
              <NavigationMenuItem className="w-full">
                <NavigationMenuLink asChild>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 px-4 text-base hover:bg-muted rounded-md"
                  >
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <NavigationMenuLink asChild>
                  <Link
                    to="/funktionen"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 px-4 text-base hover:bg-muted rounded-md"
                  >
                    Funktionen
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <NavigationMenuLink asChild>
                  <Link
                    to="/preise"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 px-4 text-base hover:bg-muted rounded-md"
                  >
                    Preise
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <NavigationMenuLink asChild>
                  <Link
                    to="/kontakt"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-3 px-4 text-base hover:bg-muted rounded-md"
                  >
                    Kontakt
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <div className="h-px bg-border my-2" />

              {isAuthenticated ? (
                <>
                  <NavigationMenuItem className="w-full">
                    <Link to="/billing" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <CreditCard size={18} /> Abo & Rechnungen
                      </Button>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <Link to="/einstellungen" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Settings size={18} /> Einstellungen
                      </Button>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-destructive border-destructive"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut size={18} /> Logout
                    </Button>
                  </NavigationMenuItem>
                </>
              ) : (
                <>
                  <NavigationMenuItem className="w-full">
                    <Button
                      variant="outline"
                      className="w-full mb-2"
                      onClick={() => navigate('/anmelden')}
                    >
                      Login
                    </Button>
                  </NavigationMenuItem>
                  <NavigationMenuItem className="w-full">
                    <Button
                      className="w-full bg-primary text-primary-foreground"
                      onClick={() => navigate('/anmelden?register=true')}
                    >
                      14 Tage kostenlos testen
                    </Button>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
    </header>
  );
}