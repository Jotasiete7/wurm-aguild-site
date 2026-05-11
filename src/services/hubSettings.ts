import { supabase } from '../lib/supabase';

export interface HubSetting {
    key: string;
    value: string;
    updated_at?: string;
}

export async function getSettings(): Promise<Record<string, string>> {
    const { data, error } = await supabase
        .from('hub_settings')
        .select('key, value');

    if (error) {
        console.warn('Settings fetch failed:', error.message);
        return {};
    }

    return (data || []).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
    const { error } = await supabase
        .from('hub_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() });

    return !error;
}

export async function updateSettings(settings: Record<string, string>): Promise<boolean> {
    const rows = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from('hub_settings')
        .upsert(rows);

    return !error;
}
