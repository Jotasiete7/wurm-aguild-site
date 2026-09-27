import { useEffect, useRef } from 'react';
import { Search, X, Sparkles, Command } from 'lucide-react';
import { CATEGORIES, type ToolCategory } from '../../data/tools';
import { useLanguage } from '../../contexts/LanguageContext';

interface HubSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeCategory: ToolCategory;
    onCategoryChange: (category: ToolCategory) => void;
    totalResults: number;
    onPressEnter?: () => void;
}

export function HubSearch({
    searchQuery,
    onSearchChange,
    activeCategory,
    onCategoryChange,
    totalResults,
    onPressEnter,
}: HubSearchProps) {
    const { lang, t } = useLanguage();
    const inputRef = useRef<HTMLInputElement>(null);

    // Global keyboard shortcut: Ctrl+K or '/' to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== inputRef.current)) {
                e.preventDefault();
                inputRef.current?.focus();
            } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
                if (searchQuery) {
                    onSearchChange('');
                } else {
                    inputRef.current?.blur();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchQuery, onSearchChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onPressEnter) {
            e.preventDefault();
            onPressEnter();
        }
    };

    return (
        <section className="w-full max-w-3xl mx-auto my-6 flex flex-col items-center">
            {/* GOOGLE-STYLE CENTRAL SEARCH BAR */}
            <div className="w-full relative group">
                {/* Glow ring on hover/focus */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-wurm-accent)]/20 via-[var(--color-wurm-accent)]/40 to-[var(--color-wurm-accent)]/20 rounded-2xl blur-md opacity-40 group-focus-within:opacity-100 group-hover:opacity-75 transition duration-500 pointer-events-none" />

                <div className="relative flex items-center w-full bg-[#0d0e11]/95 backdrop-blur-xl border border-[var(--color-wurm-border)] group-focus-within:border-[var(--color-wurm-accent)] rounded-2xl px-5 py-4 shadow-2xl transition-all duration-300">
                    <Search
                        size={22}
                        className="text-[var(--color-wurm-accent)] group-focus-within:text-[var(--color-wurm-accent)] group-focus-within:scale-110 transition-all flex-shrink-0 mr-3.5"
                    />

                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t(
                            'Buscar ferramentas, calculadoras, guias e utilitários da Guilda...',
                            'Search Guild tools, calculators, guides and utilities...'
                        )}
                        className="w-full bg-transparent text-white placeholder-[var(--color-wurm-muted)]/70 text-base md:text-lg outline-none font-sans"
                        autoComplete="off"
                        spellCheck={false}
                    />

                    {/* Clear Button or Shortcut Hint */}
                    {searchQuery ? (
                        <button
                            type="button"
                            onClick={() => {
                                onSearchChange('');
                                inputRef.current?.focus();
                            }}
                            className="p-1 rounded-lg text-[var(--color-wurm-muted)] hover:text-white hover:bg-white/10 transition-colors ml-2"
                            title={t('Limpar busca (Esc)', 'Clear search (Esc)')}
                        >
                            <X size={18} />
                        </button>
                    ) : (
                        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-[var(--color-wurm-muted)] pointer-events-none select-none ml-2">
                            <Command size={11} />
                            <span>K</span>
                        </div>
                    )}
                </div>
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 px-2 w-full">
                {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const label = lang === 'pt' ? cat.label.pt : cat.label.en;

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onCategoryChange(cat.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer ${
                                isActive
                                    ? 'bg-[var(--color-wurm-accent)]/15 border-[var(--color-wurm-accent)] text-[var(--color-wurm-accent)] font-semibold shadow-[0_0_12px_rgba(212,180,131,0.2)]'
                                    : 'bg-white/[0.02] border-[var(--color-wurm-border)]/60 text-[var(--color-wurm-muted)] hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* RESULTS COUNTER & QUICK TIP */}
            <div className="flex items-center justify-between w-full px-2 mt-3 text-[11px] font-mono text-[var(--color-wurm-muted)]">
                <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[var(--color-wurm-accent)]" />
                    <span>
                        {totalResults}{' '}
                        {lang === 'pt'
                            ? totalResults === 1
                                ? 'ferramenta disponível'
                                : 'ferramentas disponíveis'
                            : totalResults === 1
                            ? 'tool available'
                            : 'tools available'}
                    </span>
                </span>

                {searchQuery && (
                    <span className="text-[10px] text-[var(--color-wurm-accent)] opacity-80">
                        {t('Pressione Enter para abrir o 1º resultado', 'Press Enter to open 1st result')} ↵
                    </span>
                )}
            </div>
        </section>
    );
}
