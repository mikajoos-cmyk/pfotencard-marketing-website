import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Package, 
    ArrowLeft,
    Plus,
    Edit2,
    Check,
    X,
    Euro,
    Layers,
    Percent,
    Settings,
    Shield,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminPackages() {
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        plan_name: '',
        package_type: 'base',
        price_monthly: 0,
        price_yearly: 0,
        allowed_modules: ['news', 'documents'],
        max_customers: null as number | null,
        top_up_fee_percent: 0,
        additional_cost_per_customer: 0,
        features: {} as Record<string, boolean>
    });
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        if (!token) {
            navigate('/admin');
            return;
        }

        fetchPackages();
    }, [navigate]);

    const fetchPackages = async () => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/superadmin/packages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const sortedData = Array.isArray(data) 
                ? [...data].sort((a, b) => a.price_monthly - b.price_monthly)
                : data;
            setPackages(sortedData);
        } catch (err) {
            console.error("Fehler beim Laden der Pakete:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        const url = editingId 
            ? `${API_BASE_URL}/api/superadmin/packages/${editingId}`
            : `${API_BASE_URL}/api/superadmin/packages`;
        const method = editingId ? 'PUT' : 'POST';

        const payload = {
            ...formData,
            price_monthly: Number(formData.price_monthly),
            price_yearly: Number(formData.price_yearly),
            max_customers: formData.max_customers === null ? null : Number(formData.max_customers),
            top_up_fee_percent: Number(formData.top_up_fee_percent),
            additional_cost_per_customer: Number(formData.additional_cost_per_customer)
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast({ title: editingId ? "Paket aktualisiert" : "Paket erstellt" });
                resetForm();
                fetchPackages();
            }
        } catch (err) {
            toast({ variant: "destructive", title: "Fehler beim Speichern" });
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ 
            plan_name: '', 
            package_type: 'base',
            price_monthly: 0, 
            price_yearly: 0,
            allowed_modules: ['news', 'documents'], 
            max_customers: null, 
            top_up_fee_percent: 0,
            additional_cost_per_customer: 0,
            features: {}
        });
    };

    const startEdit = (pkg: any) => {
        setEditingId(pkg.id);
        setFormData({
            plan_name: pkg.plan_name,
            package_type: pkg.package_type || 'base',
            price_monthly: pkg.price_monthly,
            price_yearly: pkg.price_yearly || 0,
            allowed_modules: pkg.allowed_modules || [],
            max_customers: pkg.max_customers,
            top_up_fee_percent: pkg.top_up_fee_percent || 0,
            additional_cost_per_customer: pkg.additional_cost_per_customer || 0,
            features: pkg.features || {}
        });
        setIsAdding(true);
    };

    const toggleModule = (moduleId: string) => {
        setFormData(prev => ({
            ...prev,
            allowed_modules: prev.allowed_modules.includes(moduleId)
                ? prev.allowed_modules.filter(m => m !== moduleId)
                : [...prev.allowed_modules, moduleId]
        }));
    };

    const toggleFeature = (featureId: string) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [featureId]: !prev.features[featureId]
            }
        }));
    };

    const availableModules = [
        { id: 'status_display', label: 'Statusanzeige' },
        { id: 'calendar', label: 'Kalender & Terminbuchung' },
        { id: 'news', label: 'News & Updates' },
        { id: 'chat', label: 'Chat-System' },
        { id: 'homework', label: 'Hausaufgaben & Trainingsplan' },
        { id: 'balance_topup', label: 'Guthaben-Aufladung' },
        { id: 'invoice_download', label: 'Rechnungs-Download' },
        { id: 'certificates', label: 'Teilnahmebescheinigungen' },
        { id: 'widgets', label: 'Website-Integration (Widgets)' }
    ];

    const availableFeatures = [
        { id: 'white_label', label: 'White-Label (Eigenes Branding)' },
        { id: 'waitlist', label: 'Wartelisten-Funktion' },
        { id: 'priority_support', label: 'Prioritäts-Support' },
        { id: 'digital_vouchers', label: 'Digitale Wertkarten' },
        { id: 'custom_design', label: 'Individuelles Design' },
        { id: 'email_support', label: 'E-Mail Support' }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <Link to="/admin/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Zurück zum Dashboard
                    </Link>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-sans font-bold text-slate-900">Abonnement-Pakete</h1>
                            <p className="text-slate-500">Detaillierte Konfiguration der Preispläne.</p>
                        </div>
                        {!isAdding && (
                            <Button onClick={() => {
                                resetForm();
                                setIsAdding(true);
                            }} className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Neues Paket
                            </Button>
                        )}
                    </div>
                </header>

                {isAdding && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            {editingId ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                            {editingId ? 'Paket bearbeiten' : 'Neues Paket erstellen'}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">Paket-Typ</label>
                                <select 
                                    value={formData.package_type}
                                    onChange={e => setFormData({...formData, package_type: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="base">Basis-Paket</option>
                                    <option value="addon">Add-on</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">Plan Name</label>
                                <input 
                                    type="text" 
                                    value={formData.plan_name}
                                    onChange={e => setFormData({...formData, plan_name: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="z.B. Premium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">Preis (monatlich)</label>
                                <div className="relative">
                                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="number" 
                                        value={formData.price_monthly}
                                        onChange={e => setFormData({...formData, price_monthly: parseFloat(e.target.value)})}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">Preis (jährlich)</label>
                                <div className="relative">
                                    <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="number" 
                                        value={formData.price_yearly}
                                        onChange={e => setFormData({...formData, price_yearly: parseFloat(e.target.value)})}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {formData.package_type === 'base' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">Max. Kunden (0=Unbegrenzt)</label>
                                        <div className="relative">
                                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="number" 
                                                value={formData.max_customers || ''}
                                                onChange={e => setFormData({...formData, max_customers: e.target.value ? parseInt(e.target.value) : null})}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">Aufladegebühr (%)</label>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                value={formData.top_up_fee_percent}
                                                onChange={e => setFormData({...formData, top_up_fee_percent: parseFloat(e.target.value)})}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1 text-slate-500 uppercase text-[10px] tracking-wider font-bold">Kosten pro weiterem Kunden (€)</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                value={formData.additional_cost_per_customer}
                                                onChange={e => setFormData({...formData, additional_cost_per_customer: parseFloat(e.target.value)})}
                                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-primary" />
                                    Aktivierte Haupt-Module
                                </label>
                                <div className="space-y-2">
                                    {availableModules.map(mod => (
                                        <label key={mod.id} className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-l-4 border-l-transparent hover:border-l-primary">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.allowed_modules.includes(mod.id)}
                                                onChange={() => toggleModule(mod.id)}
                                                className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                                            />
                                            <span className="ml-3 text-sm font-medium text-slate-700">{mod.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {formData.package_type === 'base' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-primary" />
                                        Zusätzliche Features
                                    </label>
                                    <div className="space-y-2">
                                        {availableFeatures.map(feat => (
                                            <label key={feat.id} className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-l-4 border-l-transparent hover:border-l-indigo-500">
                                                <input 
                                                    type="checkbox" 
                                                    checked={!!formData.features[feat.id]}
                                                    onChange={() => toggleFeature(feat.id)}
                                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                />
                                                <span className="ml-3 text-sm font-medium text-slate-700">{feat.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Button variant="outline" onClick={resetForm}>Abbrechen</Button>
                            <Button onClick={handleSave} className="px-8 shadow-md">Speichern</Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                    <Package className="w-6 h-6" />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => startEdit(pkg)} className="h-8 w-8 text-slate-400 hover:text-primary">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{pkg.plan_name}</h3>
                            <div className="text-2xl font-bold text-primary mb-4">
                                {pkg.price_monthly.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                <span className="text-sm font-normal text-slate-500"> / Monat</span>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Kunden</div>
                                        <div className="text-xs font-semibold text-slate-700">{pkg.max_customers ? `${pkg.max_customers}` : 'Unbegr.'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Gebühr</div>
                                        <div className="text-xs font-semibold text-slate-700">{pkg.top_up_fee_percent}%</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Zusatz/Kunde</div>
                                        <div className="text-xs font-semibold text-slate-700">{pkg.additional_cost_per_customer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Aktivierte Funktionen</div>
                                    <div className="flex flex-wrap gap-1">
                                        {pkg.allowed_modules.map((m: string) => (
                                            <span key={m} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md font-medium">
                                                {m}
                                            </span>
                                        ))}
                                        {Object.entries(pkg.features || {})
                                            .filter(([_, active]) => active)
                                            .map(([feat, _]) => (
                                                <span key={feat} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-md font-medium border border-indigo-100">
                                                    {feat}
                                                </span>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
