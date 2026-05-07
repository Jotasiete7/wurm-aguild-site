import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { getLatestBadges, getBadgeCount, getRarityColor, type HubBadge } from '../../services/hubBadges';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../ecosystem/ToolWidget';

export function BadgesWidget() {
    const [badges, setBadges] = useState<HubBadge[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        Promise.all([getLatestBadges(10), getBadgeCount()]).then(([b, c]) => {
            setBadges(b);
            setCount(c);
            setLoading(false);
        });
    }, []);

    return (
        <ToolWidget
            title="Badges"
            subtitle={t('Guild Achievements', 'Conquistas da Guilda')}
            icon={Shield}
            href="https://wurm-aguilda-badges.pages.dev"
        >
            {loading ? (
                <div className="flex gap-2 flex-wrap animate-pulse">
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <div key={i} className="w-12 h-12 rounded-lg bg-white/5" />
                    ))}
                </div>
            ) : badges.length > 0 ? (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-1.5 flex-wrap">
                        {badges.map(badge => (
                            <div
                                key={badge.id}
                                className="relative group/badge"
                                title={`${badge.name} · ${badge.rarity}`}
                            >
                                <div
                                    className="w-12 h-12 rounded-lg overflow-hidden border transition-all duration-300 hover:scale-125 hover:z-10"
                                    style={{ borderColor: getRarityColor(badge.rarity) + '40' }}
                                >
                                    <img
                                        src={badge.image_url}
                                        alt={badge.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                {/* Rarity dot */}
                                <div
                                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black shadow-[0_0_4px_currentColor]"
                                    style={{ backgroundColor: getRarityColor(badge.rarity), color: getRarityColor(badge.rarity) }}
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest">
                        {count} {t('total badges', 'badges no total')}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-[var(--color-wurm-muted)]">
                    {t('No badges yet.', 'Nenhuma badge ainda.')}
                </p>
            )}
        </ToolWidget>
    );
}
