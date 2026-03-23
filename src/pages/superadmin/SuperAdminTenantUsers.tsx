import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Users, 
    ArrowLeft,
    Search,
    UserX,
    UserCheck,
    Mail,
    Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminTenantUsers() {
    const { tenantId } = useParams();
    const [users, setUsers] = useState<any[]>([]);
    const [tenant, setTenant] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        if (!token) {
            navigate('/admin');
            return;
        }

        const fetchData = async () => {
            try {
                // Tenant Infos laden (aus der Liste der Tenants finden)
                const tenantsRes = await fetch(`${API_BASE_URL}/api/superadmin/tenants`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const tenants = await tenantsRes.json();
                const currentTenant = tenants.find((t: any) => t.id === parseInt(tenantId || '0'));
                setTenant(currentTenant);

                // User für diesen Tenant laden
                const usersRes = await fetch(`${API_BASE_URL}/api/superadmin/users?tenant_id=${tenantId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (usersRes.status === 401) {
                    navigate('/admin');
                    return;
                }

                const usersData = await usersRes.json();
                setUsers(usersData);
            } catch (err) {
                console.error("Fehler beim Laden der Nutzer:", err);
                toast({
                    variant: "destructive",
                    title: "Ladefehler",
                    description: "Nutzer konnten nicht geladen werden.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [tenantId, navigate, toast]);

    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        const token = localStorage.getItem('pfotencard_superadmin_token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/superadmin/users/${userId}/ban?active=${!currentStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
                toast({
                    title: currentStatus ? "Nutzer gesperrt" : "Nutzer freigeschaltet",
                    description: `Der Nutzer wurde erfolgreich ${currentStatus ? 'gesperrt' : 'freigeschaltet'}.`,
                });
            }
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Fehler",
                description: "Status konnte nicht geändert werden.",
            });
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/dashboard" className="p-2 hover:bg-white rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-sans font-bold text-slate-900">
                                Nutzer von {tenant?.name || 'Hundeschule'}
                            </h1>
                            <p className="text-slate-500 font-body">
                                Verwalte alle registrierten Kunden und Mitarbeiter dieser Hundeschule.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            {filteredUsers.length} Nutzer
                        </h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Nutzer suchen..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">E-Mail</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rolle</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kunde seit</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-slate-600">
                                                <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                                                user.role === 'mitarbeiter' ? 'bg-blue-100 text-blue-800' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                {(user.role || 'gast').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center text-emerald-600 text-xs font-medium">
                                                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                                                    Aktiv
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-rose-600 text-xs font-medium">
                                                    <UserX className="w-3.5 h-3.5 mr-1" />
                                                    Gesperrt
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                {new Date(user.customer_since).toLocaleDateString('de-DE')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                                className={user.is_active ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                                            >
                                                {user.is_active ? 'Sperren' : 'Entsperren'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="py-12 text-center text-slate-500">
                                Keine Nutzer gefunden.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
