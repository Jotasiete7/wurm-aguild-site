import './Hero.css';
import { MessageCircle, Map, Clock } from 'lucide-react';

interface HeroProps {
    onNavigate: (page: 'home' | 'mural' | 'guild') => void;
}

export function Hero({ onNavigate }: HeroProps) {
    return (
        <div className="hero">
            <div className="hero-content container">
                <div className="hero-badge">Harmony • NFI Access</div>
                <h1 className="hero-title">
                    Construindo o <br />
                    <span className="serif-italic text-sage">Legado</span> no Wurm.
                </h1>
                <p className="hero-subtitle">
                    Artesãos, guerreiros e comerciantes unidos por um propósito.
                    Serviços de qualidade e uma comunidade unida.
                </p>

                <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => onNavigate('mural')}>
                        Acessar Mural
                    </button>
                    <button className="btn btn-secondary" onClick={() => onNavigate('guild')}>
                        Acesso Restrito
                    </button>
                </div>

                <div className="hero-links">
                    <a href="https://discord.gg/6SEr7D4G" target="_blank" rel="noopener noreferrer" className="hero-link glass">
                        <MessageCircle size={18} />
                        <span>Discord da Guilda</span>
                    </a>
                    <a href="https://harmony.yaga.host/#" target="_blank" rel="noopener noreferrer" className="hero-link glass">
                        <Map size={18} />
                        <span>Mapa de Harmony</span>
                    </a>
                    <a href="https://www.wurmnode.com" target="_blank" rel="noopener noreferrer" className="hero-link glass">
                        <Clock size={18} />
                        <span>WurmNode</span>
                    </a>
                </div>
            </div>

            <div className="hero-background"></div>
        </div>
    );
}
