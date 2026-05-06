import { supabase } from '../lib/supabase';

export interface HubArticle {
    id: string;
    slug: string;
    title_pt: string | null;
    title_en: string;
    excerpt_pt: string | null;
    excerpt_en: string;
    category: string;
    published_at: string | null;
    created_at: string;
    views: number;
}

export async function getLatestArticle(): Promise<HubArticle | null> {
    const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title_en, title_pt, excerpt_en, excerpt_pt, category, published_at, created_at, views')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.warn('HUB Analytics fetch failed:', error.message);
        return null;
    }

    return data as HubArticle;
}

export async function getArticleCount(): Promise<number> {
    const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

    if (error) return 0;
    return count ?? 0;
}
