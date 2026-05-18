import { supabase } from '../lib/supabase';

export interface HubQuote {
    id: string;
    text_pt: string;
    text_en: string | null;
    author: string;
    is_active: boolean;
    created_at: string;
}

// Pega uma quote aleatória — rotaciona pelo dia usando a data como seed
export async function getDailyQuote(): Promise<HubQuote | null> {
    const { data, error } = await supabase
        .from('hub_quotes')
        .select('*')
        .eq('is_active', true);

    if (error || !data || data.length === 0) return null;

    // Seed determinístico: dia do ano → índice da lista
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
    );
    const index = dayOfYear % data.length;
    return data[index] as HubQuote;
}

export async function getAllQuotes(): Promise<HubQuote[]> {
    const { data, error } = await supabase
        .from('hub_quotes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return [];
    return (data ?? []) as HubQuote[];
}

export async function addQuote(text_pt: string, text_en: string, author: string): Promise<boolean> {
    const { error } = await supabase
        .from('hub_quotes')
        .insert({ text_pt, text_en: text_en || null, author });
    return !error;
}

export async function toggleQuote(id: string, is_active: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('hub_quotes')
        .update({ is_active })
        .eq('id', id);
    return !error;
}

export async function deleteQuote(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('hub_quotes')
        .delete()
        .eq('id', id);
    return !error;
}

export async function addQuotesBulk(quotes: Omit<HubQuote, 'id' | 'is_active' | 'created_at'>[]): Promise<boolean> {
    const { error } = await supabase
        .from('hub_quotes')
        .insert(quotes);
    return !error;
}
