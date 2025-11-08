import { Button } from "@/components/ui/button";
import { Menu, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
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
          <Link to="/organizations" className="text-sm font-medium hover:text-primary transition-colors">
            Organizations
          </Link>
          <Link to="/trending" className="text-sm font-medium hover:text-primary transition-colors">
            Trending
          </Link>
          <Link to="/submit">
            <Button className="shadow-sm">Report Issue</Button>
          </Link>
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
              <Link to="/organizations" className="text-lg font-medium hover:text-primary transition-colors">
                Organizations
              </Link>
              <Link to="/trending" className="text-lg font-medium hover:text-primary transition-colors">
                Trending
              </Link>
              <Link to="/submit" className="mt-4">
                <Button className="w-full">Report Issue</Button>
              </L
                              <Link to="/auth" className="ml-4">
                <Button variant="outline">Sign In</Button>
              </Link>ink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
