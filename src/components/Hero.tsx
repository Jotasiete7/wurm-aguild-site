import './Hero.css';


interface HeroProps {
    onNavigate: (page: 'home' | 'mural' | 'guild', tab?: 'services' | 'resources' | 'map') => void;
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
                    Serviços, ferramentas e recursos operacionais.
                </p>

                <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => onNavigate('mural', 'services')}>
                        Ver mural de serviços
                    </button>
                    <button className="btn btn-secondary" onClick={() => onNavigate('guild')}>
                        Área Restrita
                    </button>
                </div>

                <nav className="hero-micro-nav">
                    <span onClick={() => onNavigate('mural', 'services')}>Serviços</span>
                    <span className="separator">·</span>
                    <span onClick={() => onNavigate('mural', 'resources')}>Recursos</span>
                    <span className="separator">·</span>
                    <span onClick={() => onNavigate('mural', 'map')}>Mapa</span>
                </nav>
            </div>



            <div className="hero-background"></div>
        </div >
    );
}
