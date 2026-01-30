

import { useState } from 'react';
import { Plus, X, Pencil, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase'; // CHANGED
import { useAuth } from '../../context/AuthContext';
import type { ServiceItem } from '../../types';

export default function ServicesBoard() {
    const { user } = useAuth();
    // CHANGED: Using Supabase hook
    const { data: services, loading, create, update, remove } = useSupabase<ServiceItem>('services');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<ServiceItem>>({ type: 'material', intent: 'buy' });

    const openAdd = () => {
        setEditingId(null);
        setFormData({ type: 'material', intent: 'buy', provider: user?.username });
        setIsFormOpen(true);
    };

    const openEdit = (item: ServiceItem) => {
        setEditingId(item.id);
        const { id, ...rest } = item; // don't put ID in formData to avoid confusion
        setFormData({ ...rest });
        setIsFormOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.title) return;

        if (editingId) {
            await update(editingId, formData);
        } else {
            const item: any = {
                title: formData.title,
                description: formData.description || '',
                price: formData.price || 'A combinar',
                provider: formData.provider || user?.username || 'Anon',
                type: formData.type as 'service' | 'material',
                intent: formData.intent as 'buy' | 'sell',
                status: formData.status || 'open',
                assigned_to: formData.assigned_to
            };
            // Remove undefined assigned_to to avoid DB errors if column expects null
            if (!item.assigned_to) delete item.assigned_to;

            await create(item);
        }
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ type: 'material', intent: 'buy' });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Confirmar exclusão?')) {
            await remove(id);
        }
    };

    const toggleStatus = async (id: string) => {
        if (!user) return;
        const service = services.find(s => s.id === id);
        if (!service) return;

        const newStatus = service.status === 'open' ? 'in_progress' : 'open';
        await update(id, {
            status: newStatus,
            assigned_to: newStatus === 'in_progress' ? user.username : null // Send null to DB
        } as any);
    };

    if (loading) return <div className="p-4 text-center">Carregando mural...</div>;

    return (
        <div className="services-board">
            <div className="board-actions">
                <h3>Ordens de Serviço</h3>
                {user ? (
                    <button className="btn-add" onClick={openAdd}>
                        <Plus size={16} /> Nova Ordem
                    </button>
                ) : (
                    <span className="login-hint">Acesso Restrito &bull; Somente Leitura</span>
                )}
            </div>

            {isFormOpen && (
                <div className="add-form glass">
                    <div className="form-header">
                        <h4>{editingId ? 'Editar Ordem' : 'Nova Ordem'}</h4>
                        <button onClick={() => setIsFormOpen(false)}><X size={18} /></button>
                    </div>

                    <div className="form-row">
                        <select
                            value={formData.intent}
                            onChange={e => setFormData({ ...formData, intent: e.target.value as 'buy' | 'sell' })}
                            className="intent-select"
                        >
                            <option value="buy">COMPRA</option>
                            <option value="sell">VENDA</option>
                        </select>

                        {['superadmin', 'admin', 'operator'].includes(user?.role || '') ? (
                            <input
                                placeholder="Responsável"
                                value={formData.provider || ''}
                                onChange={e => setFormData({ ...formData, provider: e.target.value })}
                                style={{ width: '150px' }}
                            />
                        ) : (
                            <div className="user-badge" style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--accent-sage)', fontWeight: 500, fontFamily: 'monospace' }}>
                                [{user?.username}]
                            </div>
                        )}

                        <input
                            placeholder="Valor"
                            value={formData.price || ''}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            style={{ flex: 1 }}
                        />
                    </div>

                    <input
                        placeholder="Especificação (ex: 1k handles)"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />

                    {(['superadmin', 'admin', 'operator'].includes(user?.role || '') || user?.username === formData.provider) && (
                        <div className="form-row" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                STATUS
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'open' | 'in_progress' })}
                                    className="status-select"
                                >
                                    <option value="open">OPEN</option>
                                    <option value="in_progress">IN PROGRESS</option>
                                </select>
                            </label>

                            {formData.status === 'in_progress' && (
                                <input
                                    placeholder="Técnico responsável"
                                    value={formData.assigned_to || ''}
                                    onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                                    style={{ flex: 1 }}
                                />
                            )}
                        </div>
                    )}

                    <button className="btn-submit" onClick={handleSubmit}>
                        {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
                    </button>
                </div>
            )}

            <div className="services-list-container">
                {services.length === 0 && <div className="text-center p-4 text-dim">Nenhuma ordem ativa.</div>}

                {services.map(service => (
                    <div key={service.id} className={`service-row glass ${service.status}`}>
                        {/* Status Indicator: Pure color, no icon unless hover */}
                        <div
                            className={`status-indicator ${service.status} ${user ? 'clickable' : ''}`}
                            onClick={() => toggleStatus(service.id)}
                        />

                        <div className="row-content">
                            <span className={`intent-text ${service.intent}`}>
                                {service.intent === 'buy' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                {service.intent === 'buy' ? 'BUY' : 'SELL'}
                            </span>

                            <span className="row-nick">{service.provider}</span>
                            <span className="row-item">{service.title}</span>

                            <div className="dots-fill"></div>

                            {service.status === 'in_progress' && (
                                <span className="assigned-text">
                                    &gt;&gt; assigned: {service.assigned_to}
                                </span>
                            )}

                            <span className="row-price">{service.price}</span>
                        </div>

                        {['superadmin', 'admin', 'operator'].includes(user?.role || '') && (
                            <div className="row-actions">
                                <button className="icon-btn edit" onClick={() => openEdit(service)}>
                                    <Pencil size={12} />
                                </button>
                                <button className="icon-btn delete" onClick={() => handleDelete(service.id)}>
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
        .services-list-container { display: flex; flex-direction: column; gap: 0; }
        
        .service-row { 
            display: flex; 
            align-items: center; 
            padding: 0.5rem 1rem; 
            gap: 1rem; 
            transition: all 0.2s; 
            border-bottom: 1px solid rgba(255, 255, 255, 0.03); 
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        .service-row:hover { background: rgba(255, 255, 255, 0.04); }
        .service-row:hover .row-actions { opacity: 1; }
        
        /* Muted state for In Progress */
        .service-row.in_progress { opacity: 0.4; }
        .service-row.in_progress:hover { opacity: 0.8; }

        /* Minimal Status Indicator */
        .status-indicator { 
            width: 8px; 
            height: 8px; 
            border-radius: 50%; 
            margin-right: 0.5rem;
        }
        .status-indicator.open { background-color: var(--accent-sage); box-shadow: 0 0 5px rgba(154, 176, 154, 0.4); }
        .status-indicator.in_progress { background-color: transparent; border: 1px solid #666; }
        .status-indicator.clickable:hover { cursor: pointer; transform: scale(1.2); }

        .row-content { display: flex; flex: 1; gap: 1rem; align-items: center; font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap; }
        
        .intent-text { display: flex; align-items: center; gap: 4px; font-weight: 600; font-size: 0.75rem; letter-spacing: 0.05em; }
        .intent-text.buy { color: #d4a5a5; } /* Muted Red */
        .intent-text.sell { color: #a5d4a5; } /* Muted Green */

        .row-nick { color: var(--text-dim); min-width: 80px; text-align: right; }
        .row-item { color: var(--text-primary); font-weight: 500; }
        
        .assigned-text { font-size: 0.75rem; color: var(--text-dim); font-style: italic; }
        
        .dots-fill { flex: 1; height: 1px; border-bottom: 1px dotted rgba(255,255,255,0.08); margin: 0 0.5rem; }
        .row-price { color: var(--text-primary); min-width: 60px; text-align: right; letter-spacing: 0.05em; }
        
        .row-actions { display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s; margin-left: 0.5rem; }
        .icon-btn { background: none; border: none; color: var(--text-dim); cursor: pointer; padding: 4px; }
        .icon-btn:hover { color: var(--text-primary); }
        .icon-btn.delete:hover { color: #ff6b6b; }

        .login-hint { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; }
        .intent-select, .status-select { background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); color: white; padding: 0.5rem; }
        .form-row { display: flex; gap: 1rem; }
        .add-form { border-radius: 0; border: 1px solid var(--border-subtle); }
        .add-form h4 { font-family: 'Playfair Display', serif; font-weight: 400; font-style: italic; }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .board-actions {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }

            .board-actions h3 {
                font-size: 1.25rem;
            }

            .service-row {
                flex-direction: column;
                align-items: flex-start;
                padding: 1rem;
                gap: 0.75rem;
            }

            .status-indicator {
                position: absolute;
                top: 1rem;
                right: 1rem;
            }

            .row-content {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
                width: 100%;
                white-space: normal;
            }

            .intent-text {
                font-size: 0.7rem;
            }

            .row-nick {
                min-width: unset;
                text-align: left;
                font-size: 0.8rem;
            }

            .row-item {
                font-size: 0.9rem;
                word-break: break-word;
            }

            .dots-fill {
                display: none;
            }

            .row-price {
                min-width: unset;
                text-align: left;
                font-size: 0.85rem;
            }

            .assigned-text {
                font-size: 0.7rem;
            }

            .row-actions {
                opacity: 1;
                margin-left: 0;
                position: absolute;
                bottom: 1rem;
                right: 1rem;
            }

            .form-row {
                flex-direction: column;
                gap: 0.75rem;
            }

            .add-form input,
            .add-form select {
                width: 100% !important;
            }
        }
      `}</style>
        </div>
    );
}

