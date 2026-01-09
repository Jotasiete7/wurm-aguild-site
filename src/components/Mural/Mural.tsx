
import { useState } from 'react';
import { LayoutGrid, Archive, Map as MapIcon } from 'lucide-react';
import ServicesBoard from './ServicesBoard';
import ResourcesBoard from './ResourcesBoard';
import GuildMap from './GuildMap';
import SystemStatus from './SystemStatus';
import { useAuth } from '../../context/AuthContext';
import './Mural.css';


interface MuralProps {
    initialTab?: 'services' | 'resources' | 'map';
}

const tabSubtitles = {
    services: "Ofertas e demandas operacionais",
    resources: "Ferramentas e links úteis",
    map: "Pontos de interesse marcados"
} as const;

export default function Mural({ initialTab }: MuralProps) {
    const { user } = useAuth();
    // Default to 'services' or provided initialTab
    const [activeTab, setActiveTab] = useState<'services' | 'resources' | 'map'>(initialTab || 'services');

    // Only Operators and Cartographers can see the Map tab
    const showMap = user?.role === 'operator' || user?.role === 'cartographer';

    return (
        <div className="mural-page container fade-in">
            <header className="mural-header">
                <h2>Mural da Comunidade</h2>
                <p>Infraestrutura e coordenação de serviços.</p>
            </header>

            {/* System Status Banner - Always visible at top of content area */}
            <SystemStatus />

            <div className="mural-tabs-container">
                <div className="mural-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                        onClick={() => setActiveTab('services')}
                    >
                        <LayoutGrid size={18} /> Log Operacional
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resources')}
                    >
                        <Archive size={18} /> Recursos
                    </button>

                    {showMap && (
                        <button
                            className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                            onClick={() => setActiveTab('map')}
                        >
                            <MapIcon size={18} /> Mapa Especial
                        </button>
                    )}
                </div>
                <div className="mural-tab-subtitle fade-in" key={activeTab}>
                    {tabSubtitles[activeTab]}
                </div>
            </div>

            <div className="mural-content">
                {activeTab === 'services' && <ServicesBoard />}
                {activeTab === 'resources' && <ResourcesBoard />}
                {activeTab === 'map' && showMap && <GuildMap />}
            </div>
        </div>
    );
}
