
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { SSOClient } from '../types/sso';

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

            // Call Edge Function with auth header
            const { data, error } = await supabase.functions.invoke('sso-authorize', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                },
                body: {
                    client_id: clientId,
                    user_id: user.id,
                    redirect_uri: redirectUri
                    // Tokens removed from body for security - extracted from header by Edge Function
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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white p-4">
            <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-zinc-800">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/20 rounded-full mb-4">
                        <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Autorização Necessária</h2>
                    <p className="text-sm text-zinc-400">A Guilda ID</p>
                </div>

                {/* App Info */}
                <div className="mb-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                    <p className="text-sm text-zinc-300 mb-3">
                        <strong className="text-white">{client?.client_name}</strong> deseja acessar suas informações:
                    </p>
                    <ul className="space-y-2 text-sm text-zinc-400">
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Ver seu perfil (Nome, Cargo)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Verificar sua participação na Guilda</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleAuthorize}
                        disabled={loading}
                        className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20 hover:shadow-green-500/30"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Autorizando...
                            </span>
                        ) : (
                            'Autorizar Acesso'
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        disabled={loading}
                        className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg font-medium transition-all duration-200 border border-zinc-700 hover:border-zinc-600"
                    >
                        Cancelar
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500">
                        Logado como <span className="text-zinc-400 font-medium">{user?.username}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
