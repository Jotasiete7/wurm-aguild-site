import { useEffect, useState } from 'react';
import { LineChart, Eye, ArrowRight } from 'lucide-react';
import { getLatestArticle, getArticleCount, type HubArticle } from '../../services/hubAnalytics';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../ecosystem/ToolWidget';

const CATEGORY_COLORS: Record<string, string> = {
    economy:   '#d4b483',
    politics:  '#60a5fa',
    tutorial:  '#34d399',
    event:     '#f472b6',
    lore:      '#a78bfa',
};

export function AnalyticsWidget() {
    const [article, setArticle] = useState<HubArticle | null>(null);
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const { lang, t } = useLanguage();

    useEffect(() => {
        Promise.all([getLatestArticle(), getArticleCount()]).then(([art, cnt]) => {
            setArticle(art);
            setCount(cnt);
            setLoading(false);
        });
    }, []);

    const title = lang === 'pt'
        ? (article?.title_pt || article?.title_en || '')
        : (article?.title_en || '');

    const excerpt = lang === 'pt'
        ? (article?.excerpt_pt || article?.excerpt_en || '')
        : (article?.excerpt_en || '');

    const accentColor = article ? (CATEGORY_COLORS[article.category] ?? '#d4b483') : '#d4b483';
    const articleUrl = article
        ? `https://wurm-analytics-journal.pages.dev/article/${article.slug}`
        : 'https://wurm-analytics-journal.pages.dev';

    return (
        <ToolWidget
            title="Analytics"
            subtitle={t('Economic Intelligence', 'Inteligência Econômica')}
            icon={LineChart}
            href="https://wurm-analytics-journal.pages.dev"
            className="md:col-span-2 md:row-span-2"
            accentColor={accentColor}
        >
            {loading ? (
                <div className="h-full flex items-end pb-2">
                    <div className="space-y-2 w-full animate-pulse">
                        <div className="h-3 bg-white/5 rounded w-24" />
                        <div className="h-6 bg-white/5 rounded w-full" />
                        <div className="h-6 bg-white/5 rounded w-3/4" />
                        <div className="h-4 bg-white/5 rounded w-full" />
                    </div>
                </div>
            ) : article ? (
                <div className="h-full flex flex-col justify-between">
                    {/* Stats bar */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                            <Eye size={10} />
                            {article.views.toLocaleString()} views
                        </span>
                        <span className="opacity-30">·</span>
                        <span>{count} {t('articles', 'artigos')}</span>
                    </div>

                    {/* Featured article */}
                    <div className="mt-auto">
                        <span
                            className="text-[10px] font-bold uppercase tracking-widest mb-3 block"
                            style={{ color: accentColor }}
                        >
                            {t('Latest Article', 'Último Artigo')} · {article.category}
                        </span>
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-white mb-3 line-clamp-2 border-none pt-0 m-0 leading-tight">
                            {title}
                        </h2>
                        <p className="text-sm text-[var(--color-wurm-muted)] line-clamp-2 m-0 text-left leading-relaxed">
                            {excerpt}
                        </p>
                        <a
                            href={articleUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:gap-3 transition-all"
                            style={{ color: accentColor }}
                        >
                            {t('Read Article', 'Ler Artigo')}
                            <ArrowRight size={12} />
                        </a>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-[var(--color-wurm-muted)] text-sm">
                    {t('No articles published yet.', 'Nenhum artigo publicado ainda.')}
                </div>
            )}
        </ToolWidget>
    );
}
