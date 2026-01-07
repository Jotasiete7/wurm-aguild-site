
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabase<T extends { id: string }>(tableName: string) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const { data: result, error } = await supabase
                .from(tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setData(result as T[] || []);
        } catch (err: any) {
            console.error(`Error fetching ${tableName}:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [tableName]);

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel(`public:${tableName}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
                const { eventType, new: newRow, old: oldRow } = payload;

                setData((currentData) => {
                    if (eventType === 'INSERT') {
                        // Prevent duplicates if we already added it optimistically
                        if (currentData.some(item => item.id === (newRow as T).id)) return currentData;
                        return [newRow as T, ...currentData];
                    } else if (eventType === 'UPDATE') {
                        return currentData.map(item => item.id === (newRow as T).id ? (newRow as T) : item);
                    } else if (eventType === 'DELETE') {
                        return currentData.filter(item => item.id !== (oldRow as T).id);
                    }
                    return currentData;
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tableName, fetchData]);

    const create = useCallback(async (item: Partial<T>) => {
        // Optimistic update impossible without ID, so we wait for DB return
        const { error } = await supabase.from(tableName).insert([item]).select().single();

        if (error) {
            console.error('Error creating:', error);
            alert('Erro ao salvar: ' + error.message);
        }
        // Subscription handles adding the item automatically via realtime event
    }, [tableName]);

    const update = useCallback(async (id: string, updates: Partial<T>) => {
        // Optimistic Update
        setData(prev => prev.map(i => i.id === id ? { ...i, ...updates } as T : i));

        const { error } = await supabase.from(tableName).update(updates).eq('id', id);
        if (error) {
            console.error('Error updating:', error);
            // Revert on error (optional, but good practice)
            fetchData();
        }
    }, [tableName, fetchData]);

    const remove = useCallback(async (id: string) => {
        // Optimistic Update
        setData(prev => prev.filter(i => i.id !== id));

        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) {
            console.error('Error deleting:', error);
            fetchData();
        }
    }, [tableName, fetchData]);

    return useMemo(
        () => ({ data, loading, error, create, update, remove }),
        [data, loading, error, create, update, remove]
    );
}
