import { supabase } from '../lib/supabase';

export interface HubBadge {
    id: string;
    name: string;
    description: string;
    image_url: string;
    category: string;
    rarity: 'Comum' | 'Rara' | 'Epica' | 'Lendaria';
    max_supply: number | null;
    created_at: string;
}

export async function getLatestBadges(limit = 5): Promise<HubBadge[]> {
    const { data, error } = await supabase
        .from('badges')
        .select('id, name, description, image_url, category, rarity, max_supply, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.warn('HUB Badges fetch failed:', error.message);
        return [];
    }

    return (data ?? []) as HubBadge[];
}

export async function getBadgeCount(): Promise<number> {
    const { count, error } = await supabase
        .from('badges')
        .select('*', { count: 'exact', head: true });

    if (error) return 0;
    return count ?? 0;
}

export function getRarityColor(rarity: HubBadge['rarity']): string {
    const colors: Record<HubBadge['rarity'], string> = {
        Lendaria: '#f59e0b',  // amber
        Epica:    '#a855f7',  // purple
        Rara:     '#3b82f6',  // blue
        Comum:    '#6b7280',  // gray
    };
    return colors[rarity] ?? '#6b7280';
}
