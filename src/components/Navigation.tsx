import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';


export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
                <Link to="/">
                  <NavigationMenuLink
                    className={`text-base font-body transition-colors hover:text-primary cursor-pointer ${isActive('/') ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/funktionen">
                  <NavigationMenuLink
                    className={`text-base font-body transition-colors hover:text-primary cursor-pointer ${isActive('/funktionen') ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                  >
                    Funktionen
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/preise">
                  <NavigationMenuLink
                    className={`text-base font-body transition-colors hover:text-primary cursor-pointer ${isActive('/preise') ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                  >
                    Preise
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/kontakt">
                  <NavigationMenuLink
                    className={`text-base font-body transition-colors hover:text-primary cursor-pointer ${isActive('/kontakt') ? 'text-primary font-medium' : 'text-foreground'
                      }`}
                  >
                    Kontakt
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary font-normal"
              onClick={() => window.location.href = '/anmelden'}
            >
              Login
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-secondary font-normal"
              onClick={() => window.location.href = '/anmelden'}
            >
              14 Tage kostenlos testen
            </Button>
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
        <div className="md:hidden bg-background border-t border-border">
          <NavigationMenu className="w-full">
            <NavigationMenuList className="flex flex-col w-full p-4 gap-4">
              <NavigationMenuItem className="w-full">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <NavigationMenuLink
                    className={`block w-full py-3 px-4 text-base font-body transition-colors hover:bg-muted rounded-md cursor-pointer ${isActive('/') ? 'text-primary font-medium bg-muted' : 'text-foreground'
                      }`}
                  >
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <Link to="/funktionen" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <NavigationMenuLink
                    className={`block w-full py-3 px-4 text-base font-body transition-colors hover:bg-muted rounded-md cursor-pointer ${isActive('/funktionen') ? 'text-primary font-medium bg-muted' : 'text-foreground'
                      }`}
                  >
                    Funktionen
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <Link to="/preise" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <NavigationMenuLink
                    className={`block w-full py-3 px-4 text-base font-body transition-colors hover:bg-muted rounded-md cursor-pointer ${isActive('/preise') ? 'text-primary font-medium bg-muted' : 'text-foreground'
                      }`}
                  >
                    Preise
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <Link to="/kontakt" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <NavigationMenuLink
                    className={`block w-full py-3 px-4 text-base font-body transition-colors hover:bg-muted rounded-md cursor-pointer ${isActive('/kontakt') ? 'text-primary font-medium bg-muted' : 'text-foreground'
                      }`}
                  >
                    Kontakt
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full pt-2">
                <Button
                  variant="outline"
                  className="w-full bg-background text-foreground border-border hover:bg-muted font-normal mb-2"
                  onClick={() => window.location.href = '/anmelden'}
                >
                  Login
                </Button>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-secondary font-normal"
                  onClick={() => window.location.href = '/anmelden'}
                >
                  14 Tage kostenlos testen
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      )}
    </header>
  );
}
