import { supabase } from '../lib/supabase';

export interface SystemStatus {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
    is_active: boolean;
    author: string;
    created_at: string;
}

export async function getActiveStatus(): Promise<SystemStatus | null> {
    const { data, error } = await supabase
        .from('hub_system_status')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) return null;
    return data as SystemStatus;
}

export async function setStatus(
    message: string,
    type: 'info' | 'warning' | 'alert'
): Promise<boolean> {
    // Desativa todos os anteriores
    await supabase.from('hub_system_status').update({ is_active: false }).eq('is_active', true);

    if (!message.trim()) return true; // limpar sem criar novo

    const { error } = await supabase.from('hub_system_status').insert({
        message: message.trim(),
        type,
        is_active: true,
        author: 'Admin',
    });

    return !error;
}

export async function clearStatus(): Promise<boolean> {
    const { error } = await supabase
        .from('hub_system_status')
        .update({ is_active: false })
        .eq('is_active', true);
    return !error;
}
