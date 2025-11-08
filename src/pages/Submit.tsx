import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Upload, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Submit = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Issue Reported Successfully!",
        description: "Your issue has been submitted and is now visible to the community.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Report an Issue</h1>
            </div>
            <p className="text-muted-foreground">
              Make your voice heard. Report problems in your community and help drive positive change.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Issue Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Brief, clear description of the problem"
                      required
                    />
                  </div>

                  {/* Organization */}
                  <div className="space-y-2">
                    <Label htmlFor="organization">
                      Organization <span className="text-destructive">*</span>
                    </Label>
                    <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {/* Transport */}
                <SelectItem value="indian-railways">Indian Railways - Website: https://indianrailways.gov.in | Twitter: @RailMinIndia | Facebook: IndianRailwayOfficial</SelectItem>
                <SelectItem value="morth">Ministry of Road Transport & Highways - Website: https://morth.nic.in | Twitter: @MORTHIndia | Facebook: MORTHIndia</SelectItem>
                
                {/* Health */}
                <SelectItem value="mohfw">Ministry of Health & Family Welfare - Website: https://mohfw.gov.in | Twitter: @mohfw_india | Facebook: MoHFWIndia</SelectItem>
                <SelectItem value="aiims">AIIMS (All India Institute of Medical Sciences) - Website: https://www.aiims.edu | Twitter: @AIIMS_Official | Facebook: AIIMS.Official</SelectItem>
                
                {/* Tax */}
                <SelectItem value="income-tax">Income Tax Department - Website: https://incometaxindia.gov.in | Twitter: @IncomeTaxIndia | Facebook: IncomeTaxIndiaOfficial</SelectItem>
                <SelectItem value="gst">GST Council - Website: https://gstcouncil.gov.in | Twitter: @askGST_GoI | Facebook: askGSTIndia</SelectItem>
                
                {/* Education */}
                <SelectItem value="education-ministry">Ministry of Education - Website: https://education.gov.in | Twitter: @EduMinOfIndia | Facebook: EducationGovIn</SelectItem>
                <SelectItem value="ugc">University Grants Commission (UGC) - Website: https://www.ugc.gov.in | Twitter: @ugc_india | Facebook: ugc.india</SelectItem>
                
                {/* Roads */}
                <SelectItem value="nhai">National Highways Authority of India (NHAI) - Website: https://nhai.gov.in | Twitter: @NHAI_Official | Facebook: NHAI.Official</SelectItem>
                
                {/* Addictions (De-addiction) */}
                <SelectItem value="nmba">Nasha Mukt Bharat Abhiyaan (NMBA) - Website: https://nmba.dosje.gov.in | Twitter: @MSJEGOI | Facebook: msje.gov.in</SelectItem>
                
                {/* Other Important Organizations */}
                <SelectItem value="epfo">Employees' Provident Fund Organisation (EPFO) - Website: https://www.epfindia.gov.in | Twitter: @EPFOIndia | Facebook: EPFOIndia</SelectItem>
                <SelectItem value="uidai">UIDAI (Aadhaar) - Website: https://uidai.gov.in | Twitter: @UIDAI | Facebook: uidai.gov.in</SelectItem>
                <SelectItem value="indian-post">India Post - Website: https://www.indiapost.gov.in | Twitter: @IndiaPostOffice | Facebook: IndiaPostOffice</SelectItem>
                <SelectItem value="police">State Police Departments - Website: Varies by state | Social Media: Varies by state</SelectItem>
                <SelectItem value="electricity-board">State Electricity Boards - Website: Varies by state | Social Media: Varies by state</SelectItem>
                <SelectItem value="water-board">Municipal Water Boards - Website: Varies by city | Social Media: Varies by city</SelectItem>
              </SelectContent>
            </Select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="corruption">Corruption</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Urgency */}
                  <div className="space-y-2">
                    <Label htmlFor="urgency">
                      Urgency Level <span className="text-destructive">*</span>
                    </Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="How urgent is this?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can wait</SelectItem>
                        <SelectItem value="medium">Medium - Needs attention</SelectItem>
                        <SelectItem value="high">High - Important</SelectItem>
                        <SelectItem value="critical">Critical - Immediate action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Area, street, landmark"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Detailed Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Explain the problem in detail. What happened? When? What impact is it having?"
                      rows={6}
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="images">Photos (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="images"
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <label htmlFor="images" className="cursor-pointer">
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">
                          Click to upload images
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 10MB each (max 5 images)
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Issue"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tips Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reporting Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <ImageIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Photos make your report more credible and help organizations understand the problem better
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Be specific with location details to help authorities locate and fix the issue quickly
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="text-muted-foreground">
                      Keep your description factual and avoid offensive language
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Card */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Your Privacy</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Your report will be publicly visible. You can report anonymously by leaving out personal details. Your contact info will never be shared publicly.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Submit;
