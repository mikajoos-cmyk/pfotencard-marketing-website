import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft, Plus, Edit2, Euro, Layers, Percent, Settings, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PLAN_MODULES, PLAN_FEATURES } from '@/lib/planConfig';

const PackageCard = ({ pkg, onEdit }: { pkg: any, onEdit: () => void }) => {
    const isAddon = pkg.package_type === 'addon';
    const inheritedPlan = Object.keys(pkg.features || {}).find(k => k.startsWith('inherits_') && pkg.features[k])?.replace('inherits_', '');

    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow relative overflow-hidden ${isAddon ? 'border-indigo-100' : 'border-slate-200'}`}>
            <div className={`absolute top-0 left-0 right-0 h-1 ${isAddon ? 'bg-indigo-500' : 'bg-primary'}`}></div>
            <div className="flex justify-between items-start mb-4 mt-2">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${isAddon ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/10 text-primary'}`}>
                        {isAddon ? <Layers className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${isAddon ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                        {isAddon ? 'Add-on' : 'Basis-Paket'}
                    </span>
                </div>
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-slate-400 hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">{pkg.plan_name}</h3>
            <div className={`text-2xl font-bold mb-4 ${isAddon ? 'text-indigo-600' : 'text-primary'}`}>
                {pkg.price_monthly.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                <span className="text-sm font-normal text-slate-500"> / Monat</span>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-50">
                {!isAddon && (
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg mb-4">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Kunden</div>
                            <div className="text-xs font-semibold text-slate-700">{pkg.included_customers || 0} inkl.</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Zusatzkosten</div>
                            <div className="text-xs font-semibold text-slate-700">{pkg.additional_cost_per_customer.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} / Kunde</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Top-Up Gebühr</div>
                            <div className="text-xs font-semibold text-slate-700">{pkg.top_up_fee_percent}%</div>
                        </div>
                    </div>
                )}
                
                <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Inkludiert</div>
                    <div className="flex flex-wrap gap-1.5">
                        {inheritedPlan && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200 text-[10px] rounded-md font-bold border">Alles aus {inheritedPlan}</span>
                        )}
                        {pkg.allowed_modules.map((mId: string) => {
                            const def = PLAN_MODULES.find(m => m.id === mId);
                            return def ? <span key={mId} className={`px-2 py-0.5 text-[10px] rounded-md font-medium border ${isAddon ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{def.label}</span> : null;
                        })}
                        {Object.entries(pkg.features || {}).filter(([k, v]) => v && !k.startsWith('inherits_')).map(([featId]) => {
                            const def = PLAN_FEATURES.find(f => f.id === featId);
                            return def ? <span key={featId} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded-md font-medium border border-green-100">{def.label}</span> : null;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SuperAdminPackages() {
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        plan_name: '', package_type: 'base', price_monthly: 0, price_yearly: 0,
        allowed_modules: [] as string[],
        included_customers: 0, top_up_fee_percent: 0,
        additional_cost_per_customer: 0, features: {} as Record<string, boolean>,
        inherits_from: '' // Temp field for UI
    });
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => { fetchPackages(); }, []);

    const fetchPackages = async () => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/superadmin/packages`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            setPackages(Array.isArray(data) ? [...data].sort((a, b) => a.price_monthly - b.price_monthly) : []);
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        const url = editingId ? `${API_BASE_URL}/api/superadmin/packages/${editingId}` : `${API_BASE_URL}/api/superadmin/packages`;
        
        // Clean up inherits flags and set the selected one
        const updatedFeatures = { ...formData.features };
        Object.keys(updatedFeatures).forEach(k => { if (k.startsWith('inherits_')) delete updatedFeatures[k]; });
        if (formData.inherits_from) updatedFeatures[`inherits_${formData.inherits_from}`] = true;

        const payload = {
            ...formData, features: updatedFeatures,
            price_monthly: Number(formData.price_monthly), price_yearly: Number(formData.price_yearly),
            included_customers: Number(formData.included_customers),
            top_up_fee_percent: Number(formData.top_up_fee_percent), 
            additional_cost_per_customer: Number(formData.additional_cost_per_customer)
        };

        try {
            const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) { toast({ title: "Gespeichert" }); resetForm(); fetchPackages(); }
        } catch (err) { toast({ variant: "destructive", title: "Fehler" }); }
    };

    const resetForm = () => {
        setIsAdding(false); setEditingId(null);
        setFormData({ plan_name: '', package_type: 'base', price_monthly: 0, price_yearly: 0, allowed_modules: [], included_customers: 0, top_up_fee_percent: 0, additional_cost_per_customer: 0, features: {}, inherits_from: '' });
    };

    const startEdit = (pkg: any) => {
        setEditingId(pkg.id);
        const inheritedPlan = Object.keys(pkg.features || {}).find(k => k.startsWith('inherits_') && pkg.features[k])?.replace('inherits_', '') || '';
        setFormData({
            plan_name: pkg.plan_name, package_type: pkg.package_type || 'base', price_monthly: pkg.price_monthly, price_yearly: pkg.price_yearly || 0,
            allowed_modules: pkg.allowed_modules || [],
            included_customers: pkg.included_customers || 0,
            top_up_fee_percent: pkg.top_up_fee_percent || 0, 
            additional_cost_per_customer: pkg.additional_cost_per_customer || 0, features: pkg.features || {}, inherits_from: inheritedPlan
        });
        setIsAdding(true);
    };

    const toggleModule = (id: string) => setFormData(p => ({ ...p, allowed_modules: p.allowed_modules.includes(id) ? p.allowed_modules.filter(m => m !== id) : [...p.allowed_modules, id] }));
    const toggleFeature = (id: string) => setFormData(p => ({ ...p, features: { ...p.features, [id]: !p.features[id] } }));

    if (isLoading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    const basePackages = packages.filter(p => p.package_type === 'base');

    // Berechne vererbte Module und Features für die Anzeige
    const getInheritedData = () => {
        if (!formData.inherits_from) return { modules: [], features: [] };
        
        const inheritedModules: string[] = [];
        const inheritedFeatures: string[] = [];
        
        let parentPkgName = formData.inherits_from;
        let safety = 0;
        
        while (parentPkgName && safety < 10) {
            safety++;
            const pName = parentPkgName;
            const parentPkg = packages.find(p => p.plan_name.toLowerCase() === pName.toLowerCase());
            
            if (parentPkg) {
                (parentPkg.allowed_modules || []).forEach((m: string) => {
                    if (!inheritedModules.includes(m)) inheritedModules.push(m);
                });
                Object.entries(parentPkg.features || {}).forEach(([k, v]) => {
                    if (v && !k.startsWith('inherits_') && !inheritedFeatures.includes(k)) {
                        inheritedFeatures.push(k);
                    }
                });
                parentPkgName = Object.keys(parentPkg.features || {}).find(k => k.startsWith('inherits_') && parentPkg.features[k])?.replace('inherits_', '') || '';
            } else {
                parentPkgName = '';
            }
        }
        
        return { modules: inheritedModules, features: inheritedFeatures };
    };

    const inheritedData = getInheritedData();

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-end gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/dashboard" className="p-2 hover:bg-white rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-sans font-bold text-slate-900">Abonnement-Pakete</h1>
                            <p className="text-slate-500">Detaillierte Konfiguration der Preispläne.</p>
                        </div>
                    </div>
                    {!isAdding && <Button onClick={() => { resetForm(); setIsAdding(true); }}><Plus className="w-4 h-4 mr-2" /> Neues Paket</Button>}
                </header>

                {isAdding && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {/* Standard-Felder */}
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paket-Typ</label>
                                <select value={formData.package_type} onChange={e => setFormData({...formData, package_type: e.target.value, inherits_from: ''})} className="w-full p-2 border rounded-md">
                                    <option value="base">Basis-Paket</option><option value="addon">Add-on</option>
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plan Name</label>
                                <input type="text" value={formData.plan_name} onChange={e => setFormData({...formData, plan_name: e.target.value})} className="w-full p-2 border rounded-md" />
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preis (Monat)</label>
                                <input type="number" step="0.01" value={formData.price_monthly || ''} onChange={e => setFormData({...formData, price_monthly: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="w-full p-2 border rounded-md" />
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preis (Jahr)</label>
                                <input type="number" step="0.01" value={formData.price_yearly || ''} onChange={e => setFormData({...formData, price_yearly: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="w-full p-2 border rounded-md" />
                            </div>

                            {/* Metered Billing Sektion (Nur Basis-Pakete) */}
                            {formData.package_type === 'base' && (
                                <>
                                    <div className="md:col-span-4 mt-4 mb-2">
                                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <Percent className="w-4 h-4 text-primary" /> Nutzungsbasierte Abrechnung (Metered Billing)
                                        </h3>
                                        <p className="text-xs text-slate-500">Diese Felder definieren die automatische Nachberechnung bei Stripe.</p>
                                    </div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inkl. Kunden</label>
                                        <input type="number" value={formData.included_customers || ''} onChange={e => setFormData({...formData, included_customers: e.target.value === '' ? 0 : parseInt(e.target.value)})} className="w-full p-2 border rounded-md" placeholder="z.B. 20" />
                                    </div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zusatzkosten / Kunde (€)</label>
                                        <input type="number" step="0.01" value={formData.additional_cost_per_customer || ''} onChange={e => setFormData({...formData, additional_cost_per_customer: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="w-full p-2 border rounded-md" />
                                    </div>
                                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Top-Up Gebühr (%)</label>
                                        <input type="number" step="0.1" value={formData.top_up_fee_percent || ''} onChange={e => setFormData({...formData, top_up_fee_percent: e.target.value === '' ? 0 : parseFloat(e.target.value)})} className="w-full p-2 border rounded-md" />
                                    </div>
                                </>
                            )}

                            {/* Dynamische Vererbung */}
                            {formData.package_type === 'base' && (
                                <div className="md:col-span-4 bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-4">
                                    <label className="text-sm font-bold text-amber-800">Dieses Paket beinhaltet automatisch alles aus:</label>
                                    <select value={formData.inherits_from} onChange={e => setFormData({...formData, inherits_from: e.target.value})} className="p-2 border border-amber-300 rounded-md bg-white">
                                        <option value="">-- Keinem Paket (Eigenständig) --</option>
                                        {basePackages.filter(p => p.id !== editingId).map(p => (
                                            <option key={p.id} value={p.plan_name}>{p.plan_name}</option>
                                        ))}
                                    </select>
                                    <span className="text-xs text-amber-600">Du musst unten nur noch die *zusätzlichen* Features anklicken!</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Zusätzliche Module</label>
                                <div className="space-y-2">
                                    {PLAN_MODULES.map(mod => {
                                        const isInherited = inheritedData.modules.includes(mod.id);
                                        const isSelected = formData.allowed_modules.includes(mod.id);

                                        return (
                                            <label key={mod.id} className={`flex items-center p-3 border rounded-lg transition-colors ${isInherited ? 'bg-slate-50 border-slate-200 opacity-80 cursor-default' : 'hover:bg-slate-50 cursor-pointer'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isInherited || isSelected} 
                                                    disabled={isInherited}
                                                    onChange={() => toggleModule(mod.id)} 
                                                    className={`w-4 h-4 rounded ${isInherited ? 'text-slate-400' : 'text-primary'}`} 
                                                />
                                                <span className={`ml-3 text-sm font-medium ${isInherited ? 'text-slate-500' : ''}`}>
                                                    {mod.label}
                                                    {isInherited && <span className="ml-2 text-[10px] font-bold text-amber-600 uppercase tracking-tight">(Inklusive)</span>}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Zusätzliche Features</label>
                                <div className="space-y-2">
                                    {PLAN_FEATURES.map(feat => {
                                        const isInherited = inheritedData.features.includes(feat.id);
                                        const isSelected = !!formData.features[feat.id];

                                        return (
                                            <label key={feat.id} className={`flex items-center p-3 border rounded-lg transition-colors ${isInherited ? 'bg-slate-50 border-slate-200 opacity-80 cursor-default' : 'hover:bg-slate-50 cursor-pointer'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isInherited || isSelected} 
                                                    disabled={isInherited}
                                                    onChange={() => toggleFeature(feat.id)} 
                                                    className={`w-4 h-4 rounded ${isInherited ? 'text-slate-400' : 'text-indigo-600'}`} 
                                                />
                                                <span className={`ml-3 text-sm font-medium ${isInherited ? 'text-slate-500' : ''}`}>
                                                    {feat.label}
                                                    {isInherited && <span className="ml-2 text-[10px] font-bold text-amber-600 uppercase tracking-tight">(Inklusive)</span>}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Vorschau der Inklusiv-Leistungen */}
                        {formData.inherits_from && (
                            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Inklusiv-Leistungen (vererbt von {formData.inherits_from}):
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {inheritedData.modules.map(mId => {
                                        const def = PLAN_MODULES.find(m => m.id === mId);
                                        return def ? <span key={mId} className="px-2 py-1 bg-white border border-slate-200 text-[10px] font-medium text-slate-600 rounded-md">{def.label}</span> : null;
                                    })}
                                    {inheritedData.features.map(fId => {
                                        const def = PLAN_FEATURES.find(f => f.id === fId);
                                        return def ? <span key={fId} className="px-2 py-1 bg-white border border-green-100 text-[10px] font-medium text-green-700 rounded-md">{def.label}</span> : null;
                                    })}
                                    {inheritedData.modules.length === 0 && inheritedData.features.length === 0 && (
                                        <span className="text-[10px] text-slate-400 italic">Keine expliziten Module/Features im Basis-Paket definiert.</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Button variant="outline" onClick={resetForm}>Abbrechen</Button>
                            <Button onClick={handleSave}>Speichern</Button>
                        </div>
                    </div>
                )}

                <div className="space-y-12">
                    <div>
                        <h2 className="text-xl font-bold mb-6 border-b pb-2">Basis-Pakete</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {packages.filter(p => p.package_type === 'base' || !p.package_type).map(pkg => <PackageCard key={pkg.id} pkg={pkg} onEdit={() => startEdit(pkg)} />)}
                        </div>
                    </div>
                    {packages.some(p => p.package_type === 'addon') && (
                        <div>
                            <h2 className="text-xl font-bold mb-6 border-b pb-2">Zusatz-Module (Add-ons)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {packages.filter(p => p.package_type === 'addon').map(pkg => <PackageCard key={pkg.id} pkg={pkg} onEdit={() => startEdit(pkg)} />)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
