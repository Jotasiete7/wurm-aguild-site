
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

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage if available
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('guild_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (username: string, pass: string) => {
        let userObj: User | null = null;

        if (username.toLowerCase() === 'jotasiete' && pass === 'quimica7') {
            userObj = { username: 'jotasiete', role: 'operator' };
        } else if (username.toLowerCase() === 'calvos' && pass === 'calvette') {
            userObj = { username: 'calvos', role: 'operator' };
        }

        if (userObj) {
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
