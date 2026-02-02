
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
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans selection:bg-green-500/30">
            <div className="max-w-md w-full bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Top Bar Decor */}
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600" />

                <div className="p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Autorização de Acesso</h1>
                        <p className="text-zinc-500 text-sm mt-1">A Guilda ID • SSO</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 mb-8">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                O aplicativo <span className="text-white font-semibold">{client?.client_name || 'Wurm Recipes'}</span> solicita permissão para acessar seu perfil e validar sua identidade.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 px-2 text-xs text-zinc-500">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Logado como <span className="text-zinc-300">{user?.email || user?.username}</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleAuthorize}
                            disabled={loading}
                            className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white rounded-xl font-bold transition-all transform active:scale-[0.98] shadow-lg shadow-green-900/20"
                        >
                            {loading ? 'Processando...' : 'Autorizar Acesso'}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-3 text-zinc-500 hover:text-white text-sm font-medium transition-colors"
                        >
                            Cancelar e Voltar
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-black/20 p-4 border-t border-white/5 text-center">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                        Ambiente Seguro & Criptografado
                    </p>
                </div>
            </div>
        </div>
    );
}
