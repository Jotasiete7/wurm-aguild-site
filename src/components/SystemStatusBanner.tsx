import { useEffect, useState } from 'react';
import { Radio, X, AlertTriangle, Info } from 'lucide-react';
import { getActiveStatus, type SystemStatus } from '../services/hubStatus';

const TYPE_CONFIG = {
    info:    { icon: Info,          border: 'border-blue-500/40',   bg: 'bg-blue-500/10',   text: 'text-blue-300',   dot: 'bg-blue-400' },
    warning: { icon: AlertTriangle, border: 'border-amber-500/40',  bg: 'bg-amber-500/10',  text: 'text-amber-300',  dot: 'bg-amber-400' },
    alert:   { icon: Radio,         border: 'border-red-500/40',    bg: 'bg-red-500/10',    text: 'text-red-300',    dot: 'bg-red-400' },
};

export function SystemStatusBanner() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        getActiveStatus().then(setStatus);
    }, []);

    if (!status || dismissed) return null;

    const config = TYPE_CONFIG[status.type as keyof typeof TYPE_CONFIG];
    const Icon = config.icon;

    return (
        <div className={`border-b ${config.border} ${config.bg} px-6 py-2.5`}>
            <div className="container mx-auto max-w-[var(--spacing-measure-wide)] flex items-center gap-3">
                {/* Pulsing dot */}
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse flex-shrink-0`} />
                <Icon size={14} className={`${config.text} flex-shrink-0`} />
                <p className={`text-xs font-mono flex-1 ${config.text} tracking-wide`}>
                    {status.message}
                </p>
                <button
                    onClick={() => setDismissed(true)}
                    className={`${config.text} opacity-50 hover:opacity-100 transition-opacity flex-shrink-0`}
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
