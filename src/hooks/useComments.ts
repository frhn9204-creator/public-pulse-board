import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useComments(issueId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('comments')
          .select('*')
          .eq('issue_id', issueId)
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        setComments((data || []) as Comment[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    const channel = supabase
      .channel(`comments-${issueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `issue_id=eq.${issueId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments((prev) => [payload.new as Comment, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === payload.new.id ? (payload.new as Comment) : comment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) =>
              prev.filter((comment) => comment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [issueId]);

  const addComment = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error: insertError } = await supabase
      .from('comments')
      .insert({
        issue_id: issueId,
        user_id: user.id,
        content
      });

    if (insertError) throw insertError;
  };

  return { comments, loading, error, addComment };
}
