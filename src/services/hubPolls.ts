import { supabase } from '../lib/supabase';

export interface HubPoll {
    id: string;
    question_pt: string;
    question_en: string;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
    options: HubPollOption[];
    totalVotes: number;
}

export interface HubPollOption {
    id: string;
    poll_id: string;
    label_pt: string;
    label_en: string;
    sort_order: number;
    votes: number;
}

export async function getActivePoll(): Promise<HubPoll | null> {
    const { data: poll, error } = await supabase
        .from('hub_polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !poll) return null;

    const { data: options } = await supabase
        .from('hub_poll_options')
        .select('*')
        .eq('poll_id', poll.id)
        .order('sort_order');

    const { data: votes } = await supabase
        .from('hub_poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id);

    const voteCounts: Record<string, number> = {};
    (votes ?? []).forEach(v => {
        voteCounts[v.option_id] = (voteCounts[v.option_id] ?? 0) + 1;
    });

    const mappedOptions: HubPollOption[] = (options ?? []).map(o => ({
        ...o,
        votes: voteCounts[o.id] ?? 0,
    }));

    return {
        ...poll,
        options: mappedOptions,
        totalVotes: (votes ?? []).length,
    };
}

// Hash simples do IP no client (sem enviar o IP bruto ao banco)
async function hashIP(): Promise<string> {
    // Gera um fingerprint baseado em user agent + resolução (não perfeito mas suficiente para vote throttling)
    const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export async function votePoll(pollId: string, optionId: string): Promise<'ok' | 'already_voted' | 'error'> {
    try {
        const ipHash = await hashIP();
        const { data } = await supabase.rpc('vote_poll', {
            p_poll_id: pollId,
            p_option_id: optionId,
            p_ip_hash: ipHash,
        });
        if (data?.success) return 'ok';
        if (data?.reason === 'already_voted') return 'already_voted';
        return 'error';
    } catch {
        return 'error';
    }
}

// Admin: criar enquete com opções
export async function createPoll(
    question_pt: string,
    question_en: string,
    options: { label_pt: string; label_en: string }[],
    expires_at?: string
): Promise<boolean> {
    const { data: poll, error } = await supabase
        .from('hub_polls')
        .insert({ question_pt, question_en, expires_at: expires_at || null, is_active: true })
        .select()
        .single();

    if (error || !poll) return false;

    const rows = options.map((o, i) => ({
        poll_id: poll.id,
        label_pt: o.label_pt,
        label_en: o.label_en,
        sort_order: i,
    }));

    const { error: optErr } = await supabase.from('hub_poll_options').insert(rows);
    return !optErr;
}

export async function closePoll(pollId: string): Promise<boolean> {
    const { error } = await supabase
        .from('hub_polls')
        .update({ is_active: false })
        .eq('id', pollId);
    return !error;
}
