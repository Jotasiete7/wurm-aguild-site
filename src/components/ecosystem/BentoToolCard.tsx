import { ArrowUpRight } from 'lucide-react';
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
        if ((e.target as HTMLElement).closest('a')) return;

        trackToolClick(tool.id);
        window.open(tool.href, '_blank', 'noopener,noreferrer');
    };

    return (
        <article
            onClick={handleCardClick}
            className={`group relative flex flex-col justify-between rounded-2xl bg-[#0d0e12]/90 border border-[var(--color-wurm-border)]/80 backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-[var(--card-accent)]/60 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6),0_0_24px_var(--card-glow)] col-span-1 ${
                isComingSoon ? 'opacity-70 grayscale-[25%] hover:grayscale-0 hover:opacity-100' : ''
            } ${className}`}
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
            <div className="p-5 pb-3 flex items-start justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                        style={{
                            backgroundColor: `${tool.accentColor}15`,
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

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider border uppercase ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
                        {currentStatus.label}
                    </span>

                    <a
                        href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                            trackToolClick(tool.id);
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-wurm-muted)] group-hover:text-[var(--card-accent)] group-hover:bg-white/[0.04] transition-all"
                        title={t('Abrir em nova aba', 'Open in new tab')}
                    >
                        <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                </div>
            </div>

            {/* CARD BODY */}
            <div className="px-5 py-2 flex-1 flex flex-col justify-between">
                <p className="text-sm text-[var(--color-wurm-muted)] leading-relaxed m-0 text-left line-clamp-3 group-hover:text-[var(--color-wurm-text)]/90 transition-colors">
                    {description}
                </p>
            </div>

            {/* CARD FOOTER */}
            <div className="px-5 py-3 mt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-[var(--color-wurm-muted)]">
                <div className="flex items-center gap-2">
                    {tool.poweredBy ? (
                        <span className="text-[10px] text-[var(--color-wurm-muted)]/70">
                            {t('Fonte:', 'By:')} <span className="text-[var(--card-accent)] font-semibold">{tool.poweredBy}</span>
                        </span>
                    ) : (
                        <span className="text-[10px] text-[var(--color-wurm-muted)]/50 uppercase tracking-widest">
                            Wurm Online
                        </span>
                    )}
                </div>

                <span className="text-[11px] font-medium tracking-wider text-[var(--color-wurm-muted)] group-hover:text-[var(--card-accent)] flex items-center gap-1 transition-colors">
                    {isComingSoon ? t('Em breve', 'Coming soon') : t('Acessar', 'Launch')}
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
            </div>
        </article>
    );
}
