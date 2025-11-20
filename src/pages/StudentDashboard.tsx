import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentProfile } from "@/types/auth";
import { CheckCircle, Clock, XCircle, Plus, Edit } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/login");
      return;
    }

    // Load profile from localStorage
    const storedProfiles = localStorage.getItem("studentProfiles");
    if (storedProfiles) {
      const profiles: StudentProfile[] = JSON.parse(storedProfiles);
      const userProfile = profiles.find(p => p.userId === user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    }
  }, [user, navigate]);

  const getStatusBadge = () => {
    if (!profile) return null;

    switch (profile.verificationStatus) {
      case "approved":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning text-warning-foreground">
            <Clock className="h-4 w-4 mr-1" />
            Pending Approval
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
            <p className="text-muted-foreground">Manage your profile and track verification status</p>
          </div>

          {!profile ? (
            <Card className="p-8 text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">No Profile Found</h2>
                <p className="text-muted-foreground">Create your profile to get started</p>
              </div>
              <Button onClick={() => navigate("/student/create-profile")} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Profile
              </Button>
            </Card>
          ) : (
            <>
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Your Profile</h2>
                    {getStatusBadge()}
                  </div>
                  {profile.verificationStatus !== "pending" && (
                    <Button onClick={() => navigate("/student/update-profile")} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold text-foreground">{profile.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">UID</p>
                      <p className="font-semibold text-foreground">{profile.uid}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold text-foreground">Year {profile.year}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="font-semibold text-foreground">{profile.branch}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Major</p>
                      <p className="font-semibold text-foreground">{profile.major}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CGPA</p>
                      <p className="font-semibold text-foreground">{profile.cgpa}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-semibold text-foreground">
                        {new Date(profile.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {profile.verificationStatus === "rejected" && profile.rejectionReason && (
                  <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-semibold text-destructive mb-1">Rejection Reason:</p>
                    <p className="text-sm text-destructive">{profile.rejectionReason}</p>
                  </div>
                )}

                {profile.verificationStatus === "pending" && (
                  <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning">
                      Your profile is under review by the admin. You will be notified once it's processed.
                    </p>
                  </div>
                )}
              </Card>

              {profile.skills.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
