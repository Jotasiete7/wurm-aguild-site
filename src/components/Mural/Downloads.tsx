
import { Download, Link as LinkIcon } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { DownloadItem } from '../../types';

export default function Downloads() {
    const [downloads] = useLocalStorage<DownloadItem[]>('guild_downloads', [
        { id: '1', name: 'Wurm Unlimited Map Tool', url: '#', description: 'Ferramenta essencial para cartografia.' },
        { id: '2', name: 'Planilha de Skill Grinding', url: '#', description: 'Calculadora de XP e recursos necessários.' },
        { id: '3', name: 'Discord da Aliança', url: '#', description: 'Canal de comunicação oficial.' },
        { id: '4', name: 'Timer Mod', url: '#', description: 'Overlay para timers de colheita.' },
    ]);

    return (
        <div className="downloads-container glass">
            <h3>Downloads & Links Úteis</h3>
            <div className="downloads-list">
                {downloads.map(item => (
                    <a key={item.id} href={item.url} className="download-item">
                        <div className="dl-icon">
                            {item.url.includes('discord') ? <LinkIcon size={24} /> : <Download size={24} />}
                        </div>
                        <div className="dl-info">
                            <span className="dl-name">{item.name}</span>
                            <span className="dl-desc">{item.description}</span>
                        </div>
                    </a>
                ))}
            </div>

            <style>{`
        .downloads-container { max-width: 800px; margin: 0 auto; padding: 2rem; border-radius: var(--radius-lg); }
        .downloads-container h3 { margin-bottom: 2rem; text-align: center; }
        .downloads-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .download-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: var(--radius-md); background: rgba(255,255,255,0.03); transition: all 0.2s; border: 1px solid transparent; }
        .download-item:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); border-color: var(--accent-sage); }
        .dl-icon { color: var(--accent-sage); background: rgba(154, 176, 154, 0.1); padding: 0.75rem; border-radius: 50%; }
        .dl-info { display: flex; flex-direction: column; }
        .dl-name { font-weight: 600; color: var(--text-primary); }
        .dl-desc { font-size: 0.85rem; color: var(--text-secondary); }
      `}</style>
        </div>
    );
}
