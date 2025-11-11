import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const issueSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  organization: z.string().trim().min(2, "Organization must be at least 2 characters").max(100, "Organization must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  urgency: z.string().min(1, "Urgency is required"),
  location: z.string().max(200, "Location must be less than 200 characters").optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000, "Description must be less than 5000 characters"),
  imageUrl: z.string().url("Must be a valid URL").max(500, "URL must be less than 500 characters").optional().or(z.literal(''))
});

const organizationWebsites: Record<string, string> = {
  "Municipal Corporation": "https://www.india.gov.in/topics/infrastructure/municipal-corporation",
  "Police Department": "https://www.mha.gov.in/",
  "Public Health Department": "https://www.mohfw.gov.in/",
  "Public Works Department (Roads)": "https://morth.nic.in/",
  "Water Supply Department": "https://jalshakti-ddws.gov.in/",
  "Electricity Board": "https://powermin.gov.in/",
  "Transport Department": "https://morth.nic.in/road-transport",
  "Education Department": "https://www.education.gov.in/",
  "Housing Board": "https://mohua.gov.in/",
  "Waste Management Department": "https://swachhbharat.mygov.in/",
  "Fire Department": "https://www.india.gov.in/topics/infrastructure/fire-services",
  "Traffic Police": "https://morth.nic.in/road-transport",
  "Revenue Department": "https://www.india.gov.in/topics/governance-administration/revenue-department",
  "Food Safety Department": "https://www.fssai.gov.in/",
  "Environmental Department": "https://moef.gov.in/"
};

const Submit = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    category: "",
    urgency: "",
    location: "",
    description: "",
    imageUrl: ""
  });

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to report an issue.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, loading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    setIsSubmitting(true);
    
    try {
      // Validate input data
      const validatedData = issueSchema.parse({
        title: formData.title,
        organization: formData.organization,
        category: formData.category,
        urgency: formData.urgency,
        location: formData.location || undefined,
        description: formData.description,
        imageUrl: formData.imageUrl || ''
      });

      const { error } = await supabase
        .from('issues')
        .insert({
          title: validatedData.title,
          organization: validatedData.organization,
          category: validatedData.category,
          urgency: validatedData.urgency,
          location: validatedData.location || null,
          description: validatedData.description,
          image_url: validatedData.imageUrl || null,
          user_id: user.id,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Issue reported successfully!",
        description: "Your issue is now visible to the community.",
      });
      
      navigate("/issues");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error submitting issue",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Report an Issue</CardTitle>
              <CardDescription>
                Fill out the form below to report a problem in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization Name *</Label>
                  <Select 
                    value={formData.organization} 
                    onValueChange={(value) => setFormData({...formData, organization: value})}
                  >
                    <SelectTrigger id="organization">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Municipal Corporation">Municipal Corporation</SelectItem>
                      <SelectItem value="Police Department">Police Department</SelectItem>
                      <SelectItem value="Public Health Department">Public Health Department</SelectItem>
                      <SelectItem value="Public Works Department (Roads)">Public Works Department (Roads)</SelectItem>
                      <SelectItem value="Water Supply Department">Water Supply Department</SelectItem>
                      <SelectItem value="Electricity Board">Electricity Board</SelectItem>
                      <SelectItem value="Transport Department">Transport Department</SelectItem>
                      <SelectItem value="Education Department">Education Department</SelectItem>
                      <SelectItem value="Housing Board">Housing Board</SelectItem>
                      <SelectItem value="Waste Management Department">Waste Management Department</SelectItem>
                      <SelectItem value="Fire Department">Fire Department</SelectItem>
                      <SelectItem value="Traffic Police">Traffic Police</SelectItem>
                      <SelectItem value="Revenue Department">Revenue Department</SelectItem>
                      <SelectItem value="Food Safety Department">Food Safety Department</SelectItem>
                      <SelectItem value="Environmental Department">Environmental Department</SelectItem>
                      <SelectItem value="Other Government Agency">Other Government Agency</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.organization && organizationWebsites[formData.organization] && (
                    <a 
                      href={organizationWebsites[formData.organization]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Visit official website
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="cleanliness">Cleanliness</SelectItem>
                      <SelectItem value="corruption">Corruption</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level *</Label>
                  <Select 
                    value={formData.urgency}
                    onValueChange={(value) => setFormData({...formData, urgency: value})}
                  >
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Street, area, or landmark"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about the issue, when it started, and its impact..."
                    className="min-h-[150px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (Optional)</Label>
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a URL to an image showing the issue
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !formData.title || !formData.organization || !formData.category || !formData.urgency || !formData.description}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Issue"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Submit;
