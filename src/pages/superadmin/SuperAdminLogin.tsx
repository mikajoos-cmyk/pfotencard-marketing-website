import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

export default function SuperAdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        if (token) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/api/superadmin/login`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.detail || 'Login fehlgeschlagen. Bitte Zugangsdaten prüfen.');
            }

            const data = await response.json();
            
            // Spezieller Token für Super-Admin
            localStorage.setItem('pfotencard_superadmin_token', data.access_token);
            localStorage.setItem('pfotencard_superadmin_user', JSON.stringify(data.user));
            
            toast({
                title: "Super-Admin Login erfolgreich",
                description: "Willkommen im globalen Verwaltungsportal.",
            });
            
            navigate('/admin/dashboard');
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Login fehlgeschlagen",
                description: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="pt-20 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-card rounded-lg border border-border shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-sans font-bold text-foreground">Super-Admin</h1>
                        <p className="text-muted-foreground mt-2 font-body">Globales Verwaltungsportal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin-Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@pfotencard.de"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Passwort</Label>
                            <PasswordInput
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <ArrowRight className="mr-2 h-5 w-5" />
                            )}
                            Einloggen
                        </Button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Zurück zur Marketing-Seite
                        </Link>
                    </div>
                </div>
                
                <p className="text-center mt-6 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    Systemzugriff beschränkt auf autorisiertes Personal
                </p>
            </motion.div>
        </main>
    );
}
