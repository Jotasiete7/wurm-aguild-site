import { Shield, Home } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EcosystemDropdown from './EcosystemDropdown';
import './Navbar.css';

export default function Navbar() {
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
                        <Home size={18} />
                        <span>Mural</span>
                    </Link>

                    <Link to={user ? "/guild" : "/login"} className={`nav-item ${isActive('/login') || isActive('/guild') ? 'active' : ''}`}>
                        <Shield size={18} />
                        <span>{user ? 'Área VIP' : 'Membros'}</span>
                    </Link>

                    <EcosystemDropdown />
                </div>
            </div>
        </nav>
    );
}

