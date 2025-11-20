import { NavLink } from "@/components/NavLink";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
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
              Student Directory
            </NavLink>
            <NavLink
              to="/add-student"
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeClassName="!text-primary !bg-accent"
            >
              Add Student
            </NavLink>
            <NavLink
              to="/rankings"
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeClassName="!text-primary !bg-accent"
            >
              Rankings
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
