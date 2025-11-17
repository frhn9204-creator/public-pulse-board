import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";

const AdminGeocoding = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ total: number; success: number; failed: number } | null>(null);
  const { toast } = useToast();

  const handleBatchGeocode = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('batch-geocode-issues');

      if (error) throw error;

      setResult(data);
      toast({
        title: "Geocoding completed!",
        description: `Successfully geocoded ${data.success} out of ${data.total} issues.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to geocode issues",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                <CardTitle>Batch Geocoding</CardTitle>
              </div>
              <CardDescription>
                Geocode all existing issues that don't have coordinates yet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will process all issues in the database that have a location but are missing latitude/longitude coordinates. 
                It may take a few moments to complete.
              </p>
              
              <Button 
                onClick={handleBatchGeocode} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start Geocoding'
                )}
              </Button>

              {result && (
                <div className="mt-6 p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold">Results:</h3>
                  <div className="space-y-1 text-sm">
                    <p>Total issues processed: <span className="font-medium">{result.total}</span></p>
                    <p className="text-success">Successfully geocoded: <span className="font-medium">{result.success}</span></p>
                    <p className="text-destructive">Failed: <span className="font-medium">{result.failed}</span></p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminGeocoding;
