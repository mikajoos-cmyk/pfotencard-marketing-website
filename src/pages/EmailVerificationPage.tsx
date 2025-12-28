import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resendVerificationEmail } from '@/lib/api';

export function EmailVerificationPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const email = searchParams.get('email') || '';
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Cooldown Timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendEmail = async () => {
        if (resendCooldown > 0 || !email) return;

        setIsResending(true);
        try {
            await resendVerificationEmail(email);

            toast({
                title: "E-Mail gesendet",
                description: "Wir haben dir eine neue Bestätigungs-E-Mail gesendet. Bitte überprüfe auch deinen Spam-Ordner.",
            });

            setResendCooldown(60); // 60 Sekunden Cooldown
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Fehler",
                description: error.message || "E-Mail konnte nicht gesendet werden.",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <main className="pt-20 min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-lg border border-border shadow-lg p-8"
                    >
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <Link to="/" className="inline-flex items-center gap-3">
                                <img src="/logo.png" alt="Pfotencard Logo" className="w-12 h-12" />
                                <span className="text-3xl font-sans font-bold text-primary">Pfotencard</span>
                            </Link>
                        </div>

                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Mail className="w-10 h-10 text-primary" />
                            </div>
                        </div>

                        {/* Titel */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-sans font-bold text-foreground mb-2">
                                E-Mail Bestätigung
                            </h1>
                            <p className="text-muted-foreground font-body text-sm">
                                Überprüfe dein Postfach
                            </p>
                        </div>

                        {/* Nachricht */}
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-foreground font-medium mb-1">
                                        Registrierung erfolgreich!
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Wir haben eine Bestätigungs-E-Mail an{' '}
                                        <strong className="text-foreground">{email}</strong> gesendet.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Anweisungen */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">1</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Öffne dein E-Mail-Postfach und suche nach unserer Nachricht
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">2</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Klicke auf den Bestätigungslink in der E-Mail
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-primary">3</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Melde dich mit deinen Zugangsdaten an
                                </p>
                            </div>
                        </div>

                        {/* Hinweis Spam */}
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 mb-6">
                            <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 dark:text-amber-200">
                                    <strong>Keine E-Mail erhalten?</strong> Überprüfe bitte auch deinen Spam-Ordner.
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={handleResendEmail}
                                variant="outline"
                                className="w-full"
                                disabled={isResending || resendCooldown > 0}
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Wird gesendet...
                                    </>
                                ) : resendCooldown > 0 ? (
                                    `Erneut senden in ${resendCooldown}s`
                                ) : (
                                    'E-Mail erneut senden'
                                )}
                            </Button>

                            <Button
                                onClick={() => navigate('/anmelden')}
                                className="w-full"
                            >
                                Zum Login
                            </Button>
                        </div>

                        {/* Support Link */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                Probleme bei der Registrierung?{' '}
                                <Link to="/kontakt" className="text-primary hover:underline">
                                    Kontaktiere uns
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
