import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Header as AgHeader } from '@ecossistema-guilda/layout/Header';
import { LanguageSwitch } from '@ecossistema-guilda/modules/LanguageSwitch';
import agStyles from '@ecossistema-guilda/layout/Header.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../../components/ecosystem/ToolWidget';
import {
    Gavel, Pickaxe, Hammer, BookOpen, BookMarked,
    Hourglass, Gem, Shield, Map, LineChart, Clock, Search, Wrench,
    Telescope, ScrollText,
} from 'lucide-react';
import { trackToolClick } from '../../utils/toolTracker';
import styles from './GuildUtilitiesPage.module.css';

type FilterType = 'all' | 'ecosystem' | 'utilities';

interface ToolMeta {
    id: string;
    title: string;
    icon: any;
    href: string;
    accentColor: string;
    glowColor: string;
    borderColor: string;
    status?: 'active' | 'maintenance' | 'coming-soon';
    isInternal?: boolean;
    featured?: boolean;   // spans 2 columns in the grid
    isLive?: boolean;     // shows pulsing LIVE badge inside card
    isArchive?: boolean;  // shows Archive source badge
    poweredBy?: string;   // shows "Powered by X" note
    subtitle: { pt: string; en: string };
    description: { pt: string; en: string };
}

const TOOLS: ToolMeta[] = [
    // ─── FEATURED ────────────────────────────────────────────────────────────
    {
        id: 'market-observatory',
        title: 'Market Observatory',
        icon: Telescope,
        href: 'https://wurm-market-observatory.pages.dev',
        accentColor: '#00d4aa',
        glowColor: 'rgba(0, 212, 170, 0.25)',
        borderColor: 'rgba(0, 212, 170, 0.40)',
        featured: true,
        poweredBy: 'Historical Archive',
        subtitle: { en: 'Economic Archaeology', pt: 'Arqueologia Econômica' },
        description: {
            pt: 'Plataforma de análise de logs históricos de comércio de Wurm Online. Trata cada corpus como uma "amostra de escavação" — sem interpolações, sem dados ao vivo. Alimentado pelo Historical Archive.',
            en: 'Analysis platform for historical Wurm Online trade logs. Treats each corpus as a "site sample" — no guessing, no live data. Powered by the Historical Archive.',
        },
    },
    {
        id: 'mining',
        title: 'Mining',
        icon: Pickaxe,
        href: 'https://wurm-mining-tool.pages.dev',
        accentColor: '#d97706',
        glowColor: 'rgba(217, 119, 6, 0.22)',
        borderColor: 'rgba(217, 119, 6, 0.35)',
        subtitle: { en: 'Ore & Vein Calculator', pt: 'Calculadora de Minério' },
        description: {
            pt: 'Calcule minério, veias e qualidade de extração por nível de habilidade.',
            en: 'Ore, veins & extraction quality calculator based on skill level.',
        },
    },
    {
        id: 'carpentry',
        title: 'Carpentry',
        icon: Hammer,
        href: 'https://wurm-carpentry-tool.pages.dev',
        accentColor: '#b45309',
        glowColor: 'rgba(180, 83, 9, 0.22)',
        borderColor: 'rgba(180, 83, 9, 0.35)',
        subtitle: { en: 'Woodworking Planner', pt: 'Planejador de Marcenaria' },
        description: {
            pt: 'Planejador de itens, materiais e progresso de habilidade de marcenaria.',
            en: 'Plan items, materials & carpentry skill grinding paths.',
        },
    },
    {
        id: 'recipes',
        title: 'Recipes',
        icon: BookOpen,
        href: 'https://wurm-recipe-tool.pages.dev',
        accentColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.22)',
        borderColor: 'rgba(16, 185, 129, 0.35)',
        subtitle: { en: 'Cooking Guide', pt: 'Guia de Culinária' },
        description: {
            pt: 'Encontre receitas, ingredientes e efeitos de buff de culinária.',
            en: 'Find cooking recipes, ingredients, and food buff effects.',
        },
    },
    {
        id: 'liturgy',
        title: 'Liturgy',
        icon: BookMarked,
        href: 'https://wurm-liturgy.pages.dev',
        accentColor: '#6366f1',
        glowColor: 'rgba(99, 102, 241, 0.22)',
        borderColor: 'rgba(99, 102, 241, 0.35)',
        subtitle: { en: 'Priest Planner', pt: 'Planejador de Sacerdotes' },
        description: {
            pt: 'Planejamento de rezas, favores e rituais para sacerdotes de Wurm.',
            en: 'Prayers, favors, and ritual timers for Wurm priests.',
        },
    },
    {
        id: 'wall-decay',
        title: 'Wall Decay',
        icon: Hourglass,
        href: 'https://wurm-wall-decay-calculator.pages.dev',
        accentColor: '#f43f5e',
        glowColor: 'rgba(244, 63, 94, 0.22)',
        borderColor: 'rgba(244, 63, 94, 0.35)',
        subtitle: { en: 'Decay Calculator', pt: 'Calculadora de Decaimento' },
        description: {
            pt: 'Calcule o tempo de decaimento de cercas, muralhas e manutenção de deeds.',
            en: 'Deed upkeep, wall decay and structure collapse timing calculator.',
        },
    },
    {
        id: 'relic-appraiser',
        title: 'Relic Appraiser',
        icon: Gem,
        href: 'https://wurm-relic-appraiser.pages.dev',
        accentColor: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.22)',
        borderColor: 'rgba(6, 182, 212, 0.35)',
        subtitle: { en: 'Relics & Rares', pt: 'Relíquias e Raros' },
        description: {
            pt: 'Avalie, compare e classifique relíquias e itens raros de Wurm.',
            en: 'Appraise, compare and rank Wurm relics and rare items.',
        },
    },
    {
        id: 'prospect',
        title: 'Prospect',
        icon: Map,
        href: 'https://wurm-prospect-tool.pages.dev',
        accentColor: '#22c55e',
        glowColor: 'rgba(34, 197, 94, 0.22)',
        borderColor: 'rgba(34, 197, 94, 0.35)',
        subtitle: { en: 'Vein Mapper', pt: 'Mapeador de Veias' },
        description: {
            pt: 'Ferramenta de prospecção e mapeamento de veias de minério subterrâneas.',
            en: 'Ore prospecting tracker and underground vein mapper.',
        },
    },
    {
        id: 'analytics',
        title: 'Analytics',
        icon: LineChart,
        href: 'https://wurm-analytics-journal.pages.dev',
        accentColor: '#3b82f6',
        glowColor: 'rgba(59, 130, 246, 0.22)',
        borderColor: 'rgba(59, 130, 246, 0.35)',
        subtitle: { en: 'Economic Intel', pt: 'Inteligência Econômica' },
        description: {
            pt: 'Jornal analítico com dados operacionais e econômicos do ecossistema.',
            en: 'Analytical journal tracking ecosystem economic & operational data.',
        },
    },
    // ─── HISTORICAL ARCHIVE ───────────────────────────────────────────────────
    {
        id: 'historical-archive',
        title: 'Historical Archive',
        icon: ScrollText,
        href: 'https://wurm-online-historical-archive.pages.dev',
        accentColor: '#c9a84c',
        glowColor: 'rgba(201, 168, 76, 0.25)',
        borderColor: 'rgba(201, 168, 76, 0.38)',
        isArchive: true,
        subtitle: { en: 'Digital Archaeology', pt: 'Arqueologia Digital' },
        description: {
            pt: 'Preservação imutável de logs históricos de Wurm Online. Logs de jogadores como fragmentos arqueológicos de uma civilização virtual — antes que desapareçam para sempre.',
            en: 'Immutable preservation of Wurm Online historical logs. Player logs as archaeological fragments of a virtual civilization — before they are lost forever.',
        },
    },
    {
        id: 'badges',
        title: 'Guilda Badges',
        icon: Shield,
        href: 'https://wurm-aguilda-badges.pages.dev',
        accentColor: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.22)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        subtitle: { en: 'Achievement Board', pt: 'Mural de Conquistas' },
        description: {
            pt: 'Galeria de conquistas e medalhas dos membros da Guilda.',
            en: 'Guild member achievements, badges, and recognition board.',
        },
    },
    {
        id: 'auction',
        title: 'Auctions',
        icon: Gavel,
        href: 'https://wurm-auction-helper.pages.dev',
        accentColor: '#eab308',
        glowColor: 'rgba(234, 179, 8, 0.22)',
        borderColor: 'rgba(234, 179, 8, 0.35)',
        status: 'coming-soon',
        subtitle: { en: 'Live Marketplace', pt: 'Mercado ao Vivo' },
        description: {
            pt: 'Mercado de leilões ao vivo para compra e venda de itens raros.',
            en: 'Live auction house helper for buying and selling rare items.',
        },
    },
    // ─── LOCAL MICRO-UTILITIES ────────────────────────────────────────────────
    {
        id: 'craft-pulse',
        title: 'Craft Pulse',
        icon: Clock,
        href: '/guildutilities/craft-pulse',
        accentColor: '#ec4899',
        glowColor: 'rgba(236, 72, 153, 0.22)',
        borderColor: 'rgba(236, 72, 153, 0.35)',
        isInternal: true,
        subtitle: { en: 'Crafting Timer', pt: 'Timer de Crafting' },
        description: {
            pt: 'Timer operacional minimalista voltado para eficiência de crafting raro.',
            en: 'Minimalist operational timer optimized for rare crafting efficiency.',
        },
    },
];

