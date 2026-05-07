import { supabase } from '../lib/supabase';

export interface ServiceOrder {
    id: string;
    title: string;
    description?: string;
    price: string;
    provider: string;
    type: 'service' | 'material';
    intent: 'buy' | 'sell';
    status: 'open' | 'in_progress' | 'closed';
    assigned_to?: string | null;
    created_at: string;
}

export interface PublicResource {
    id: string;
    name: string;
    type: 'tool' | 'map' | 'sheet' | 'doc' | 'external';
    access: 'public' | 'members' | 'admins';
    url: string;
    author?: string;
}

export async function getOpenOrders(limit = 8): Promise<ServiceOrder[]> {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) { console.warn('Services fetch failed:', error.message); return []; }
    return (data ?? []) as ServiceOrder[];
}

export async function getAllOrders(): Promise<ServiceOrder[]> {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) { console.warn('Services fetch failed:', error.message); return []; }
    return (data ?? []) as ServiceOrder[];
}

export async function addOrder(order: Omit<ServiceOrder, 'id' | 'created_at'>): Promise<boolean> {
    const { error } = await supabase
        .from('services')
        .insert(order);
    return !error;
}

export async function closeOrder(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('services')
        .update({ status: 'closed' })
        .eq('id', id);
    return !error;
}

export async function getPublicResources(): Promise<PublicResource[]> {
    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('access', 'public')
        .order('created_at', { ascending: false });

    if (error) { console.warn('Resources fetch failed:', error.message); return []; }
    return (data ?? []) as PublicResource[];
}
