import { Button } from "@/components/ui/button";
import { TrendingUp, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Your Voice. Your City. Your Power.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            Report problems. Get support. Drive change. Make organizations accountable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link to="/submit">
              <Button size="lg" variant="secondary" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                <AlertCircle className="mr-2 h-5 w-5" />
                Report an Issue
              </Button>
            </Link>
            <Link to="/issues">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white shadow-lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Browse Issues
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-700 delay-500">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-3xl font-bold mb-2">2,847</div>
              <div className="text-sm text-white/80 flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Active Issues
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-3xl font-bold mb-2">1,563</div>
              <div className="text-sm text-white/80 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resolved
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-3xl font-bold mb-2">15.2K</div>
              <div className="text-sm text-white/80 flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Citizens
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-3xl font-bold mb-2">428</div>
              <div className="text-sm text-white/80 flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Organizations
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
    </div>
  );
};

export default Hero;
