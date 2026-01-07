
import React, { useState } from 'react';
import { Lock, Map, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './GuildArea.css';

export default function GuildArea() {
    const { user, login, logout } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(username, password)) {
            setError('');
        } else {
            setError('Credenciais inválidas.');
        }
    };

    if (!user) {
        return (
            <div className="login-container container fade-in">
                <div className="login-card glass">
                    <div className="lock-icon">
                        <Lock size={32} />
                    </div>
                    <h2>Área Restrita</h2>
                    <p>Faça login para acessar.</p>

                    <form onSubmit={handleLogin} className="login-form">
                        <input
                            type="text"
                            placeholder="Usuário"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="password-input"
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="password-input"
                        />
                        {error && <span className="error-msg">{error}</span>}
                        <button type="submit" className="login-btn">Entrar</button>
                    </form>
                </div>
            </div>
        );
    }

    const roleLabel = user.role === 'operator' ? 'adm' : user.role;

    return (
        <div className="dashboard-container container fade-in">
            <header className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h2>Olá, {user.username}</h2>
                        <p>Bem-vindo à central da guilda.</p>
                    </div>
                    <button onClick={logout} className="logout-btn">
                        Sair ({roleLabel} {user.username})
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="dash-card glass">
                    <Map className="dash-icon" size={32} />
                    <h3>Mapas Especiais</h3>
                    <p>Localizações de argila, minas raras e rotas comerciais seguras.</p>
                    <button className="dash-btn">Acessar Mapas</button>
                </div>

                <div className="dash-card glass">
                    <Lightbulb className="dash-icon" size={32} />
                    <h3>Dicas & Tutoriais</h3>
                    <p>Guia de skill grind, macros permitidos e dicas de construção.</p>
                    <button className="dash-btn">Ver Dicas</button>
                </div>
            </div>
        </div>
    );
}
