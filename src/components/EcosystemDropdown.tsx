import { useState, useRef, useEffect } from 'react';
import { Network, Home, BookOpen, Pickaxe, LineChart, BookMarked, Hammer, Shield, Gavel } from 'lucide-react';
import './EcosystemDropdown.css';

// ─────────────────────────────────────────────────────────────
// CANONICAL ECOSYSTEM DROPDOWN — A Guilda (Hub Version)
// Template de referência para todos os projetos do ecossistema.
// Ao replicar em outro projeto, altere apenas `CURRENT_TOOL`.
// ─────────────────────────────────────────────────────────────

const ECOSYSTEM_TOOLS = [
    {
        id: 'portal',
        label: 'Portal',
        href: 'https://wurm-aguild-site.pages.dev',
        icon: Home,
    },
    {
        id: 'analytics',
        label: 'Analytics',
        href: 'https://wurm-analytics-journal.pages.dev',
        icon: LineChart,
    },
    {
        id: 'recipes',
        label: 'Receitas',
        href: 'https://wurm-recipe-tool.pages.dev',
        icon: BookOpen,
    },
    {
        id: 'mining',
        label: 'Mineração',
        href: 'https://wurm-mining-tool.pages.dev',
        icon: Pickaxe,
    },
    {
        id: 'liturgy',
        label: 'Liturgy',
        href: 'https://wurm-liturgy.pages.dev',
        icon: BookMarked,
    },
    {
        id: 'carpentry',
        label: 'Carpentry',
        href: 'https://wurm-carpentry-tool.pages.dev',
        icon: Hammer,
    },
    {
        id: 'auction',
        label: 'Leilões',
        href: 'https://wurm-auction-helper.pages.dev',
        icon: Gavel,
    },
    {
        id: 'badges',
        label: 'Guilda Badges',
        href: 'https://wurm-aguilda-badges.pages.dev',
        icon: Shield,
    },
] as const;

// ← Change this to the id of the current project
const CURRENT_TOOL = 'portal';

export default function EcosystemDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative-container">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                title="Ecossistema A Guilda"
                className={`nav-item ${isOpen ? 'active' : ''}`}
            >
                <Network size={18} />
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">ECOSSISTEMA</div>
                    {ECOSYSTEM_TOOLS.map(({ id, label, href, icon: Icon }) => {
                        const isCurrent = id === CURRENT_TOOL;
                        return isCurrent ? (
                            <div key={id} className="dropdown-item active">
                                <Icon size={14} /> {label}
                                <span className="dropdown-here-label">aqui</span>
                            </div>
                        ) : (
                            <a key={id} href={href} className="dropdown-item">
                                <Icon size={14} /> {label}
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
