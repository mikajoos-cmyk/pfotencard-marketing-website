// src/lib/api.ts

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
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

// Zentrale Response-Behandlung für 401 Handling
async function handleResponse(response: Response) {
    if (response.status === 401) {
        localStorage.removeItem('pfotencard_token');
        localStorage.removeItem('pfotencard_subdomain');
        // Custom Event für AuthContext
        window.dispatchEvent(new Event('auth-unauthorized'));
        window.location.href = '/anmelden';
        throw new Error("Sitzung abgelaufen. Bitte neu anmelden.");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Anfrage fehlgeschlagen (${response.status})`);
    }

    // Bei 204 No Content oder leeren Responses
    if (response.status === 204) return null;

    return response.json();
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

    return handleResponse(response);
}

export async function registerTenant(data: {
    schoolName: string;
    subdomain: string;
    adminName: string;
    email: string;
    password: string;
    phone?: string;
    plan?: string;
}) {
    const payload = {
        tenant_data: {
            name: data.schoolName,
            subdomain: data.subdomain.toLowerCase(),
            plan: data.plan || "starter",
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

    return handleResponse(response);
}

export async function checkTenantStatus(subdomain: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/status?subdomain=${subdomain}`);
    return handleResponse(response);
}

export async function subscribeTenant(subdomain: string, plan: string) {
    const response = await fetch(`${API_BASE_URL}/api/tenants/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, plan }),
    });

    return handleResponse(response);
}

export async function fetchAppConfig() {
    const subdomain = localStorage.getItem('pfotencard_subdomain');
    if (!subdomain) throw new Error("No subdomain found");

    const response = await fetch(`${API_BASE_URL}/api/config`, {
        headers: { 'x-tenant-subdomain': subdomain }
    });
    return handleResponse(response);
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

    return handleResponse(response);
}

export async function uploadImage(file: File) {
    const headers = getAuthHeaders();

    // Prüfen ob Token existiert UND gültig aussieht
    if (!headers.Authorization || headers.Authorization === 'Bearer null') {
        // Token löschen um sauberen State zu haben
        localStorage.removeItem('pfotencard_token');
        window.location.href = '/anmelden';
        throw new Error("Nicht authentifiziert. Bitte melden Sie sich an.");
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
            'Authorization': headers.Authorization,
            'x-tenant-subdomain': headers['x-tenant-subdomain'],
            // WICHTIG: Kein Content-Type Header setzen! Der Browser macht das für FormData automatisch (boundary).
        },
        body: formData,
    });

    return handleResponse(response);
}

export async function resendVerificationEmail(email: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    return handleResponse(response);
}

export async function newsletterSubscribe(email: string) {
    const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    return handleResponse(response);
}
