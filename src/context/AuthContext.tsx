import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

// Compatible User interface for the app
export interface AppUser {
    id: string;
    email?: string;
    username: string;
    role: string;
}

interface AuthContextType {
    session: Session | null;
    user: AppUser | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (authUser: SupabaseUser) => {
        try {
            // Default fallback if no profile exists
            let newItem: AppUser = {
                id: authUser.id,
                email: authUser.email,
                username: authUser.email?.split('@')[0] || 'Anon',
                role: 'member'
            };

            // Try to fetch profile from DB
            const { data } = await supabase
                .from('profiles')
                .select('role, username') // Assuming username might be in profiles too
                .eq('id', authUser.id)
                .single();

            if (data) {
                newItem.role = data.role || 'member';
                if (data.username) newItem.username = data.username;

                if (newItem.role === 'admin' || newItem.role === 'operator') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            }

            setUser(newItem);

        } catch (e) {
            console.error('Error fetching user profile:', e);
            // Fallback to basic info even on error
            setUser({
                id: authUser.id,
                email: authUser.email,
                username: authUser.email?.split('@')[0] || 'Anon',
                role: 'member'
            });
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
    };

    const value = {
        session,
        user,
        loading,
        isAdmin,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
