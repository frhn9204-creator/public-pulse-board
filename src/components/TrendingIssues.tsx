import { TrendingUp } from "lucide-react";
import IssueCard from "./IssueCard";
import { useIssues } from "@/hooks/useIssues";
import { useVotes } from "@/hooks/useVotes";

const TrendingIssues = () => {
  const { issues } = useIssues();
  const { getVoteCount } = useVotes();
  
  const trendingIssues = issues
    .map(issue => ({
      ...issue,
      votes: getVoteCount(issue.id),
      urgency: (issue.urgency || 'medium') as "low" | "medium" | "high" | "critical"
    }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 6);

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
