/**
 * AUTH CONTEXT
 * This is the heart of the application's security.
 * It manages the logged-in user's state, their authentication token,
 * and provides functions for login, registration, and logout.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

export interface AuthUser {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: 'customer' | 'owner';
    is_subscribed: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        password: string;
    }) => Promise<void>;
    googleLogin: (credential: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * SESSION RESTORATION
     * When the user refreshes the page, we check if they were already logged in
     * by looking at the browser's localStorage.
     */
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        let res: Response;
        try {
            res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
        } catch {
            throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
        }

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Erreur de connexion');
        }

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Keep legacy key for any remaining checks
        localStorage.setItem('isAuthenticated', 'true');
    }, []);

    const register = useCallback(
        async (data: {
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            password: string;
        }) => {
            let res: Response;
            try {
                res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
            } catch {
                throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
            }

            const json = await res.json();
            if (!res.ok) {
                throw new Error(
                    json.errors?.[0]?.msg || json.message || "Erreur lors de l'inscription"
                );
            }

            setUser(json.user);
            setToken(json.token);
            localStorage.setItem('token', json.token);
            localStorage.setItem('user', JSON.stringify(json.user));
            localStorage.setItem('isAuthenticated', 'true');
        },
        []
    );

    const googleLogin = useCallback(async (credential: string) => {
        let res: Response;
        try {
            res = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential }),
            });
        } catch {
            throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
        }

        const json = await res.json();
        if (!res.ok) {
            throw new Error(
                json.errors?.[0]?.msg || json.message || "Erreur lors de la connexion Google"
            );
        }

        setUser(json.user);
        setToken(json.token);
        localStorage.setItem('token', json.token);
        localStorage.setItem('user', JSON.stringify(json.user));
        localStorage.setItem('isAuthenticated', 'true');
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isLoading,
                login,
                register,
                googleLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
