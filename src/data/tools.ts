import type { LucideIcon } from 'lucide-react';
import {
    Pickaxe, Hammer, BookOpen, BookMarked,
    Hourglass, Gem, Shield, Map, LineChart, Clock,
    Telescope, ScrollText, Gavel
} from 'lucide-react';

export type ToolCategory = 'all' | 'crafting' | 'economy' | 'exploration' | 'community' | 'data';

export interface ToolItem {
    id: string;
    title: string;
    category: ToolCategory;
    icon: LucideIcon;
    href: string;
    accentColor: string;
    glowColor: string;
    borderColor: string;
    status?: 'active' | 'maintenance' | 'coming-soon';
    featured?: boolean;
    isExternal?: boolean;
    poweredBy?: string;
    subtitle: { pt: string; en: string };
    description: { pt: string; en: string };
    tags: string[]; // search keywords (in pt & en)
}

export const CATEGORIES: { id: ToolCategory; label: { pt: string; en: string }; icon?: string }[] = [
    { id: 'all',         label: { pt: 'Todas', en: 'All' } },
    { id: 'crafting',    label: { pt: 'Craft & Ofícios', en: 'Crafting & Skills' } },
    { id: 'economy',     label: { pt: 'Economia & Trade', en: 'Economy & Trade' } },
    { id: 'exploration', label: { pt: 'Mapas & Minas', en: 'Maps & Mining' } },
    { id: 'community',   label: { pt: 'Comunidade', en: 'Community' } },
    { id: 'data',        label: { pt: 'Histórico & Dados', en: 'History & Data' } },
];

