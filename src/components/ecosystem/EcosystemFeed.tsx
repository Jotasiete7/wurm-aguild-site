import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Activity, Circle, ExternalLink } from 'lucide-react';
import { getFeedItems, type HubFeedItem } from '../../services/hubFeed';

export function EcosystemFeed() {
  const [feed, setFeed] = useState<HubFeedItem[]>([]);
  const { t, lang } = useLanguage();

  useEffect(() => {
    getFeedItems().then(setFeed);
  }, []);

  if (feed.length === 0) return null;

  return (
    <section className="my-16 pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded bg-[var(--color-wurm-accent)]/10 flex items-center justify-center text-[var(--color-wurm-accent)]">
           <Activity size={18} />
        </div>
        <h2 className="text-2xl font-serif font-bold uppercase tracking-tight m-0 border-none pt-0">
            {t('Live Pulse', 'Pulso do Ecossistema')}
        </h2>
      </div>

      <div className="space-y-0 border-l border-[var(--color-wurm-border)] ml-3">
        {feed.map((item) => {
          // Color based on type
          const colorClass = 
            item.type === 'alert' ? 'text-red-500' : 
            item.type === 'event' ? 'text-blue-500' : 
            item.type === 'badge' ? 'text-purple-500' :
            item.type === 'maintenance' ? 'text-amber-500' :
            'text-[var(--color-wurm-accent)]';
          
          const title = lang === 'pt' ? item.title_pt : (item.title_en || item.title_pt);
          const desc = lang === 'pt' ? item.description_pt : (item.description_en || item.description_pt);
          // Format date directly since we have a timestamp
          const dateStr = new Date(item.created_at).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });

          return (
            <div key={item.id} className="relative pl-8 pb-8 group">
              {/* Timeline Dot */}
              <div className="absolute left-[-5px] top-1.5 transition-transform group-hover:scale-125">
                <Circle size={10} className={`fill-black ${colorClass}`} />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest">
                    {dateStr}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-current opacity-60 ${colorClass}`}>
                        {item.type}
                    </span>
                </div>
                
                {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" className="group/link text-white hover:text-[var(--color-wurm-accent)] transition-colors inline-flex items-center gap-2 mt-1">
                        <h3 className="text-base font-bold m-0 border-none pt-0">{title}</h3>
                        <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                ) : (
                    <h3 className="text-base font-bold text-white m-0 border-none pt-0 mt-1">{title}</h3>
                )}
                
                <p className="text-sm text-[var(--color-wurm-muted)] m-0 mt-1 leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
