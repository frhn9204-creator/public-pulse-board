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
import { Upload, Loader2, ExternalLink, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LocationPicker } from "@/components/LocationPicker";
import { VoiceDictation } from "@/components/VoiceDictation";

const issueSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  state: z.string().trim().min(2, "State/Region is required").max(100, "State must be less than 100 characters"),
  organization: z.string().trim().min(2, "Organization must be at least 2 characters").max(100, "Organization must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  urgency: z.string().min(1, "Urgency is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Must be a valid 6-digit Indian pincode").optional().or(z.literal('')),
  location: z.string().max(200, "Location must be less than 200 characters").optional(),
  subLocation: z.string().max(200, "Sub-location must be less than 200 characters").optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000, "Description must be less than 5000 characters"),
  imageUrl: z.string().url("Must be a valid URL").max(500, "URL must be less than 500 characters").optional().or(z.literal(''))
});

const organizationData: Record<string, { website: string; social?: { platform: string; url: string }[] }> = {
  "Municipal Corporation": {
    website: "https://www.india.gov.in/topics/infrastructure/municipal-corporation",
    social: [
      { platform: "Twitter", url: "https://twitter.com/IndiaGov" },
      { platform: "Facebook", url: "https://www.facebook.com/IndiaGov" }
    ]
  },
  "Police Department": {
    website: "https://www.mha.gov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/HMOIndia" }
    ]
  },
  "Public Health Department": {
    website: "https://www.mohfw.gov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/MoHFW_INDIA" }
    ]
  },
  "Public Works Department (Roads)": {
    website: "https://morth.nic.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/MORTHIndia" }
    ]
  },
  "Water Supply Department": {
    website: "https://jalshakti-ddws.gov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/jalshakti_goi" }
    ]
  },
  "Electricity Board": {
    website: "https://powermin.gov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/PowerMin_India" }
    ]
  },
  "Transport Department": {
    website: "https://morth.nic.in/road-transport",
    social: [
      { platform: "Twitter", url: "https://twitter.com/MORTHIndia" }
    ]
  },
  "Education Department": {
    website: "https://www.education.gov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/EduMinOfIndia" }
    ]
  },
  "Housing Board": {
    website: "https://mohua.gov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/MoHUA_India" }
    ]
  },
  "Waste Management Department": {
    website: "https://swachhbharat.mygov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/swachhbharat" },
      { platform: "Facebook", url: "https://www.facebook.com/SwachhBharatAbhiyan" }
    ]
  },
  "Fire Department": {
    website: "https://www.india.gov.in/topics/infrastructure/fire-services"
  },
  "Traffic Police": {
    website: "https://morth.nic.in/road-transport"
  },
  "Revenue Department": {
    website: "https://www.india.gov.in/topics/governance-administration/revenue-department"
  },
  "Food Safety Department": {
    website: "https://www.fssai.gov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/fssaiindia" },
      { platform: "Facebook", url: "https://www.facebook.com/FSSAIIndia" }
    ]
  },
  "Environmental Department": {
    website: "https://moef.gov.in/",
    social: [
      { platform: "Twitter", url: "https://twitter.com/moefcc" }
    ]
  }
};

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const Submit = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    state: "",
    organization: "",
    category: "",
    urgency: "",
    location: "",
    subLocation: "",
    pincode: "",
    description: "",
    imageUrl: "",
    latitude: "",
    longitude: ""
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
        state: formData.state,
        organization: formData.organization,
        category: formData.category,
        urgency: formData.urgency,
        pincode: formData.pincode || '',
        location: formData.location || undefined,
        subLocation: formData.subLocation || undefined,
        description: formData.description,
        imageUrl: formData.imageUrl || ''
      });

      const fullLocation = [
        validatedData.subLocation,
        validatedData.location,
        validatedData.state,
        "India"
      ].filter(Boolean).join(", ");

      // Use manually selected coordinates if available, otherwise geocode
      let latitude = formData.latitude ? parseFloat(formData.latitude) : null;
      let longitude = formData.longitude ? parseFloat(formData.longitude) : null;
      
      // Only geocode if coordinates weren't manually selected
      if (!latitude || !longitude) {
        try {
          // If pincode is provided, use it for more accurate geocoding
          const geocodeLocation = validatedData.pincode 
            ? `${validatedData.pincode}, India`
            : fullLocation;
            
          const geocodeResponse = await supabase.functions.invoke('geocode-location', {
            body: { 
              location: geocodeLocation,
              usePincode: !!validatedData.pincode 
            }
          });
          
          if (geocodeResponse.data && !geocodeResponse.error) {
            latitude = geocodeResponse.data.latitude;
            longitude = geocodeResponse.data.longitude;
          }
        } catch (geocodeError) {
          console.error('Geocoding failed:', geocodeError);
          // Continue without coordinates if geocoding fails
        }
      }

      const { error } = await supabase
        .from('issues')
        .insert({
          title: validatedData.title,
          organization: validatedData.organization,
          category: validatedData.category,
          urgency: validatedData.urgency,
          location: fullLocation || null,
          pincode: validatedData.pincode || null,
          latitude,
          longitude,
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
                  <Label htmlFor="state">State *</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={(value) => setFormData({...formData, state: value})}
                  >
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {formData.organization && organizationData[formData.organization] && (
                    <div className="space-y-2">
                      <a 
                        href={organizationData[formData.organization].website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit official website
                      </a>
                      {organizationData[formData.organization].social && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {organizationData[formData.organization].social!.map((social) => (
                            <a
                              key={social.platform}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {social.platform}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
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
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="Enter 6-digit pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    maxLength={6}
                    pattern="[0-9]*"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pincode helps locate the issue more accurately on the map
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">City/District</Label>
                  <Input
                    id="location"
                    placeholder="Enter city or district"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subLocation">Area/Locality (Specific Location)</Label>
                  <Input
                    id="subLocation"
                    placeholder="Street, area, or landmark"
                    value={formData.subLocation}
                    onChange={(e) => setFormData({...formData, subLocation: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide the exact location where the issue exists
                  </p>
                </div>

                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <Label>Coordinates (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLocationPickerOpen(true)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      📍 Pick location on map
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="25.5977795"
                        value={formData.latitude}
                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="85.2093407"
                        value={formData.longitude}
                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                        readOnly
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click the button above to select precise coordinates on the map
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <span className="text-xs font-medium text-orange-600">Voice available</span>
                  </div>
                  <VoiceDictation
                    onAppend={(t) =>
                      setFormData((f) => ({
                        ...f,
                        description: (f.description ? f.description + " " : "") + t,
                      }))
                    }
                  />
                  <Textarea
                    id="description"
                    placeholder="Provide details about the issue, when it started, and its impact... (or tap Speak and say it)"
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
                  disabled={isSubmitting || !formData.title || !formData.state || !formData.organization || !formData.category || !formData.urgency || !formData.description}
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
      
      <LocationPicker
        open={locationPickerOpen}
        onOpenChange={setLocationPickerOpen}
        onLocationSelect={(lat, lng) => {
          setFormData({
            ...formData,
            latitude: lat.toFixed(7),
            longitude: lng.toFixed(7)
          });
        }}
      />
    </div>
  );
};

export default Submit;
