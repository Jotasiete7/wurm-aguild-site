import { useEffect, useState } from 'react';
import { ExternalLink, Hammer, Map, FileSpreadsheet, FileText, Globe, Link2 } from 'lucide-react';
import { getPublicResources, type PublicResource } from '../../services/hubMural';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../ecosystem/ToolWidget';
import type { LucideIcon } from 'lucide-react';

const TYPE_ICONS: Record<PublicResource['type'], LucideIcon> = {
    tool:     Hammer,
    map:      Map,
    sheet:    FileSpreadsheet,
    doc:      FileText,
    external: Globe,
};

export function ResourcesWidget() {
    const [resources, setResources] = useState<PublicResource[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        getPublicResources().then(data => { setResources(data); setLoading(false); });
    }, []);

    return (
        <ToolWidget
            title={t('Resources', 'Recursos')}
            subtitle={t('Useful Links', 'Links Úteis')}
            icon={Link2}
            href="https://wurm-aguild-site.pages.dev"
            accentColor="#a78bfa"
        >
            {loading ? (
                <div className="space-y-2 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-6 bg-white/5 rounded" />)}
                </div>
            ) : resources.length === 0 ? (
                <p className="text-xs text-[var(--color-wurm-muted)] m-0 italic">
                    {t('No public resources yet.', 'Nenhum recurso público ainda.')}
                </p>
            ) : (
                <div className="flex flex-col gap-1.5">
                    {resources.slice(0, 6).map(res => {
                        const Icon = TYPE_ICONS[res.type];
                        return (
                            <a
                                key={res.id}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-purple-500/20 transition-all group/res"
                            >
                                <Icon size={11} className="text-[var(--color-wurm-muted)] group-hover/res:text-purple-400 transition-colors flex-shrink-0" />
                                <span className="text-white flex-1 truncate">{res.name}</span>
                                <ExternalLink size={10} className="text-[var(--color-wurm-muted)] opacity-0 group-hover/res:opacity-100 transition-opacity flex-shrink-0" />
                            </a>
                        );
                    })}
                </div>
            )}
        </ToolWidget>
    );
}
