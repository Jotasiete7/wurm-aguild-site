
import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { Activity, Radio, X, Save } from 'lucide-react';

interface SystemStatusData {
    message: string;
    timestamp: number;
    author: string;
}

export default function SystemStatus() {
    const { user } = useAuth();
    const [status, setStatus] = useLocalStorage<SystemStatusData | null>('guild_system_status_v1', null);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');

    const isOperator = user?.role === 'operator';

    const handleSave = () => {
        if (!draft.trim()) {
            setStatus(null); // Clear status if empty
        } else {
            setStatus({
                message: draft,
                timestamp: Date.now(),
                author: user?.username || 'System'
            });
        }
        setIsEditing(false);
    };

    const startEdit = () => {
        setDraft(status?.message || '');
        setIsEditing(true);
    };

    // If no status and not operator (who might want to set one), render nothing for silence
    if (!status && !isOperator) return null;

    return (
        <div className="system-status-container fade-in">
            {isEditing ? (
                <div className="status-editor glass">
                    <div className="editor-row">
                        <Activity size={18} className="icon-pulse" />
                        <input
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            placeholder="Status do Sistema (ex: Manutenção na região norte...)"
                            autoFocus
                        />
                        <div className="editor-actions">
                            <button onClick={() => setIsEditing(false)} title="Cancelar"><X size={16} /></button>
                            <button onClick={handleSave} className="save-btn" title="Salvar"><Save size={16} /></button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`status-display glass ${status ? 'active' : 'placeholder'}`}>
                    <div className="status-content">
                        {status ? (
                            <>
                                <Radio size={16} className="status-icon" />
                                <span className="status-text">{status.message}</span>
                                <span className="status-meta">
                                    // {new Date(status.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {/* • by {status.author} (Hide author for purer system feel?) */}
                                </span>
                            </>
                        ) : (
                            /* Only visible to Operator when empty */
                            <span className="status-placeholder" onClick={startEdit}>
                                + Definir Status do Sistema
                            </span>
                        )}
                    </div>

                    {isOperator && status && (
                        <button className="edit-status-btn" onClick={startEdit}>
                            EDITAR
                        </button>
                    )}
                </div>
            )}

            <style>{`
                .system-status-container { margin-bottom: 1rem; }
                
                .status-display {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    border-left: 3px solid transparent;
                    transition: all 0.2s;
                    min-height: 40px;
                }
                
                .status-display.active {
                    background: rgba(229, 179, 45, 0.1); /* Amber tint */
                    border-left-color: #e5b32d;
                }
                
                .status-display.placeholder {
                    border: 1px dashed var(--border-subtle);
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0.5;
                }
                .status-display.placeholder:hover { opacity: 1; border-color: var(--accent-sage); }

                .status-content { display: flex; align-items: center; gap: 0.8rem; flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
                
                .status-icon { color: #e5b32d; animation: pulse 2s infinite; }
                .status-text { color: var(--text-primary); letter-spacing: 0.05em; }
                .status-meta { color: var(--text-dim); font-size: 0.75rem; margin-left: auto; }

                .edit-status-btn {
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    background: transparent;
                    border: 1px solid var(--border-subtle);
                    color: var(--text-dim);
                    cursor: pointer;
                    margin-left: 1rem;
                    text-transform: uppercase;
                }
                .edit-status-btn:hover { background: rgba(255,255,255,0.1); color: white; }

                /* Editor */
                .status-editor { padding: 0.5rem; border-radius: 4px; border: 1px solid var(--accent-sage); }
                .editor-row { display: flex; align-items: center; gap: 0.5rem; }
                .status-editor input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: white;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.9rem;
                    outline: none;
                }
                .editor-actions { display: flex; gap: 0.2rem; }
                .editor-actions button {
                    background: none;
                    border: none;
                    color: var(--text-dim);
                    cursor: pointer;
                    padding: 4px;
                }
                .editor-actions button:hover { color: white; }
                .editor-actions button.save-btn { color: var(--accent-sage); }

                .icon-pulse { color: var(--accent-sage); }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
