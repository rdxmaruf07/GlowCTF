import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldIcon, Menu, X, Users } from "lucide-react";

// Navigation item props
interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}

// Navigation item component
const NavItem = ({ href, label, icon, active, onClick }: NavItemProps) => {
  return (
    <div className="w-full">
      <Link href={href}>
        <div
          className={`flex items-center px-4 py-3 rounded-md font-medium transition duration-200 cursor-pointer ${
            active 
              ? "text-primary bg-background bg-opacity-50" 
              : "text-muted-foreground hover:text-primary"
          }`}
          onClick={onClick}
        >
          {icon}
          <span className="ml-3">{label}</span>
        </div>
      </Link>
    </div>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close the mobile menu when navigating to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Navigation items
  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-lg"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
    },
    {
      href: "/challenges",
      label: "Challenges",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-lg"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>
    },
    {
      href: "/chatbot",
      label: "AI Chatbot",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-lg"><path d="M14.22 15.45A9.89 9.89 0 0 1 12 16c-3.34 0-6.32-1.94-7.94-5 .6-1.09 1.37-2 2.24-2.72"/><path d="M8 9h4l1-1h2"></path><path d="M15.9 4.65A3.49 3.49 0 0 1 19 8a3.5 3.5 0 0 1-5.92 2.51l-.84-.72a3.49 3.49 0 0 1 3.66-5.14Z"></path><line x1="19" x2="19" y1="8" y2="8"></line><line x1="3" x2="5" y1="3" y2="5"></line><line x1="21" x2="19" y1="3" y2="5"></line><line x1="8" x2="6" y1="16" y2="18"></line><line x1="16" x2="18" y1="16" y2="18"></line><line x1="3" x2="21" y1="21" y2="21"></line></svg>
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-lg"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"></path><path d="M12 13V7"></path><path d="M9 10h6"></path><path d="M12 17v.01"></path></svg>
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-lg"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    },
    {
      href: "/practice",
      label: "Practice Arena",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-lg"><path d="M17 9c.63.58 1 1.4 1 2.3v.7H8V12c0-.9.38-1.72 1-2.3"></path><path d="M12 12v6"></path><path d="M5 5a3 3 0 0 1 5.83 1H7"></path><path d="M14 10h2.83A3 3 0 0 0 16 6"></path><circle cx="12" cy="19" r="1"></circle></svg>
    },
    {
      href: "/team",
      label: "Our Team",
      icon: <Users className="mr-3 text-lg" />
    }
  ];
  
  // Add admin route if user is admin
  if (user?.role === "admin") {
    navItems.push({
      href: "/admin",
      label: "Admin Panel",
      icon: <ShieldIcon className="mr-3 text-lg" />
    });
  }
  
  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="fixed top-0 right-0 p-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      
      {/* Sidebar Container */}
      <aside className={`w-full md:w-64 lg:w-72 bg-sidebar fixed h-full z-40 transition-transform duration-300 transform ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m16 8-8 8"></path>
                  <path d="m8 8 8 8"></path>
                </svg>
              </div>
              <h1 className="font-orbitron font-bold text-xl text-white">
                <span className="text-primary neon-glow">Glow</span>CTF
              </h1>
            </div>
          </div>
          
          {/* Navigation Links */}
          <ScrollArea className="flex-grow py-2">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href))}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>
          </ScrollArea>
          
          {/* User Profile */}
          {user && (
            <div className="mt-auto p-4 border-t border-sidebar-border">
              <div className="flex items-center p-2">
                <div className="w-10 h-10 rounded-full bg-background border border-accent flex items-center justify-center mr-3">
                  <span className="text-accent font-medium">{getInitials(user.username)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sidebar-foreground font-medium truncate">{user.username}</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.role === "admin" ? "Administrator" : user.role === "hacker" ? "Hacker" : "CTF Player"}
                    </p>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" x2="9" y1="12" y2="12"></line>
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
      </aside>
      
      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
