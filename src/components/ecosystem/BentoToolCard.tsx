import { ExternalLink } from 'lucide-react';
import type { ToolItem } from '../../data/tools';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackToolClick } from '../../utils/toolTracker';

interface BentoToolCardProps {
    tool: ToolItem;
    className?: string;
}

export function BentoToolCard({ tool, className = '' }: BentoToolCardProps) {
    const { lang, t } = useLanguage();
    const Icon = tool.icon;

    const subtitle = lang === 'pt' ? tool.subtitle.pt : tool.subtitle.en;
    const description = lang === 'pt' ? tool.description.pt : tool.description.en;

    const statusConfig = {
        active: { label: 'Online', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        maintenance: { label: lang === 'pt' ? 'Manutenção' : 'Maintenance', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        'coming-soon': { label: lang === 'pt' ? 'Em breve' : 'Coming Soon', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' }
    };

    const status = tool.status ?? 'active';
    const currentStatus = statusConfig[status];
    const isComingSoon = status === 'coming-soon';

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent click if user clicked directly on link (which already handles it)
        if ((e.target as HTMLElement).closest('a')) return;

        trackToolClick(tool.id);
        if (tool.isExternal || tool.href.startsWith('http')) {
            window.open(tool.href, '_blank', 'noopener,noreferrer');
        } else {
            // Even for internal routes, if user prefers new tab or navigate:
            window.open(tool.href, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <article
            onClick={handleCardClick}
            className={`group relative flex flex-col justify-between rounded-2xl bg-[#0a0a0c]/90 border border-[var(--color-wurm-border)]/70 backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-[var(--card-accent)]/60 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5),0_0_24px_var(--card-glow)] ${
                isComingSoon ? 'opacity-70 grayscale-[30%] hover:grayscale-0 hover:opacity-100' : ''
            } ${tool.featured ? 'md:col-span-2' : 'col-span-1'} ${className}`}
            style={{
                '--card-accent': tool.accentColor,
                '--card-glow': tool.glowColor,
            } as React.CSSProperties}
        >
            {/* Ambient background glow on hover */}
            <div
                className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: tool.accentColor }}
            />

            {/* CARD HEADER */}
            <div className="p-5 flex items-start justify-between border-b border-white/[0.05]">
                <div className="flex items-center gap-3.5">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                        style={{
                            backgroundColor: `${tool.accentColor}18`,
                            color: tool.accentColor,
                            border: `1px solid ${tool.accentColor}30`,
                        }}
                    >
                        <Icon size={22} />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-white font-bold text-base md:text-lg m-0 leading-snug group-hover:text-[var(--card-accent)] transition-colors truncate">
                            {tool.title}
                        </h3>
                        <p className="text-[11px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-wider mt-0.5 truncate">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider border uppercase flex-shrink-0 ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
                    {currentStatus.label}
                </span>
            </div>

            {/* CARD BODY */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-sm text-[var(--color-wurm-muted)] leading-relaxed m-0 text-left line-clamp-3 group-hover:text-[var(--color-wurm-text)]/90 transition-colors">
                    {description}
                </p>

                {tool.poweredBy && (
                    <div className="mt-3 text-[10px] font-mono text-[var(--color-wurm-muted)]/70 flex items-center gap-1">
                        <span>{t('Fonte:', 'Powered by:')}</span>
                        <span className="text-[var(--card-accent)] font-semibold">{tool.poweredBy}</span>
                    </div>
                )}
            </div>

            {/* CARD FOOTER */}
            <div className="px-5 py-3.5 bg-white/[0.015] border-t border-white/[0.04] flex items-center justify-between text-xs font-mono font-medium text-[var(--color-wurm-muted)] group-hover:text-white group-hover:bg-[var(--card-accent)]/10 transition-all">
                <span className="tracking-wider uppercase text-[11px]">
                    {isComingSoon
                        ? t('Em desenvolvimento', 'In development')
                        : t('Acessar ferramenta', 'Open tool')}
                </span>

                <a
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                        e.stopPropagation();
                        trackToolClick(tool.id);
                    }}
                    className="p-1 rounded-md text-[var(--card-accent)] hover:scale-125 transition-transform"
                    title={t('Abrir em nova aba', 'Open in new tab')}
                >
                    <ExternalLink size={14} />
                </a>
            </div>
        </article>
    );
}
