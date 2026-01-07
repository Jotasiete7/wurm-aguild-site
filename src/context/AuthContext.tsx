
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserRole } from '../types';

interface User {
    username: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map of allowed users and their roles
const ALLOWED_USERS: Record<string, UserRole> = {
    'jotasiete': 'operator',
    'calvos': 'operator',
};

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage if available
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('guild_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (username: string, pass: string) => {
        // Validate shared guild password via environment variable (with fallback for production)
        const GUILD_PASSWORD = import.meta.env.VITE_GUILD_PASSWORD || 'quimica7';

        if (pass !== GUILD_PASSWORD) {
            return false;
        }

        // Check if user is in allowed list
        const normalizedUsername = username.toLowerCase();
        const role = ALLOWED_USERS[normalizedUsername];

        if (role) {
            const userObj = { username: normalizedUsername, role };
            setUser(userObj);
            localStorage.setItem('guild_user', JSON.stringify(userObj));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('guild_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
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
