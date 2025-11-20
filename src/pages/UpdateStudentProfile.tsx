import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StudentProfile } from "@/types/auth";

const UpdateStudentProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    uid: "",
    email: "",
    year: "",
    branch: "",
    major: "",
    cgpa: "",
    skills: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const storedProfiles = localStorage.getItem("studentProfiles");
    if (storedProfiles) {
      const profiles: StudentProfile[] = JSON.parse(storedProfiles);
      const userProfile = profiles.find(p => p.userId === user.id);
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          name: userProfile.name,
          uid: userProfile.uid,
          email: userProfile.email,
          year: userProfile.year.toString(),
          branch: userProfile.branch,
          major: userProfile.major,
          cgpa: userProfile.cgpa.toString(),
          skills: userProfile.skills.join(", "),
        });
      }
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) return;

    const updatedProfile: StudentProfile = {
      ...profile,
      name: formData.name,
      uid: formData.uid,
      email: formData.email,
      year: parseInt(formData.year),
      branch: formData.branch,
      major: formData.major,
      cgpa: parseFloat(formData.cgpa),
      skills: formData.skills.split(",").map(s => s.trim()),
      verificationStatus: "pending",
      submittedAt: new Date().toISOString(),
      rejectionReason: undefined,
    };

    const storedProfiles = localStorage.getItem("studentProfiles");
    const profiles: StudentProfile[] = storedProfiles ? JSON.parse(storedProfiles) : [];
    const index = profiles.findIndex(p => p.id === profile.id);
    
    if (index !== -1) {
      profiles[index] = updatedProfile;
      localStorage.setItem("studentProfiles", JSON.stringify(profiles));
    }

    toast({
      title: "Profile Updated",
      description: "Your profile has been resubmitted for admin review.",
    });

    navigate("/student/dashboard");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Update Your Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uid">UID *</Label>
                  <Input
                    id="uid"
                    name="uid"
                    value={formData.uid}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1"
                    max="4"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Input
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">Major *</Label>
                  <Input
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA *</Label>
                  <Input
                    id="cgpa"
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated) *</Label>
                <Textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Python, Machine Learning"
                  required
                />
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <p className="text-sm text-warning">
                  Your updated profile will be sent to admin for re-verification.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Update & Submit for Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/student/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpdateStudentProfile;
