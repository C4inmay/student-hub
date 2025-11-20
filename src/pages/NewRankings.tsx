import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockStudents } from "@/data/mockStudents";
import { Trophy, Award, Zap, Briefcase, Lightbulb, Medal } from "lucide-react";

type RankingCategory = "overall" | "academics" | "sports" | "internships" | "hackathons";

const NewRankings = () => {
  const [activeCategory, setActiveCategory] = useState<RankingCategory>("overall");

  const stats = {
    totalStudents: mockStudents.length,
    avgCGPA: (mockStudents.reduce((sum, s) => sum + s.cgpa, 0) / mockStudents.length).toFixed(2),
    topScore: Math.max(...mockStudents.map(s => 
      (s.overallRank ? 100 - s.overallRank * 10 : 0) + 
      s.certificates.length * 5 + 
      s.internships.length * 10 +
      s.hackathons.length * 8
    )),
    totalAchievements: mockStudents.reduce((sum, s) => 
      sum + s.certificates.length + s.internships.length + s.hackathons.length + s.sports.length, 0
    ),
  };

  const getTopThree = (category: RankingCategory) => {
    const rankKey = category === "overall" ? "overallRank" : 
                    category === "academics" ? "academicRank" :
                    category === "sports" ? "sportsRank" :
                    category === "internships" ? "internshipRank" :
                    "hackathonRank";
    
    return [...mockStudents]
      .filter(s => s[rankKey as keyof typeof s])
      .sort((a, b) => (a[rankKey as keyof typeof a] as number) - (b[rankKey as keyof typeof b] as number))
      .slice(0, 3);
  };

  const getCategoryRankings = (category: RankingCategory) => {
    const rankKey = category === "overall" ? "overallRank" : 
                    category === "academics" ? "academicRank" :
                    category === "sports" ? "sportsRank" :
                    category === "internships" ? "internshipRank" :
                    "hackathonRank";
    
    return [...mockStudents]
      .filter(s => s[rankKey as keyof typeof s])
      .sort((a, b) => (a[rankKey as keyof typeof a] as number) - (b[rankKey as keyof typeof b] as number));
  };

  const topThree = getTopThree(activeCategory);
  const rankings = getCategoryRankings(activeCategory);

  const getScoreForStudent = (student: typeof mockStudents[0]) => {
    return (student.overallRank ? 160 - student.overallRank * 10 : 0) + 
           student.certificates.length * 3 + 
           student.internships.length * 5 +
           student.hackathons.length * 4;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary text-primary-foreground px-6 py-2">
            <Trophy className="h-4 w-4 mr-2" />
            Student Rankings
          </Badge>
          <h1 className="text-5xl font-bold text-foreground mb-4">Excellence Leaderboard</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Celebrating outstanding achievements in academics, sports, internships, and innovation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-4xl font-bold text-foreground">{stats.totalStudents}</p>
              </div>
              <div className="bg-primary/20 p-4 rounded-2xl">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average CGPA</p>
                <p className="text-4xl font-bold text-foreground">{stats.avgCGPA}</p>
              </div>
              <div className="bg-success/20 p-4 rounded-2xl">
                <Award className="h-8 w-8 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Top Score</p>
                <p className="text-4xl font-bold text-foreground">{stats.topScore}</p>
              </div>
              <div className="bg-purple-500/20 p-4 rounded-2xl">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Achievements</p>
                <p className="text-4xl font-bold text-foreground">{stats.totalAchievements}</p>
              </div>
              <div className="bg-warning/20 p-4 rounded-2xl">
                <Medal className="h-8 w-8 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Top Performers</h2>
          <p className="text-muted-foreground text-center mb-8">Celebrating our highest achievers</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {topThree.map((student, index) => {
              const rank = index + 1;
              const borderColors = ['border-gold', 'border-silver', 'border-bronze'];
              const bgColors = ['from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900', 
                              'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700',
                              'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900'];
              const iconBg = ['bg-gold', 'bg-silver', 'bg-bronze'];
              
              return (
                <Card key={student.id} className={`p-6 bg-gradient-to-br ${bgColors[index]} border-t-4 ${borderColors[index]} relative overflow-hidden`}>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="text-xs font-bold">
                      #{rank}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className={`${iconBg} p-4 rounded-full mb-4`}>
                      {rank === 1 ? <Trophy className="h-10 w-10 text-white" /> :
                       rank === 2 ? <Medal className="h-10 w-10 text-white" /> :
                       <Award className="h-10 w-10 text-white" />}
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-1">{student.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{student.major} • {student.year === 5 ? "Graduate" : `${student.year}${student.year === 1 ? 'st' : student.year === 2 ? 'nd' : student.year === 3 ? 'rd' : 'th'} Year`}</p>
                    <p className="text-sm font-medium text-muted-foreground mb-4">CGPA: {student.cgpa}</p>
                    
                    <Badge className={`${iconBg} text-white px-6 py-2 text-base font-bold`}>
                      {getScoreForStudent(student)} pts
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Category Leaders */}
        <Card className="p-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Category Leaders</h2>
          
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as RankingCategory)}>
            <TabsList className="grid grid-cols-5 w-full mb-6">
              <TabsTrigger value="overall" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Overall
              </TabsTrigger>
              <TabsTrigger value="academics" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Academics
              </TabsTrigger>
              <TabsTrigger value="sports" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Sports
              </TabsTrigger>
              <TabsTrigger value="internships" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Internships
              </TabsTrigger>
              <TabsTrigger value="hackathons" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Hackathons
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory}>
              <div className="space-y-3">
                {rankings.map((student, index) => {
                  const rank = index + 1;
                  const score = getScoreForStudent(student);
                  
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                          rank === 1 ? 'bg-primary text-primary-foreground' :
                          rank === 2 ? 'bg-purple-500 text-white' :
                          rank === 3 ? 'bg-warning text-warning-foreground' :
                          'bg-muted text-foreground'
                        }`}>
                          #{rank}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground text-lg">{student.name}</p>
                            {rank <= 3 && <Badge className="bg-success text-success-foreground text-xs">Verified ✓</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {student.branch} • Year {student.year}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{score}</p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default NewRankings;
