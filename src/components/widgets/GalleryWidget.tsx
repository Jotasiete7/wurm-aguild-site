import { useEffect, useState } from 'react';
import { Camera, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGalleryPhotos, votePhoto, type HubPhoto } from '../../services/hubGallery';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../ecosystem/ToolWidget';

export function GalleryWidget() {
    const [photos, setPhotos] = useState<HubPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState<number | null>(null); // index
    const [voted, setVoted] = useState<Set<string>>(new Set());
    const { t } = useLanguage();

    useEffect(() => {
        getGalleryPhotos().then(p => { setPhotos(p); setLoading(false); });
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

    const prev = () => setLightbox(i => i !== null ? Math.max(0, i - 1) : null);
    const next = () => setLightbox(i => i !== null ? Math.min(photos.length - 1, i + 1) : null);

    const current = lightbox !== null ? photos[lightbox] : null;

    return (
        <>
            <ToolWidget
                title={t('Deed Photography', 'Fotografia de Deeds')}
                subtitle={t('Community Contest', 'Concurso da Comunidade')}
                icon={Camera}
                href="#"
                status={photos.length > 0 ? 'active' : 'coming-soon'}
                className="md:col-span-2"
            >
                {loading ? (
                    <div className="grid grid-cols-4 gap-2 h-24 animate-pulse">
                        {[1,2,3,4].map(i => <div key={i} className="rounded-lg bg-white/5" />)}
                    </div>
                ) : photos.length === 0 ? (
                    <p className="text-xs text-[var(--color-wurm-muted)] m-0">
                        {t('No photos submitted yet. Be the first!', 'Nenhuma foto ainda. Seja o primeiro!')}
                    </p>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {photos.slice(0, 8).map((photo, idx) => (
                            <div
                                key={photo.id}
                                onClick={() => setLightbox(idx)}
                                className="relative group/photo cursor-pointer rounded-lg overflow-hidden aspect-square bg-white/5"
                            >
                                <img
                                    src={photo.image_url}
                                    alt={photo.deed_name ?? 'Deed'}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                    <p className="text-[9px] text-white font-bold leading-tight truncate">
                                        {photo.deed_name ?? photo.title ?? '?'}
                                    </p>
                                    <button
                                        onClick={(e) => handleVote(photo.id, e)}
                                        className={`flex items-center gap-1 text-[9px] mt-1 transition-colors ${voted.has(photo.id) ? 'text-red-400' : 'text-white/60 hover:text-red-400'}`}
                                    >
                                        <Heart size={10} className={voted.has(photo.id) ? 'fill-red-400' : ''} />
                                        {photo.votes}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ToolWidget>

            {/* LIGHTBOX */}
            {current && (
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
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                        >
                            <ChevronLeft size={40} />
                        </button>
                    )}

                    {lightbox! < photos.length - 1 && (
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); next(); }}
                        >
                            <ChevronRight size={40} />
                        </button>
                    )}

                    <div
                        className="max-w-3xl w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={current.image_url}
                            alt={current.deed_name ?? ''}
                            className="w-full max-h-[70vh] object-contain rounded-xl"
                        />
                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <h3 className="text-white font-bold text-lg m-0 border-none pt-0">
                                    {current.deed_name ?? current.title ?? t('Unnamed Deed', 'Deed Sem Nome')}
                                </h3>
                                {current.author_name && (
                                    <p className="text-[var(--color-wurm-muted)] text-xs font-mono m-0">
                                        by {current.author_name}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={(e) => handleVote(current.id, e)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                    voted.has(current.id)
                                        ? 'border-red-500/50 bg-red-500/10 text-red-400'
                                        : 'border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-white/60'
                                }`}
                            >
                                <Heart size={16} className={voted.has(current.id) ? 'fill-red-400' : ''} />
                                <span className="text-sm font-bold">{current.votes}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
