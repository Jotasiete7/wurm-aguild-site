import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ScrollText } from 'lucide-react';
import { getOpenOrders, type ServiceOrder } from '../../services/hubMural';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../ecosystem/ToolWidget';

export function MuralWidget() {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        getOpenOrders(6).then(data => { setOrders(data); setLoading(false); });
    }, []);

    return (
        <ToolWidget
            title={t('Mural', 'Mural')}
            subtitle={t('Open Orders', 'Ordens Abertas')}
            icon={ScrollText}
            href="https://wurm-aguild-site.pages.dev"
            accentColor="#9ab09a"
        >
            {loading ? (
                <div className="space-y-2 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-5 bg-white/5 rounded" />)}
                </div>
            ) : orders.length === 0 ? (
                <p className="text-xs text-[var(--color-wurm-muted)] m-0 italic">
                    {t('No open orders at the moment.', 'Nenhuma ordem aberta no momento.')}
                </p>
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
                            <span className="text-[var(--color-wurm-muted)] flex-shrink-0 w-16 truncate">
                                {order.provider}
                            </span>

                            {/* Item */}
                            <span className="text-white flex-1 truncate">{order.title}</span>

                            {/* Price */}
                            <span className="text-[var(--color-wurm-accent)] flex-shrink-0 font-bold">
                                {order.price}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </ToolWidget>
    );
}
