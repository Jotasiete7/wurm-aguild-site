
import './Hero.css';

interface HeroProps {
    onNavigate: (page: 'home' | 'mural' | 'guild') => void;
}

export default function Hero({ onNavigate }: HeroProps) {
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
            </div>

            <div className="hero-background"></div>
        </div>
    );
}
