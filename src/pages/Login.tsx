import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import './Login.css';

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
            <div className="login-page">
                <div className="login-container">
                    <div className="login-card" style={{ textAlign: 'center' }}>
                        <div className="login-icon">
                            <Shield size={32} />
                        </div>
                        <h2 className="login-title">Bem-vindo, {user.username}</h2>
                        <p className="login-subtitle">Identidade confirmada no Ecossistema.</p>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="btn-primary"
                            style={{ marginTop: '2rem' }}
                        >
                            Acessar Portal
                        </button>
                        <button
                            onClick={() => window.location.href = '/guild'}
                            className="btn-secondary"
                        >
                            Ir para Área VIP
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-icon">
                            <Shield size={32} />
                        </div>
                        <h2 className="login-title">Membros</h2>
                        <p className="login-subtitle">Acesso restrito ao painel</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="alert alert-success">
                            <CheckCircle size={16} />
                            <span>{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Acessando...' : 'Entrar no Sistema'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="btn-secondary"
                        >
                            Criar Nova Credencial
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
