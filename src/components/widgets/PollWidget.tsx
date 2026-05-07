import { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { getActivePoll, votePoll, type HubPoll } from '../../services/hubPolls';
import { useLanguage } from '../../contexts/LanguageContext';
import { ToolWidget } from '../ecosystem/ToolWidget';

export function PollWidget() {
    const [poll, setPoll] = useState<HubPoll | null>(null);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState<string | null>(null); // option id voted
    const [voting, setVoting] = useState(false);
    const [result, setResult] = useState<'ok' | 'already_voted' | 'error' | null>(null);
    const { lang, t } = useLanguage();

    useEffect(() => {
        getActivePoll().then(p => { setPoll(p); setLoading(false); });
    }, []);

    const handleVote = async (optionId: string) => {
        if (!poll || voting || voted) return;
        setVoting(true);
        const res = await votePoll(poll.id, optionId);
        setResult(res);
        if (res === 'ok' || res === 'already_voted') {
            setVoted(optionId);
            // Refresh counts after voting
            const updated = await getActivePoll();
            if (updated) setPoll(updated);
        }
        setVoting(false);
    };

    const hasVoted = voted !== null || result === 'already_voted';
    const question = lang === 'pt' ? poll?.question_pt : poll?.question_en;

    return (
        <ToolWidget
            title={t('Community Poll', 'Enquete')}
            subtitle={t('Your voice matters', 'Voz da Comunidade')}
            icon={MessageSquare}
            href="#"
            accentColor="#3b82f6"
            status={poll ? 'active' : 'coming-soon'}
        >
            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-8 bg-white/5 rounded" />
                    <div className="h-8 bg-white/5 rounded" />
                </div>
            ) : !poll ? (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-[var(--color-wurm-muted)] leading-relaxed m-0">
                        {t(
                            'Your opinion shapes the Guild. A new poll is on the way!',
                            'Sua opinião constrói a Guilda. Uma nova enquete vem aí!'
                        )}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--color-wurm-muted)] opacity-50 m-0">
                        {t('Check back soon.', 'Volte em breve.')}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-bold text-white m-0 leading-snug">{question}</p>

                    <div className="space-y-2">
                        {poll.options.map(option => {
                            const pct = poll.totalVotes > 0
                                ? Math.round((option.votes / poll.totalVotes) * 100)
                                : 0;
                            const label = lang === 'pt' ? option.label_pt : option.label_en;
                            const isChosen = voted === option.id;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleVote(option.id)}
                                    disabled={hasVoted || voting}
                                    className={`w-full h-8 rounded text-left px-3 text-[10px] relative overflow-hidden transition-all group/opt
                                        ${hasVoted ? 'cursor-default' : 'hover:brightness-110 cursor-pointer'}
                                        ${isChosen ? 'ring-1 ring-blue-500/50' : ''}
                                    `}
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    {/* Progress fill */}
                                    <div
                                        className="absolute left-0 top-0 h-full bg-blue-500/20 transition-all duration-700"
                                        style={{ width: hasVoted ? `${pct}%` : '0%' }}
                                    />
                                    <span className="relative z-10 flex justify-between items-center">
                                        <span className="flex items-center gap-1.5">
                                            {isChosen && <CheckCircle size={10} className="text-blue-400" />}
                                            {label}
                                        </span>
                                        {hasVoted && (
                                            <span className="font-bold text-blue-400">{pct}%</span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {result === 'already_voted' && (
                        <p className="text-[9px] text-blue-400 m-0">
                            {t('You already voted in this poll.', 'Você já votou nesta enquete.')}
                        </p>
                    )}
                    <p className="text-[9px] text-[var(--color-wurm-muted)] m-0">
                        {poll.totalVotes} {t('votes', 'votos')}
                    </p>
                </div>
            )}
        </ToolWidget>
    );
}
