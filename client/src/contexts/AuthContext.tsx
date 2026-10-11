import React, { createContext, useContext, useState } from 'react';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read the stored session lazily during state initialization (not in an effect)
// so no synchronous setState-in-effect is needed.
const readStoredUser = (): User | null => {
    try {
        const storedUser = localStorage.getItem('admin_user');
        return storedUser ? (JSON.parse(storedUser) as User) : null;
    } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('admin_user');
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(readStoredUser);
    const [isLoading] = useState(false);

    const login = async (email: string, password: string) => {
        // Use relative path to allow Nginx proxying
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Login failed' }));
            throw new Error(error.error || 'Login failed');
        }

        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('admin_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('admin_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
