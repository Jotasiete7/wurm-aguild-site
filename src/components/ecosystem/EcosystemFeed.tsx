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
          
          // Parse date safely (supports ISO strings or simple YYYY-MM-DD from old JSON)
          const postDate = new Date(item.post_date || item.created_at);
          // If it fails (e.g., from an old invalid format), try to append 'T00:00:00' to force local timezone parse
          if (isNaN(postDate.getTime()) && item.post_date) {
              const fallbackDate = new Date(`${item.post_date}T00:00:00`);
              if (!isNaN(fallbackDate.getTime())) postDate.setTime(fallbackDate.getTime());
          }
          const isValidDate = !isNaN(postDate.getTime());
          
          // Determine time status
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const itemDate = new Date(postDate);
          itemDate.setHours(0, 0, 0, 0);

          let timeStatus: 'past' | 'present' | 'future' = 'past';
          if (isValidDate) {
              if (itemDate > today) timeStatus = 'future';
              else if (itemDate.getTime() === today.getTime()) timeStatus = 'present';
          }

          // Format date explicitly as DD/MM/YYYY for PT or MM/DD/YYYY for EN
          const dateStr = isValidDate 
            ? postDate.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'Data Indisponível';

          return (
            <div key={item.id} className={`relative pl-8 pb-8 group ${timeStatus === 'past' ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}`}>
              {/* Timeline Dot */}
              <div className="absolute left-[-5px] top-1.5 transition-transform group-hover:scale-125">
                <Circle size={10} className={`fill-black ${colorClass} ${timeStatus === 'future' ? 'animate-pulse shadow-[0_0_8px_currentColor] rounded-full' : ''}`} />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${timeStatus === 'present' ? 'text-white font-bold' : 'text-[var(--color-wurm-muted)]'}`}>
                    {dateStr}
                    </span>
                    {timeStatus === 'present' && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--color-wurm-accent)] text-black">
                            {lang === 'pt' ? 'HOJE' : 'TODAY'}
                        </span>
                    )}
                    {timeStatus === 'future' && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-[var(--color-wurm-accent)] text-[var(--color-wurm-accent)] animate-pulse">
                            {lang === 'pt' ? 'EM BREVE' : 'UPCOMING'}
                        </span>
                    )}
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-current opacity-60 ${colorClass}`}>
                        {item.type}
                    </span>
                </div>
                
                {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" className={`group/link transition-colors inline-flex items-center gap-2 mt-1 ${timeStatus === 'past' ? 'text-white/90 hover:text-[var(--color-wurm-accent)]' : 'text-white hover:text-[var(--color-wurm-accent)]'}`}>
                        <h3 className="text-base font-bold m-0 border-none pt-0">{title}</h3>
                        <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                ) : (
                    <h3 className={`text-base font-bold m-0 border-none pt-0 mt-1 ${timeStatus === 'past' ? 'text-white/90' : 'text-white'}`}>{title}</h3>
                )}
                
                <p className={`text-sm m-0 mt-1 leading-relaxed ${timeStatus === 'past' ? 'text-[var(--color-wurm-muted)]' : 'text-white/80'}`}>
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
