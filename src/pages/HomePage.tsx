import { NavLink } from 'react-router-dom';
import { Header as AgHeader } from '@ecossistema-guilda/layout/Header';
import { LanguageSwitch } from '@ecossistema-guilda/modules/LanguageSwitch';
import agStyles from '@ecossistema-guilda/layout/Header.module.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { Gavel, Activity, Pickaxe, Hammer, BookOpen, BookMarked, CalendarClock } from 'lucide-react';

import { AnalyticsWidget } from '../components/widgets/AnalyticsWidget';
import { BadgesWidget } from '../components/widgets/BadgesWidget';
import { PollWidget } from '../components/widgets/PollWidget';
import { GalleryWidget } from '../components/widgets/GalleryWidget';
import { MuralWidget } from '../components/widgets/MuralWidget';
import { ResourcesWidget } from '../components/widgets/ResourcesWidget';
import { ToolWidget } from '../components/ecosystem/ToolWidget';
import { EcosystemFeed } from '../components/ecosystem/EcosystemFeed';
import { SystemStatusBanner } from '../components/SystemStatusBanner';
import { QuoteWidget } from '../components/widgets/QuoteWidget';
import { getFeedItems, type HubFeedItem } from '../services/hubFeed';
import styles from './HomePage.module.css';

function getGreeting(lang: string): string {
    const hour = new Date().getHours();
    if (lang === 'pt') {
        if (hour < 12) return 'Bom dia, aventureiro. O quartel-general da Guilda está de pé.';
        if (hour < 18) return 'Boa tarde. O que a Guilda tem pra você hoje?';
        return 'Boa noite. A Guilda nunca dorme — o hub está no ar.';
    } else {
        if (hour < 12) return 'Good morning, adventurer. The Guild HQ is standing.';
        if (hour < 18) return 'Good afternoon. What does the Guild have for you today?';
        return 'Good evening. The Guild never sleeps — hub is live.';
    }
}

const TOOL_DESCRIPTIONS: Record<string, { pt: string; en: string }> = {
    Mining:    { pt: 'Calcule minério, veias e qualidade por habilidade', en: 'Ore, veins & quality calculator' },
    Carpentry: { pt: 'Planejar itens, materiais e grind de marcenaria', en: 'Plan items, materials & carpentry grind' },
    Recipes:   { pt: 'Encontre receitas e ingredientes de culinária', en: 'Find cooking recipes & ingredients' },
    Liturgy:   { pt: 'Rezas, favores e rituais de sacerdotes', en: 'Prayers, favors & priest rituals' },
};

export function HomePage() {
    const { lang, setLang, t } = useLanguage();
    const [nextEvent, setNextEvent] = useState<HubFeedItem | null>(null);

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
        });
    }, []);

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

            {/* GLOBAL STATUS BANNER — Visible to all */}
            <SystemStatusBanner />

            <main className="flex-1 py-12">
                <div className="container mx-auto max-w-[var(--spacing-measure-wide)] px-6">

                    {/* PAGE HEADER */}
                    <header className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 tracking-tight text-gradient">
                            {t('Ecosystem Hub', 'Hub do Ecossistema')}
                        </h1>
                        <p className="text-sm text-[var(--color-wurm-muted)] m-0 leading-relaxed max-w-xl">
                            {greeting}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest mt-3">
                            <span className="flex items-center gap-1.5 text-green-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                {t('All systems operational', 'Todos os sistemas operacionais')}
                            </span>
                            <span className="opacity-20">|</span>
                            <span>v2.0 Beta</span>
                        </div>
                    </header>

                    {/* NEXT EVENT BANNER */}
                    {nextEvent && (() => {
                        const title = lang === 'pt' ? nextEvent.title_pt : (nextEvent.title_en || nextEvent.title_pt);
                        const desc  = lang === 'pt' ? nextEvent.description_pt : (nextEvent.description_en || nextEvent.description_pt);
                        const d = new Date(nextEvent.post_date);
                        const dateStr = d.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
                        const isToday = new Date().toDateString() === d.toDateString();
                        return (
                            <div className="mb-8 glass-panel rounded-2xl p-4 border border-blue-500/20 flex items-center gap-4">
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
                                        rel="noreferrer"
                                        className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                                    >
                                        {t('Details →', 'Ver detalhes →')}
                                    </a>
                                )}
                            </div>
                        );
                    })()}

                    {/* BENTO GRID — MAIN */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 grid-flow-row-dense">

                        {/* ROW 1: Analytics (2 cols) + Badges (1 col) */}
                        <AnalyticsWidget className="md:col-span-2" />
                        <BadgesWidget />

                        {/* ROW 2: Mural (2 cols) + Gallery (1 col) */}
                        <MuralWidget className="md:col-span-2" />
                        <GalleryWidget />

                        {/* ROW 3: Poll (1 col) + Resources (1 col) + Auctions (1 col) */}
                        <PollWidget />
                        <ResourcesWidget />

                        <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <ToolWidget
                                title={t('Auctions', 'Leilões')}
                                subtitle={t('Live Marketplace', 'Mercado ao Vivo')}
                                icon={Gavel}
                                href="https://wurm-auction-helper.pages.dev"
                                status="coming-soon"
                            >
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm text-[var(--color-wurm-muted)] leading-relaxed m-0">
                                        {t(
                                            'Soon you\'ll see live buy & sell orders from guild members here.',
                                            'Em breve você verá ordens de compra e venda ao vivo dos membros da Guilda aqui.'
                                        )}
                                    </p>
                                    <a
                                        href="https://wurm-auction-helper.pages.dev"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-wurm-accent)] hover:brightness-125 transition-all inline-flex items-center gap-1.5"
                                    >
                                        {t('Open Auction Helper →', 'Acessar Ferramenta de Leilões →')}
                                    </a>
                                </div>
                            </ToolWidget>
                        </div>

                    </div>

                    {/* SECONDARY TOOLS ROW */}
                    <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {([
                            { title: 'Mining',    icon: Pickaxe,    href: 'https://wurm-mining-tool.pages.dev' },
                            { title: 'Carpentry', icon: Hammer,     href: 'https://wurm-carpentry-tool.pages.dev' },
                            { title: 'Recipes',   icon: BookOpen,   href: 'https://wurm-recipe-tool.pages.dev' },
                            { title: 'Liturgy',   icon: BookMarked, href: 'https://wurm-liturgy.pages.dev' },
                        ] as const).map(tool => {
                            const desc = TOOL_DESCRIPTIONS[tool.title];
                            return (
                                <ToolWidget
                                    key={tool.title}
                                    title={tool.title}
                                    icon={tool.icon}
                                    href={tool.href}
                                >
                                    <p className="text-xs text-[var(--color-wurm-muted)] m-0 leading-relaxed">
                                        {lang === 'pt' ? desc.pt : desc.en}
                                    </p>
                                </ToolWidget>
                            );
                        })}
                    </div>

                    {/* QUOTE DO DIA */}
                    <div className="mt-8">
                        <QuoteWidget />
                    </div>

                    {/* ACTIVITY FEED — rendered by EcosystemFeed itself (includes its own heading) */}
                    <div className="mt-4">
                        <EcosystemFeed />
                    </div>

                </div>
            </main>

            <footer className="py-10 border-t border-[var(--color-wurm-border)]/30 mt-16">
                <div className="container mx-auto px-6 text-center text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest">
                    A Guilda · {new Date().getFullYear()} · Wurm Online
                </div>
            </footer>
        </div>
    );
}


