import { NavLink } from 'react-router-dom';
import { Header as AgHeader } from '@ecossistema-guilda/layout/Header';
import { LanguageSwitch } from '@ecossistema-guilda/modules/LanguageSwitch';
import agStyles from '@ecossistema-guilda/layout/Header.module.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Sparkles, RotateCcw } from 'lucide-react';

import { HubSearch } from '../components/search/HubSearch';
import { BentoToolCard } from '../components/ecosystem/BentoToolCard';
import { ECOSYSTEM_TOOLS, type ToolCategory } from '../data/tools';
import { getFeedItems, type HubFeedItem } from '../services/hubFeed';
import styles from './HomePage.module.css';

function getGreeting(lang: string): string {
    const hour = new Date().getHours();
    if (lang === 'pt') {
        if (hour < 12) return 'Bom dia, aventureiro. O quartel-general da Guilda está de pé.';
        if (hour < 18) return 'Boa tarde. Encontre qualquer ferramenta, cálculo ou utilitário da Guilda.';
        return 'Boa noite. A Guilda nunca dorme — explore o ecossistema.';
    } else {
        if (hour < 12) return 'Good morning, adventurer. The Guild HQ is standing.';
        if (hour < 18) return 'Good afternoon. Find any Guild tool, calculator or utility.';
        return 'Good evening. The Guild never sleeps — explore the ecosystem.';
    }
}

