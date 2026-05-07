import { supabase } from '../lib/supabase';

export interface HubFeedItem {
    id: string;
    type: 'update' | 'event' | 'alert' | 'article' | 'maintenance' | 'badge';
    title_pt: string;
    title_en: string | null;
    description_pt: string;
    description_en: string | null;
    link: string | null;
    post_date: string;
    is_active: boolean;
    created_at: string;
}

export async function getFeedItems(limit = 10): Promise<HubFeedItem[]> {
    const { data, error } = await supabase
        .from('hub_feed')
        .select('*')
        .eq('is_active', true)
        .order('post_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.warn('Ecosystem Feed fetch failed:', error.message);
        return [];
    }

    return (data ?? []) as HubFeedItem[];
}

export async function addFeedItem(item: Omit<HubFeedItem, 'id' | 'is_active' | 'created_at'>): Promise<boolean> {
    const { error } = await supabase
        .from('hub_feed')
        .insert(item);
        
    return !error;
}

export async function toggleFeedItem(id: string, is_active: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('hub_feed')
        .update({ is_active })
        .eq('id', id);
        
    return !error;
}
