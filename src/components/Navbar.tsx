import { useState } from 'react';
import { Hammer, Shield, Network, Home, Pickaxe, BookOpen } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar glass">
            <div className="container navbar-content">
                <div className="logo" onClick={() => navigate('/')}>
                    <span className="logo-icon">*</span> A Guilda
                </div>

                <div className="nav-links">
                    <Link to="/mural" className={`nav-item ${isActive('/mural')}`}>
                        <Hammer size={18} />
                        <span>Mural</span>
                    </Link>

                    <Link to={user ? "/guild" : "/login"} className={`nav-item ${isActive('/login') || isActive('/guild') ? 'active' : ''}`}>
                        <Shield size={18} />
                        <span>{user ? 'Área VIP' : 'Membros'}</span>
                    </Link>

                    <div className="relative-container">
                        <button
                            className={`nav-item ${isMenuOpen ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title="Ecossistema A Guilda"
                        >
                            <Network size={18} />
                        </button>

                        {isMenuOpen && (
                            <div className="dropdown-menu animate-in">
                                <div className="dropdown-header">ECOSSISTEMA</div>
                                <a href="https://wurm-recipe-tool.pages.dev" className="dropdown-item">
                                    <BookOpen size={14} /> Receitas
                                </a>
                                <a href="https://wurm-mining-tool.pages.dev" className="dropdown-item">
                                    <Pickaxe size={14} /> Mineração
                                </a>
                                <div className="dropdown-item active">
                                    <Home size={14} /> Portal (Você está aqui)
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="dropdown-backdrop" onClick={() => setIsMenuOpen(false)}></div>
            )}
        </nav>
    );
}
