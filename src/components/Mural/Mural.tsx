
import { useState } from 'react';
import { LayoutGrid, Archive, Map as MapIcon } from 'lucide-react';
import ServicesBoard from './ServicesBoard';
import ResourcesBoard from './ResourcesBoard';
import GuildMap from './GuildMap';
import SystemStatus from './SystemStatus';
import { useAuth } from '../../context/AuthContext';
import './Mural.css';

export default function Mural() {
    const { user } = useAuth();
    // Default to 'services'
    const [activeTab, setActiveTab] = useState<'services' | 'resources' | 'map'>('services');

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

            <div className="mural-content">
                {activeTab === 'services' && <ServicesBoard />}
                {activeTab === 'resources' && <ResourcesBoard />}
                {activeTab === 'map' && showMap && <GuildMap />}
            </div>
        </div>
    );
}
