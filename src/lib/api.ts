// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders() {
    const token = localStorage.getItem('pfotencard_token');
    const subdomain = localStorage.getItem('pfotencard_subdomain');

    if (!token) {
        console.error("FEHLER: Kein Auth-Token im LocalStorage gefunden! User ist nicht eingeloggt.");
    }

    return {
        'Authorization': `Bearer ${token}`,
        'x-tenant-subdomain': subdomain || '',
        'Content-Type': 'application/json',
    };
}

export async function loginUser(subdomain: string, email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
            'x-tenant-subdomain': subdomain.toLowerCase(),
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Anmeldung fehlgeschlagen');
    }

    return response.json();
}

export async function registerTenant(data: {
    schoolName: string;
    subdomain: string;
    adminName: string;
    email: string;
    password: string;
    phone?: string;
}) {
    const payload = {
        tenant_data: {
            name: data.schoolName,
            subdomain: data.subdomain.toLowerCase(),
            plan: "starter",
            config: {
                branding: { primary_color: "#22C55E", secondary_color: "#3B82F6" },
                wording: { level: "Level", vip: "VIP" }
            }
        },
        admin_data: {
            name: data.adminName,
            email: data.email,
            password: data.password,
            role: "admin",
            phone: data.phone,
            dogs: []
        }
    };

    const response = await fetch(`${API_BASE_URL}/api/tenants/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registrierung fehlgeschlagen');
    }

    return response.json();
}

export async function checkTenantStatus(subdomain: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/status?subdomain=${subdomain}`);
    if (!response.ok) throw new Error('Status-Check fehlgeschlagen');
    return response.json();
}

export async function subscribeTenant(subdomain: string, plan: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, plan }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Buchung fehlgeschlagen');
    }

    return response.json();
}

export async function fetchAppConfig() {
    const subdomain = localStorage.getItem('pfotencard_subdomain');
    if (!subdomain) throw new Error("No subdomain found");

    const response = await fetch(`${API_BASE_URL}/api/config`, {
        headers: { 'x-tenant-subdomain': subdomain }
    });
    if (!response.ok) throw new Error("Failed to load config");
    return response.json();
}

export async function saveSettings(data: any) {
    const headers = getAuthHeaders();

    // Sicherheits-Check: Abbrechen, wenn kein Token da ist
    if (!headers.Authorization || headers.Authorization === 'Bearer null') {
        throw new Error("Nicht authentifiziert. Bitte neu einloggen.");
    }

    const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data),
    });

    if (response.status === 401) {
        // Optional: Automatisch ausloggen
        localStorage.removeItem('pfotencard_token');
        window.location.href = '/anmelden';
        throw new Error("Sitzung abgelaufen. Bitte neu anmelden.");
    }

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to save settings");
    }
    return response.json();
}

export async function uploadImage(file: File) {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("Not authenticated");

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
            'Authorization': headers.Authorization,
            'x-tenant-subdomain': headers['x-tenant-subdomain'],
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Image upload failed');
    }

    return response.json();
}