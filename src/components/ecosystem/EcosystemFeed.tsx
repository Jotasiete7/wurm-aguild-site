import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Activity, Circle } from 'lucide-react';

interface FeedItem {
  id: string;
  date: string;
  type: 'update' | 'event' | 'alert';
  message_en: string;
  message_pt: string;
}

export function EcosystemFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const { t, lang } = useLanguage();

  useEffect(() => {
    fetch('/data/ecosystem-feed.json')
      .then((r) => r.json())
      .then((data) => setFeed(data))
      .catch(() => {});
  }, []);

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
        {feed.map((item) => (
          <div key={item.id} className="relative pl-8 pb-8 group">
            {/* Timeline Dot */}
            <div className="absolute left-[-5px] top-1.5 transition-transform group-hover:scale-125">
               <Circle size={10} className={`fill-black ${
                 item.type === 'alert' ? 'text-red-500' : item.type === 'event' ? 'text-blue-500' : 'text-[var(--color-wurm-accent)]'
               }`} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-widest">
                {item.date}
              </span>
              <p className="text-sm text-[var(--color-wurm-text)] m-0 leading-relaxed">
                {lang === 'en' ? item.message_en : item.message_pt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
