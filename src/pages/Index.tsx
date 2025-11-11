import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import TrendingIssues from "@/components/TrendingIssues";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [organizations, setOrganizations] = useState<string[]>([]);

  useEffect(() => {
    // Fetch unique organizations from issues
    const fetchOrganizations = async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('organization')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        // Get unique organizations
        const uniqueOrgs = [...new Set(data.map(issue => issue.organization))];
        setOrganizations(uniqueOrgs.slice(0, 10)); // Show top 10
      }
    };

    fetchOrganizations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('issues-orgs-changes')
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <TrendingIssues />
        
        {/* Organizations Section */}
        {organizations.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8 text-center">Organizations with Reported Issues</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {organizations.map((org, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <p className="font-semibold text-center">{org}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
