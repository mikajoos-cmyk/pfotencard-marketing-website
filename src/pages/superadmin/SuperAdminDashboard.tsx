import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Users, 
    Home, 
    CreditCard, 
    TrendingUp, 
    LogOut, 
    ExternalLink, 
    CheckCircle2, 
    XCircle,
    Calendar,
    Search,
    Package,
    Ticket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        const storedUser = localStorage.getItem('pfotencard_superadmin_user');
        
        if (!token) {
            navigate('/admin');
            return;
        }

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchData = async () => {
            try {
                const [statsRes, tenantsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/superadmin/stats`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE_URL}/api/superadmin/tenants`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (statsRes.status === 401 || tenantsRes.status === 401) {
                    handleLogout();
                    return;
                }

                const statsData = await statsRes.json();
                const tenantsData = await tenantsRes.json();
                
                setStats(statsData);
                setTenants(tenantsData);
            } catch (err) {
                console.error("Fehler beim Laden der Admin-Daten:", err);
                toast({
                    variant: "destructive",
                    title: "Ladefehler",
                    description: "Daten konnten nicht vom Server geladen werden.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate, toast]);

    const handleLogout = () => {
        localStorage.removeItem('pfotencard_superadmin_token');
        localStorage.removeItem('pfotencard_superadmin_user');
        navigate('/admin');
    };

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
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-sans font-bold text-slate-900">Super-Admin Dashboard</h1>
                        <p className="text-slate-500 font-body">Willkommen zurück, {user?.name || 'Administrator'}</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Abmelden
                    </Button>
                </header>

                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        <StatCard 
                            title="Gesamtumsatz" 
                            value={stats.total_revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} 
                            icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
                            trend="+4.2%"
                        />
                        <StatCard 
                            title="Hundeschulen" 
                            value={stats.total_tenants} 
                            icon={<Home className="w-6 h-6 text-blue-600" />}
                        />
                        <StatCard 
                            title="Aktive Abos" 
                            value={stats.active_tenants} 
                            icon={<CreditCard className="w-6 h-6 text-amber-600" />}
                        />
                        <StatCard 
                            title="Nutzer gesamt" 
                            value={stats.total_users} 
                            icon={<Users className="w-6 h-6 text-purple-600" />}
                        />
                        <Link to="/admin/packages">
                            <StatCard 
                                title="Pakete verwalten" 
                                value="Preise & Limits" 
                                icon={<Package className="w-6 h-6 text-indigo-600" />}
                            />
                        </Link>
                        <Link to="/admin/promo-codes">
                            <StatCard 
                                title="Gutscheincodes" 
                                value={`${stats.total_promo_codes || 0} Codes`} 
                                icon={<Ticket className="w-6 h-6 text-emerald-600" />}
                            />
                        </Link>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900">Hundeschulen (Tenants)</h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Suchen..." 
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subdomain</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paket</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Erstellt am</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tenants.map(tenant => (
                                    <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900">{tenant.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            <a 
                                                href={`https://${tenant.subdomain}.pfotencard.de`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="hover:text-primary flex items-center gap-1"
                                            >
                                                {tenant.subdomain}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                tenant.plan === 'premium' ? 'bg-purple-100 text-purple-800' :
                                                tenant.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                {(tenant.plan || 'kein paket').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {tenant.is_active ? (
                                                <div className="flex items-center text-emerald-600 text-sm font-medium">
                                                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                    Aktiv
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-rose-600 text-sm font-medium">
                                                    <XCircle className="w-4 h-4 mr-1.5" />
                                                    Gesperrt
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                                                {new Date(tenant.created_at).toLocaleDateString('de-DE')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-slate-400 hover:text-primary"
                                                onClick={() => navigate(`/admin/tenants/${tenant.id}/users`)}
                                            >
                                                Verwalten
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend?: string }) {
    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-slate-50">
                    {icon}
                </div>
                {trend && (
                    <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1">{title}</div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
        </motion.div>
    );
}
