import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export interface User {
  id: string;
  email?: string;
  created_at: string;
}

export function useUsers() {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('auth.users')
          .select('id', { count: 'exact', head: true });
        
        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        // Fallback: count from custom users table if exists
        const { count, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (count !== null) {
          setUserCount(count);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    subscription = supabase
      .from('users')
      .on('*', (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setUserCount((prev) => prev + 1);
        } else if (payload.eventType === 'DELETE') {
          setUserCount((prev) => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { userCount, loading, error };
}
