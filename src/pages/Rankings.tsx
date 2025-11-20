import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockStudents } from "@/data/mockStudents";
import { useNavigate } from "react-router-dom";
import { Trophy, Award, Code, Briefcase, Medal } from "lucide-react";

type RankingType = "academic" | "sports" | "hackathon" | "internship" | "overall";

const Rankings = () => {
  const [activeTab, setActiveTab] = useState<RankingType>("overall");
  const navigate = useNavigate();

  const getRankingData = (type: RankingType) => {
    const rankKey = `${type}Rank` as keyof typeof mockStudents[0];
    return [...mockStudents]
      .sort((a, b) => (a[rankKey] as number || 999) - (b[rankKey] as number || 999))
      .filter(student => student[rankKey] !== undefined);
  };

  const getRankingIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-primary" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-accent-foreground" />;
    if (rank === 3) return <Award className="h-5 w-5 text-muted-foreground" />;
    return null;
  };

  const renderRankingTable = (type: RankingType) => {
    const students = getRankingData(type);
    const rankKey = `${type}Rank` as keyof typeof mockStudents[0];

    return (
      <Card className="overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Student</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Branch</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Year</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CGPA</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Key Achievements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => {
                const rank = student[rankKey] as number;
                const achievements = [];
                if (student.certificates.length > 0) achievements.push(`${student.certificates.length} Certs`);
                if (student.internships.length > 0) achievements.push(`${student.internships.length} Internships`);
                if (student.hackathons.length > 0) achievements.push(`${student.hackathons.length} Hackathons`);

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/student/${student.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          rank === 1 ? "text-primary" :
                          rank === 2 ? "text-accent-foreground" :
                          rank === 3 ? "text-muted-foreground" :
                          "text-foreground"
                        }`}>
                          #{rank}
                        </span>
                        {getRankingIcon(rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.uid}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{student.branch}</td>
                    <td className="px-6 py-4 text-sm text-foreground">Year {student.year}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-semibold">
                        {student.cgpa}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {achievements.map((achievement, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Rankings</h1>
          <p className="text-muted-foreground">View rankings across different categories</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RankingType)} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overall" className="gap-2">
              <Medal className="h-4 w-4" />
              Overall
            </TabsTrigger>
            <TabsTrigger value="academic" className="gap-2">
              <Award className="h-4 w-4" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="sports" className="gap-2">
              <Trophy className="h-4 w-4" />
              Sports
            </TabsTrigger>
            <TabsTrigger value="hackathon" className="gap-2">
              <Code className="h-4 w-4" />
              Hackathon
            </TabsTrigger>
            <TabsTrigger value="internship" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Internship
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            {renderRankingTable("overall")}
          </TabsContent>

          <TabsContent value="academic">
            {renderRankingTable("academic")}
          </TabsContent>

          <TabsContent value="sports">
            {renderRankingTable("sports")}
          </TabsContent>

          <TabsContent value="hackathon">
            {renderRankingTable("hackathon")}
          </TabsContent>

          <TabsContent value="internship">
            {renderRankingTable("internship")}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Rankings;
