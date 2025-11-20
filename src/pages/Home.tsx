import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockStudents } from "@/data/mockStudents";
import { useNavigate } from "react-router-dom";
import { Trophy, Award, Code, Briefcase, Medal } from "lucide-react";

type RankingType = "academic" | "sports" | "hackathon" | "internship" | "overall";

const Home = () => {
  const [rankingType, setRankingType] = useState<RankingType>("overall");
  const navigate = useNavigate();

  const getRankingIcon = (type: RankingType) => {
    switch (type) {
      case "academic": return <Award className="h-4 w-4" />;
      case "sports": return <Trophy className="h-4 w-4" />;
      case "hackathon": return <Code className="h-4 w-4" />;
      case "internship": return <Briefcase className="h-4 w-4" />;
      case "overall": return <Medal className="h-4 w-4" />;
    }
  };

  const sortedStudents = [...mockStudents].sort((a, b) => {
    const rankKey = `${rankingType}Rank` as keyof typeof a;
    return (a[rankKey] as number || 999) - (b[rankKey] as number || 999);
  });

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

        <Card className="overflow-hidden bg-card">
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
                {sortedStudents.map((student, index) => {
                  const rankKey = `${rankingType}Rank` as keyof typeof student;
                  const rank = student[rankKey] as number || "-";
                  
                  return (
                    <tr 
                      key={student.id}
                      className="hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/student/${student.id}`)}
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
        </Card>
      </main>
    </div>
  );
};

export default Home;
