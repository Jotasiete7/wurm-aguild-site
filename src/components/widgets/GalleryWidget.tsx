import { useEffect, useState } from 'react';
import { Camera, Heart, X, ChevronLeft, ChevronRight, Link2, Download } from 'lucide-react';
import { getGalleryPhotos, votePhoto, type HubPhoto } from '../../services/hubGallery';
import { getSettings } from '../../services/hubSettings';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../ecosystem/ToolWidget';

export function GalleryWidget() {
    const [photos, setPhotos] = useState<HubPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<number | null>(null); // index
    const [activeIndex, setActiveIndex] = useState(0); // for the carousel
    const [voted, setVoted] = useState<Set<string>>(new Set());
    const [settings, setSettings] = useState<Record<string, string>>({});
    const { t, lang: language } = useLanguage();

    useEffect(() => {
        getGalleryPhotos().then(p => { 
            // Para o carrossel, pegamos até 8 fotos
            setPhotos(p.slice(0, 8)); 
            setLoading(false); 
        });

        getSettings().then(setSettings);
    }, []);

    const handleVote = async (photoId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (voted.has(photoId)) return;
        const res = await votePhoto(photoId);
        if (res === 'ok') {
            setVoted(prev => new Set([...prev, photoId]));
            setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, votes: p.votes + 1 } : p));
        } else if (res === 'already_voted') {
            setVoted(prev => new Set([...prev, photoId]));
        }
    };

    const prevLightbox = () => setLightbox(i => i !== null ? Math.max(0, i - 1) : null);
    const nextLightbox = () => setLightbox(i => i !== null ? Math.min(photos.length - 1, i + 1) : null);

    const prevSlide = () => setActiveIndex(i => i === 0 ? photos.length - 1 : i - 1);
    const nextSlide = () => setActiveIndex(i => i === photos.length - 1 ? 0 : i + 1);

    const currentLightbox = lightbox !== null ? photos[lightbox] : null;

    return (
        <>
            <ToolWidget
                title={language === 'pt' ? (settings.gallery_card_title_pt || 'Fotografia de Deeds') : (settings.gallery_card_title_en || 'Deed Photography')}
                subtitle={language === 'pt' ? (settings.gallery_card_subtitle_pt || 'Concurso da Comunidade') : (settings.gallery_card_subtitle_en || 'Community Contest')}
                icon={Camera}
                href="#"
                status={photos.length > 0 ? 'active' : 'coming-soon'}
                className="md:col-span-2 md:row-span-2"
            >
                {loading ? (
                    <div className="w-full h-[300px] animate-pulse rounded-lg bg-white/5" />
                ) : photos.length === 0 ? (
                    <p className="text-xs text-[var(--color-wurm-muted)] m-0">
                        {t('No photos submitted yet. Be the first!', 'Nenhuma foto ainda. Seja o primeiro!')}
                    </p>
                ) : (
                    <div className="relative group/carousel w-full h-full flex flex-col items-center justify-center">
                        <div 
                            className="relative w-full h-[300px] rounded-lg overflow-hidden bg-white/5 cursor-pointer"
                            onClick={() => setLightbox(activeIndex)}
                        >
                            <img
                                src={photos[activeIndex].image_url}
                                alt={photos[activeIndex].deed_name ?? 'Deed'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/carousel:scale-105 select-none"
                                loading="lazy"
                                onContextMenu={(e) => e.preventDefault()}
                                draggable={false}
                            />
                            
                            {/* Overlay Info */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                                {photos[activeIndex].event_tag && (
                                    <span className="self-start text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-sm mb-1.5">
                                        {photos[activeIndex].event_tag}
                                    </span>
                                )}
                                <h3 className="text-white font-bold text-lg md:text-xl leading-tight truncate m-0 border-none pt-0">
                                    {photos[activeIndex].deed_name || photos[activeIndex].title || '?'}
                                    {photos[activeIndex].deed_name && photos[activeIndex].title && <span className="opacity-80 font-normal text-sm md:text-base ml-2">— {photos[activeIndex].title}</span>}
                                </h3>
                                {photos[activeIndex].author_name && (
                                    <p className="text-xs text-white/70 m-0 mt-1 font-mono">por {photos[activeIndex].author_name}</p>
                                )}
                                
                                <div className="absolute bottom-4 right-4">
                                    <button
                                        onClick={(e) => handleVote(photos[activeIndex].id, e)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors ${
                                            voted.has(photos[activeIndex].id) 
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                                : 'bg-black/40 text-white/80 border border-white/10 hover:bg-black/60 hover:text-red-400'
                                        }`}
                                    >
                                        <Heart size={14} className={voted.has(photos[activeIndex].id) ? 'fill-red-400' : ''} />
                                        <span className="font-bold text-sm">{photos[activeIndex].votes}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Arrows overlay for navigation within widget */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white/50 hover:text-white hover:bg-black/70 opacity-0 group-hover/carousel:opacity-100 transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white/50 hover:text-white hover:bg-black/70 opacity-0 group-hover/carousel:opacity-100 transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                        
                        {/* Dots */}
                        <div className="flex items-center gap-2 mt-4">
                            {photos.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all ${
                                        idx === activeIndex 
                                            ? 'w-6 bg-[#d4b483]' 
                                            : 'w-1.5 bg-white/20 hover:bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ToolWidget>

            {/* LIGHTBOX */}
            {currentLightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                        onClick={() => setLightbox(null)}
                    >
                        <X size={28} />
                    </button>

                    {lightbox! > 0 && (
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
                        >
                            <ChevronLeft size={40} />
                        </button>
                    )}

                    {lightbox! < photos.length - 1 && (
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
                        >
                            <ChevronRight size={40} />
                        </button>
                    )}

                    <div
                        className="w-screen h-screen flex flex-col items-center justify-center p-0 md:p-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={currentLightbox.image_url}
                            alt={currentLightbox.deed_name ?? ''}
                            className="w-full h-full object-contain select-none"
                            loading="lazy"
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                        />
                        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-lg px-6 py-4 rounded-2xl flex items-center gap-8 border border-white/10 max-w-[90vw]">
                            <div className="min-w-0">
                                {currentLightbox.event_tag && (
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-sm mb-1">
                                        {currentLightbox.event_tag}
                                    </span>
                                )}
                                <h3 className="text-white font-bold text-xl m-0 border-none pt-0 truncate">
                                    {currentLightbox.deed_name || currentLightbox.title || t('Unnamed Deed', 'Deed Sem Nome')}
                                    {currentLightbox.deed_name && currentLightbox.title && <span className="opacity-80 font-normal text-base ml-2">— {currentLightbox.title}</span>}
                                </h3>
                                {currentLightbox.author_name && (
                                    <p className="text-[var(--color-wurm-muted)] text-sm font-mono m-0 truncate">
                                        by {currentLightbox.author_name}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {/* Copy link */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(currentLightbox.image_url);
                                    }}
                                    title={t('Copy image link', 'Copiar link da imagem')}
                                    className="p-2 rounded-lg border border-white/10 text-white/60 hover:border-white/30 hover:text-white transition-all"
                                >
                                    <Link2 size={18} />
                                </button>
                                {/* Download */}
                                <a
                                    href={currentLightbox.image_url}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    title={t('Download image', 'Baixar imagem')}
                                    className="p-2 rounded-lg border border-white/10 text-white/60 hover:border-white/30 hover:text-white transition-all"
                                >
                                    <Download size={18} />
                                </a>
                                {/* Vote */}
                                <button
                                    onClick={(e) => handleVote(currentLightbox.id, e)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                        voted.has(currentLightbox.id)
                                            ? 'border-red-500/50 bg-red-500/20 text-red-400'
                                            : 'border-white/10 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-400 text-white/60'
                                    }`}
                                >
                                    <Heart size={20} className={voted.has(currentLightbox.id) ? 'fill-red-400' : ''} />
                                    <span className="text-lg font-bold">{currentLightbox.votes}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
