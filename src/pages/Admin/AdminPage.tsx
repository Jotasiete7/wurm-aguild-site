import { useState } from 'react';
import { createPoll } from '../../services/hubPolls';
import { addPhoto, getGalleryPhotos, hidePhoto, type HubPhoto } from '../../services/hubGallery';
import { setStatus, clearStatus } from '../../services/hubStatus';
import { addQuote, getAllQuotes, toggleQuote, deleteQuote, addQuotesBulk, type HubQuote } from '../../services/hubQuotes';
import { addFeedItem, type HubFeedItem } from '../../services/hubFeed';
import { addOrder, closeOrder, getAllOrders, type ServiceOrder, getAllResources, addResource, deleteResource, type PublicResource } from '../../services/hubMural';
import { getSettings, updateSettings } from '../../services/hubSettings';
import { Plus, X, Lock, Radio, Quote, Activity, ScrollText, CheckCircle, Link as LinkIcon, Camera } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function AdminPage() {
    const [auth, setAuth] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const checkAdminAccess = async (currentEmail: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('hub_admins')
                .select('email')
                .eq('email', currentEmail)
                .maybeSingle();
            return !!data && !error;
        } catch {
            return false;
        }
    };

    const inputCls = "w-full bg-black/30 border border-[var(--color-wurm-border)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-wurm-accent)] placeholder:text-[var(--color-wurm-muted)]";
    const labelCls = "text-[10px] font-mono uppercase tracking-widest text-[var(--color-wurm-muted)] mb-1 block";

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

    // Resources state
    const [resources, setResources] = useState<PublicResource[]>([]);
    const [resourceName, setResourceName] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');
    const [resourceType, setResourceType] = useState<'tool' | 'map' | 'sheet' | 'doc' | 'external'>('tool');
    const [resourceAuthor, setResourceAuthor] = useState('');
    const [resourceMsg, setResourceMsg] = useState('');

    useEffect(() => {
        // Check active session on mount
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const currentEmail = session?.user?.email;
            if (currentEmail) {
                const isAdmin = await checkAdminAccess(currentEmail);
                if (isAdmin) {
                    setAuth(true);
                    setUserEmail(currentEmail);
                } else {
                    supabase.auth.signOut();
                    setPollMsg('Este e-mail não possui acesso administrativo.');
                }
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentEmail = session?.user?.email;
            if (currentEmail) {
                const isAdmin = await checkAdminAccess(currentEmail);
                if (isAdmin) {
                    setAuth(true);
                    setUserEmail(currentEmail);
                } else {
                    setAuth(false);
                    setUserEmail(null);
                }
            } else {
                setAuth(false);
                setUserEmail(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (auth) {
            getAllQuotes().then(setQuotes);
            getAllOrders().then(setOrders);
            getSettings().then(setHubSettings);
            getAllResources().then(setResources);
            getGalleryPhotos().then(setPhotos);
        }
    }, [auth]);

    // Mural state
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [orderTitle, setOrderTitle] = useState('');
    const [orderDesc, setOrderDesc] = useState('');
    const [orderPrice, setOrderPrice] = useState('');
    const [orderProvider, setOrderProvider] = useState('');
    const [orderType, setOrderType] = useState<'service' | 'material'>('material');
    const [orderIntent, setOrderIntent] = useState<'buy' | 'sell'>('sell');
    const [orderMsg, setOrderMsg] = useState('');

    // Photo form
    const [photoUrl, setPhotoUrl] = useState('');
    const [photoTitle, setPhotoTitle] = useState('');
    const [photoAuthor, setPhotoAuthor] = useState('');
    const [photoDeed, setPhotoDeed] = useState('');
    const [photoTag, setPhotoTag] = useState('Concurso 2026');
    const [photoMsg, setPhotoMsg] = useState('');
    const [photos, setPhotos] = useState<HubPhoto[]>([]);

    // Feed form
    const [feedType, setFeedType] = useState<HubFeedItem['type']>('update');
    const [feedTitlePt, setFeedTitlePt] = useState('');
    const [feedTitleEn, setFeedTitleEn] = useState('');
    const [feedDescPt, setFeedDescPt] = useState('');
    const [feedDescEn, setFeedDescEn] = useState('');
    const [feedLink, setFeedLink] = useState('');
    const [feedDate, setFeedDate] = useState('');
    const [feedMsg, setFeedMsg] = useState('');
    
    // Hub Settings
    const [hubSettings, setHubSettings] = useState<Record<string, string>>({
        gallery_card_title_pt: '',
        gallery_card_title_en: '',
        gallery_card_subtitle_pt: '',
        gallery_card_subtitle_en: '',
    });
    const [settingsMsg, setSettingsMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return setPollMsg('Por favor, preencha todos os campos.');
        setLoading(true);
        setPollMsg('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setPollMsg(`Erro ao entrar: ${error.message}`);
                setLoading(false);
                return;
            }

            const currentEmail = data.user?.email;
            if (currentEmail) {
                const isAdmin = await checkAdminAccess(currentEmail);
                if (!isAdmin) {
                    await supabase.auth.signOut();
                    setPollMsg('Acesso negado: Este e-mail não possui permissão de administrador.');
                    setLoading(false);
                    return;
                }
                setAuth(true);
                setUserEmail(currentEmail);
            } else {
                await supabase.auth.signOut();
                setPollMsg('Erro ao recuperar e-mail do usuário.');
                setLoading(false);
            }
        } catch (err: any) {
            setPollMsg('Erro desconhecido ao tentar realizar o login.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setAuth(false);
        setUserEmail(null);
    };

    if (!auth) {
        return (
            <div className="min-h-screen bg-[var(--color-wurm-bg)] flex items-center justify-center px-4">
                <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl w-full max-w-sm space-y-4 border border-[var(--color-wurm-border)]">
                    <div className="flex items-center gap-2 text-[var(--color-wurm-accent)] mb-2">
                        <Lock size={20} />
                        <h1 className="font-serif text-2xl m-0 border-none pt-0 font-bold">Admin — HUB2</h1>
                    </div>
                    <p className="text-[10px] text-[var(--color-wurm-muted)] font-mono uppercase tracking-widest leading-relaxed">
                        Faça login com a sua conta do ecossistema A Guilda.
                    </p>
                    
                    <div className="space-y-1">
                        <label className={labelCls}>E-mail de Acesso</label>
                        <input
                            type="email"
                            placeholder="exemplo@gmail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/30 border border-[var(--color-wurm-border)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-wurm-accent)] placeholder:text-[var(--color-wurm-muted)]"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className={labelCls}>Senha</label>
                        <input
                            type="password"
                            placeholder="Sua senha secreta"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/30 border border-[var(--color-wurm-border)] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-wurm-accent)] placeholder:text-[var(--color-wurm-muted)]"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-wurm-accent)] text-black font-bold text-sm py-2.5 rounded-lg hover:brightness-110 disabled:brightness-50 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? 'Entrando...' : 'Entrar no Painel'}
                    </button>

                    {pollMsg && (
                        <p className="text-red-400 text-xs mt-2 bg-red-500/10 border border-red-500/20 p-2 rounded-lg leading-relaxed">
                            {pollMsg}
                        </p>
                    )}
                </form>
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

    const handleDeleteQuote = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta frase?')) {
            const ok = await deleteQuote(id);
            if (ok) {
                getAllQuotes().then(setQuotes);
                setQuoteFeedback('✅ Frase excluída com sucesso!');
            } else {
                setQuoteFeedback('❌ Erro ao excluir frase. Verifique as políticas do banco de dados.');
            }
        }
    };

    const handleBulkUploadQuotes = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            const lines = text.split('\n');
            const newQuotes: Omit<HubQuote, 'id' | 'is_active' | 'created_at'>[] = [];

            for (const rawLine of lines) {
                const line = rawLine.trim();
                if (!line) continue;

                const parts = line.split('|').map(p => p.trim());
                if (parts.length === 3) {
                    newQuotes.push({
                        text_pt: parts[0],
                        text_en: parts[1] || null,
                        author: parts[2] || 'A Guilda'
                    });
                } else if (parts.length === 2) {
                    newQuotes.push({
                        text_pt: parts[0],
                        text_en: null,
                        author: parts[1] || 'A Guilda'
                    });
                } else {
                    newQuotes.push({
                        text_pt: line,
                        text_en: null,
                        author: 'A Guilda'
                    });
                }
            }

            if (newQuotes.length === 0) {
                setQuoteFeedback('❌ Nenhuma frase válida encontrada no arquivo.');
                return;
            }

            const ok = await addQuotesBulk(newQuotes);
            setQuoteFeedback(ok ? `✅ ${newQuotes.length} frases importadas com sucesso!` : '❌ Erro ao importar frases.');
            if (ok) {
                getAllQuotes().then(setQuotes);
                event.target.value = '';
            }
        };
        reader.readAsText(file);
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
        if (ok) { 
            setPhotoUrl(''); setPhotoTitle(''); setPhotoAuthor(''); setPhotoDeed(''); 
            getGalleryPhotos().then(setPhotos);
        }
    };

    const handleHidePhoto = async (id: string) => {
        if (confirm('Deseja ocultar esta foto da galeria?')) {
            const ok = await hidePhoto(id);
            if (ok) {
                setPhotoMsg('✅ Foto ocultada com sucesso!');
                getGalleryPhotos().then(setPhotos);
            } else {
                setPhotoMsg('❌ Erro ao ocultar foto.');
            }
        }
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

    const handleAddOrder = async () => {
        if (!orderTitle || !orderPrice || !orderProvider) return setOrderMsg('Título, preço e fornecedor são obrigatórios.');
        const ok = await addOrder({
            title: orderTitle,
            description: orderDesc || undefined,
            price: orderPrice,
            provider: orderProvider,
            type: orderType,
            intent: orderIntent,
            status: 'open',
        });
        setOrderMsg(ok ? '✅ Ordem publicada no Mural!' : '❌ Erro ao publicar ordem.');
        if (ok) {
            setOrderTitle(''); setOrderDesc(''); setOrderPrice(''); setOrderProvider('');
            getAllOrders().then(setOrders);
        }
    };

    const handleCloseOrder = async (id: string) => {
        const ok = await closeOrder(id);
        if (ok) getAllOrders().then(setOrders);
    };

    const handleAddResource = async () => {
        if (!resourceName || !resourceUrl) return setResourceMsg('Nome e URL são obrigatórios.');
        const ok = await addResource({
            name: resourceName,
            url: resourceUrl,
            type: resourceType,
            access: 'public',
            author: resourceAuthor || undefined
        });
        setResourceMsg(ok ? '✅ Recurso adicionado com sucesso!' : '❌ Erro ao adicionar recurso.');
        if (ok) {
            setResourceName(''); setResourceUrl(''); setResourceAuthor('');
            getAllResources().then(setResources);
        }
    };

    const handleDeleteResource = async (id: string) => {
        const ok = await deleteResource(id);
        if (ok) getAllResources().then(setResources);
    };

    const handleUpdateHubSettings = async () => {
        const ok = await updateSettings(hubSettings);
        setSettingsMsg(ok ? '✅ Configurações salvas!' : '❌ Erro ao salvar configurações.');
        if (ok) {
            setTimeout(() => setSettingsMsg(''), 3000);
        }
    };



    return (
        <div className="min-h-screen bg-[var(--color-wurm-bg)] py-12 px-6">
            <div className="max-w-2xl mx-auto space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="font-serif text-3xl text-white border-none pt-0 m-0 font-bold">
                            Admin — HUB2
                        </h1>
                        {userEmail && (
                            <p className="text-[10px] text-[var(--color-wurm-accent)] font-mono uppercase tracking-widest mt-1.5">
                                Logado como: <span className="text-white font-bold">{userEmail}</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-[10px] font-mono uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shrink-0 sm:self-start"
                    >
                        🚪 Encerrar Sessão
                    </button>
                </div>


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

                {/* ── MURAL DE ORDENS SECTION ── */}
                <section className="glass-panel p-6 rounded-2xl space-y-4 border border-[#9ab09a]/20">
                    <h2 className="font-serif text-xl text-white m-0 border-none pt-0 flex items-center gap-2">
                        <ScrollText size={18} className="text-[#9ab09a]" /> Mural de Ordens
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Item / Serviço *</label>
                            <input className={inputCls} value={orderTitle} onChange={e => setOrderTitle(e.target.value)} placeholder="Ex: 100x Iron Lump" />
                        </div>
                        <div>
                            <label className={labelCls}>Preço *</label>
                            <input className={inputCls} value={orderPrice} onChange={e => setOrderPrice(e.target.value)} placeholder="Ex: 5s 20c" />
                        </div>
                        <div>
                            <label className={labelCls}>Contato / Personagem *</label>
                            <input className={inputCls} value={orderProvider} onChange={e => setOrderProvider(e.target.value)} placeholder="Ex: Jotasiete" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={labelCls}>Tipo</label>
                                <select value={orderType} onChange={e => setOrderType(e.target.value as any)} className={inputCls}>
                                    <option value="material">Material</option>
                                    <option value="service">Serviço</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Intenção</label>
                                <select value={orderIntent} onChange={e => setOrderIntent(e.target.value as any)} className={inputCls}>
                                    <option value="buy">Comprar (WTS)</option>
                                    <option value="sell">Vender (WTB)</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Descrição / Notas adicionais</label>
                            <input className={inputCls} value={orderDesc} onChange={e => setOrderDesc(e.target.value)} placeholder="Opcional. Ex: Entrega em The Howl" />
                        </div>
                    </div>

                    <button onClick={handleAddOrder} className="bg-[#9ab09a] text-black font-bold text-sm px-6 py-2 rounded-lg hover:brightness-110 transition-all">
                        Publicar Ordem
                    </button>
                    {orderMsg && <p className={`text-xs ${orderMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{orderMsg}</p>}

                    {/* Active Orders List */}
                    {orders.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                            <h3 className="text-sm font-bold text-white mb-3">Ordens Abertas ({orders.filter(o => o.status === 'open').length})</h3>
                            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                                {orders.map(o => (
                                    <div key={o.id} className={`flex items-center justify-between p-3 rounded-lg border text-sm ${o.status === 'open' ? 'bg-black/20 border-white/10' : 'bg-black/10 border-white/5 opacity-50'}`}>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${o.intent === 'buy' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                    {o.intent === 'buy' ? 'WTS' : 'WTB'}
                                                </span>
                                                <span className="font-bold text-white truncate">{o.title}</span>
                                                <span className="text-[#9ab09a] font-mono">{o.price}</span>
                                            </div>
                                            <div className="text-xs text-[var(--color-wurm-muted)]">
                                                Por {o.provider} · {new Date(o.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                        {o.status === 'open' ? (
                                            <button
                                                onClick={() => handleCloseOrder(o.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-xs shrink-0"
                                                title="Marcar como concluída/fechada"
                                            >
                                                <CheckCircle size={14} /> Fechar
                                            </button>
                                        ) : (
                                            <span className="text-xs text-[var(--color-wurm-muted)] italic shrink-0">Fechada</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* ── RECURSOS / LINKS UTEIS SECTION ── */}
                <section className="glass-panel p-6 rounded-2xl space-y-4 border border-[var(--color-wurm-accent)]/20">
                    <h2 className="font-serif text-xl text-white m-0 border-none pt-0 flex items-center gap-2">
                        <LinkIcon size={18} className="text-[var(--color-wurm-accent)]" /> Gerenciar Recursos (Links Úteis)
                    </h2>
                    <p className="text-[10px] text-[var(--color-wurm-muted)] font-mono uppercase tracking-widest m-0">
                        Adicione ou remova ferramentas, calculadoras e links úteis que aparecem no card Recursos da página principal.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Nome do Link/Ferramenta *</label>
                            <input className={inputCls} value={resourceName} onChange={e => setResourceName(e.target.value)} placeholder="Ex: Calculadora de Grind" />
                        </div>
                        <div>
                            <label className={labelCls}>URL de Acesso *</label>
                            <input className={inputCls} value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} placeholder="Ex: https://..." />
                        </div>
                        <div>
                            <label className={labelCls}>Tipo do Recurso</label>
                            <select value={resourceType} onChange={e => setResourceType(e.target.value as any)} className={inputCls}>
                                <option value="tool">🔨 Ferramenta (Tool)</option>
                                <option value="map">🗺️ Mapa (Map)</option>
                                <option value="sheet">📊 Planilha (Sheet)</option>
                                <option value="doc">📜 Documento (Doc)</option>
                                <option value="external">🔗 Link Externo (External)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Autor / Criador (opcional)</label>
                            <input className={inputCls} value={resourceAuthor} onChange={e => setResourceAuthor(e.target.value)} placeholder="Ex: Jotasiete" />
                        </div>
                    </div>

                    <button onClick={handleAddResource} className="bg-[var(--color-wurm-accent)] text-black font-bold text-sm px-6 py-2 rounded-lg hover:brightness-110 transition-all">
                        Adicionar Recurso
                    </button>
                    {resourceMsg && <p className={`text-xs ${resourceMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{resourceMsg}</p>}

                    {/* Resources list */}
                    {resources.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                            <h3 className="text-sm font-bold text-white mb-3">Links Cadastrados ({resources.length})</h3>
                            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                                {resources.map(r => (
                                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20 text-sm">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-[var(--color-wurm-muted)] uppercase tracking-wider">
                                                    {r.type === 'tool' && '🔨 Ferramenta'}
                                                    {r.type === 'map' && '🗺️ Mapa'}
                                                    {r.type === 'sheet' && '📊 Planilha'}
                                                    {r.type === 'doc' && '📜 Documento'}
                                                    {r.type === 'external' && '🔗 Link'}
                                                </span>
                                                <span className="font-bold text-white truncate">{r.name}</span>
                                            </div>
                                            <div className="text-xs text-[var(--color-wurm-muted)] truncate font-mono">
                                                {r.url} {r.author && ` · Por ${r.author}`}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteResource(r.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-xs shrink-0"
                                            title="Deletar este recurso"
                                        >
                                            <X size={14} /> Excluir
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                <section className="glass-panel p-6 rounded-2xl space-y-4 border border-[var(--color-wurm-accent)]/20">
                    <h2 className="font-serif text-xl text-white m-0 border-none pt-0 flex items-center gap-2">
                        <Camera size={18} className="text-[var(--color-wurm-accent)]" /> Gerenciar Galeria de Fotos
                    </h2>

                    {/* Gallery Card Configs */}
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3 mb-6">
                        <h3 className="text-[10px] font-bold text-[var(--color-wurm-muted)] uppercase tracking-wider">Configurações do Card Principal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Título (PT / EN)</label>
                                <div className="flex gap-2">
                                    <input className={inputCls} value={hubSettings.gallery_card_title_pt} onChange={e => setHubSettings(prev => ({ ...prev, gallery_card_title_pt: e.target.value }))} placeholder="Fotografia de Deeds" />
                                    <input className={inputCls} value={hubSettings.gallery_card_title_en} onChange={e => setHubSettings(prev => ({ ...prev, gallery_card_title_en: e.target.value }))} placeholder="Deed Photography" />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Subtítulo (PT / EN)</label>
                                <div className="flex gap-2">
                                    <input className={inputCls} value={hubSettings.gallery_card_subtitle_pt} onChange={e => setHubSettings(prev => ({ ...prev, gallery_card_subtitle_pt: e.target.value }))} placeholder="Concurso da Comunidade" />
                                    <input className={inputCls} value={hubSettings.gallery_card_subtitle_en} onChange={e => setHubSettings(prev => ({ ...prev, gallery_card_subtitle_en: e.target.value }))} placeholder="Community Contest" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <button onClick={handleUpdateHubSettings} className="bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded hover:bg-white/20 transition-all">
                                Salvar Títulos do Card
                            </button>
                            {settingsMsg && <span className={`text-[10px] ${settingsMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{settingsMsg}</span>}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                        <h3 className="text-sm font-bold text-white mb-3">Adicionar Nova Foto</h3>

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
                    </div>

                    {/* Lista de fotos */}
                    {photos.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                            <h3 className="text-sm font-bold text-white mb-3">Fotos Publicadas ({photos.length})</h3>
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                                {photos.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20 text-sm">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <img src={p.image_url} alt="Thumbnail" className="w-16 h-10 object-cover rounded opacity-80" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white px-1.5 py-0.5 rounded">
                                                        {p.event_tag}
                                                    </span>
                                                    <span className="font-bold text-white truncate">{p.deed_name || p.title || 'Sem título'}</span>
                                                </div>
                                                <div className="text-xs text-[var(--color-wurm-muted)] truncate font-mono flex gap-2">
                                                    <span>Por {p.author_name || 'Desconhecido'}</span>
                                                    <span>·</span>
                                                    <span className="text-red-400">♥ {p.votes}</span>
                                                    <span>·</span>
                                                    <span>{new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleHidePhoto(p.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-xs shrink-0"
                                            title="Ocultar foto da galeria"
                                        >
                                            <X size={14} /> Ocultar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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

                    {/* Importação em Lote (.txt) */}
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Importação em Lote (.txt)</h3>
                        <p className="text-[10px] text-[var(--color-wurm-muted)] leading-relaxed">
                            Suba um arquivo <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[var(--color-wurm-accent)]">.txt</code> com uma frase por linha.
                            <br />
                            Formatos aceitos por linha:
                            <br />
                            • <code className="bg-black/20 px-1 font-mono text-white">Frase em Português | Tradução em Inglês | Autor</code>
                            <br />
                            • <code className="bg-black/20 px-1 font-mono text-white">Frase em Português | Autor</code>
                            <br />
                            • <code className="bg-black/20 px-1 font-mono text-white">Apenas a Frase em Português</code> (Autor padrão será "A Guilda")
                        </p>
                        <div className="relative flex items-center justify-center border border-dashed border-white/20 hover:border-[var(--color-wurm-accent)]/50 rounded-lg p-4 bg-black/20 transition-all cursor-pointer">
                            <input 
                                type="file" 
                                accept=".txt" 
                                onChange={handleBulkUploadQuotes} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                            <div className="text-center text-xs text-white/60">
                                📤 Selecione ou arraste o arquivo <span className="text-[var(--color-wurm-accent)] font-bold">.txt</span>
                            </div>
                        </div>
                    </div>

                    {/* Lista de quotes */}
                    {quotes.length > 0 && (
                        <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
                            <p className={labelCls}>{quotes.length} frase(s) cadastrada(s)</p>
                            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                                {quotes.map(q => (
                                    <div key={q.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                        q.is_active
                                            ? 'border-white/10 bg-white/[0.02]'
                                            : 'border-white/5 bg-white/[0.01] opacity-40'
                                    }`}>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-white m-0 font-serif italic leading-relaxed">"{q.text_pt}"</p>
                                            {q.text_en && <p className="text-[11px] text-[var(--color-wurm-muted)] m-0 font-serif italic leading-relaxed mt-1">"{q.text_en}"</p>}
                                            <p className="text-[9px] font-mono text-[var(--color-wurm-muted)] mt-1.5 m-0">— {q.author}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
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
                                            <button
                                                onClick={() => handleDeleteQuote(q.id)}
                                                className="text-[9px] font-mono uppercase px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                                                title="Excluir frase permanentemente"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
