import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Ticket, 
    ArrowLeft, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    XCircle, 
    Calendar, 
    Users, 
    Clock, 
    Tag, 
    Activity,
    AlertCircle,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PromoCodeCard = ({ promo, onToggle, onDelete }: { promo: any, onToggle: () => void, onDelete: () => void }) => {
    const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
    const isLimitReached = promo.max_uses && promo.current_uses >= promo.max_uses;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${promo.is_active && !isExpired && !isLimitReached ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            
            <div className="flex justify-between items-start mb-4 mt-2">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${promo.is_active && !isExpired && !isLimitReached ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                        <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{promo.code}</h3>
                        <p className="text-sm text-slate-500">{promo.name || 'Kein Name'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onToggle} 
                        title={promo.is_active ? "Deaktivieren" : "Aktivieren"}
                        className={`h-8 w-8 ${promo.is_active ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                        {promo.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onDelete} 
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Rabatt</div>
                    <div className="text-sm font-semibold text-slate-700">100% Rabatt</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Dauer: {promo.duration_months} Monate</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Nutzung</div>
                    <div className="text-sm font-semibold text-slate-700">{promo.current_uses} / {promo.max_uses || '∞'}</div>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                        <div 
                            className={`h-full ${isLimitReached ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${promo.max_uses ? Math.min(100, (promo.current_uses / promo.max_uses) * 100) : 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ablaufdatum: {promo.expires_at ? new Date(promo.expires_at).toLocaleDateString('de-DE') : 'Unbegrenzt'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {promo.applicable_plans && promo.applicable_plans.length > 0 ? (
                        promo.applicable_plans.map((plan: string) => (
                            <span key={plan} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-md font-medium border border-indigo-100">
                                {plan}
                            </span>
                        ))
                    ) : (
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] rounded-md font-medium border border-slate-200">
                            Alle Pläne
                        </span>
                    )}
                </div>
            </div>

            {(isExpired || isLimitReached || !promo.is_active) && (
                <div className="absolute top-2 right-12 flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                    <AlertCircle className="w-3 h-3" />
                    {isExpired ? 'Abgelaufen' : isLimitReached ? 'Limit erreicht' : 'Inaktiv'}
                </div>
            )}
        </div>
    );
};

export default function SuperAdminPromoCodes() {
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState<'codes' | 'redemptions'>('codes');
    
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        duration_months: 1,
        max_uses: '' as any,
        expires_at: '',
        applicable_plans: [] as string[]
    });

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('pfotencard_superadmin_token');
        try {
            const [promoRes, redeemRes, pkgRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/superadmin/promo-codes`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/superadmin/promo-redemptions`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/superadmin/packages`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const promoData = await promoRes.json();
            const redeemData = await redeemRes.json();
            const pkgData = await pkgRes.json();

            setPromoCodes(Array.isArray(promoData) ? promoData : []);
            setRedemptions(Array.isArray(redeemData) ? redeemData : []);
            setPackages(Array.isArray(pkgData) ? pkgData.filter(p => p.package_type === 'base') : []);
        } catch (err) {
            console.error("Fehler beim Laden der Daten:", err);
            toast({ variant: "destructive", title: "Fehler", description: "Daten konnten nicht geladen werden." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('pfotencard_superadmin_token');
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/superadmin/promo-codes`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    code: formData.code.toUpperCase(),
                    max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                    expires_at: formData.expires_at || null,
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Konnte Gutschein nicht erstellen.");
            }

            toast({ title: "Erfolg", description: "Gutscheincode wurde erstellt." });
            setIsAdding(false);
            setFormData({ code: '', name: '', duration_months: 1, max_uses: '', expires_at: '', applicable_plans: [] });
            fetchData();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Fehler", description: err.message });
        }
    };

    const handleToggleStatus = async (promo: any) => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/superadmin/promo-codes/${promo.id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: !promo.is_active })
            });

            if (!res.ok) throw new Error("Statusänderung fehlgeschlagen.");
            
            setPromoCodes(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p));
            toast({ title: "Status aktualisiert", description: `Code ${promo.code} wurde ${!promo.is_active ? 'aktiviert' : 'deaktiviert'}.` });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Fehler", description: err.message });
        }
    };

    const handleDelete = async (promoId: string) => {
        if (!confirm("Möchten Sie diesen Gutscheincode wirklich löschen?")) return;
        
        const token = localStorage.getItem('pfotencard_superadmin_token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/superadmin/promo-codes/${promoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Löschen fehlgeschlagen.");
            
            setPromoCodes(prev => prev.filter(p => p.id !== promoId));
            toast({ title: "Gelöscht", description: "Gutscheincode wurde erfolgreich gelöscht." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Fehler", description: err.message });
        }
    };

    const togglePlan = (planName: string) => {
        setFormData(prev => ({
            ...prev,
            applicable_plans: prev.applicable_plans.includes(planName)
                ? prev.applicable_plans.filter(p => p !== planName)
                : [...prev.applicable_plans, planName]
        }));
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/dashboard" className="p-2 hover:bg-white rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-sans font-bold text-slate-900">Gutscheincodes</h1>
                            <p className="text-slate-500 font-body">Promotion Codes verwalten und Einlösungen tracken</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Code erstellen
                    </Button>
                </header>

                <div className="flex gap-1 bg-slate-200 p-1 rounded-lg w-fit mb-8">
                    <button 
                        onClick={() => setActiveTab('codes')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'codes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Aktive Codes
                    </button>
                    <button 
                        onClick={() => setActiveTab('redemptions')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'redemptions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        Nutzungshistorie
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : activeTab === 'codes' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {promoCodes.length > 0 ? (
                            promoCodes.map(promo => (
                                <PromoCodeCard 
                                    key={promo.id} 
                                    promo={promo} 
                                    onToggle={() => handleToggleStatus(promo)}
                                    onDelete={() => handleDelete(promo.id)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-700">Keine Gutscheincodes vorhanden</h3>
                                <p className="text-slate-500 mb-6">Erstellen Sie Ihren ersten Promo-Code für Kunden.</p>
                                <Button variant="outline" onClick={() => setIsAdding(true)}>Code erstellen</Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gutschein</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mandant (Tenant)</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Eingelöst am</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dauer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {redemptions.length > 0 ? (
                                        redemptions.map(red => (
                                            <tr key={red.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Ticket className="w-4 h-4 text-emerald-500" />
                                                        <span className="font-bold text-slate-900">{red.promo_code?.code || 'Unbekannt'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-900">{red.tenant?.name || `ID: ${red.tenant_id}`}</div>
                                                    <div className="text-xs text-slate-500">{red.tenant?.subdomain}.pfotencard.de</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    {new Date(red.created_at).toLocaleString('de-DE')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                                    {red.applied_months} Monate
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                Noch keine Einlösungen vorhanden.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-900">Neuen Gutscheincode erstellen</h3>
                                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white rounded-full transition-colors"><XCircle className="w-6 h-6 text-slate-400" /></button>
                            </div>
                            
                            <form onSubmit={handleCreate} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Gutschein-Code</label>
                                        <div className="flex gap-2">
                                            <input 
                                                required
                                                type="text" 
                                                value={formData.code}
                                                onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none uppercase font-mono tracking-widest font-bold"
                                                placeholder="Z.B. SOMMER2026"
                                            />
                                            <Button type="button" variant="outline" onClick={generateRandomCode} title="Zufällig generieren">
                                                <Activity className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Anzeigename (Intern)</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="Z.B. Sommerkampagne 2026"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Rabatt-Dauer (Monate)</label>
                                        <input 
                                            required
                                            type="number" 
                                            min="1"
                                            value={formData.duration_months}
                                            onChange={e => setFormData(prev => ({ ...prev, duration_months: parseInt(e.target.value) }))}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Max. Nutzungen (Leer = unlimitiert)</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={formData.max_uses}
                                            onChange={e => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Ablaufdatum (Optional)</label>
                                        <input 
                                            type="datetime-local" 
                                            value={formData.expires_at}
                                            onChange={e => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                        Gilt für folgende Pläne
                                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-normal">Optional</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {packages.map(pkg => (
                                            <button
                                                key={pkg.id}
                                                type="button"
                                                onClick={() => togglePlan(pkg.plan_name)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                                                    formData.applicable_plans.includes(pkg.plan_name)
                                                    ? 'bg-primary border-primary text-white shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                {pkg.plan_name}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.applicable_plans.length === 0 && (
                                        <p className="text-[10px] text-slate-400 italic mt-1 flex items-center gap-1">
                                            <Info className="w-3 h-3" />
                                            Keine Auswahl bedeutet der Code gilt für alle Basis-Pakete.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="flex-grow py-6 text-lg">Abbrechen</Button>
                                    <Button type="submit" className="flex-grow py-6 text-lg bg-emerald-600 hover:bg-emerald-700">Erstellen</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
