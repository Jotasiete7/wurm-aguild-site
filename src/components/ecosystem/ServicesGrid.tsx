import { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ExternalLink, Clock } from 'lucide-react';
import styles from './ServicesGrid.module.css';

interface Service {
  id: string;
  name: string;
  description: string;
  status: 'ativo' | 'pausado';
  actionLabel: string;
  actionUrl: string | null;
}

export function ServicesGrid() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch('/data/services.json')
      .then((r) => r.json())
      .then((data) => { setServices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
      return <div className="text-center py-10 font-mono text-xs text-[var(--color-wurm-muted)] animate-pulse uppercase tracking-widest">Loading Services...</div>;
  }

  return (
    <section className="my-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded bg-[var(--color-wurm-accent)]/10 flex items-center justify-center text-[var(--color-wurm-accent)]">
           <Clock size={18} />
        </div>
        <h2 className="text-2xl font-serif font-bold uppercase tracking-tight m-0 border-none pt-0">
            {t('Guild Services', 'Serviços da Guilda')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className={`${styles.card} ${service.status === 'pausado' ? styles.cardPaused : ''} glass-panel p-6 rounded-xl flex flex-col gap-4 group transition-all hover:-translate-y-1`}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white m-0 border-none pt-0">
                {service.name}
              </h3>
              <span
                className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${
                  service.status === 'ativo' 
                    ? 'border-green-500/30 text-green-500 bg-green-500/5' 
                    : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                }`}
              >
                {service.status}
              </span>
            </div>
            
            <p className="text-sm text-[var(--color-wurm-muted)] flex-grow leading-relaxed m-0 text-left">
              {service.description}
            </p>

            <div className="pt-4 mt-auto border-t border-[var(--color-wurm-border)]/30">
                {service.actionUrl && service.status === 'ativo' ? (
                <a
                    href={service.actionUrl}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-wurm-accent)] hover:text-white transition-colors"
                    target={service.actionUrl.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                >
                    {service.actionLabel}
                    <ExternalLink size={12} />
                </a>
                ) : (
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-wurm-muted)] opacity-50 cursor-not-allowed">
                    {service.actionLabel}
                </span>
                )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
