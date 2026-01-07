
import { useState } from 'react';
import { LayoutGrid, Download, Map as MapIcon } from 'lucide-react';
import ServicesBoard from './ServicesBoard';
import Downloads from './Downloads';
import GuildMap from './GuildMap';
import SystemStatus from './SystemStatus';
import { useAuth } from '../../context/AuthContext';
import './Mural.css';

export default function Mural() {
    const { user } = useAuth();
    // Default to 'services'
    const [activeTab, setActiveTab] = useState<'services' | 'downloads' | 'map'>('services');

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

            <div className="mural-tabs">
                <button
                    className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveTab('services')}
                >
                    <LayoutGrid size={18} /> Log Operacional
                </button>
                <button
                    className={`tab-btn ${activeTab === 'downloads' ? 'active' : ''}`}
                    onClick={() => setActiveTab('downloads')}
                >
                    <Download size={18} /> Downloads
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

            <div className="mural-content">
                {activeTab === 'services' && <ServicesBoard />}
                {activeTab === 'downloads' && <Downloads />}
                {activeTab === 'map' && showMap && <GuildMap />}
            </div>
        </div>
    );
}
