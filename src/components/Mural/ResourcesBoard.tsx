
import { useState } from 'react';
import { Plus, X, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { useAuth } from '../../context/AuthContext';
import type { Resource } from '../../types';

const TYPE_LABELS: Record<Resource['type'], string> = {
    tool: 'ferramenta',
    map: 'mapa',
    sheet: 'planilha',
    doc: 'documento',
    external: 'externo',
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
        if (r.access === 'admins' && user?.role === 'operator') return true;
        return false;
    });

    if (loading) return <div className="p-4 text-center">Carregando recursos...</div>;

    return (
        <div className="services-board">
            <div className="board-actions">
                <h3>Recursos Operacionais</h3>
                {user?.role === 'operator' && (
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

                {visibleResources.map(resource => (
                    <div key={resource.id} className="service-row">
                        <span style={{ flex: 2 }}>{resource.name}</span>
                        <span style={{ width: '120px', opacity: 0.6, fontSize: '0.875rem' }}>
                            {TYPE_LABELS[resource.type]}
                        </span>
                        <span style={{ width: '100px', opacity: 0.6, fontSize: '0.875rem' }}>
                            {ACCESS_LABELS[resource.access]}
                        </span>
                        <div style={{ width: '100px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="icon-btn"
                                title="Abrir"
                            >
                                <ExternalLink size={16} />
                            </a>

                            {user?.role === 'operator' && (
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
                ))}
            </div>

            <style>{`
                .services-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .service-row {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    gap: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    transition: background 0.2s;
                }

                .service-row:hover {
                    background: rgba(255, 255, 255, 0.04);
                }

                .service-row.header {
                    font-weight: 600;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-dim);
                    opacity: 0.6;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .icon-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.25rem;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-btn:hover {
                    color: var(--accent-sage);
                }
                
                .icon-btn.delete:hover {
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
                        padding: 1rem;
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
                    }

                    .icon-btn {
                        padding: 0.5rem;
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
