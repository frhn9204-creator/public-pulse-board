import { Button } from "@/components/ui/button";
import { Menu, Megaphone, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Megaphone className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">VoiceUp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/issues" className="text-sm font-medium hover:text-primary transition-colors">
            Browse Issues
          </Link>
          <Link to="/map" className="text-sm font-medium hover:text-primary transition-colors">
            Map View
          </Link>
          <Link to="/organizations" className="text-sm font-medium hover:text-primary transition-colors">
            Organizations
          </Link>
          <Link to="/trending" className="text-sm font-medium hover:text-primary transition-colors">
            Trending
          </Link>
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Link to="/submit">
                <Button className="shadow-sm">Report Issue</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/submit">
                <Button className="shadow-sm">Report Issue</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              <Link to="/issues" className="text-lg font-medium hover:text-primary transition-colors">
                Browse Issues
              </Link>
              <Link to="/map" className="text-lg font-medium hover:text-primary transition-colors">
                Map View
              </Link>
              <Link to="/organizations" className="text-lg font-medium hover:text-primary transition-colors">
                Organizations
              </Link>
              <Link to="/trending" className="text-lg font-medium hover:text-primary transition-colors">
                Trending
              </Link>
              {user ? (
                <>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                    <Link to="/submit" className="block mb-2">
                      <Button className="w-full">Report Issue</Button>
                    </Link>
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/auth" className="mt-4">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/submit" className="mt-2">
                    <Button className="w-full">Report Issue</Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
