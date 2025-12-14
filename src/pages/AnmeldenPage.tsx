import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, Phone } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function AnmeldenPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    schoolName: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-lg border border-border shadow-lg p-8"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-3">
                <Logo className="w-12 h-12" />
                <span className="text-3xl font-sans font-bold text-primary">Pfotencard</span>
              </Link>
            </div>

            {/* Toggle Login/Register */}
            <div className="flex gap-2 mb-8 bg-muted rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                  isLogin
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Anmelden
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                  !isLogin
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Registrieren
              </button>
            </div>

            {/* Form Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-sans font-bold text-foreground mb-2">
                {isLogin ? 'Willkommen zurück!' : 'Kostenlos starten'}
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                {isLogin
                  ? 'Melde dich an, um auf dein Konto zuzugreifen.'
                  : '14 Tage kostenlos testen. Keine Kreditkarte erforderlich.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label htmlFor="name" className="text-foreground font-body mb-2 block">
                      Vollständiger Name *
                    </Label>
                    <div className="relative">
                      <User
                        size={18}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Max Mustermann"
                        className="pl-10 bg-background text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="schoolName" className="text-foreground font-body mb-2 block">
                      Name der Hundeschule *
                    </Label>
                    <div className="relative">
                      <Building2
                        size={18}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="schoolName"
                        name="schoolName"
                        type="text"
                        required
                        value={formData.schoolName}
                        onChange={handleChange}
                        placeholder="Meine Hundeschule"
                        className="pl-10 bg-background text-foreground border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-foreground font-body mb-2 block">
                      Telefon
                    </Label>
                    <div className="relative">
                      <Phone
                        size={18}
                        strokeWidth={1.5}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+49 123 456789"
                        className="pl-10 bg-background text-foreground border-border"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email" className="text-foreground font-body mb-2 block">
                  E-Mail *
                </Label>
                <div className="relative">
                  <Mail
                    size={18}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="deine@email.de"
                    className="pl-10 bg-background text-foreground border-border"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground font-body mb-2 block">
                  Passwort *
                </Label>
                <div className="relative">
                  <Lock
                    size={18}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10 bg-background text-foreground border-border"
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-sm text-primary hover:text-secondary transition-colors font-body"
                  >
                    Passwort vergessen?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-secondary font-normal"
              >
                {isLogin ? 'Anmelden' : 'Kostenlos registrieren'}
              </Button>

              {!isLogin && (
                <p className="text-xs text-muted-foreground font-body text-center">
                  Mit der Registrierung stimmst du unseren{' '}
                  <a href="#" className="text-primary hover:underline">
                    AGB
                  </a>{' '}
                  und{' '}
                  <a href="#" className="text-primary hover:underline">
                    Datenschutzbestimmungen
                  </a>{' '}
                  zu.
                </p>
              )}
            </form>

            <Separator className="my-6 bg-border" />

            {/* Social Login */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full bg-background text-foreground border-border hover:bg-muted font-normal"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Mit Google {isLogin ? 'anmelden' : 'registrieren'}
              </Button>
            </div>

            {/* Footer Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground font-body">
                {isLogin ? 'Noch kein Konto?' : 'Bereits registriert?'}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-secondary transition-colors font-medium"
                >
                  {isLogin ? 'Jetzt registrieren' : 'Anmelden'}
                </button>
              </p>
            </div>
          </motion.div>

          {/* Trust Badges */}
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground font-body mb-4">
                Vertraut von über 900 Hundetrainern
              </p>
              <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  14 Tage kostenlos
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Keine Kreditkarte
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Jederzeit kündbar
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
