import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IssueCard from "@/components/IssueCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

const Issues = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const issues: any[] = [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Search Header */}
        <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12 border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-6">Browse All Issues</h1>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Explore and support issues that matter to your community. Vote for problems you've experienced.
            </p>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search issues by keyword, organization, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[180px] h-12">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="corruption">Corruption</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full md:w-[180px] h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="resolved">Recently Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Issues Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {issues.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Issues Found</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to report an issue in your community
                </p>
                <Button size="lg">Report First Issue</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} {...issue} />
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

export default Issues;
