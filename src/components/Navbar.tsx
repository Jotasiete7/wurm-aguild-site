
import { Hammer, Shield } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
    currentPage: 'home' | 'mural' | 'guild';
    onNavigate: (page: 'home' | 'mural' | 'guild') => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
    return (
        <nav className="navbar glass">
            <div className="container navbar-content">
                <div className="logo" onClick={() => onNavigate('home')}>
                    <span className="logo-icon">*</span> A Guilda
                </div>

                <div className="nav-links">
                    <button
                        className={`nav-item ${currentPage === 'mural' ? 'active' : ''}`}
                        onClick={() => onNavigate('mural')}
                    >
                        <Hammer size={18} />
                        <span>Mural</span>
                    </button>

                    <button
                        className={`nav-item ${currentPage === 'guild' ? 'active' : ''}`}
                        onClick={() => onNavigate('guild')}
                    >
                        <Shield size={18} />
                        <span>Membros</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
