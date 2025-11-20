import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Trophy, Award, Code, Briefcase, Medal } from "lucide-react";
import { StudentProfile } from "@/types/auth";
import { listProfiles } from "@/services/studentProfiles";
import { listEvents } from "@/services/events";
import { listStudents } from "@/services/students";
import { useToast } from "@/hooks/use-toast";

type RankingType = "academic" | "sports" | "hackathon" | "internship" | "overall";

const Home = () => {
  const [rankingType, setRankingType] = useState<RankingType>("overall");
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [stats, setStats] = useState({ students: 0, events: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [approvedProfiles, students, events] = await Promise.all([
          listProfiles("approved"),
          listStudents(),
          listEvents(),
        ]);
        setProfiles(approvedProfiles);
        setStats({ students: students.length, events: events.length });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load dashboard";
        toast({ title: "Dashboard error", description: message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const getRankingIcon = (type: RankingType) => {
    switch (type) {
      case "academic": return <Award className="h-4 w-4" />;
      case "sports": return <Trophy className="h-4 w-4" />;
      case "hackathon": return <Code className="h-4 w-4" />;
      case "internship": return <Briefcase className="h-4 w-4" />;
      case "overall": return <Medal className="h-4 w-4" />;
    }
  };

  const rankings = useMemo(() => {
    const base = [...profiles];

    const score = (profile: StudentProfile) =>
      profile.cgpa * 10 +
      profile.certificates.length * 2 +
      profile.hackathons.length * 3 +
      profile.internships.length * 4 +
      profile.sports.length * 1.5;

    return {
      overall: [...base].sort((a, b) => score(b) - score(a)),
      academic: [...base].sort((a, b) => b.cgpa - a.cgpa),
      sports: [...base].filter(p => p.sports.length).sort((a, b) => b.sports.length - a.sports.length),
      hackathon: [...base].filter(p => p.hackathons.length).sort((a, b) => b.hackathons.length - a.hackathons.length),
      internship: [...base].filter(p => p.internships.length).sort((a, b) => b.internships.length - a.internships.length),
    } as Record<RankingType, StudentProfile[]>;
  }, [profiles]);

  const rankedStudents = rankings[rankingType]?.slice(0, 10) ?? [];
  const averageCgpa = useMemo(() => {
    if (!profiles.length) return "-";
    const total = profiles.reduce((sum, profile) => sum + profile.cgpa, 0);
    return (total / profiles.length).toFixed(2);
  }, [profiles]);
  const topPerformer = rankings.overall?.[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Performance Dashboard</h1>
          <p className="text-muted-foreground">Track and compare student rankings across different categories</p>
        </div>

        <Card className="p-6 mb-6 bg-card">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground">Filter by Ranking:</label>
            <Select value={rankingType} onValueChange={(value) => setRankingType(value as RankingType)}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall Ranking</SelectItem>
                <SelectItem value="academic">Academic Ranking</SelectItem>
                <SelectItem value="sports">Sports Ranking</SelectItem>
                <SelectItem value="hackathon">Hackathon Ranking</SelectItem>
                <SelectItem value="internship">Internship Ranking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Approved Students</div>
            <div className="text-2xl font-semibold text-foreground">{stats.students}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Published Events</div>
            <div className="text-2xl font-semibold text-foreground">{stats.events}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Average CGPA</div>
            <div className="text-2xl font-semibold text-foreground">{averageCgpa}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Top Performer</div>
            <div className="text-lg font-semibold text-foreground">{topPerformer?.name ?? "-"}</div>
            <p className="text-sm text-muted-foreground">{topPerformer?.branch ?? ""}</p>
          </Card>
        </div>

        <Card className="overflow-hidden bg-card">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading rankings...</div>
          ) : rankedStudents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No approved students yet.</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">UID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Year</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Branch</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CGPA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rankedStudents.map((student, index) => {
                  const rank = index + 1;
                  
                  return (
                    <tr 
                      key={student.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/student/${student.uid}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${
                            index === 0 ? "text-primary" : 
                            index === 1 ? "text-accent-foreground" : 
                            "text-foreground"
                          }`}>
                            #{rank}
                          </span>
                          {index < 3 && getRankingIcon(rankingType)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{student.uid}</td>
                      <td className="px-6 py-4 text-sm text-foreground">Year {student.year}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{student.branch}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-semibold">
                          {student.cgpa}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {student.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Home;
