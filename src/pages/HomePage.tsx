import { NavLink } from 'react-router-dom';
import { Header as AgHeader } from '@ecossistema-guilda/layout/Header';
import { LanguageSwitch } from '@ecossistema-guilda/modules/LanguageSwitch';
import agStyles from '@ecossistema-guilda/layout/Header.module.css';
import { useLanguage } from '../contexts/LanguageContext';
import { Gavel, Activity, Pickaxe, Hammer, BookOpen, BookMarked } from 'lucide-react';

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
import styles from './HomePage.module.css';

export function HomePage() {
    const { lang, setLang, t } = useLanguage();

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
                    <header className="mb-14">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight text-gradient">
                            {t('Ecosystem Hub', 'Hub do Ecossistema')}
                        </h1>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 text-green-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                {t('All systems operational', 'Todos os sistemas operacionais')}
                            </span>
                            <span className="opacity-20">|</span>
                            <span>v2.0 Beta</span>
                        </div>
                    </header>

                    {/* BENTO GRID — MAIN */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* ANALYTICS — real data, large */}
                        <AnalyticsWidget />

                        {/* BADGES — real data */}
                        <BadgesWidget />

                        {/* AUCTIONS */}
                        <ToolWidget
                            title={t('Auctions', 'Leilões')}
                            subtitle={t('Live Marketplace', 'Mercado ao Vivo')}
                            icon={Gavel}
                            href="https://wurm-auction-helper.pages.dev"
                        >
                            <div className="space-y-2.5">
                                <p className="text-[10px] text-[var(--color-wurm-muted)] italic">
                                    {t('Live data coming soon.', 'Dados ao vivo em breve.')}
                                </p>
                                <div className="flex flex-col gap-2 opacity-40">
                                    {['Dragon Scale...', 'Rare Pickaxe', 'Fine Sword'].map((item, i) => (
                                        <div key={i} className="text-[10px] flex justify-between border-b border-white/5 pb-1.5">
                                            <span className="text-[var(--color-wurm-muted)]">{item}</span>
                                            <span className="text-green-500 font-bold">{['12s','5s','8s'][i]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ToolWidget>

                        {/* DEED GALLERY — real data */}
                        <GalleryWidget />

                        {/* COMMUNITY POLL — real data */}
                        <PollWidget />

                        {/* MURAL — Open Orders */}
                        <MuralWidget />

                        {/* RESOURCES — Useful Links */}
                        <ResourcesWidget />

                    </div>

                    {/* SECONDARY TOOLS ROW */}
                    <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { title: 'Mining', icon: Pickaxe, href: 'https://wurm-mining-tool.pages.dev' },
                            { title: 'Carpentry', icon: Hammer, href: 'https://wurm-carpentry-tool.pages.dev' },
                            { title: 'Recipes', icon: BookOpen, href: 'https://wurm-recipe-tool.pages.dev' },
                            { title: 'Liturgy', icon: BookMarked, href: 'https://wurm-liturgy.pages.dev' },
                        ].map(tool => (
                            <ToolWidget
                                key={tool.title}
                                title={tool.title}
                                icon={tool.icon}
                                href={tool.href}
                            >
                                <p className="text-[10px] text-[var(--color-wurm-muted)] uppercase tracking-widest m-0">
                                    {t('Open Tool', 'Acessar Ferramenta')}
                                </p>
                            </ToolWidget>
                        ))}
                    </div>

                    {/* QUOTE DO DIA */}
                    <div className="mt-8">
                        <QuoteWidget />
                    </div>

                    {/* ACTIVITY FEED */}
                    <div className="mt-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity size={16} className="text-[var(--color-wurm-accent)]" />
                            <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] m-0 border-none pt-0 text-[var(--color-wurm-muted)]">
                                {t('Activity Pulse', 'Pulso do Ecossistema')}
                            </h2>
                        </div>
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
