import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ScrollText, Clock } from 'lucide-react';
import { getOpenOrders, type ServiceOrder } from '../../services/hubMural';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../ecosystem/ToolWidget';

function relativeTime(dateStr: string, lang: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (lang === 'pt') {
        if (mins < 1) return 'agora';
        if (mins < 60) return `${mins}min atrás`;
        if (hours < 24) return `${hours}h atrás`;
        return `${days}d atrás`;
    } else {
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
}

export function MuralWidget({ className }: { className?: string }) {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { lang, t } = useLanguage();

    useEffect(() => {
        getOpenOrders(6).then(data => { setOrders(data); setLoading(false); });
    }, []);

    return (
        <ToolWidget
            title={
                <span className="flex items-center gap-2">
                    {t('Mural', 'Mural')}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </span>
            }
            subtitle={t('Open Orders', 'Ordens Abertas')}
            icon={ScrollText}
            accentColor="#9ab09a"
            className={className}
        >
            {loading ? (
                <div className="space-y-2 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-5 bg-white/5 rounded" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-[var(--color-wurm-muted)] leading-relaxed m-0">
                        {t(
                            'No open orders at the moment. New orders posted by the admin will appear here.',
                            'Nenhuma ordem aberta no momento. Novas ordens publicadas pelo admin aparecerão aqui.'
                        )}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col divide-y divide-white/[0.04]">
                    {orders.map(order => (
                        <div key={order.id} className="flex items-center gap-2 py-1.5 text-[10px] font-mono">
                            {/* Intent indicator */}
                            <span className={`flex items-center gap-0.5 font-bold flex-shrink-0 ${
                                order.intent === 'buy' ? 'text-red-400' : 'text-green-400'
                            }`}>
                                {order.intent === 'buy'
                                    ? <ArrowDown size={10} />
                                    : <ArrowUp size={10} />
                                }
                                {order.intent === 'buy' ? 'BUY' : 'SELL'}
                            </span>

                            {/* Provider */}
                            <span className="text-[var(--color-wurm-muted)] flex-shrink-0 w-14 truncate">
                                {order.provider}
                            </span>

                            {/* Item */}
                            <span className="text-white flex-1 truncate">{order.title}</span>

                            {/* Price */}
                            <span className="text-[#9ab09a] flex-shrink-0 font-bold">
                                {order.price}
                            </span>

                            {/* Relative time */}
                            <span className="text-[var(--color-wurm-muted)] flex-shrink-0 flex items-center gap-0.5 opacity-60">
                                <Clock size={8} />
                                {relativeTime(order.created_at, lang)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </ToolWidget>
    );
}