export function HomePage() {
    const { lang, setLang, t } = useLanguage();
    const [nextEvent, setNextEvent] = useState<HubFeedItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');

    useEffect(() => {
        // Fetch feed and find the soonest upcoming event
        getFeedItems(20).then(items => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const upcoming = items
                .filter(item => item.type === 'event')
                .find(item => {
                    const d = new Date(item.post_date);
                    d.setHours(0, 0, 0, 0);
                    return d >= today;
                });
            setNextEvent(upcoming ?? null);
        }).catch(() => {
            // Silently fail if feed cannot be fetched
        });
    }, []);

    // Filter tools based on query & category
    const filteredTools = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return ECOSYSTEM_TOOLS.filter(tool => {
            // Category filter
            if (activeCategory !== 'all' && tool.category !== activeCategory) {
                return false;
            }

            // Text search filter
            if (!query) return true;

            const titleMatch = tool.title.toLowerCase().includes(query);
            const subPtMatch = tool.subtitle.pt.toLowerCase().includes(query);
            const subEnMatch = tool.subtitle.en.toLowerCase().includes(query);
            const descPtMatch = tool.description.pt.toLowerCase().includes(query);
            const descEnMatch = tool.description.en.toLowerCase().includes(query);
            const tagMatch = tool.tags.some(tag => tag.toLowerCase().includes(query));

            return titleMatch || subPtMatch || subEnMatch || descPtMatch || descEnMatch || tagMatch;
        });
    }, [searchQuery, activeCategory]);

    // Press Enter to open the first tool match in a new tab
    const handlePressEnter = () => {
        if (filteredTools.length > 0) {
            const firstTool = filteredTools[0];
            window.open(firstTool.href, '_blank', 'noopener,noreferrer');
        }
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        setActiveCategory('all');
    };

    const greeting = getGreeting(lang);

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

            <main className="flex-1 py-10">
                <div className="container mx-auto max-w-[var(--spacing-measure-wide)] px-4 sm:px-6">

                    {/* HERO HEADER */}
                    <header className="text-center mb-6 pt-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-wurm-accent)]/10 border border-[var(--color-wurm-accent)]/20 text-[var(--color-wurm-accent)] text-xs font-mono tracking-wider mb-3">
                            <Sparkles size={13} />
                            <span>{t('PORTAL CENTRAL DA GUILDA', 'GUILD CENTRAL PORTAL')}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-3 tracking-tight text-gradient">
                            {t('Ecosystem Hub', 'Hub do Ecossistema')}
                        </h1>

                        <p className="text-sm md:text-base text-[var(--color-wurm-muted)] m-0 leading-relaxed max-w-xl mx-auto">
                            {greeting}
                        </p>

                        <div className="inline-flex items-center gap-3 text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest mt-3 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.05]">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {t('Todos os sistemas operacionais', 'All systems operational')}
                            </span>
                            <span className="opacity-20">•</span>
                            <span>v2.1 Wurm Online</span>
                        </div>
                    </header>

                    {/* NEXT EVENT BANNER (IF ANY) */}
                    {nextEvent && (() => {
                        const title = lang === 'pt' ? nextEvent.title_pt : (nextEvent.title_en || nextEvent.title_pt);
                        const desc  = lang === 'pt' ? nextEvent.description_pt : (nextEvent.description_en || nextEvent.description_pt);
                        const d = new Date(nextEvent.post_date);
                        const dateStr = d.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
                        const isToday = new Date().toDateString() === d.toDateString();
                        return (
                            <div className="mb-6 glass-panel rounded-2xl p-4 border border-blue-500/20 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <CalendarClock size={20} className="text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400">
                                            {isToday ? (lang === 'pt' ? 'HOJE' : 'TODAY') : (lang === 'pt' ? 'PRÓXIMO EVENTO' : 'NEXT EVENT')}
                                        </span>
                                        <span className="text-[9px] font-mono text-[var(--color-wurm-muted)]">{dateStr}</span>
                                    </div>
                                    <p className="text-sm font-bold text-white m-0 truncate">{title}</p>
                                    <p className="text-xs text-[var(--color-wurm-muted)] m-0 truncate">{desc}</p>
                                </div>
                                {nextEvent.link && (
                                    <a
                                        href={nextEvent.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                                    >
                                        {t('Ver detalhes →', 'Details →')}
                                    </a>
                                )}
                            </div>
                        );
                    })()}

                    {/* CENTRAL GOOGLE-STYLE SEARCH */}
                    <HubSearch
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        totalResults={filteredTools.length}
                        onPressEnter={handlePressEnter}
                    />

                    {/* BENTO GRID OF TOOLS */}
                    <section className="mt-6 mb-12">
                        {(searchQuery || activeCategory !== 'all') && (
                            <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/[0.05]">
                                <span className="text-xs font-mono text-[var(--color-wurm-muted)]">
                                    {t(
                                        `Filtrando por: ${activeCategory !== 'all' ? activeCategory : ''} ${searchQuery ? `"${searchQuery}"` : ''}`,
                                        `Filtering by: ${activeCategory !== 'all' ? activeCategory : ''} ${searchQuery ? `"${searchQuery}"` : ''}`
                                    )}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleResetSearch}
                                    className="flex items-center gap-1.5 text-xs font-mono text-[var(--color-wurm-accent)] hover:underline cursor-pointer"
                                >
                                    <RotateCcw size={12} />
                                    <span>{t('Limpar filtros', 'Clear filters')}</span>
                                </button>
                            </div>
                        )}

                        {filteredTools.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredTools.map((tool) => (
                                    <BentoToolCard key={tool.id} tool={tool} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 glass-panel rounded-2xl border border-dashed border-[var(--color-wurm-border)]">
                                <p className="text-lg font-semibold text-white mb-2">
                                    {t('Nenhuma ferramenta encontrada', 'No tools found')}
                                </p>
                                <p className="text-sm text-[var(--color-wurm-muted)] max-w-md mx-auto mb-6">
                                    {t(
                                        `Não encontramos nada para "${searchQuery}". Tente pesquisar por termos como "minério", "madeira", "culinária", "relic", "badges" ou explore todas as categorias.`,
                                        `We couldn't find anything for "${searchQuery}". Try searching for keywords like "mining", "wood", "cooking", "relic", "badges" or clear filters.`
                                    )}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResetSearch}
                                    className="px-4 py-2 rounded-xl bg-[var(--color-wurm-accent)]/15 border border-[var(--color-wurm-accent)]/40 text-[var(--color-wurm-accent)] text-xs font-semibold uppercase tracking-wider hover:bg-[var(--color-wurm-accent)]/25 transition-all cursor-pointer"
                                >
                                    {t('Ver todas as ferramentas', 'View all tools')}
                                </button>
                            </div>
                        )}
                    </section>

                </div>
            </main>

            <footer className="py-10 border-t border-[var(--color-wurm-border)]/30 mt-12">
                <div className="container mx-auto px-6 text-center text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest">
                    A Guilda · {new Date().getFullYear()} · Wurm Online Hub Central
                </div>
            </footer>
        </div>
    );
}
