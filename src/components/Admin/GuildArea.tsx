import { useEffect } from 'react'; // Added import
import { Map, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './GuildArea.css';

export default function GuildArea() {
    const { user, signOut } = useAuth(); // Changed logout to signOut
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="dashboard-container container fade-in">
            <header className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h2>Olá, {user.email}</h2>
                        <p>Bem-vindo à central da guilda.</p>
                    </div>
                    <button onClick={() => { signOut(); navigate('/'); }} className="logout-btn">
                        Sair
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
