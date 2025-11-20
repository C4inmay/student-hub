import { NavLink } from "@/components/NavLink";
import { GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Public navbar (not logged in)
  if (!isAuthenticated) {
    return (
      <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Student Portal</span>
            </div>
            
            <div className="flex items-center gap-2">
              <NavLink
                to="/"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="!text-primary !bg-accent"
              >
                Home
              </NavLink>
              <NavLink
                to="/directory"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="!text-primary !bg-accent"
              >
                Directory
              </NavLink>
              <NavLink
                to="/rankings"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="!text-primary !bg-accent"
              >
                Rankings
              </NavLink>
              <NavLink
                to="/analytics"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="!text-primary !bg-accent"
              >
                Analytics
              </NavLink>
              <Button onClick={() => navigate("/login")} size="sm" className="ml-2">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Student navbar
  if (user?.role === "student") {
    return (
      <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Student Portal</span>
            </div>
            
            <div className="flex items-center gap-1">
              <NavLink
                to="/student/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="!text-primary !bg-accent"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/rankings"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="!text-primary !bg-accent"
              >
                Rankings
              </NavLink>
              <NavLink
                to="/analytics"
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeClassName="!text-primary !bg-accent"
              >
                Analytics
              </NavLink>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="ml-2">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Admin navbar
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Admin Portal</span>
          </div>
          
          <div className="flex items-center gap-1">
            <NavLink
              to="/admin/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeClassName="!text-primary !bg-accent"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/directory"
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeClassName="!text-primary !bg-accent"
            >
              Directory
            </NavLink>
            <NavLink
              to="/rankings"
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeClassName="!text-primary !bg-accent"
            >
              Rankings
            </NavLink>
            <NavLink
              to="/analytics"
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeClassName="!text-primary !bg-accent"
            >
              Analytics
            </NavLink>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="ml-2">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
