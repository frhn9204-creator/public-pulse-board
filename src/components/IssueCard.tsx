import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowUp, MessageSquare, Share2, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useComments } from "@/hooks/useComments";
import { useIssueViews } from "@/hooks/useIssueViews";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userVoted, setUserVoted] = useState(false);
  const { comments } = useComments(id);
  const { getViewCount } = useIssueViews();
  const formattedDate = new Date(created_at).toLocaleDateString();

  useEffect(() => {
    const checkUserVote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('votes')
        .select('*')
        .eq('issue_id', id)
        .eq('user_id', user.id)
        .single();

      setUserVoted(!!data);
    };

    checkUserVote();
  }, [id]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (userVoted) {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('issue_id', id)
        .eq('user_id', user.id);

      if (!error) {
        setUserVoted(false);
        toast({ title: "Vote removed" });
      }
    } else {
      const { error } = await supabase
        .from('votes')
        .insert({ issue_id: id, user_id: user.id });

      if (!error) {
        setUserVoted(true);
        toast({ title: "Vote added!" });
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/issues/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this issue: ${title}`,
          url: url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this link with others",
      });
    }
  };
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
            <Link to={`/issues/${id}`}>
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
            <span>{getViewCount(id)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{comments.length}</span>
          </div>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <Button
          onClick={handleVote}
          variant={userVoted ? "default" : "ghost"}
          size="sm"
          className="gap-2 hover:bg-primary/10 hover:text-primary"
        >
          <ArrowUp className="h-4 w-4" />
          <span className="font-semibold">{votes}</span>
          <span className="hidden sm:inline">{userVoted ? "Voted" : "Vote"}</span>
        </Button>
        <Button onClick={handleShare} variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IssueCard;
