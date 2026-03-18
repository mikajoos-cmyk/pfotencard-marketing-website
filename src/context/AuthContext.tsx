import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAppConfig } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    subdomain: string | null;
    hotelProfile: any | null;
    login: (token: string, subdomain: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [hotelProfile, setHotelProfile] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Beim Start: Prüfen ob Token im LocalStorage ist
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('pfotencard_token');
            const storedSubdomain = localStorage.getItem('pfotencard_subdomain');

            if (storedToken && storedSubdomain) {
                setToken(storedToken);
                setSubdomain(storedSubdomain);
                setIsAuthenticated(true);
                
                try {
                    const config = await fetchAppConfig();
                    if (config && config.tenant) {
                        setHotelProfile(config.tenant);
                    }
                } catch (err) {
                    console.error("Fehler beim Laden des Hotelprofils:", err);
                    // Falls Token ungültig ist, wird handleUnauthorized das regeln
                }
            }
            setIsLoading(false);
        };

        initializeAuth();

        // Auf unbefugte API-Antworten reagieren
        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener('auth-unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
    }, []);

    const login = async (newToken: string, newSubdomain: string) => {
        localStorage.setItem('pfotencard_token', newToken);
        localStorage.setItem('pfotencard_subdomain', newSubdomain);
        setToken(newToken);
        setSubdomain(newSubdomain);
        setIsAuthenticated(true);
        
        try {
            const config = await fetchAppConfig();
            if (config && config.tenant) {
                setHotelProfile(config.tenant);
            }
        } catch (err) {
            console.error("Fehler beim Laden des Hotelprofils nach Login:", err);
        }
    };

    const logout = () => {
        localStorage.removeItem('pfotencard_token');
        localStorage.removeItem('pfotencard_subdomain');
        setToken(null);
        setSubdomain(null);
        setHotelProfile(null);
        setIsAuthenticated(false);
        // Optional: Redirect zur Startseite
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, subdomain, hotelProfile, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}