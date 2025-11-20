import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockStudents } from "@/data/mockStudents";
import { ArrowLeft, Mail, User, Award, Briefcase, Code, Trophy, Star } from "lucide-react";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = mockStudents.find(s => s.id === id);

  if (!student) {
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
            <div className="w-32 h-32 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <User className="h-16 w-16 text-accent-foreground" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{student.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Mail className="h-4 w-4" />
                <span>{student.email}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">UID</p>
                  <p className="font-semibold text-foreground">{student.uid}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-semibold text-foreground">Year {student.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-semibold text-foreground">{student.branch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <Badge variant="secondary" className="font-bold text-base">{student.cgpa}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-accent/30 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-accent-foreground mb-1">Overall Rank</p>
                <p className="text-3xl font-bold text-primary">#{student.overallRank}</p>
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
                <span className="font-medium text-foreground">Academic Rank</span>
                <Badge variant="secondary" className="font-bold">#{student.academicRank}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-medium text-foreground">Major</span>
                <span className="text-muted-foreground">{student.major}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="font-medium text-foreground">CGPA</span>
                <Badge className="font-bold">{student.cgpa}</Badge>
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
              {student.certificates.map((cert, idx) => (
                <div key={idx} className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium text-foreground">{cert.name}</p>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cert.date}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Internships */}
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Internships</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-accent/20 rounded-lg mb-3">
                <p className="text-sm text-muted-foreground">Internship Rank</p>
                <Badge variant="secondary" className="font-bold mt-1">#{student.internshipRank}</Badge>
              </div>
              {student.internships.map((intern, idx) => (
                <div key={idx} className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium text-foreground">{intern.company}</p>
                  <p className="text-sm text-muted-foreground">{intern.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{intern.duration}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Hackathons */}
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Hackathons</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-accent/20 rounded-lg mb-3">
                <p className="text-sm text-muted-foreground">Hackathon Rank</p>
                <Badge variant="secondary" className="font-bold mt-1">#{student.hackathonRank}</Badge>
              </div>
              {student.hackathons.length > 0 ? (
                student.hackathons.map((hack, idx) => (
                  <div key={idx} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">{hack.name}</p>
                    <p className="text-sm text-muted-foreground">{hack.position}</p>
                    <p className="text-xs text-muted-foreground mt-1">{hack.date}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hackathon participation yet</p>
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
              <div className="p-3 bg-accent/20 rounded-lg mb-3">
                <p className="text-sm text-muted-foreground">Sports Rank</p>
                <Badge variant="secondary" className="font-bold mt-1">#{student.sportsRank}</Badge>
              </div>
              {student.sports.length > 0 ? (
                student.sports.map((sport, idx) => (
                  <div key={idx} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">{sport.sport}</p>
                    <p className="text-sm text-muted-foreground">{sport.achievement}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sport.year}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sports participation yet</p>
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
              {student.extracurricular.map((activity, idx) => (
                <div key={idx} className="p-3 bg-secondary rounded-lg">
                  <p className="font-medium text-foreground">{activity.activity}</p>
                  <p className="text-sm text-muted-foreground">{activity.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.year}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
