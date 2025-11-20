import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/auth";

const Login = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === "register" && !name)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (mode === "login") {
      const result = await login(email, password);
      if (!result.success) {
        toast({
          title: "Sign in failed",
          description: result.error ?? "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back",
        description: "You have successfully signed in",
      });
      return;
    }

    const result = await register({ email, password, role, name });
    if (!result.success) {
      toast({
        title: "Sign up failed",
        description: result.error ?? "Unable to create account",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account created",
      description: "Welcome! Continue by completing your profile.",
    });

    const autoLogin = await login(email, password);
    if (!autoLogin.success) {
      toast({
        title: "Sign in required",
        description: "Account created. Please sign in to continue.",
      });
      setMode("login");
      return;
    }

    navigate("/student/create-profile", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {mode === "login" ? "Welcome Back" : "Create an Account"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "login" ? "Sign in to access your portal" : "Register to get started"}
          </p>
        </div>

        <div className="flex rounded-xl bg-muted p-1 text-sm font-medium">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 transition ${
              mode === "login" ? "bg-background shadow" : "text-muted-foreground"
            }`}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 transition ${
              mode === "register" ? "bg-background shadow" : "text-muted-foreground"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Use your verified institute email for seamless approval.</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
