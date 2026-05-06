import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Layers, ArrowRight } from 'lucide-react';

interface System {
  id: string;
  name: string;
  description: string;
  url: string;
}

export function SystemsGrid() {
  const [systems, setSystems] = useState<System[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/data/systems.json')
      .then((r) => r.json())
      .then((data) => setSystems(data))
      .catch(() => {});
  }, []);

  return (
    <section className="my-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded bg-[var(--color-wurm-accent)]/10 flex items-center justify-center text-[var(--color-wurm-accent)]">
           <Layers size={18} />
        </div>
        <h2 className="text-2xl font-serif font-bold uppercase tracking-tight m-0 border-none pt-0">
            {t('Core Systems', 'Sistemas Centrais')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systems.map((system) => (
          <a
            key={system.id}
            href={system.url}
            className="glass-panel p-4 rounded-lg flex items-center gap-4 transition-all hover:bg-[var(--color-wurm-panel)] hover:border-[var(--color-wurm-accent)]/50 group"
          >
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center border border-[var(--color-wurm-border)] text-[var(--color-wurm-muted)] group-hover:text-[var(--color-wurm-accent)] group-hover:border-[var(--color-wurm-accent)] transition-colors">
               <span className="font-mono text-xs">{system.name.charAt(0)}</span>
            </div>
            
            <div className="flex-grow">
              <h3 className="text-sm font-bold text-white m-0 border-none pt-0">
                {system.name}
              </h3>
              <p className="text-[10px] text-[var(--color-wurm-muted)] uppercase tracking-wider m-0">
                {system.description}
              </p>
            </div>

            <ArrowRight size={14} className="text-[var(--color-wurm-border)] group-hover:text-[var(--color-wurm-accent)] transition-colors" />
          </a>
        ))}
      </div>
    </section>
  );
}
