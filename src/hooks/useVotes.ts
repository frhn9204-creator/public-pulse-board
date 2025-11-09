import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Vote {
  id: string;
  issue_id: string;
  user_id: string;
  created_at: string;
}

export function useVotes(issueId?: string) {
  const [votes, setVotes] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('votes')
          .select('*');
        
        if (fetchError) throw fetchError;
        
        const voteMap = new Map<string, number>();
        (data || []).forEach((vote: Vote) => {
          voteMap.set(vote.issue_id, (voteMap.get(vote.issue_id) || 0) + 1);
        });
        setVotes(voteMap);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();

    const channel = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        (payload) => {
          setVotes((prev) => {
            const newMap = new Map(prev);
            const issueId = (payload.new as any)?.issue_id || (payload.old as any)?.issue_id;
            
            if (payload.eventType === 'INSERT') {
              newMap.set(issueId, (newMap.get(issueId) || 0) + 1);
            } else if (payload.eventType === 'DELETE') {
              newMap.set(issueId, Math.max(0, (newMap.get(issueId) || 1) - 1));
            }
            return newMap;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getVoteCount = (id: string) => votes.get(id) || 0;

  return { votes, getVoteCount, loading, error };
}
