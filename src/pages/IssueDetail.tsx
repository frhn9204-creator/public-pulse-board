import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowUp, Share2, MessageSquare, Eye, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useComments } from "@/hooks/useComments";
import { useIssueViews } from "@/hooks/useIssueViews";
import { useVotes } from "@/hooks/useVotes";
import { useToast } from "@/hooks/use-toast";
import { Issue } from "@/hooks/useIssues";

const IssueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [userVoted, setUserVoted] = useState(false);
  
  const { comments, addComment } = useComments(id || "");
  const { trackView, getViewCount } = useIssueViews();
  const { getVoteCount } = useVotes();

  useEffect(() => {
    if (!id) return;

    const fetchIssue = async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Issue not found",
          variant: "destructive",
        });
        navigate('/issues');
        return;
      }

      setIssue(data as Issue);
      setLoading(false);
      trackView(id);
    };

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

    fetchIssue();
    checkUserVote();
  }, [id, navigate, toast, trackView]);

  const handleVote = async () => {
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: issue?.title,
          text: issue?.description,
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

  const handleAddComment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!newComment.trim()) return;

    try {
      await addComment(newComment);
      setNewComment("");
      toast({ title: "Comment added!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!issue) return null;

  const urgencyColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-warning text-warning-foreground",
    high: "bg-urgent text-urgent-foreground",
    critical: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/issues')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Issues
          </Button>

          <Card className="mb-8">
            <CardContent className="p-8">
              {issue.image_url && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={issue.image_url}
                    alt={issue.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-bold">{issue.title}</h1>
                <Badge className={urgencyColors[issue.urgency as keyof typeof urgencyColors] || urgencyColors.medium}>
                  {issue.urgency || 'medium'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(issue.created_at).toLocaleDateString()}
                </div>
                {issue.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {issue.location}
                  </div>
                )}
                <Badge variant="outline">{issue.category}</Badge>
                {issue.status === 'resolved' && (
                  <Badge className="bg-success text-success-foreground">Resolved</Badge>
                )}
                {issue.status === 'in_progress' && (
                  <Badge className="bg-warning text-warning-foreground">In Progress</Badge>
                )}
              </div>

              <p className="text-lg mb-6 leading-relaxed">{issue.description}</p>

              <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{getViewCount(issue.id)}</span>
                  <span className="text-muted-foreground">views</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">{comments.length}</span>
                  <span className="text-muted-foreground">comments</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleVote}
                  variant={userVoted ? "default" : "outline"}
                  className="gap-2"
                >
                  <ArrowUp className="h-4 w-4" />
                  {userVoted ? "Voted" : "Vote"}
                  <span className="font-semibold">{getVoteCount(issue.id)}</span>
                </Button>
                <Button onClick={handleShare} variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Reported to:</p>
                <p className="font-semibold">{issue.organization}</p>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

              <div className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                />
                <Button onClick={handleAddComment}>Post Comment</Button>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-muted rounded-lg">
                    <p className="mb-2">{comment.content}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IssueDetail;
