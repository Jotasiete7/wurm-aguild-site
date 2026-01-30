
import { useState } from 'react';
import { Plus, X, ExternalLink, Pencil, Trash2, Hammer, Map, FileSpreadsheet, FileText, Globe } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { useAuth } from '../../context/AuthContext';
import type { Resource } from '../../types';

const TYPE_ICONS: Record<Resource['type'], React.ElementType> = {
    tool: Hammer,
    map: Map,
    sheet: FileSpreadsheet,
    doc: FileText,
    external: Globe,
};

const TYPE_LABELS: Record<Resource['type'], string> = {
    tool: 'Ferramenta',
    map: 'Mapa',
    sheet: 'Planilha',
    doc: 'Documento',
    external: 'Externo',
};

const ACCESS_LABELS: Record<Resource['access'], string> = {
    public: 'público',
    members: 'membros',
    admins: 'admins',
};

export default function ResourcesBoard() {
    const { user } = useAuth();
    const { data: resources, loading, create, update, remove } = useSupabase<Resource>('resources');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Resource>>({
        type: 'tool',
        access: 'public'
    });

    const openAdd = () => {
        setEditingId(null);
        setFormData({ type: 'tool', access: 'public' });
        setIsFormOpen(true);
    };

    const openEdit = (resource: Resource) => {
        setEditingId(resource.id);
        setFormData({
            name: resource.name,
            type: resource.type,
            access: resource.access,
            url: resource.url
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja remover este recurso?')) {
            await remove(id);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.url) return;

        if (editingId) {
            await update(editingId, {
                name: formData.name,
                type: formData.type as Resource['type'],
                access: formData.access as Resource['access'],
                url: formData.url,
            });
        } else {
            await create({
                name: formData.name,
                type: formData.type as Resource['type'],
                access: formData.access as Resource['access'],
                url: formData.url,
                author: user?.username || 'Anon',
            });
        }

        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ type: 'tool', access: 'public' });
    };

    // Filter by access level
    const visibleResources = resources.filter(r => {
        if (r.access === 'public') return true;
        if (r.access === 'members' && user) return true;
        if (r.access === 'admins' && ['superadmin', 'admin', 'operator'].includes(user?.role || '')) return true;
        return false;
    });

    if (loading) return <div className="p-4 text-center">Carregando recursos...</div>;

    return (
        <div className="services-board">
            <div className="board-actions">
                <h3>Recursos Operacionais</h3>
                {['superadmin', 'admin', 'operator'].includes(user?.role || '') && (
                    <button className="btn-add" onClick={openAdd}>
                        <Plus size={16} /> Novo Recurso
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="add-form glass">
                    <div className="form-header">
                        <h4>{editingId ? 'Editar Recurso' : 'Novo Recurso'}</h4>
                        <button onClick={() => setIsFormOpen(false)}><X size={18} /></button>
                    </div>

                    <div className="form-row">
                        <input
                            placeholder="Nome do recurso"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ flex: 2 }}
                        />
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
                        >
                            <option value="tool">Ferramenta</option>
                            <option value="map">Mapa</option>
                            <option value="sheet">Planilha</option>
                            <option value="doc">Documento</option>
                            <option value="external">Externo</option>
                        </select>
                        <select
                            value={formData.access}
                            onChange={e => setFormData({ ...formData, access: e.target.value as Resource['access'] })}
                        >
                            <option value="public">Público</option>
                            <option value="members">Membros</option>
                            <option value="admins">Admins</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <input
                            placeholder="URL completa (https://...)"
                            value={formData.url || ''}
                            onChange={e => setFormData({ ...formData, url: e.target.value })}
                        />
                    </div>

                    <div className="form-actions">
                        <button className="btn-submit" onClick={handleSubmit}>
                            {editingId ? 'Salvar Alterações' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            )}

            <div className="services-list">
                <div className="service-row header">
                    <span style={{ flex: 2 }}>Recurso</span>
                    <span style={{ width: '120px' }}>Tipo</span>
                    <span style={{ width: '100px' }}>Acesso</span>
                    <span style={{ width: '100px', textAlign: 'center' }}>Ação</span>
                </div>

                {visibleResources.length === 0 && (
                    <div className="empty-state">
                        <p>Nenhum recurso disponível no momento.</p>
                    </div>
                )}

                {visibleResources.map((resource, index) => {
                    const Icon = TYPE_ICONS[resource.type];
                    return (
                        <div
                            key={resource.id}
                            className="service-row"
                            onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                            role="button"
                            tabIndex={0}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <span style={{ flex: 2, fontWeight: 500, color: 'var(--text-primary)' }}>{resource.name}</span>

                            <span style={{ width: '130px', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.8, fontSize: '0.875rem' }}>
                                <Icon size={16} style={{ opacity: 0.7 }} />
                                {TYPE_LABELS[resource.type]}
                            </span>

                            <span style={{ width: '100px' }}>
                                <span className={`badge ${resource.access}`}>
                                    {ACCESS_LABELS[resource.access]}
                                </span>
                            </span>
                            <div
                                style={{ width: '100px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="icon-btn"
                                    title="Abrir"
                                >
                                    <ExternalLink size={16} />
                                </a>

                                {['superadmin', 'admin', 'operator'].includes(user?.role || '') && (
                                    <>
                                        <button
                                            className="icon-btn"
                                            onClick={() => openEdit(resource)}
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="icon-btn delete"
                                            onClick={() => handleDelete(resource.id)}
                                            title="Remover"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .services-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .service-row {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    gap: 1rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 8px;
                    border: 1px solid transparent;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                    
                    /* Animation */
                    opacity: 0;
                    animation: slideIn 0.3s ease-out forwards;
                }

                .service-row:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(154, 176, 154, 0.3); /* accent-sage-dim */
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(154, 176, 154, 0.1);
                    transform: translateY(-1px);
                }
                
                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.03);
                    color: var(--text-secondary);
                }

                .badge.public { color: var(--text-secondary); }
                .badge.members { color: var(--accent-sage); border-color: rgba(154, 176, 154, 0.2); background: rgba(154, 176, 154, 0.05); }
                .badge.admins { color: #d4a373; border-color: rgba(212, 163, 115, 0.2); background: rgba(212, 163, 115, 0.05); }

                .service-row.header {
                    background: transparent;
                    border: none;
                    cursor: default;
                    pointer-events: none;
                    padding: 0.5rem 1rem;
                    margin-bottom: 0;
                    font-weight: 600;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-dim);
                    opacity: 0.6;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0;
                    box-shadow: none !important;
                    transform: none !important;
                }

                .icon-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 4px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                }

                .icon-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--accent-sage);
                }
                
                .icon-btn.delete:hover {
                    background: rgba(255, 77, 77, 0.1);
                    color: #ff6b6b;
                }

                .empty-state {
                    padding: 3rem 1rem;
                    text-align: center;
                    color: var(--text-dim);
                    font-size: 0.875rem;
                }

                /* Mobile Responsiveness */
                @media (max-width: 768px) {
                    .service-row.header {
                        display: none;
                    }

                    .service-row {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 1.25rem;
                        gap: 0.75rem;
                    }

                    .service-row > span,
                    .service-row > div {
                        width: 100% !important;
                        flex: unset !important;
                    }
                    
                    .service-row > div {
                        justify-content: flex-end !important;
                        margin-top: 0.5rem;
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                        padding-top: 1rem;
                    }

                    .icon-btn {
                        padding: 0.75rem;
                        /* Larger touch target */
                    }

                    .form-row {
                        flex-direction: column;
                    }

                    .form-row input,
                    .form-row select {
                        flex: unset !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}