export const ECOSYSTEM_TOOLS: ToolItem[] = [
    // ─── FEATURED / ESSENCIAIS ────────────────────────────────────────────────
    {
        id: 'relic-appraiser',
        title: 'Relic Appraiser',
        category: 'economy',
        icon: Gem,
        href: 'https://wurm-relic-appraiser.pages.dev',
        accentColor: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.25)',
        borderColor: 'rgba(6, 182, 212, 0.40)',
        featured: true,
        isExternal: true,
        subtitle: { pt: 'Relíquias e Itens Raros', en: 'Relics & Rare Items' },
        description: {
            pt: 'Avalie, compare e precifique relíquias, armas e itens raros do Wurm Online com base em qualidade e atributos.',
            en: 'Appraise, compare and value Wurm relics, weapons, and rare items based on quality and stats.',
        },
        tags: ['relic', 'raro', 'rare', 'appraiser', 'preco', 'price', 'valor', 'avaliacao', 'arma', 'armadura'],
    },
    {
        id: 'market-observatory',
        title: 'Market Observatory',
        category: 'economy',
        icon: Telescope,
        href: 'https://wurm-market-observatory.pages.dev',
        accentColor: '#00d4aa',
        glowColor: 'rgba(0, 212, 170, 0.25)',
        borderColor: 'rgba(0, 212, 170, 0.40)',
        isExternal: true,
        poweredBy: 'Historical Archive',
        subtitle: { pt: 'Arqueologia Econômica', en: 'Economic Archaeology' },
        description: {
            pt: 'Plataforma analítica com dados reais de comércio histórico. Trata os logs de mercado como dados arqueológicos comprovados.',
            en: 'Analytical platform for historical Wurm Online trade logs. Proven trade archaeology from real game logs.',
        },
        tags: ['mercado', 'market', 'observatorio', 'comercio', 'trade', 'economia', 'historico', 'moedas', 'coins'],
    },
    {
        id: 'historical-archive',
        title: 'Historical Archive',
        category: 'data',
        icon: ScrollText,
        href: 'https://wurm-online-historical-archive.pages.dev',
        accentColor: '#c9a84c',
        glowColor: 'rgba(201, 168, 76, 0.25)',
        borderColor: 'rgba(201, 168, 76, 0.38)',
        isExternal: true,
        subtitle: { pt: 'Arquivo Histórico Imutável', en: 'Digital Archaeology Archive' },
        description: {
            pt: 'Preservação imutável de logs e eventos históricos de Wurm Online antes que se percam no tempo.',
            en: 'Immutable preservation of Wurm Online historical logs and artifacts before they are lost forever.',
        },
        tags: ['arquivo', 'archive', 'historico', 'logs', 'preservacao', 'arqueologia', 'dados'],
    },
    {
        id: 'badges',
        title: 'Guilda Badges',
        category: 'community',
        icon: Shield,
        href: 'https://wurm-aguilda-badges.pages.dev',
        accentColor: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.25)',
        borderColor: 'rgba(239, 68, 68, 0.40)',
        isExternal: true,
        subtitle: { pt: 'Mural de Conquistas & Insígnias', en: 'Guild Achievements Board' },
        description: {
            pt: 'Galeria de medalhas, títulos honoríficos e conquistas exclusivas dos membros ativos da Guilda.',
            en: 'Showcase of badges, medals, and unique achievements attained by guild members.',
        },
        tags: ['badges', 'conquistas', 'medalhas', 'achievements', 'titulos', 'honra', 'membros', 'guilda'],
    },

    // ─── CRAFTING & SKILLS ────────────────────────────────────────────────────
    {
        id: 'mining',
        title: 'Mining Calculator',
        category: 'crafting',
        icon: Pickaxe,
        href: 'https://wurm-mining-tool.pages.dev',
        accentColor: '#d97706',
        glowColor: 'rgba(217, 119, 6, 0.25)',
        borderColor: 'rgba(217, 119, 6, 0.38)',
        isExternal: true,
        subtitle: { pt: 'Mineração & Veias', en: 'Ore & Extraction Tool' },
        description: {
            pt: 'Calcule velocidade de escavação, pureza do minério, veias subterrâneas e rendimento por nível de skill.',
            en: 'Calculate excavation speed, ore purity, underground veins, and yield per skill level.',
        },
        tags: ['mineracao', 'mining', 'minerio', 'ore', 'ferro', 'iron', 'cobre', 'copper', 'ouro', 'gold', 'veia', 'vein'],
    },
    {
        id: 'carpentry',
        title: 'Carpentry Planner',
        category: 'crafting',
        icon: Hammer,
        href: 'https://wurm-carpentry-tool.pages.dev',
        accentColor: '#b45309',
        glowColor: 'rgba(180, 83, 9, 0.25)',
        borderColor: 'rgba(180, 83, 9, 0.38)',
        isExternal: true,
        subtitle: { pt: 'Planejador de Marcenaria', en: 'Woodworking & Grind' },
        description: {
            pt: 'Lista de materiais, cálculo de tábuas/pregos e otimização de rotas de grind para marcenaria.',
            en: 'Material planner, plank/nail requirements, and optimal carpentry grind paths.',
        },
        tags: ['marcenaria', 'carpentry', 'madeira', 'wood', 'tabua', 'plank', 'craft', 'grind', 'construcao'],
    },
    {
        id: 'recipes',
        title: 'Cooking & Recipes',
        category: 'crafting',
        icon: BookOpen,
        href: 'https://wurm-recipe-tool.pages.dev',
        accentColor: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        borderColor: 'rgba(16, 185, 129, 0.38)',
        isExternal: true,
        subtitle: { pt: 'Receitas & Culinária', en: 'Cooking Guide & Buffs' },
        description: {
            pt: 'Banco de dados de receitas culinárias, ingredientes, complexidade e bônus de afinidade/nutrição.',
            en: 'Culinary recipes database, ingredients, complexity, and nutrition/affinity buffs.',
        },
        tags: ['culinaria', 'cooking', 'receitas', 'recipes', 'comida', 'food', 'buff', 'nutricao', 'ingredientes'],
    },
    {
        id: 'liturgy',
        title: 'Liturgy & Priests',
        category: 'crafting',
        icon: BookMarked,
        href: 'https://wurm-liturgy.pages.dev',
        accentColor: '#6366f1',
        glowColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: 'rgba(99, 102, 241, 0.38)',
        isExternal: true,
        subtitle: { pt: 'Favores, Rituais & Magias', en: 'Priest Planner & Favors' },
        description: {
            pt: 'Planejador para sacerdotes: regeneração de favor divino, tempos de recarga e custo de magias.',
            en: 'Priest helper: divine favor regeneration, ritual cooldowns, and spell favor costs.',
        },
        tags: ['liturgy', 'liturgia', 'sacerdote', 'priest', 'deus', 'god', 'magia', 'spell', 'favor', 'fo', 'vynora', 'magranon', 'libila'],
    },
    {
        id: 'craft-pulse',
        title: 'Craft Pulse Timer',
        category: 'crafting',
        icon: Clock,
        href: '/guildutilities/craft-pulse',
        accentColor: '#ec4899',
        glowColor: 'rgba(236, 72, 153, 0.25)',
        borderColor: 'rgba(236, 72, 153, 0.38)',
        isExternal: false,
        subtitle: { pt: 'Timer Operacional', en: 'Operational Crafting Timer' },
        description: {
            pt: 'Timer e alarme sonoro de precisão para spam de itens raros e sincronização de ações sem fadiga.',
            en: 'Precision timer and audio chimes for rare item craft spam and fatigue-free synchronization.',
        },
        tags: ['timer', 'craft', 'pulse', 'relogio', 'raro', 'spam', 'alarme', 'tempo', 'acao'],
    },

    // ─── EXPLORATION & MAPS ───────────────────────────────────────────────────
    {
        id: 'prospect',
        title: 'Prospect Mapper',
        category: 'exploration',
        icon: Map,
        href: 'https://wurm-prospect-tool.pages.dev',
        accentColor: '#22c55e',
        glowColor: 'rgba(34, 197, 94, 0.25)',
        borderColor: 'rgba(34, 197, 94, 0.38)',
        isExternal: true,
        subtitle: { pt: 'Mapeamento de Mina & Veias', en: 'Mine Vein Mapper' },
        description: {
            pt: 'Registre suas prospecções e gere o mapa 2D da disposição exata das veias de minério na sua mina.',
            en: 'Log prospecting readings and generate a 2D map of ore veins inside your mine tunnels.',
        },
        tags: ['prospect', 'prospeccao', 'mapa', 'map', 'mina', 'mine', 'veia', 'tunel', 'coordenadas'],
    },
    {
        id: 'wall-decay',
        title: 'Wall Decay & Upkeep',
        category: 'exploration',
        icon: Hourglass,
        href: 'https://wurm-wall-decay-calculator.pages.dev',
        accentColor: '#f43f5e',
        glowColor: 'rgba(244, 63, 94, 0.25)',
        borderColor: 'rgba(244, 63, 94, 0.38)',
        isExternal: true,
        subtitle: { pt: 'Decaimento & Upkeep de Deeds', en: 'Structure Decay & Deed Upkeep' },
        description: {
            pt: 'Previsão de quanto tempo estruturas fora de deed duram antes de cair e cálculo de manutenção financeira.',
            en: 'Calculate decay time of walls/fences outside deed and estimate upkeep drainage costs.',
        },
        tags: ['deed', 'upkeep', 'decay', 'queda', 'muralha', 'wall', 'manutencao', 'moedas', 'tempo'],
    },

    // ─── ECONOMY & DATA ───────────────────────────────────────────────────────
    {
        id: 'analytics',
        title: 'Ecosystem Analytics',
        category: 'data',
        icon: LineChart,
        href: 'https://wurm-analytics-journal.pages.dev',
        accentColor: '#3b82f6',
        glowColor: 'rgba(59, 130, 246, 0.25)',
        borderColor: 'rgba(59, 130, 246, 0.38)',
        isExternal: true,
        subtitle: { pt: 'Jornal & Inteligência Econômica', en: 'Ecosystem Economic Intel' },
        description: {
            pt: 'Relatórios, tendências de mercado e métricas operacionais consolidadas de Wurm Online.',
            en: 'Market reports, economic trends, and operational metrics across the ecosystem.',
        },
        tags: ['analytics', 'graficos', 'estatisticas', 'jornal', 'dados', 'economia', 'guilda'],
    },
    {
        id: 'auction',
        title: 'Auction House Helper',
        category: 'economy',
        icon: Gavel,
        href: 'https://wurm-auction-helper.pages.dev',
        accentColor: '#eab308',
        glowColor: 'rgba(234, 179, 8, 0.25)',
        borderColor: 'rgba(234, 179, 8, 0.38)',
        status: 'coming-soon',
        isExternal: true,
        subtitle: { pt: 'Auxiliar de Leilões', en: 'Live Auction Helper' },
        description: {
            pt: 'Assistente para criação de lotes, cálculo de taxas e acompanhamento de lances no fórum e in-game.',
            en: 'Auction lot assistant, fee calculations, and bid tracking for forum and in-game auctions.',
        },
        tags: ['leilao', 'auction', 'venda', 'compra', 'lances', 'bids', 'comercio'],
    },
];
