import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { getDailyQuote, type HubQuote } from '../../services/hubQuotes';
import { useLanguage } from '../../contexts/LanguageContext';

export function QuoteWidget() {
    const [quote, setQuote] = useState<HubQuote | null>(null);
    const [loading, setLoading] = useState(true);
    const { lang } = useLanguage();

    useEffect(() => {
        getDailyQuote().then(q => { setQuote(q); setLoading(false); });
    }, []);

    const text = quote
        ? (lang === 'pt' ? quote.text_pt : (quote.text_en ?? quote.text_pt))
        : null;

    return (
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 border border-[var(--color-wurm-border)]/50 hover:border-[var(--color-wurm-accent)]/20 transition-colors">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-wurm-muted)]">
                <Quote size={12} className="text-[var(--color-wurm-accent)]" />
                Quote do Dia
            </div>

            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/3 mt-2" />
                </div>
            ) : quote ? (
                <>
                    {/* Opening quote mark */}
                    <p className="text-white font-serif text-lg leading-relaxed m-0 relative pl-4 border-l-2 border-[var(--color-wurm-accent)]/40 italic">
                        {text}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--color-wurm-muted)] m-0 tracking-widest uppercase">
                        — {quote.author}
                    </p>
                </>
            ) : null}
        </div>
    );
}
