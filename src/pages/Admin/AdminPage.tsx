import { useState } from 'react';
import { createPoll } from '../../services/hubPolls';
import { addPhoto } from '../../services/hubGallery';
import { setStatus, clearStatus } from '../../services/hubStatus';
import { addQuote, getAllQuotes, toggleQuote, type HubQuote } from '../../services/hubQuotes';
import { addFeedItem, type HubFeedItem } from '../../services/hubFeed';
import { Plus, X, Lock, Radio, Quote, Activity } from 'lucide-react';
import { useEffect } from 'react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export function AdminPage() {
    const [auth, setAuth] = useState(false);
    const [pw, setPw] = useState('');

    // Poll form
    const [qPt, setQPt] = useState('');
    const [qEn, setQEn] = useState('');
    const [options, setOptions] = useState([
        { label_pt: '', label_en: '' },
        { label_pt: '', label_en: '' },
    ]);
    const [pollMsg, setPollMsg] = useState('');

    // System Status form
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState<'info' | 'warning' | 'alert'>('info');
    const [statusFeedback, setStatusFeedback] = useState('');

    // Quotes
    const [quotes, setQuotes] = useState<HubQuote[]>([]);
    const [newQuotePt, setNewQuotePt] = useState('');
    const [newQuoteEn, setNewQuoteEn] = useState('');
    const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
    const [quoteFeedback, setQuoteFeedback] = useState('');

    useEffect(() => {
        if (auth) getAllQuotes().then(setQuotes);
    }, [auth]);

    // Photo form
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoTitle, setPhotoTitle] = useState('');
    const [photoAuthor, setPhotoAuthor] = useState('');
    const [photoDeed, setPhotoDeed] = useState('');
    const [photoTag, setPhotoTag] = useState('Concurso 2026');
    const [photoMsg, setPhotoMsg] = useState('');

    // Feed form
    const [feedType, setFeedType] = useState<HubFeedItem['type']>('update');
    const [feedTitlePt, setFeedTitlePt] = useState('');
    const [feedTitleEn, setFeedTitleEn] = useState('');
    const [feedDescPt, setFeedDescPt] = useState('');
    const [feedDescEn, setFeedDescEn] = useState('');
    const [feedLink, setFeedLink] = useState('');
    const [feedDate, setFeedDate] = useState('');
    const [feedMsg, setFeedMsg] = useState('');

    if (!auth) {
        return (
            <div className="min-h-screen bg-[var(--color-wurm-bg)] flex items-center justify-center">
                <div className="glass-panel p-8 rounded-2xl w-full max-w-sm space-y-4">
                    <div className="flex items-center gap-2 text-[var(--color-wurm-accent)]">
                        <Lock size={18} />
                        <h1 className="font-serif text-xl m-0 border-none pt-0">Admin — HUB2</h1>
                    </div>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={pw}
                        onChange={e => setPw(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && pw === ADMIN_PASSWORD && setAuth(true)}
                        className="w-full bg-black/30 border border-[var(--color-wurm-border)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-wurm-accent)]"
                    />
                    <button
                        onClick={() => pw === ADMIN_PASSWORD ? setAuth(true) : setPollMsg('Senha incorreta')}
                        className="w-full bg-[var(--color-wurm-accent)] text-black font-bold text-sm py-2 rounded-lg hover:brightness-110 transition-all"
                    >
                        Entrar
                    </button>
                    {pollMsg && <p className="text-red-400 text-xs">{pollMsg}</p>}
                </div>
            </div>
        );
    }

    const handleCreatePoll = async () => {
        if (!qPt || !qEn) return setPollMsg('Preencha a pergunta em PT e EN.');
        const filled = options.filter(o => o.label_pt && o.label_en);
        if (filled.length < 2) return setPollMsg('Adicione ao menos 2 opções completas.');
        const ok = await createPoll(qPt, qEn, filled);
        setPollMsg(ok ? '✅ Enquete criada com sucesso!' : '❌ Erro ao criar enquete.');
        if (ok) { setQPt(''); setQEn(''); setOptions([{ label_pt: '', label_en: '' }, { label_pt: '', label_en: '' }]); }
    };

    const handleSetStatus = async () => {
        const ok = await setStatus(statusMsg, statusType);
        setStatusFeedback(ok ? '✅ Status publicado!' : '❌ Erro ao publicar status.');
        if (ok && statusMsg) setStatusMsg('');
    };

    const handleClearStatus = async () => {
        const ok = await clearStatus();
        setStatusFeedback(ok ? '✅ Status removido.' : '❌ Erro ao remover.');
    };

    const handleAddQuote = async () => {
        if (!newQuotePt.trim()) return setQuoteFeedback('Frase em PT é obrigatória.');
        const ok = await addQuote(newQuotePt, newQuoteEn, newQuoteAuthor || 'A Guilda');
        setQuoteFeedback(ok ? '✅ Frase adicionada!' : '❌ Erro ao adicionar.');
        if (ok) {
            setNewQuotePt(''); setNewQuoteEn(''); setNewQuoteAuthor('');
            getAllQuotes().then(setQuotes);
        }
    };

    const handleToggleQuote = async (id: string, current: boolean) => {
        await toggleQuote(id, !current);
        getAllQuotes().then(setQuotes);
    };

    const handleAddPhoto = async () => {
        if (!photoUrl) return setPhotoMsg('URL da foto é obrigatória.');
        const ok = await addPhoto({
            image_url: photoUrl,
            title: photoTitle || null,
            author_name: photoAuthor || null,
            deed_name: photoDeed || null,
            event_tag: photoTag || 'Concurso 2026',
        } as any);
        setPhotoMsg(ok ? '✅ Foto adicionada!' : '❌ Erro ao adicionar foto.');
        if (ok) { setPhotoUrl(''); setPhotoTitle(''); setPhotoAuthor(''); setPhotoDeed(''); }
    };

    const handleAddFeed = async () => {
        if (!feedTitlePt || !feedDescPt) return setFeedMsg('Título e Descrição em PT são obrigatórios.');
        const ok = await addFeedItem({
            type: feedType,
            title_pt: feedTitlePt,
            title_en: feedTitleEn || null,
            description_pt: feedDescPt,
            description_en: feedDescEn || null,
            link: feedLink || null,
            post_date: feedDate || new Date().toISOString().split('T')[0],
        });
        setFeedMsg(ok ? '✅ Post adicionado ao Feed!' : '❌ Erro ao adicionar post.');
        if (ok) {
            setFeedTitlePt(''); setFeedTitleEn(''); setFeedDescPt(''); setFeedDescEn(''); setFeedLink(''); setFeedDate('');
        }
    };

    const inputCls = "w-full bg-black/30 border border-[var(--color-wurm-border)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-wurm-accent)] placeholder:text-[var(--color-wurm-muted)]";
    const labelCls = "text-[10px] font-mono uppercase tracking-widest text-[var(--color-wurm-muted)] mb-1 block";

    return (
        <div className="min-h-screen bg-[var(--color-wurm-bg)] py-12 px-6">
            <div className="max-w-2xl mx-auto space-y-10">
                <h1 className="font-serif text-3xl text-white border-none pt-0 m-0">
                    Admin — HUB2
                </h1>

                {/* ── SYSTEM STATUS SECTION ── */}
                <section className="glass-panel p-6 rounded-2xl space-y-4">
                    <h2 className="font-serif text-xl text-white m-0 border-none pt-0 flex items-center gap-2">
                        <Radio size={18} className="text-amber-400" /> Status do Sistema
                    </h2>
                    <p className="text-[10px] text-[var(--color-wurm-muted)] font-mono uppercase tracking-widest m-0">
                        Aparece como banner no topo do HUB para todos os visitantes.
                    </p>

                    <div className="flex gap-3">
                        <select
                            value={statusType}
                            onChange={e => setStatusType(e.target.value as any)}
                            className="bg-black/30 border border-[var(--color-wurm-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-wurm-accent)] flex-shrink-0"
                        >
                            <option value="info">ℹ️ Info</option>
                            <option value="warning">⚠️ Aviso</option>
                            <option value="alert">🚨 Alerta</option>
                        </select>
                        <input
                            className={inputCls}
                            value={statusMsg}
                            onChange={e => setStatusMsg(e.target.value)}
                            placeholder="Ex: Manutenção programada às 22h..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={handleSetStatus} className="bg-amber-500 text-black font-bold text-sm px-6 py-2 rounded-lg hover:brightness-110 transition-all">
                            Publicar
                        </button>
                        <button onClick={handleClearStatus} className="bg-white/5 border border-white/10 text-white/60 text-sm px-6 py-2 rounded-lg hover:bg-white/10 transition-all">
                            Limpar Banner
                        </button>
                    </div>
                    {statusFeedback && <p className={`text-xs ${statusFeedback.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{statusFeedback}</p>}
                </section>

                {/* ── ECOSYSTEM FEED SECTION ── */}
                <section className="glass-panel p-6 rounded-2xl space-y-4">
                    <h2 className="font-serif text-xl text-white m-0 border-none pt-0 flex items-center gap-2">
                        <Activity size={18} className="text-[var(--color-wurm-accent)]" /> Pulso do Ecossistema
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>Tipo de Post *</label>
                            <select
                                value={feedType}
                                onChange={e => setFeedType(e.target.value as any)}
                                className={inputCls}
                            >
                                <option value="update">🔄 Update</option>
                                <option value="event">📅 Evento</option>
                                <option value="alert">🚨 Alerta</option>
                                <option value="article">📰 Artigo</option>
                                <option value="maintenance">🔧 Manutenção</option>
                                <option value="badge">🎖️ Badge</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Data do Post/Evento</label>
                            <input type="date" className={inputCls} value={feedDate} onChange={e => setFeedDate(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelCls}>Link (Opcional)</label>
                            <input className={inputCls} value={feedLink} onChange={e => setFeedLink(e.target.value)} placeholder="https://..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Título (PT) *</label>
                            <input className={inputCls} value={feedTitlePt} onChange={e => setFeedTitlePt(e.target.value)} placeholder="Novo sistema lançado" />
                        </div>
                        <div>
                            <label className={labelCls}>Title (EN)</label>
                            <input className={inputCls} value={feedTitleEn} onChange={e => setFeedTitleEn(e.target.value)} placeholder="New system launched" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelCls}>Descrição (PT) *</label>
                            <textarea className={inputCls} value={feedDescPt} onChange={e => setFeedDescPt(e.target.value)} placeholder="Detalhes da atualização..." rows={2} />
                        </div>
                        <div>
                            <label className={labelCls}>Description (EN)</label>
                            <textarea className={inputCls} value={feedDescEn} onChange={e => setFeedDescEn(e.target.value)} placeholder="Update details..." rows={2} />
                        </div>
                    </div>

                    <button onClick={handleAddFeed} className="bg-[var(--color-wurm-accent)] text-black font-bold text-sm px-6 py-2 rounded-lg hover:brightness-110 transition-all">
                        Publicar no Feed
                    </button>
                    {feedMsg && <p className={`text-xs ${feedMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{feedMsg}</p>}
                </section>

                {/* ── POLL SECTION ── */}
                <section className="glass-panel p-6 rounded-2xl space-y-4">
                    <h2 className="font-serif text-xl text-white m-0 border-none pt-0">Nova Enquete</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Pergunta (PT)</label>
                            <input className={inputCls} value={qPt} onChange={e => setQPt(e.target.value)} placeholder="Qual evento vem aí?" />
                        </div>
                        <div>
                            <label className={labelCls}>Question (EN)</label>
                            <input className={inputCls} value={qEn} onChange={e => setQEn(e.target.value)} placeholder="Which event is coming?" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={labelCls}>Opções</label>
                        {options.map((opt, i) => (
                            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                <input className={inputCls} value={opt.label_pt} onChange={e => setOptions(o => o.map((x, j) => j === i ? { ...x, label_pt: e.target.value } : x))} placeholder={`Opção ${i+1} (PT)`} />
                                <input className={inputCls} value={opt.label_en} onChange={e => setOptions(o => o.map((x, j) => j === i ? { ...x, label_en: e.target.value } : x))} placeholder={`Option ${i+1} (EN)`} />
                                {i > 1 && (
                                    <button onClick={() => setOptions(o => o.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {options.length < 5 && (
                            <button onClick={() => setOptions(o => [...o, { label_pt: '', label_en: '' }])} className="flex items-center gap-1 text-[10px] text-[var(--color-wurm-accent)] hover:brightness-110 transition-all font-mono uppercase tracking-widest">
                                <Plus size={12} /> Adicionar opção
                            </button>
                        )}
                    </div>

                    <button onClick={handleCreatePoll} className="bg-[var(--color-wurm-accent)] text-black font-bold text-sm px-6 py-2 rounded-lg hover:brightness-110 transition-all">
                        Criar Enquete
                    </button>
                    {pollMsg && <p className={`text-xs ${pollMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{pollMsg}</p>}
                </section>

                {/* ── GALLERY SECTION ── */}
                <section className="glass-panel p-6 rounded-2xl space-y-4">
                    <h2 className="font-serif text-xl text-white m-0 border-none pt-0">Adicionar Foto</h2>

                    <div>
                        <label className={labelCls}>URL da Imagem *</label>
                        <input className={inputCls} value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Nome da Deed</label>
                            <input className={inputCls} value={photoDeed} onChange={e => setPhotoDeed(e.target.value)} placeholder="Pinheiro do Norte" />
                        </div>
                        <div>
                            <label className={labelCls}>Autor</label>
                            <input className={inputCls} value={photoAuthor} onChange={e => setPhotoAuthor(e.target.value)} placeholder="Jotasiete" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Título (opcional)</label>
                            <input className={inputCls} value={photoTitle} onChange={e => setPhotoTitle(e.target.value)} placeholder="Pôr do sol na fortaleza" />
                        </div>
                        <div>
                            <label className={labelCls}>Tag do Evento</label>
                            <input className={inputCls} value={photoTag} onChange={e => setPhotoTag(e.target.value)} placeholder="Concurso 2026" />
                        </div>
                    </div>

                    {photoUrl && (
                        <img src={photoUrl} alt="Preview" className="rounded-lg max-h-40 object-cover opacity-70" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                    )}

                    <button onClick={handleAddPhoto} className="bg-[var(--color-wurm-accent)] text-black font-bold text-sm px-6 py-2 rounded-lg hover:brightness-110 transition-all">
                        Adicionar Foto
                    </button>
                    {photoMsg && <p className={`text-xs ${photoMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{photoMsg}</p>}
                </section>

                {/* ── QUOTES SECTION ── */}
                <section className="glass-panel p-6 rounded-2xl space-y-4">
                    <h2 className="font-serif text-xl text-white m-0 border-none pt-0 flex items-center gap-2">
                        <Quote size={18} className="text-[var(--color-wurm-accent)]" /> Quotes do Dia
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className={labelCls}>Frase (PT) *</label>
                            <input className={inputCls} value={newQuotePt} onChange={e => setNewQuotePt(e.target.value)} placeholder="A Guilda não é um grupo — é uma cultura." />
                        </div>
                        <div>
                            <label className={labelCls}>Quote (EN)</label>
                            <input className={inputCls} value={newQuoteEn} onChange={e => setNewQuoteEn(e.target.value)} placeholder="The Guild is not a group — it is a culture." />
                        </div>
                        <div>
                            <label className={labelCls}>Autor</label>
                            <input className={inputCls} value={newQuoteAuthor} onChange={e => setNewQuoteAuthor(e.target.value)} placeholder="A Guilda" />
                        </div>
                    </div>

                    <button onClick={handleAddQuote} className="bg-[var(--color-wurm-accent)] text-black font-bold text-sm px-6 py-2 rounded-lg hover:brightness-110 transition-all">
                        Adicionar Frase
                    </button>
                    {quoteFeedback && <p className={`text-xs ${quoteFeedback.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{quoteFeedback}</p>}

                    {/* Lista de quotes */}
                    {quotes.length > 0 && (
                        <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
                            <p className={labelCls}>{quotes.length} frase(s) cadastradas</p>
                            {quotes.map(q => (
                                <div key={q.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                    q.is_active
                                        ? 'border-white/10 bg-white/[0.02]'
                                        : 'border-white/5 bg-white/[0.01] opacity-40'
                                }`}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white m-0 font-serif italic leading-relaxed">"{q.text_pt}"</p>
                                        <p className="text-[9px] font-mono text-[var(--color-wurm-muted)] mt-1 m-0">— {q.author}</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggleQuote(q.id, q.is_active)}
                                        className={`text-[9px] font-mono uppercase px-2 py-1 rounded border flex-shrink-0 transition-all ${
                                            q.is_active
                                                ? 'border-green-500/30 text-green-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                                                : 'border-white/10 text-[var(--color-wurm-muted)] hover:border-green-500/30 hover:text-green-400'
                                        }`}
                                    >
                                        {q.is_active ? 'ativa' : 'inativa'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
