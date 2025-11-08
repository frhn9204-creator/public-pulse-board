import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export interface Issue {
  id: string;
  title: string;
  description: string;
  organization: string;
  votes: number;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  image_url?: string;
}

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const fetchIssues = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        setIssues(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();

    subscription = supabase
      .from('issues')
      .on('*', (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setIssues((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIssues((prev) =>
            prev.map((issue) =>
              issue.id === payload.new.id ? payload.new : issue
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setIssues((prev) =>
            prev.filter((issue) => issue.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { issues, loading, error };
}
