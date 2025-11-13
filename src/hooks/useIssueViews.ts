import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useIssueViews(issueId?: string) {
  const [viewCounts, setViewCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('issue_views')
          .select('issue_id');
        
        if (fetchError) throw fetchError;
        
        const counts = new Map<string, number>();
        (data || []).forEach((view: { issue_id: string }) => {
          counts.set(view.issue_id, (counts.get(view.issue_id) || 0) + 1);
        });
        setViewCounts(counts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchViews();

    const channel = supabase
      .channel('issue-views-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issue_views'
        },
        (payload) => {
          const view = payload.new as { issue_id: string };
          setViewCounts((prev) => {
            const newMap = new Map(prev);
            newMap.set(view.issue_id, (newMap.get(view.issue_id) || 0) + 1);
            return newMap;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const trackView = async (issueId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('issue_views').insert({
      issue_id: issueId,
      user_id: user?.id || null
    });
  };

  const getViewCount = (id: string) => viewCounts.get(id) || 0;

  return { viewCounts, getViewCount, trackView, loading, error };
}
