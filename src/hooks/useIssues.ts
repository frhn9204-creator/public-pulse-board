import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Issue {
  id: string;
  title: string;
  description: string;
  organization: string;
  category?: string;
  urgency?: string;
  location?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  image_url?: string;
  user_id?: string;
}

export function useIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        setIssues((data || []) as Issue[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();

    const channel = supabase
      .channel('issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIssues((prev) => [payload.new as Issue, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIssues((prev) =>
              prev.map((issue) =>
                issue.id === payload.new.id ? (payload.new as Issue) : issue
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setIssues((prev) =>
              prev.filter((issue) => issue.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { issues, loading, error };
}
