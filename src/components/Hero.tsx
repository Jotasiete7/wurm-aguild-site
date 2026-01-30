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

                {/* Buttons removed as per request to avoid redundancy with Navbar */}

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
