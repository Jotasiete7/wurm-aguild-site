
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { SSOClient } from '../types/sso';

export default function SSOAuthorize() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    // const responseType = searchParams.get('response_type'); // Assume 'code'
    // const state = searchParams.get('state');

    const [client, setClient] = useState<SSOClient | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        // 1. Check Auth
        if (!user) {
            // Redirect to Login with return to here
            const currentPath = location.pathname + location.search;
            navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
            return;
        }

        // 2. Fetch Client Info
        if (!clientId) {
            setError('Missing client_id');
            setLoading(false);
            return;
        }

        const fetchClient = async () => {
            const { data, error } = await supabase
                .from('sso_clients')
                .select('*')
                .eq('client_id', clientId)
                .single();

            if (error || !data) {
                console.error('Error fetching client:', error);
                setError('Invalid Client ID');
            } else {
                setClient(data);
                // Verify Redirect URI locally too for UX (backend doubles checks)
                if (redirectUri && !data.redirect_uris.includes(redirectUri)) {
                    // Check if it starts with allowed URI (optional, sticking to strict for now)
                    setError('Invalid Redirect URI');
                }
            }
            setLoading(false);
        };

        fetchClient();

    }, [user, authLoading, clientId, redirectUri, navigate, location]);

    const handleAuthorize = async () => {
        if (!user || !client) return;
        setLoading(true);

        try {
            // Get current session tokens
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No active session');

            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('sso-authorize', {
                body: {
                    client_id: clientId,
                    user_id: user.id,
                    redirect_uri: redirectUri,
                    access_token: session.access_token,
                    refresh_token: session.refresh_token
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            if (data?.code && redirectUri) {
                // Redirect back to satellite
                // Append code to redirectUri
                const separator = redirectUri.includes('?') ? '&' : '?';
                window.location.href = `${redirectUri}${separator}code=${data.code}`;
            } else {
                throw new Error('No code returned');
            }

        } catch (err: any) {
            console.error('Authorization error:', err);
            setError(err.message || 'Failed to authorize');
            setLoading(false);
        }
    };

    if (authLoading || (loading && !error)) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white p-4">
                <div className="max-w-md w-full bg-zinc-900 p-8 rounded-lg border border-red-900">
                    <h1 className="text-xl text-red-500 mb-4">Authorization Error</h1>
                    <p className="text-gray-300">{error}</p>
                    <button onClick={() => navigate('/')} className="mt-6 px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-black text-white p-4">
            <style>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
            <div className="max-w-md w-full glass-panel p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">A Guilda ID</h2>
                    <div className="w-16 h-1 bg-green-500 mx-auto rounded"></div>
                </div>

                <div className="mb-8">
                    <p className="text-gray-300 text-center mb-4">
                        The application <strong className="text-white">{client?.client_name}</strong> wants to access your account information.
                    </p>
                    <div className="bg-zinc-900/50 p-4 rounded text-sm text-gray-400">
                        <p>• View your Profile (Username, Role)</p>
                        <p>• Verify your Guild Membership</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleAuthorize}
                        disabled={loading}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Authorizing...' : 'Authorize'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-transparent hover:bg-white/10 text-gray-400 hover:text-white rounded font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                <div className="mt-6 text-center text-xs text-gray-600">
                    Logged in as <span className="text-gray-500">{user?.username}</span>
                </div>
            </div>
        </div>
    );
}
