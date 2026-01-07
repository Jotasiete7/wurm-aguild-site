
import { useState } from 'react';
import { Plus, X, Eye, Lock, Shield, ExternalLink } from 'lucide-react';
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

const ACCESS_ICONS = {
    public: <Eye size={14} />,
    members: <Lock size={14} />,
    admins: <Shield size={14} />,
};

export default function ResourcesBoard() {
    const { user } = useAuth();
    const { data: resources, loading, create, remove } = useSupabase<Resource>('resources');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Resource>>({
        type: 'tool',
        access: 'public'
    });

    const handleSubmit = async () => {
        if (!formData.name || !formData.url) return;

        await create({
            name: formData.name,
            type: formData.type as Resource['type'],
            access: formData.access as Resource['access'],
            url: formData.url,
        });

        setIsFormOpen(false);
        setFormData({ type: 'tool', access: 'public' });
    };

    const handleDelete = async (id: string) => {
        if (confirm('Remover recurso?')) {
            await remove(id);
        }
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
                <div>
                    <h3>Recursos Operacionais</h3>
                    <p className="board-subtitle">Ferramentas e referências mantidas pela Guilda.</p>
                </div>
                {user?.role === 'operator' && (
                    <button className="btn-add icon-only" onClick={() => setIsFormOpen(true)} title="Novo Recurso">
                        <Plus size={16} />
                    </button>
                )}
            </div>

            {isFormOpen && (
                <div className="add-form glass">
                    <div className="form-header">
                        <h4>Novo Recurso</h4>
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
                        <button className="btn-submit" onClick={handleSubmit}>Adicionar</button>
                    </div>
                </div>
            )}

            <div className="services-list">
                <div className="service-row header">
                    <span style={{ flex: 2 }}>Recurso</span>
                    <span style={{ width: '100px' }}>Tipo</span>
                    <span style={{ width: '60px', textAlign: 'center' }}>Acesso</span>
                    <span style={{ width: '80px', textAlign: 'center' }}>Ação</span>
                </div>

                {visibleResources.length === 0 && (
                    <div className="empty-state">
                        <p>Nenhum recurso disponível no momento.</p>
                    </div>
                )}

                {visibleResources.map(resource => (
                    <div key={resource.id} className="service-row">
                        <span style={{ flex: 2, fontWeight: 500 }}>{resource.name}</span>
                        <span style={{ width: '100px', opacity: 0.6, fontSize: '0.875rem' }}>
                            {TYPE_LABELS[resource.type]}
                        </span>
                        <span style={{ width: '60px', textAlign: 'center', opacity: 0.6 }}>
                            {ACCESS_ICONS[resource.access]}
                        </span>
                        <div style={{ width: '80px', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
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
                                <button
                                    className="icon-btn danger"
                                    onClick={() => handleDelete(resource.id)}
                                    title="Remover"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
