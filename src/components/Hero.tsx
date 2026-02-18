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
                    Construindo um <br />
                    <span className="serif-italic text-sage">Ecossistema</span> no Wurm.
                </h1>
                <p className="hero-subtitle">
                    Organização, dados e infraestrutura para uma economia real.
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
