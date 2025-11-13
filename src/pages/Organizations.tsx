import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Building2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface OrgData {
  name: string;
  activeIssues: number;
  resolvedIssues: number;
  totalIssues: number;
}

const Organizations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [organizations, setOrganizations] = useState<OrgData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('issues')
          .select('organization, status, created_at');
        
        if (error) throw error;
        
        if (data) {
          // Group by organization and calculate stats
          const orgStats = data.reduce((acc: any, issue: any) => {
            const org = issue.organization;
            if (!acc[org]) {
              acc[org] = {
                name: org,
                activeIssues: 0,
                resolvedIssues: 0,
                totalIssues: 0
              };
            }
            acc[org].totalIssues++;
            if (issue.status === 'resolved') {
              acc[org].resolvedIssues++;
            } else {
              acc[org].activeIssues++;
            }
            return acc;
          }, {});
          
          // Convert to array and sort by total issues
          const orgsArray = Object.values(orgStats)
            .sort((a: any, b: any) => b.totalIssues - a.totalIssues);
          
          setOrganizations(orgsArray as OrgData[]);
        }
      } catch (err: any) {
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrganizations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('issues-org-changes')
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

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12 border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-6">Organizations</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Browse organizations and see how they're responding to community issues. 
              Track active and resolved issues for each organization.
            </p>
            {/* Search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
        </section>

        {/* Organizations List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Loading organizations...</p>
              </div>
            ) : filteredOrganizations.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  {searchQuery ? 'No Organizations Found' : 'No Organizations Yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search query'
                    : 'Organizations will appear here once issues are reported'
                  }
                </p>
                {!searchQuery && (
                  <Button size="lg" onClick={() => navigate('/submit')}>
                    Report First Issue
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizations.map((org) => (
                  <Card key={org.name} className="hover:shadow-lg transition-all hover-scale">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{org.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            Active Issues
                          </span>
                          <span className="font-semibold text-urgent">{org.activeIssues}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            Resolved
                          </span>
                          <span className="font-semibold text-success">{org.resolvedIssues}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Issues</span>
                          <span className="font-semibold">{org.totalIssues}</span>
                        </div>
                        <Button 
                          className="w-full mt-4" 
                          variant="outline"
                          onClick={() => navigate(`/issues?org=${encodeURIComponent(org.name)}`)}
                        >
                          View Issues
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Organizations;
