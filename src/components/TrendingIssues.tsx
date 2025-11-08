import { TrendingUp } from "lucide-react";
import IssueCard from "./IssueCard";

const TrendingIssues = () => {
  const trendingIssues = [
    {
      id: "1",
      title: "Dangerous pothole causing accidents on Main Street near City Hospital",
      organization: "Municipal Corporation",
      category: "Infrastructure",
      urgency: "critical" as const,
      votes: 234,
      comments: 45,
      views: 1205,
      imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop",
      status: "open" as const,
      createdAt: "2 days ago",
    },
    {
      id: "2",
      title: "Street lights not working in Sector 15 for over a month",
      organization: "Electricity Board",
      category: "Safety",
      urgency: "high" as const,
      votes: 189,
      comments: 32,
      views: 890,
      status: "in-progress" as const,
      createdAt: "5 days ago",
    },
    {
      id: "3",
      title: "Overflowing garbage bins attracting stray animals in residential area",
      organization: "Municipal Corporation",
      category: "Cleanliness",
      urgency: "medium" as const,
      votes: 156,
      comments: 28,
      views: 675,
      imageUrl: "https://images.unsplash.com/photo-1625736552722-0934c5d0b83a?w=800&auto=format&fit=crop",
      status: "open" as const,
      createdAt: "1 week ago",
    },
  ];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Trending Issues</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingIssues.map((issue) => (
            <IssueCard key={issue.id} {...issue} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingIssues;
