import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ToolWidgetProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  status?: 'active' | 'maintenance' | 'coming-soon';
  href: string;
  children?: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function ToolWidget({
  title,
  subtitle,
  icon: Icon,
  status = 'active',
  href,
  children,
  className = '',
  accentColor = 'var(--color-wurm-accent)'
}: ToolWidgetProps) {
  const statusConfig = {
    active: { label: 'Online', color: 'text-green-500', bg: 'bg-green-500/10' },
    maintenance: { label: 'Manutenção', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    'coming-soon': { label: 'Em breve', color: 'text-blue-500', bg: 'bg-blue-500/10' }
  };

  const config = statusConfig[status];

  return (
    <div 
      className={`glass-panel rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,180,131,0.05)] hover:border-[var(--color-wurm-accent)]/30 ${className}`}
      style={{ '--widget-accent': accentColor } as React.CSSProperties}
    >
      {/* Header */}
      <div className="p-5 flex items-start justify-between border-b border-[var(--color-wurm-border)]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--widget-accent)]/10 flex items-center justify-center text-[var(--widget-accent)] group-hover:scale-110 transition-transform">
            <Icon size={22} />
          </div>
          <div>
            <h3 className="text-white font-bold m-0 border-none pt-0 leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-[var(--color-wurm-muted)] uppercase tracking-widest mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${config.bg} ${config.color}`}>
          {config.label}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 relative overflow-hidden">
        {children}
      </div>

      {/* Footer / Action */}
      <a 
        href={href}
        target={href.startsWith('http') ? '_blank' : '_self'}
        rel="noreferrer"
        className="px-5 py-3 bg-white/[0.02] border-t border-[var(--color-wurm-border)]/30 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-wurm-muted)] hover:text-white hover:bg-[var(--widget-accent)]/10 transition-all group/btn"
      >
        <span>Acessar Ferramenta</span>
        <ExternalLink size={12} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
      </a>
    </div>
  );
}
