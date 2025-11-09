import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowUp, MessageSquare, Share2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface IssueCardProps {
  id: string;
  title: string;
  organization: string;
  category?: string;
  urgency?: "low" | "medium" | "high" | "critical";
  votes: number;
  image_url?: string;
  status: "open" | "in_progress" | "resolved";
  created_at: string;
}

const urgencyColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning text-warning-foreground",
  high: "bg-urgent text-urgent-foreground",
  critical: "bg-destructive text-destructive-foreground",
};

const statusColors = {
  open: "border-l-urgent",
  in_progress: "border-l-warning",
  resolved: "border-l-success",
};

const IssueCard = ({
  id,
  title,
  organization,
  category = "other",
  urgency = "medium",
  votes,
  image_url,
  status,
  created_at,
}: IssueCardProps) => {
  const comments = 0;
  const views = 0;
  const formattedDate = new Date(created_at).toLocaleDateString();
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all border-l-4 ${statusColors[status]} group`}>
      {image_url && (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <Link to={`/issue/${id}`}>
              <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                {title}
              </h3>
            </Link>
            <Link to={`/organization/${organization.toLowerCase().replace(/\s+/g, "-")}`}>
              <p className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {organization}
              </p>
            </Link>
          </div>
          <Badge className={urgencyColors[urgency]} variant="secondary">
            {urgency}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">{category}</Badge>
          {status === "resolved" && (
            <Badge className="bg-success text-success-foreground">Resolved</Badge>
          )}
          {status === "in_progress" && (
            <Badge className="bg-warning text-warning-foreground">In Progress</Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{comments}</span>
          </div>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary">
          <ArrowUp className="h-4 w-4" />
          <span className="font-semibold">{votes}</span>
          <span className="hidden sm:inline">Votes</span>
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IssueCard;