const ONLINE_COUNT = TOOLS.filter(t => !t.isInternal && t.status !== 'coming-soon').length;

const FILTER_TABS: { key: FilterType; en: string; pt: string }[] = [
    { key: 'all',       en: 'All',         pt: 'Todas'       },
    { key: 'ecosystem', en: 'Ecosystem',   pt: 'Ferramentas' },
    { key: 'utilities', en: 'Utilities',   pt: 'Utilitários' },
];

export function GuildUtilitiesPage() {
    const { lang, setLang, t } = useLanguage();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');

    const filtered = TOOLS.filter(tool => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'ecosystem' && !tool.isInternal) ||
            (filter === 'utilities' && !!tool.isInternal);

        const desc = lang === 'pt' ? tool.description.pt : tool.description.en;
        const sub  = lang === 'pt' ? tool.subtitle.pt    : tool.subtitle.en;
        const query = search.toLowerCase().trim();
        const matchesSearch =
            !query ||
            tool.title.toLowerCase().includes(query) ||
            desc.toLowerCase().includes(query) ||
            sub.toLowerCase().includes(query);

        return matchesFilter && matchesSearch;
    });

    return (
        <div className={styles.page}>
            <AgHeader
                variant="default"
                currentToolId="portal-v2"
                LinkComponent={NavLink}
                logo={<img src="/logo-sm.webp" alt="A Guilda" className="h-8 w-auto opacity-90" />}
                extraModules={
                    <LanguageSwitch
                        lang={lang}
                        onLanguageChange={(l: any) => setLang(l)}
                        styles={agStyles}
                    />
                }
            />

            <main className="flex-1 py-12">
                <div className="container mx-auto max-w-[var(--spacing-measure-wide)] px-6">

                    {/* ── PAGE HEADER ─────────────────────────────────────────── */}
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--color-wurm-accent)]/10 flex items-center justify-center">
                                <Wrench size={20} className="text-[var(--color-wurm-accent)]" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-gradient m-0">
                                {t('Tools Hub', 'Central de Ferramentas')}
                            </h1>
                        </div>
                        <p className="text-sm text-[var(--color-wurm-muted)] leading-relaxed max-w-xl mt-3 m-0">
                            {t(
                                'All A Guilda tools and local utilities in one place. Filter, search and access directly.',
                                'Todas as ferramentas e utilitários da A Guilda em um só lugar. Filtre, pesquise e acesse direto.'
                            )}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest mt-4">
                            <span className="flex items-center gap-1.5 text-green-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                {ONLINE_COUNT} {t('Systems Online', 'Sistemas Online')}
                            </span>
                            <span className="opacity-20">|</span>
                            <span>{TOOLS.length} {t('Tools Total', 'Ferramentas no Total')}</span>
                        </div>
                    </header>

                    {/* ── SEARCH + FILTERS ────────────────────────────────────── */}
                    <div className="mb-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        {/* Search input */}
                        <div className="relative flex-1 max-w-sm">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-wurm-muted)] pointer-events-none"
                            />
                            <input
                                id="tools-search"
                                type="text"
                                placeholder={t('Search tools...', 'Buscar ferramentas...')}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-[var(--color-wurm-panel)] border border-[var(--color-wurm-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--color-wurm-muted)] focus:outline-none focus:border-[var(--color-wurm-accent)]/50 transition-colors"
                            />
                        </div>

                        {/* Filter tabs */}
                        <div className="flex items-center gap-1 glass-panel rounded-xl p-1 shrink-0">
                            {FILTER_TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    id={`filter-${tab.key}`}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                                        filter === tab.key
                                            ? 'bg-[var(--color-wurm-accent)] text-black'
                                            : 'text-[var(--color-wurm-muted)] hover:text-white'
                                    }`}
                                >
                                    {lang === 'pt' ? tab.pt : tab.en}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── TOOLS GRID ──────────────────────────────────────────── */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-24 text-[var(--color-wurm-muted)]">
                            <p className="text-5xl mb-4">🔍</p>
                            <p className="text-sm font-mono">
                                {t('No tools found for', 'Nenhuma ferramenta encontrada para')}
                                {' '}<span className="text-white">"{search}"</span>
                            </p>
                            <button
                                onClick={() => { setSearch(''); setFilter('all'); }}
                                className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-wurm-accent)] hover:brightness-125 transition-all"
                            >
                                {t('Clear filters →', 'Limpar filtros →')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map(tool => (
                                <div
                                    key={tool.id}
                                    onClick={() => trackToolClick(tool.id)}
                                    className={`${styles.toolCardWrapper} ${tool.featured ? 'md:col-span-2' : ''}`}
                                    style={{
                                        '--tool-glow':   tool.glowColor,
                                        '--tool-border': tool.borderColor,
                                    } as React.CSSProperties}
                                >
                                    <ToolWidget
                                        title={tool.title}
                                        subtitle={lang === 'pt' ? tool.subtitle.pt : tool.subtitle.en}
                                        icon={tool.icon}
                                        href={tool.href}
                                        status={tool.status ?? 'active'}
                                        accentColor={tool.accentColor}
                                        className={styles.toolCard}
                                    >
                                        <div className="flex flex-col gap-3 h-full">
                                            {/* LIVE badge — reserved for future live tools */}
                                            {tool.isLive && (
                                                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest w-fit px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    {t('Live Data Feed', 'Dados em Tempo Real')}
                                                </span>
                                            )}
                                            {/* Powered by Archive — Market Observatory */}
                                            {tool.poweredBy && (
                                                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest w-fit px-2 py-1 rounded-md bg-[#c9a84c]/10 border border-[#c9a84c]/25 text-[#c9a84c]">
                                                    <ScrollText size={10} />
                                                    {t(`Powered by ${tool.poweredBy}`, `Alimentado pelo ${tool.poweredBy}`)}
                                                </span>
                                            )}
                                            {/* Archive badge — Historical Archive */}
                                            {tool.isArchive && (
                                                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest w-fit px-2 py-1 rounded-md bg-[#c9a84c]/10 border border-[#c9a84c]/25 text-[#c9a84c]">
                                                    <ScrollText size={10} />
                                                    {t('Source · Powers Market Observatory', 'Fonte · Alimenta o Market Observatory')}
                                                </span>
                                            )}
                                            <p className="text-xs text-[var(--color-wurm-muted)] m-0 leading-relaxed flex-1">
                                                {lang === 'pt' ? tool.description.pt : tool.description.en}
                                            </p>
                                            {/* Local badge — Craft Pulse */}
                                            {tool.isInternal && (
                                                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--color-wurm-muted)] bg-white/5 border border-white/10 px-2 py-1 rounded-md w-fit">
                                                    <span className="w-1 h-1 rounded-full bg-pink-400 animate-pulse" />
                                                    {t('Runs locally · No redirect', 'Roda localmente · Sem redirect')}
                                                </span>
                                            )}
                                        </div>
                                    </ToolWidget>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── FOOTER NAV ──────────────────────────────────────────── */}
                    <div className="mt-14 pt-6 border-t border-[var(--color-wurm-border)]/30">
                        <NavLink
                            to="/"
                            className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-wurm-muted)] hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            ← {t('Back to Hub', 'Voltar para o Hub')}
                        </NavLink>
                    </div>

                </div>
            </main>

            <footer className="py-10 border-t border-[var(--color-wurm-border)]/30 mt-4">
                <div className="container mx-auto px-6 text-center text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest">
                    A Guilda · {new Date().getFullYear()} · Wurm Online
                </div>
            </footer>
        </div>
    );
}
