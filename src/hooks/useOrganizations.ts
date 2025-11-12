import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOrganizations() {
  const [organizationCount, setOrganizationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('issues')
          .select('organization')
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        // Get unique organizations count
        if (data) {
          const uniqueOrgs = new Set(data.map(issue => issue.organization));
          setOrganizationCount(uniqueOrgs.size);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('issues-org-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        () => {
          // Refetch organizations when issues change
          fetchOrganizations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { organizationCount, loading, error };
}
