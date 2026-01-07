
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

// Map of allowed users with their passwords and roles
const ALLOWED_USERS: Record<string, { password: string; role: UserRole }> = {
    'jotasiete': { password: 'quimica7', role: 'operator' },
    'calvos': { password: 'calvette', role: 'operator' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage if available
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('guild_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (username: string, pass: string) => {
        // Check if user exists and password matches
        const normalizedUsername = username.toLowerCase();
        const userConfig = ALLOWED_USERS[normalizedUsername];

        if (userConfig && userConfig.password === pass) {
            const userObj = { username: normalizedUsername, role: userConfig.role };
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
