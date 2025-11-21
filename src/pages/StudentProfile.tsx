import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, User, Award, Briefcase, Code, Trophy, Star } from "lucide-react";
import { StudentProfile as StudentProfileType } from "@/types/auth";
import { getProfileById, getProfileByUid } from "@/services/studentProfiles";
import { useToast } from "@/hooks/use-toast";

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        navigate("/directory");
        return;
      }

      try {
        setIsLoading(true);
        let data = await getProfileByUid(id);
        if (!data) {
          data = await getProfileById(id);
        }

        if (!data) {
          throw new Error("Student profile not found");
        }

        setProfile(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load profile";
        toast({ title: "Student not found", description: message, variant: "destructive" });
        navigate("/directory");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center bg-card">
            <p className="text-muted-foreground">Loading student profile...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center bg-card">
            <h2 className="text-2xl font-bold text-foreground mb-4">Student Not Found</h2>
            <Button onClick={() => navigate("/directory")}>Back to Directory</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="p-8 mb-6 bg-card">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border border-border flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <User className="h-16 w-16 text-accent-foreground" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{profile.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">UID</p>
                  <p className="font-semibold text-foreground">{profile.uid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-semibold text-foreground">Year {profile.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-semibold text-foreground">{profile.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <Badge variant="secondary" className="font-bold text-base">{profile.cgpa}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length > 0 ? (
                    profile.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic History */}
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Academic Achievements</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-medium text-foreground">CGPA</span>
                <Badge className="font-bold">{profile.cgpa}</Badge>
              </div>
            </div>
          </Card>

          {/* Certificates */}
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Certificates</h2>
            </div>
            <div className="space-y-3">
              {profile.certificates.length > 0 ? (
                profile.certificates.map((cert, idx) => (
                  <div key={idx} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">{cert.title}</p>
                    <p className="text-sm text-muted-foreground">{cert.category}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cert.year}</p>
                    <a
                      href={cert.proofLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline"
                    >
                      Proof Link
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No certificates added.</p>
              )}
            </div>
          </Card>

          {/* Internships */}
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Internships</h2>
            </div>
            <div className="space-y-3">
              {profile.internships.length > 0 ? (
                profile.internships.map((intern, idx) => (
                  <div key={idx} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">{intern.company}</p>
                    <p className="text-sm text-muted-foreground">{intern.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{intern.duration}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No internships recorded.</p>
              )}
            </div>
          </Card>

          {/* Hackathons */}
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Hackathons</h2>
            </div>
            <div className="space-y-3">
              {profile.hackathons.length > 0 ? (
                profile.hackathons.map((hack, idx) => (
                  <div key={idx} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">{hack.eventName}</p>
                    <p className="text-sm text-muted-foreground">{hack.position}</p>
                    <p className="text-xs text-muted-foreground mt-1">{hack.year}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hackathon participation yet.</p>
              )}
            </div>
          </Card>

          {/* Sports */}
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Sports</h2>
            </div>
            <div className="space-y-3">
              {profile.sports.length > 0 ? (
                profile.sports.map((sport, idx) => (
                  <div key={idx} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">{sport.sport}</p>
                    <p className="text-sm text-muted-foreground">{sport.level}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sport.position}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sports participation yet.</p>
              )}
            </div>
          </Card>

          {/* Extracurricular */}
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Extracurricular Activities</h2>
            </div>
            <div className="space-y-3">
              {profile.extracurricular.length > 0 ? (
                profile.extracurricular.map((activity, idx) => (
                  <div key={idx} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">{activity.activityName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.year}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No extracurricular activities recorded.</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
