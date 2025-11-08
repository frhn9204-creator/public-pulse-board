import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IssueCard from "@/components/IssueCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Clock, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Trending = () => {
  const trendingIssues: any[] = [];
  const trendingOrgs: any[] = [];
  const trendingLocations: any[] = [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Trending Now</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              See what's getting attention in your community right now. These are the most voted and discussed issues.
            </p>
          </div>
        </section>

        {/* Trending Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-8">
                <TabsTrigger value="issues">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Issues
                </TabsTrigger>
                <TabsTrigger value="organizations">
                  <Flame className="h-4 w-4 mr-2" />
                  Organizations
                </TabsTrigger>
                <TabsTrigger value="locations">
                  <MapPin className="h-4 w-4 mr-2" />
                  Locations
                </TabsTrigger>
              </TabsList>

              {/* Trending Issues Tab */}
              <TabsContent value="issues">
                {trendingIssues.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                      <TrendingUp className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">No Trending Issues</h3>
                    <p className="text-muted-foreground">
                      Issues that receive lots of votes and attention will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingIssues.map((issue) => (
                      <IssueCard key={issue.id} {...issue} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Trending Organizations Tab */}
              <TabsContent value="organizations">
                {trendingOrgs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                      <Flame className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">No Trending Organizations</h3>
                    <p className="text-muted-foreground">
                      Organizations with most issues or fastest responses will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trendingOrgs.map((org: any, index: number) => (
                      <Card key={org.id} className="hover:shadow-lg transition-all">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-primary">
                                #{index + 1}
                              </div>
                              <div>
                                <CardTitle>{org.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{org.category}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {org.trendingFor}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Issues: </span>
                              <span className="font-semibold">{org.issueCount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Votes: </span>
                              <span className="font-semibold">{org.voteCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Trending Locations Tab */}
              <TabsContent value="locations">
                {trendingLocations.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                      <MapPin className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">No Trending Locations</h3>
                    <p className="text-muted-foreground">
                      Areas with high concentration of issues will appear here
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingLocations.map((location: any) => (
                      <Card key={location.id} className="hover:shadow-lg transition-all">
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">{location.name}</CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground">{location.area}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Active Issues</span>
                              <span className="font-semibold text-urgent">{location.activeIssues}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Top Category</span>
                              <Badge variant="outline">{location.topCategory}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Trending;
