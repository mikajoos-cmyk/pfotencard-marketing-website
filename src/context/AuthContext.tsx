import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  subdomain: string | null;
  login: (token: string, subdomain: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Beim Start: Prüfen ob Token im LocalStorage ist
    const storedToken = localStorage.getItem('pfotencard_token');
    const storedSubdomain = localStorage.getItem('pfotencard_subdomain');

    if (storedToken && storedSubdomain) {
      setToken(storedToken);
      setSubdomain(storedSubdomain);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newSubdomain: string) => {
    localStorage.setItem('pfotencard_token', newToken);
    localStorage.setItem('pfotencard_subdomain', newSubdomain);
    setToken(newToken);
    setSubdomain(newSubdomain);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('pfotencard_token');
    localStorage.removeItem('pfotencard_subdomain');
    setToken(null);
    setSubdomain(null);
    setIsAuthenticated(false);
    // Optional: Redirect zur Startseite
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, subdomain, login, logout, isLoading }}>
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