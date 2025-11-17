import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Map from "@/components/Map";
import { useIssues } from "@/hooks/useIssues";
import { Loader2, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MapView = () => {
  const { issues, loading } = useIssues();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter;
    const matchesUrgency = urgencyFilter === "all" || issue.urgency === urgencyFilter;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.organization.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Only show issues with coordinates
    return matchesCategory && matchesUrgency && matchesSearch && issue.latitude && issue.longitude;
  });

  const issuesWithCoords = issues.filter(i => i.latitude && i.longitude).length;
  const issuesWithoutCoords = issues.length - issuesWithCoords;

  const handleGeocode = async () => {
    setIsGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('batch-geocode-issues');
      
      if (error) throw error;
      
      toast({
        title: "Geocoding completed!",
        description: `Successfully geocoded ${data.success} out of ${data.total} issues.`,
      });
      
      // Refresh the page to show updated issues
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to geocode issues",
        variant: "destructive",
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Issue Map</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Visualize all reported issues on an interactive map. Click on markers to view details.
            </p>
            {issuesWithoutCoords > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-3">
                  {issuesWithoutCoords} issue(s) without location coordinates are hidden from the map.
                </p>
                <Button 
                  onClick={handleGeocode}
                  disabled={isGeocoding}
                  size="sm"
                  variant="outline"
                >
                  {isGeocoding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Geocoding...
                    </>
                  ) : (
                    'Geocode All Issues'
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Public Safety">Public Safety</SelectItem>
                  <SelectItem value="Environment">Environment</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Urgency Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredIssues.length} of {issuesWithCoords} issues with location data
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed rounded-lg">
                <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
                <p className="text-muted-foreground">
                  {issuesWithCoords === 0 
                    ? "No issues with location data available yet."
                    : "Try adjusting your filters to see more issues."}
                </p>
              </div>
            ) : (
              <Map issues={filteredIssues} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MapView;
