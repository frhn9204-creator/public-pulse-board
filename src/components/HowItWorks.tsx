import { AlertCircle, Users, TrendingUp, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: AlertCircle,
      title: "Report an Issue",
      description: "Select the organization, describe the problem, and upload photos for evidence.",
      color: "text-urgent",
      bgColor: "bg-urgent/10",
    },
    {
      icon: Users,
      title: "Get Community Support",
      description: "Other citizens can vote and comment, building momentum for your cause.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      title: "Share & Amplify",
      description: "Share on social media and tag organizations to increase visibility and pressure.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: CheckCircle,
      title: "Track Resolution",
      description: "Organizations respond and resolve issues publicly, building trust and accountability.",
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How VoiceUp Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple, powerful process to make your voice heard and drive real change
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className={`${step.bgColor} ${step.color} p-4 rounded-2xl mb-4 relative`}>
                    <Icon className="h-8 w-8" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
