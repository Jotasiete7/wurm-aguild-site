
import { useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase'; // CHANGED
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import type { MapPin } from '../../types';

export default function GuildMap() {
    const { user } = useAuth();
    // CHANGED: Using Supabase
    const { data: pins, create, remove } = useSupabase<MapPin>('map_pins');

    const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [clickCoords, setClickCoords] = useState<{ x: number, y: number } | null>(null);
    const [newPin, setNewPin] = useState<Partial<MapPin>>({ type: 'resource' });

    // Permissions: Operator (All), Cartographer (Create + Edit Own)
    const canEdit = (pin: MapPin) => user?.role === 'operator' || (user?.role === 'cartographer' && pin.author === user.username);
    const canCreate = user?.role === 'operator' || user?.role === 'cartographer';

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canCreate) return;
        // If clicking a pin, stop propagation is handled in pin click
        // Calculate % coordinates
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setClickCoords({ x, y });
        setNewPin({ type: 'resource', author: user?.username });
        setIsAdding(true);
        setSelectedPin(null);
    };

    const handlePinClick = (e: React.MouseEvent, pin: MapPin) => {
        e.stopPropagation();
        setSelectedPin(pin);
        setIsAdding(false);
    };

    const savePin = async () => {
        if (!clickCoords || !newPin.title) return;

        const pin: any = {
            x: clickCoords.x,
            y: clickCoords.y,
            type: newPin.type,
            title: newPin.title,
            note: newPin.note || '',
            author: user?.username || 'Anon',
            timestamp: Date.now() // Optional, DB has created_at
        };

        await create(pin);

        setIsAdding(false);
        setClickCoords(null);
    };

    const deletePin = async (id: string) => {
        if (confirm('Remover este pin?')) {
            await remove(id);
            setSelectedPin(null);
        }
    };

    return (
        <div className="guild-map-container fade-in">
            <div className="map-toolbar">
                <h3>Mapa Especial (Harmony)</h3>
                <div className="map-legend">
                    <span className="legend-item"><span className="dot resource"></span> Recurso</span>
                    <span className="legend-item"><span className="dot infra"></span> Infra</span>
                    <span className="legend-item"><span className="dot project"></span> Projeto</span>
                    <span className="legend-item"><span className="dot warning"></span> Aviso</span>
                </div>
            </div>

            <div className="map-viewport glass" onClick={handleMapClick}>
                {/* Placeholder Map Background */}
                <div className="map-placeholder-grid"></div>

                {pins.map(pin => (
                    <div
                        key={pin.id}
                        className={`map-pin ${pin.type}`}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        onClick={(e) => handlePinClick(e, pin)}
                        title={pin.title}
                    >
                        <div className="pin-dot"></div>
                    </div>
                ))}

                {/* Creation Modal (Positioned absolutely near click) */}
                {isAdding && clickCoords && (
                    <div className="pin-modal creation glass" style={{ left: `${Math.min(clickCoords.x, 80)}%`, top: `${Math.min(clickCoords.y, 80)}%` }} onClick={e => e.stopPropagation()}>
                        <h4>Novo Pin</h4>
                        <select onChange={e => setNewPin({ ...newPin, type: e.target.value as any })} value={newPin.type}>
                            <option value="resource">🌿 Recurso</option>
                            <option value="infra">🏗️ Infraestrutura</option>
                            <option value="project">🚧 Projeto</option>
                            <option value="warning">⚠️ Aviso/Nota</option>
                            <option value="poi">📍 POI</option>
                        </select>
                        <input placeholder="Título" value={newPin.title || ''} onChange={e => setNewPin({ ...newPin, title: e.target.value })} autoFocus />
                        <input placeholder="Nota (opcional)" value={newPin.note || ''} onChange={e => setNewPin({ ...newPin, note: e.target.value })} />
                        <div className="modal-actions">
                            <button onClick={() => setIsAdding(false)}>Cancelar</button>
                            <button className="confirm" onClick={savePin}>Salvar</button>
                        </div>
                    </div>
                )}

                {/* Info Modal */}
                {selectedPin && (
                    <div className="pin-modal info glass" style={{ left: `${Math.min(selectedPin.x, 80)}%`, top: `${Math.min(selectedPin.y, 80)}%` }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className={`type-badge ${selectedPin.type}`}>{selectedPin.type.toUpperCase()}</span>
                            <button onClick={() => setSelectedPin(null)}><X size={14} /></button>
                        </div>
                        <h4>{selectedPin.title}</h4>
                        {selectedPin.note && <p className="pin-note">{selectedPin.note}</p>}
                        <div className="pin-meta">
                            <span>por {selectedPin.author}</span>
                            {canEdit(selectedPin) && (
                                <button className="delete-btn" onClick={() => deletePin(selectedPin.id)}>Remover</button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .guild-map-container { display: flex; flex-direction: column; gap: 1rem; height: 600px; }
                .map-toolbar { display: flex; justify-content: space-between; align-items: center; }
                .map-legend { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-secondary); }
                .legend-item { display: flex; align-items: center; gap: 0.5rem; }
                .dot { width: 8px; height: 8px; border-radius: 50%; }

                .map-viewport { 
                    flex: 1; 
                    position: relative; 
                    overflow: hidden; 
                    cursor: crosshair; 
                    border: 1px solid var(--border-subtle);
                    background: #111;
                }
                
                /* Grid Pattern Placeholder */
                .map-placeholder-grid {
                    width: 100%; height: 100%;
                    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                }

                /* Pins */
                .map-pin { position: absolute; transform: translate(-50%, -50%); cursor: pointer; transition: transform 0.2s; padding: 10px; }
                .map-pin:hover { transform: translate(-50%, -50%) scale(1.5); z-index: 10; }
                .pin-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(0,0,0,0.5); box-shadow: 0 0 5px rgba(0,0,0,0.5); }
                
                /* Colors */
                .map-pin.resource .pin-dot, .dot.resource { background-color: var(--accent-sage); }
                .map-pin.infra .pin-dot, .dot.infra { background-color: #888; }
                .map-pin.project .pin-dot, .dot.project { background-color: #e5b32d; }
                .map-pin.warning .pin-dot, .dot.warning { background-color: #ff6b6b; }
                .map-pin.poi .pin-dot, .dot.poi { background-color: #fff; }

                /* Modals */
                .pin-modal { 
                    position: absolute; 
                    background: rgba(10, 10, 10, 0.95); 
                    border: 1px solid var(--border-subtle);
                    padding: 1rem; 
                    border-radius: 4px;
                    width: 250px;
                    z-index: 20;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    backdrop-filter: blur(10px);
                }
                
                .pin-modal input, .pin-modal select { 
                    width: 100%; 
                    margin-bottom: 0.5rem; 
                    background: rgba(255,255,255,0.05); 
                    border: 1px solid var(--border-subtle); 
                    color: white; 
                    padding: 0.5rem;
                }
                
                .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
                .modal-actions button { padding: 0.3rem 0.8rem; border-radius: 2px; cursor: pointer; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); }
                .modal-actions button.confirm { background: var(--accent-sage); color: black; border: none; }

                .modal-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem; }
                .type-badge { font-size: 0.65rem; padding: 2px 6px; border-radius: 2px; background: rgba(255,255,255,0.1); letter-spacing: 0.05em; }
                .pin-note { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-style: italic; }
                .pin-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-dim); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; margin-top: 0.5rem; }
                .delete-btn { color: #ff6b6b; background: none; border: none; cursor: pointer; padding: 0; }
                .delete-btn:hover { text-decoration: underline; }

                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .guild-map-container {
                        height: 400px;
                    }

                    .map-toolbar {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.75rem;
                    }

                    .map-toolbar h3 {
                        font-size: 1.25rem;
                    }

                    .map-legend {
                        flex-wrap: wrap;
                        gap: 0.75rem;
                        font-size: 0.75rem;
                    }

                    /* Critical: Bottom Sheet Modal Pattern */
                    .pin-modal {
                        position: fixed !important;
                        bottom: 0 !important;
                        left: 0 !important;
                        top: auto !important;
                        width: 100% !important;
                        max-height: 70vh;
                        overflow-y: auto;
                        border-radius: 12px 12px 0 0;
                        box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
                    }

                    .pin-modal input,
                    .pin-modal select {
                        font-size: 1rem; /* Prevent zoom on iOS */
                    }
                }
            `}</style>
        </div>
    );
}

