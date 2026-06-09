import { supabase } from '../lib/supabase';

export interface HubPhoto {
    id: string;
    image_url: string;
    title: string | null;
    author_name: string | null;
    deed_name: string | null;
    event_tag: string;
    votes: number;
    created_at: string;
}

export async function getGalleryPhotos(event_tag?: string): Promise<HubPhoto[]> {
    let query = supabase
        .from('hub_photos')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });

    if (event_tag) query = query.eq('event_tag', event_tag);

    const { data, error } = await query;
    if (error) { console.warn('Gallery fetch failed:', error.message); return []; }
    return (data ?? []) as HubPhoto[];
}

async function hashFingerprint(): Promise<string> {
    const raw = `${navigator.userAgent}|${screen.width}x${screen.height}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export async function votePhoto(photoId: string): Promise<'ok' | 'already_voted' | 'error'> {
    try {
        const ipHash = await hashFingerprint();
        const { data } = await supabase.rpc('vote_photo', {
            p_photo_id: photoId,
            p_ip_hash: ipHash,
        });
        if (data?.success) return 'ok';
        if (data?.reason === 'already_voted') return 'already_voted';
        return 'error';
    } catch {
        return 'error';
    }
}

// Admin: adicionar foto por URL
export async function addPhoto(photo: Omit<HubPhoto, 'id' | 'votes' | 'created_at'>): Promise<boolean> {
    const { error } = await supabase.from('hub_photos').insert(photo);
    return !error;
}

export async function hidePhoto(photoId: string): Promise<boolean> {
    const { error } = await supabase.from('hub_photos').update({ is_visible: false }).eq('id', photoId);
    return !error;
}

export async function deletePhoto(photoId: string): Promise<boolean> {
    const { error } = await supabase.from('hub_photos').delete().eq('id', photoId);
    return !error;
}
