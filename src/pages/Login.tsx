import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { user } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage("Conta criada! Verifique seu email.");
        }
        setLoading(false);
    }

    if (user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-6 animate-in fade-in">
                <div className="bg-[#1a1a1a] p-8 rounded-lg border border-[#333] text-center max-w-md w-full shadow-2xl">
                    <h2 className="text-2xl mb-4 text-[#d4b483] font-serif font-bold">Bem-vindo, {user.email}</h2>
                    <p className="text-gray-400 mb-6 font-mono text-sm">Identidade confirmada no Ecossistema.</p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-4 py-2 bg-[#d4b483] text-black font-bold hover:bg-[#c3a06e] rounded transition-colors text-sm font-mono uppercase tracking-widest"
                        >
                            Voltar ao Portal
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-white p-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-full max-w-md p-8 bg-[#1a1a1a]/80 backdrop-blur-sm rounded-xl shadow-2xl border border-[#333]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#d4b483]/10 mb-4">
                        <Shield className="w-6 h-6 text-[#d4b483]" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-[#d4b483] tracking-tight">Membros da Guilda</h2>
                    <p className="text-gray-500 text-sm mt-2 font-mono">Acesso restrito ao painel de controle</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-3 rounded mb-6 text-xs font-mono">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-900/20 border border-green-900/50 text-green-200 p-3 rounded mb-6 text-xs font-mono">
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-black/50 border border-[#333] rounded-lg focus:ring-1 focus:ring-[#d4b483] focus:border-[#d4b483] outline-none text-white transition-all placeholder-gray-700 font-mono text-sm"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 font-mono">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-black/50 border border-[#333] rounded-lg focus:ring-1 focus:ring-[#d4b483] focus:border-[#d4b483] outline-none text-white transition-all placeholder-gray-700 font-mono text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#d4b483] hover:bg-[#c3a06e] text-black font-bold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-wider"
                        >
                            {loading ? 'Acessando...' : 'Entrar no Sistema'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="w-full bg-transparent hover:bg-white/5 text-gray-400 font-medium py-2 px-4 rounded-lg transition-all text-xs font-mono"
                        >
                            Criar Nova Credencial
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
