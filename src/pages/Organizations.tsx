import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Building2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

const Organizations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const organizations: any[] = [];

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
              Organizations with faster response times are highlighted.
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
            {organizations.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Organizations Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Organizations will appear here once issues are reported
                </p>
                <Button size="lg">Report First Issue</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org: any) => (
                  <Card key={org.id} className="hover:shadow-lg transition-all hover-scale">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        {org.verified && (
                          <Badge variant="default" className="bg-success">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{org.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{org.category}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            Active Issues
                          </span>
                          <span className="font-semibold">{org.activeIssues}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            Resolved
                          </span>
                          <span className="font-semibold text-success">{org.resolvedIssues}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Avg Response
                          </span>
                          <span className="font-semibold">{org.avgResponseTime}</span>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          View Profile
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
