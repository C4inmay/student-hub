import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import StudentDirectory from "./pages/StudentDirectory";
import AddStudent from "./pages/AddStudent";
import StudentProfile from "./pages/StudentProfile";
import Rankings from "./pages/Rankings";
import NewRankings from "./pages/NewRankings";
import Analytics from "./pages/Analytics";
import StudentDashboard from "./pages/StudentDashboard";
import CreateStudentProfile from "./pages/CreateStudentProfile";
import UpdateStudentProfile from "./pages/UpdateStudentProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVerifyStudent from "./pages/AdminVerifyStudent";
import AdminManageStudent from "./pages/AdminManageStudent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Home />} />
            
            {/* Public Routes */}
            <Route path="/directory" element={<StudentDirectory />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/rankings" element={<NewRankings />} />
            <Route path="/analytics" element={<Analytics />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/create-profile" element={<CreateStudentProfile />} />
            <Route path="/student/update-profile" element={<UpdateStudentProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/performance" element={<Home />} />
            <Route path="/admin/verify/:id" element={<AdminVerifyStudent />} />
            <Route path="/admin/students/:id/edit" element={<AdminManageStudent />} />
            
            {/* Legacy Routes */}
            <Route path="/add-student" element={<AddStudent />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
